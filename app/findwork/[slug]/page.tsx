'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  username: string;
  profile_photo_url?: string;
  location?: string;
  social_links?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  user_type: 'creator' | 'business';
}

interface BusinessProfile {
  id: string;
  business_id: string;
  business_name: string;
  title: string;
  description: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

const BusinessProfilePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchBusinessData = async () => {
      setIsLoading(true);
      try {
        // First try to find the business profile by slug
        const { data: businessData, error: businessError } = await supabase
          .from('business_profile')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        // If not found by slug, try by ID (for backward compatibility)
        if (!businessData && businessError) {
          const { data: idBusinessData, error: idBusinessError } =
            await supabase
              .from('business_profile')
              .select('*')
              .eq('id', slug)
              .maybeSingle();

          if (idBusinessError || !idBusinessData) {
            notFound();
          }

          setBusinessProfile(idBusinessData);

          // Get profile data for the business
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', idBusinessData.business_id)
            .single();

          if (profileError) {
            throw profileError;
          }

          setProfile(profileData);

          // Check if this is the current user's profile
          if (user && profileData.id === user.id) {
            setIsCurrentUser(true);
          }
        } else {
          // Business was found by slug
          setBusinessProfile(businessData);

          // Get profile data for the business
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', businessData.business_id)
            .single();

          if (profileError) {
            throw profileError;
          }

          setProfile(profileData);

          // Check if this is the current user's profile
          if (user && profileData.id === user.id) {
            setIsCurrentUser(true);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching business profile:', err);
        setError(err.message || 'Failed to load business profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchBusinessData();
    }
  }, [slug, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-indigo-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 relative">
          {isCurrentUser && (
            <Link
              href="/profile"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Edit Profile
            </Link>
          )}
        </div>

        <div className="px-6 py-4 relative">
          <div className="absolute -top-16 left-6">
            <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
              {profile?.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.username}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">
                    {businessProfile?.business_name?.[0]?.toUpperCase() ||
                      profile?.username?.[0]?.toUpperCase() ||
                      'B'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16">
            <h1 className="text-3xl font-bold text-gray-900">
              {businessProfile?.title || businessProfile?.business_name}
            </h1>
            <p className="text-gray-600 flex items-center mt-1">
              <span className="font-medium text-gray-700 mr-2">
                @{profile?.username}
              </span>
              {profile?.location && (
                <>
                  <span className="mx-2">•</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {profile.location}
                </>
              )}
            </p>

            {/* Social Media Links */}
            {profile?.social_links && (
              <div className="flex space-x-4 mt-3">
                {profile.social_links.instagram && (
                  <a
                    href={profile.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 transition-colors p-2 rounded-full hover:bg-pink-50"
                    aria-label="Instagram"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {profile.social_links.youtube && (
                  <a
                    href={profile.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                    aria-label="YouTube"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                )}
                {profile.social_links.tiktok && (
                  <a
                    href={profile.social_links.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                    aria-label="TikTok"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <div className="prose max-w-none text-gray-600">
                <p>{businessProfile?.description}</p>
              </div>
            </div>
          </div>

          {/* Business Projects/Offerings Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                What We&apos;re Looking For
              </h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  We&apos;re interested in working with talented creators who
                  can help our business grow.
                </p>

                <p className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  <strong>Note:</strong> To discuss potential opportunities with
                  this business, reach out directly using the contact
                  information below.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Business Info */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Business Info
              </h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Name:</span>
                  <span className="text-gray-600">
                    {businessProfile?.business_name}
                  </span>
                </li>

                <li className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">
                    Location:
                  </span>
                  <span className="text-gray-600">
                    {profile?.location || 'Not specified'}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact
              </h2>
              {/* Contact info would go here - currently hidden for privacy */}
              <p className="text-gray-600">
                Please use the social media links above to contact this business
                about potential opportunities.
              </p>

              {/* CTA Button */}
              {profile?.social_links?.instagram && (
                <a
                  href={profile.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Contact on Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
