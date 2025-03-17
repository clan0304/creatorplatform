// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Create a new user profile if it doesn't exist yet
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
    }
  }

  // Redirect to the auth page to complete profile setup
  return NextResponse.redirect(new URL('/auth', request.url));
}
