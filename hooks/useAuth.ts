// hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import supabase from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Profile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  const router = useRouter();
  const pathname = usePathname();

  // Function to fetch profile data - wrapped in useCallback
  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let isFirstLoad = true;
    let authSubscription: { subscription: { unsubscribe: () => void } } | null =
      null;

    // Move checkProfileSetup inside useEffect
    const checkProfileSetup = async (user: User | null) => {
      if (!user) return false;

      // Skip check if already on auth page
      if (pathname?.includes('/auth')) {
        return false;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_profile_complete, username')
          .eq('id', user.id)
          .single();

        // If no profile, error, profile not complete, or username is missing, user needs setup
        if (error || !data || !data.is_profile_complete || !data.username) {
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error checking profile:', err);
        return false;
      }
    };

    const initAuth = async () => {
      setIsLoading(true);

      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user || null;
        setUser(currentUser);
        setSession(session);
        setIsSignedIn(!!currentUser);

        // If user is authenticated, fetch profile
        if (currentUser) {
          // Check if profile setup is needed
          if (isFirstLoad) {
            const needsSetup = await checkProfileSetup(currentUser);
            if (needsSetup) {
              router.push('/auth');
              return;
            }
          }

          // Fetch profile data
          await fetchProfile(currentUser.id);
        }

        setIsLoading(false);
        isFirstLoad = false;

        // Set up listener for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            const updatedUser = session?.user || null;

            setUser(updatedUser);
            setSession(session);
            setIsSignedIn(!!updatedUser);

            if (event === 'SIGNED_IN' && updatedUser) {
              const needsSetup = await checkProfileSetup(updatedUser);
              if (needsSetup) {
                router.push('/auth');
                return;
              }

              // Fetch profile data for new user
              await fetchProfile(updatedUser.id);
            } else if (event === 'SIGNED_OUT') {
              // Clear profile data on sign out
              setProfile(null);
            }
          }
        );

        authSubscription = authListener;
      } catch (err) {
        console.error('Error in auth initialization:', err);
        setIsLoading(false);
        isFirstLoad = false;
      }
    };

    initAuth();

    // Clean up subscription
    return () => {
      if (authSubscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, [pathname, router, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Function to refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  return {
    user,
    session,
    profile,
    isCreator: profile?.user_type === 'creator',
    isBusiness: profile?.user_type === 'business',
    isSignedIn,
    isLoading,
    profileLoading,
    signOut,
    refreshProfile,
  };
}
