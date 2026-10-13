import { getOrder } from '@/lib/orders';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Server-Sent Events (SSE) Route Handler for Live Order Tracking (Day 47)
 * Streams real-time order status updates and delivery telemetry to the client.
 */
export async function GET(request, { params }) {
  const session = await getSession();

  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized: Please sign in' },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const order = getOrder(id);

  if (!order) {
    return Response.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }

  const isOwner = order.userId === session.id;
  const isStaff = session.role === 'staff';

  if (!isOwner && !isStaff) {
    return Response.json(
      { success: false, error: 'Access denied: You do not have permission to view this order' },
      { status: 403 }
    );
  }

  const encoder = new TextEncoder();
  let closeStreamRef = null;

  const stream = new ReadableStream({
    start(controller) {
      let interval = null;
      let closed = false;
      let lastStatus = null;
      let heartbeatTicks = 0;

      function cleanup() {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        try {
          request.signal.removeEventListener('abort', handleAbort);
        } catch {
          // ignore
        }
      }

      function closeStream() {
        if (closed) return;
        closed = true;
        cleanup();
        try {
          controller.close();
        } catch {
          // Controller might already be closed by the client
        }
      }

      closeStreamRef = closeStream;

      function sendPayload(eventType, data) {
        if (closed) return;
        try {
          // Strict SSE format: "data: ...\n\n" with optional "event: ...\n"
          const serialized = JSON.stringify(data);
          const sseMessage = `event: ${eventType}\ndata: ${serialized}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        } catch {
          closeStream();
        }
      }

      function handleAbort() {
        closeStream();
      }

      function checkOrderStatus() {
        if (closed) return;

        const currentOrder = getOrder(id);
        if (!currentOrder) {
          sendPayload('error', { message: 'Order no longer exists' });
          closeStream();
          return;
        }

        // Send update if status has changed or on first check
        if (currentOrder.status !== lastStatus) {
          lastStatus = currentOrder.status;

          sendPayload('status', {
            id: currentOrder.id,
            status: currentOrder.status,
            updatedAt: currentOrder.updatedAt || new Date().toISOString(),
            area: currentOrder.area || 'Bole',
          });

          // Deliberately close stream once delivery is finished or cancelled (Day 47 principle)
          if (currentOrder.status === 'Delivered' || currentOrder.status === 'Cancelled') {
            closeStream();
            return;
          }
        }

        heartbeatTicks += 1;
        // Keep-alive heartbeat comment every ~15 seconds (every 3 ticks of 5s)
        if (heartbeatTicks % 3 === 0 && !closed) {
          try {
            controller.enqueue(encoder.encode(': keep-alive\n\n'));
          } catch {
            closeStream();
          }
        }
      }

      request.signal.addEventListener('abort', handleAbort, { once: true });

      if (request.signal.aborted) {
        closeStream();
        return;
      }

      // Immediately seed initial status so user doesn't wait
      checkOrderStatus();

      if (!closed) {
        // Poll orders state every 5 seconds and push any change down the SSE stream
        interval = setInterval(checkOrderStatus, 5000);
      }
    },

    cancel() {
      if (closeStreamRef) {
        closeStreamRef();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
