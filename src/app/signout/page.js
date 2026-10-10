import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteSession } from '@/lib/session';

export const metadata = {
  title: 'Sign Out',
  description: 'Sign out of your Addis Eats session.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignOutPage() {
  async function signOut() {
    'use server';

    await deleteSession();
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/menu');
      revalidatePath('/orders');
      revalidatePath('/favorites');
    } catch {
      // Safe no-op
    }

    redirect('/');
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-900 mb-4">
        Sign Out
      </h1>

      <form action={signOut}>
        <button
          type="submit"
          className="bg-stone-900 text-white rounded-lg px-5 py-3 hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </form>
    </main>
  );
}