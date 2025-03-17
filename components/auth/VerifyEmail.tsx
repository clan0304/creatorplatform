/* eslint-disable @typescript-eslint/no-explicit-any */
// components/auth/VerifyEmail.tsx
'use client';

import { useState } from 'react';
import supabase from '@/utils/supabase/client';

type VerifyEmailProps = {
  email: string;
  onVerificationComplete: () => void;
};

const VerifyEmail: React.FC<VerifyEmailProps> = ({
  email,
  onVerificationComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(
        error.message ||
          'An error occurred while resending the verification email'
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to check verification status periodically
  const checkVerificationStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        onVerificationComplete();
      } else {
        setError(
          'Email not verified yet. Please check your inbox and click the verification link.'
        );
      }
    } catch (error: any) {
      setError(
        error.message || 'An error occurred while checking verification status'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-700">
              We&apos;ve sent a verification email to <strong>{email}</strong>.
              Please check your inbox and click the verification link to
              continue.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="text-sm text-center">
        <p>Didn&apos;t receive the email?</p>
        <button
          onClick={handleResendEmail}
          disabled={loading}
          className="font-medium text-indigo-600 hover:text-indigo-500 mt-2"
        >
          {loading ? 'Sending...' : 'Resend verification email'}
        </button>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={checkVerificationStatus}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          I&apos;ve verified my email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
