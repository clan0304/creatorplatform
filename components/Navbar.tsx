'use client';

import { useAuth } from '@/hooks/useAuth';
import supabase from '@/utils/supabase/client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AlignJustify } from 'lucide-react';

const Navbar = () => {
  const { isSignedIn, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if device is mobile on component mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is typically 768px
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (pathname === '/auth') {
    return null;
  }

  async function handleSignOut() {
    const {} = await supabase.auth.signOut();
    router.push('/auth');
  }

  const navLinks = [
    { href: '/creators', label: 'Creators' },
    { href: '/findwork', label: 'Find Work' },
    { href: '/aboutus', label: 'About Us' },
  ];

  return (
    <nav className="flex justify-between mx-3 mt-1 items-center min-h-[60px]">
      <div>
        <Link href="/">Home</Link>
      </div>

      {/* Desktop Navigation */}
      {!isMobile ? (
        <div className="flex gap-3 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}

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
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  ></div>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
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
              <button className="bg-[#01182F] text-white font-semibold rounded-lg px-6 py-2 hover:bg-opacity-90 transition-all hover:cursor-pointer">
                Sign In
              </button>
            </Link>
          )}
        </div>
      ) : (
        /* Mobile Navigation */
        <div className="flex items-center">
          {/* User profile button (if signed in) */}
          {isSignedIn && (
            <div className="relative mr-4">
              <button
                className="flex items-center gap-2 hover:opacity-80 hover:cursor-pointer"
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
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  ></div>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
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
          )}

          {/* Hamburger Icon */}
          <button
            className="flex flex-col justify-center items-center w-6 h-6 space-y-1 hover:cursor-pointer hover:opacity-70"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <AlignJustify size={30} />
          </button>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10 bg-black bg-opacity-30"
                onClick={() => setIsMobileMenuOpen(false)}
              ></div>

              {/* Menu Content */}
              <div className="fixed left-0 right-0 top-[60px] w-full bg-white shadow-lg py-2 z-20">
                {/* Close button */}
                <div className="flex justify-end px-4 mb-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Close menu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Only include main navigation links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Conditionally show sign in link if not signed in */}
                {!isSignedIn && (
                  <Link
                    href="/auth"
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
