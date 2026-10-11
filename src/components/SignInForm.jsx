'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInAction } from '@/app/actions';

export default function SignInForm({ next = '/' }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signInAction, null);

  useEffect(() => {
    if (state?.success && state?.target) {
      router.push(state.target);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state?.error && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="sessionId"
          className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1"
        >
          Session ID / Name <span className="text-rose-600">*</span>
        </label>
        <input
          id="sessionId"
          name="sessionId"
          placeholder="e.g. Daniel or Selam"
          required
          disabled={isPending}
          className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="staffCode"
          className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1"
        >
          Staff Passcode <span className="text-stone-400 font-normal">(Kitchen & Admin staff only)</span>
        </label>
        <input
          id="staffCode"
          name="staffCode"
          type="password"
          placeholder="Leave blank for regular customer"
          disabled={isPending}
          className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 disabled:opacity-60"
        />
        <p className="mt-1.5 text-[11px] text-stone-500">
          Leave blank to sign in as a customer. For kitchen & admin access, enter: <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded font-mono font-medium">addis-kitchen-2026</code>
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg px-4 py-3 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Signing in...</span>
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}
