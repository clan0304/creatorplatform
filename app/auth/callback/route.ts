import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // If we have a code, exchange it for a session
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Verify we have a session, regardless of how we got it
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      // Check if the user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select()
        .eq('id', session.user.id)
        .single();

      // If no profile exists, create one
      if (!existingProfile) {
        const { error } = await supabase.from('profiles').insert({
          id: session.user.id,
          email: session.user.email,
          is_profile_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error creating user profile:', error);
        }
      }

      // Redirect to dashboard or profile completion based on profile status
      if (existingProfile?.is_profile_complete) {
        return NextResponse.redirect(new URL('/', request.url));
      } else {
        return NextResponse.redirect(new URL('/auth', request.url));
      }
    }
  } catch (error) {
    console.error('Auth callback error:', error);
  }

  // If anything fails, redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url));
}
