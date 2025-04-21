// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Await the cookie store to resolve the Promise<ReadonlyRequestCookies>
  const cookieStore = cookies();

  // Create Supabase client with the cookie store
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });

  try {
    // Exchange code for session if present
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Error exchanging code for session:', error);
        throw error;
      }
    }

    // Verify session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw sessionError;
    }

    if (session) {
      // Check if the user already has a profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select()
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "no rows found", which is expected for new users
        console.error('Error checking profile:', profileError);
        throw profileError;
      }

      // If no profile exists, create one
      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: session.user.id,
          email: session.user.email,
          is_profile_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        }
      }

      // Redirect based on profile status
      if (existingProfile?.is_profile_complete) {
        return NextResponse.redirect(new URL('/', request.url));
      } else {
        return NextResponse.redirect(new URL('/auth', request.url));
      }
    }
  } catch (error) {
    console.error('Auth callback error:', error);
  }

  // Fallback redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url));
}
