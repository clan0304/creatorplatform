import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, allow the request to continue
  if (!session) {
    return res;
  }

  // Only check profile completion for authenticated users accessing the home page
  const url = req.nextUrl.pathname;

  if (url === '/') {
    // Get user profile with explicit conditions
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Log the profile data to help with debugging
    console.log('Middleware profile check:', {
      userId: session.user.id,
      profile,
      error,
    });

    // Check if the profile exists and has the required flags
    if (profile) {
      const isComplete = profile.is_profile_complete === true;
      const isSkipped = profile.signup_skipped === true;

      console.log('Profile status:', { isComplete, isSkipped });

      // Only redirect if profile is not complete AND not skipped
      if (!isComplete && !isSkipped) {
        console.log('Redirecting to complete-profile');
        return NextResponse.redirect(new URL('/complete-profile', req.url));
      }
    } else if (error) {
      console.error('Error fetching profile:', error);
    }
  }

  return res;
}

// Specify which paths should trigger this middleware
export const config = {
  matcher: ['/', '/complete-profile'],
};
