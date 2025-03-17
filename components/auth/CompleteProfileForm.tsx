/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import supabase from '@/utils/supabase/client';
import { UserType } from '@/types';
import CreatorProfileForm from './CreatorProfileForm';
import BusinessProfileForm from './BusinessProfileForm';
import UserTypeSelection from './UserTypeSelection';

type CompleteProfileFormProps = {
  userType: UserType | null;
  onUserTypeSelect: (type: UserType) => void;
  onProfileComplete: () => void;
};

const CompleteProfileForm: React.FC<CompleteProfileFormProps> = ({
  userType,
  onUserTypeSelect,
}) => {
  const [username, setUsername] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<
    'username' | 'user-type' | 'profile-details'
  >('username');
  const [userId, setUserId] = useState<string | null>(null);

  // Debounce timer reference
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };

    getUserId();

    // Cleanup the timer when component unmounts
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      return false;
    }

    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !data;
    } catch (error: any) {
      console.error('Error checking username:', error.message);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only check availability if username is at least 3 characters
    if (value.length >= 3) {
      setIsCheckingUsername(true);

      // Set a new timer to check availability after 500ms
      debounceTimer.current = setTimeout(async () => {
        const isAvailable = await checkUsernameAvailability(value);
        setIsUsernameAvailable(isAvailable);
      }, 500);
    } else {
      setIsUsernameAvailable(true);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!isUsernameAvailable) {
      setError('Username is already taken');
      return;
    }

    if (!userId) {
      setError('User session not found');
      return;
    }

    // Instead of updating the profile now, just move to the next step
    // The username will be saved along with the final profile submission
    setStep('user-type');
  };

  const handleUserTypeSubmit = (type: UserType) => {
    onUserTypeSelect(type);
    setStep('profile-details');
  };

  const handleProfileComplete = async (profileData: any) => {
    if (!userId) {
      setError('User session not found');
      return;
    }

    try {
      // Now we update the profile with ALL form data including username
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          username, // Include the username here
          user_type: userType,
          is_profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Use a hard refresh to ensure the middleware sees the updated state
      window.location.href = '/';
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving profile');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium">Complete Your Profile</h2>
      </div>

      {step === 'username' && (
        <form onSubmit={handleUsernameSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Choose a username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                value={username}
                onChange={handleUsernameChange}
                className={`block w-full px-3 py-2 placeholder-gray-400 border ${
                  !isUsernameAvailable && username.length >= 3
                    ? 'border-red-300'
                    : 'border-gray-300'
                } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
            </div>
            {username.length >= 3 && (
              <p
                className={`mt-2 text-sm ${
                  isUsernameAvailable ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isCheckingUsername
                  ? 'Checking availability...'
                  : isUsernameAvailable
                  ? 'Username is available'
                  : 'Username is already taken'}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={
                !isUsernameAvailable ||
                username.length < 3 ||
                isCheckingUsername
              }
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 'user-type' && (
        <UserTypeSelection onSelect={handleUserTypeSubmit} />
      )}

      {step === 'profile-details' && userType === 'creator' && (
        <CreatorProfileForm onComplete={handleProfileComplete} />
      )}

      {step === 'profile-details' && userType === 'business' && (
        <BusinessProfileForm onComplete={handleProfileComplete} />
      )}
    </div>
  );
};

export default CompleteProfileForm;
