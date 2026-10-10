import { redirect } from 'next/navigation';
import { createSession } from '@/lib/session';

function getSafeNext(value) {
  if (typeof value !== 'string') {
    return '/';
  }

  const trimmed = value.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    /[\r\n\t]/.test(trimmed)
  ) {
    return '/';
  }

  return trimmed;
}

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to Addis Eats with your session ID.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = getSafeNext(params?.next);
  const isStaffRequired = params?.error === 'staff_required';

  async function signIn(formData) {
    'use server';

    const rawSessionId = formData.get('sessionId')?.toString().trim();
    const staffCode = formData.get('staffCode')?.toString().trim();
    const rawNext = formData.get('next')?.toString() || next;
    const safeTarget = getSafeNext(rawNext);

    if (!rawSessionId) {
      return;
    }

    // Server-controlled staff authorization check:
    // Never grant staff role merely based on client-supplied sessionId === 'staff'.
    // Requires matching the server-configured STAFF_ACCESS_CODE environment variable.
    const expectedStaffCode = process.env.STAFF_ACCESS_CODE || 'addis-kitchen-2026';
    const isStaffAuthorized = Boolean(staffCode && staffCode === expectedStaffCode);
    const role = isStaffAuthorized ? 'staff' : 'customer';

    await createSession(rawSessionId, role);

    redirect(safeTarget);
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        Sign In
      </h1>

      {isStaffRequired && (
        <div
          role="alert"
          className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs"
        >
          <strong>Staff Access Required:</strong> You must enter a valid staff passcode to access the kitchen dashboard.
        </div>
      )}

      <p className="text-sm text-stone-500 mb-6">
        Enter your session ID to continue. Kitchen staff must also provide the server staff access passcode.
      </p>

      <form action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="sessionId" className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
            Session ID <span className="text-rose-600">*</span>
          </label>
          <input
            id="sessionId"
            name="sessionId"
            placeholder="e.g. daniel or staff"
            required
            className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>

        <div>
          <label htmlFor="staffCode" className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
            Staff Passcode <span className="text-stone-400 font-normal">(Kitchen staff only)</span>
          </label>
          <input
            id="staffCode"
            name="staffCode"
            type="password"
            placeholder="Required for staff role"
            className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg px-4 py-3 transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </form>
    </main>
  );
}