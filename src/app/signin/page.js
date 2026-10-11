import SignInForm from '@/components/SignInForm';

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

      <SignInForm next={next} />
    </main>
  );
}