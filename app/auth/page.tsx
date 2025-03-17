// app/auth/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import supabase from '@/utils/supabase/client';
import type { UserType } from '@/types';

// Components for the auth page
import AuthTabs from '@/components/auth/AuthTabs';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import CompleteProfileForm from '@/components/auth/CompleteProfileForm';
import VerifyEmail from '@/components/auth/VerifyEmail';

type AuthView = 'sign-in' | 'sign-up' | 'verify-email' | 'complete-profile';

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>('sign-in');
  const [email, setEmail] = useState<string>('');
  const [userType, setUserType] = useState<UserType | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_profile_complete')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_profile_complete) {
          router.push('/dashboard');
        } else {
          setView('complete-profile');
        }
      }
    };

    checkUser();
  }, [router]);

  // Handle switching between sign-in and sign-up views
  const handleViewChange = (newView: 'sign-in' | 'sign-up') => {
    setView(newView);
  };

  // After successful email signup, show verification page
  const handleSignUpSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setView('verify-email');
  };

  // After email verification, move to complete profile
  const handleVerificationComplete = () => {
    setView('complete-profile');
  };

  // After user chooses type (creator or business)
  const handleUserTypeSelection = (type: UserType) => {
    setUserType(type);
  };

  // After profile completion, redirect to dashboard
  const handleProfileComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div>
            <Image
              src="/logo.svg"
              alt="Your Logo"
              width={48}
              height={48}
              className="w-auto h-12"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {view === 'sign-in' && 'Sign in to your account'}
              {view === 'sign-up' && 'Create your account'}
              {view === 'verify-email' && 'Verify your email'}
              {view === 'complete-profile' && 'Complete your profile'}
            </h2>
          </div>

          <div className="mt-8">
            {(view === 'sign-in' || view === 'sign-up') && (
              <AuthTabs currentView={view} onViewChange={handleViewChange} />
            )}

            <div className="mt-6">
              {view === 'sign-in' && <SignInForm />}

              {view === 'sign-up' && (
                <SignUpForm onSuccess={handleSignUpSuccess} />
              )}

              {view === 'verify-email' && (
                <VerifyEmail
                  email={email}
                  onVerificationComplete={handleVerificationComplete}
                />
              )}

              {view === 'complete-profile' && (
                <CompleteProfileForm
                  userType={userType}
                  onUserTypeSelect={handleUserTypeSelection}
                  onProfileComplete={handleProfileComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right side illustration/image */}
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-600">
          <div className="p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Connect. Create. Collaborate.
            </h2>
            <p className="text-xl">
              The platform where creators and businesses find each other.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
