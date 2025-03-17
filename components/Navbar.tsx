'use client';

import { useAuth } from '@/hooks/useAuth';
import supabase from '@/utils/supabase/client';
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const Navbar = () => {
  const { isSignedIn, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/auth') {
    return null;
  }

  async function handleSignOut() {
    const {} = await supabase.auth.signOut();
    router.push('/auth');
  }

  return (
    <nav className="flex justify-between mx-3 mt-1 items-center min-h-[60px]">
      <div>
        <Link href="/">Home</Link>
      </div>
      <div className="flex gap-3 items-center">
        <Link href="/creators">Creators</Link>
        <Link href="/findwork">Find Work</Link>

        {isSignedIn ? (
          <div className="relative">
            <button
              className="flex items-center gap-2 text-white hover:opacity-80 hover:cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#01182F] font-bold">
                {user?.user_metadata?.username?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  'U'}
              </div>
            </button>

            {isMenuOpen && (
              <>
                {/* Backdrop for closing the modal when clicking outside */}
                <div
                  className="fixed inset-0 z-10 "
                  onClick={() => setIsMenuOpen(false)}
                ></div>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/auth">
            <button className="bg-[#01182F]  text-white font-semibold rounded-lg px-6 py-2 hover:bg-opacity-90 transition-all hover:cursor-pointer">
              Sign In
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
