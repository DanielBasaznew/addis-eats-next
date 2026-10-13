import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OrderPageRedirect({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  redirect(`/track/${encodeURIComponent(id)}`);
}
