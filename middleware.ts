// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Middleware: Error getting session:', sessionError);
  }

  // If no session, allow the request to continue
  if (!session) {
    return res;
  }

  // Only check profile completion for authenticated users accessing the home page
  const url = req.nextUrl.pathname;

  if (url === '/') {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_profile_complete, signup_skipped')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Middleware: Error checking profile:', profileError);
    }

    // Check explicitly for both conditions
    const isComplete = profile?.is_profile_complete === true;
    const isSkipped = profile?.signup_skipped === true;

    // Redirect if profile is not complete AND not skipped
    if (!isComplete && !isSkipped) {
      return NextResponse.redirect(new URL('/complete-profile', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/complete-profile'],
};
