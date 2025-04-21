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
  languages?: string[];
  portfolio_items: string[];
  social_links?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  user_type: 'creator';
}

interface CreatorProfile {
  id: string;
  creator_id: string;
  description: string;
}

interface TravelSchedule {
  id: string;
  creator_id: string;
  country: string; // Ensure this property exists
  city: string; // Ensure this property exists
  start_date: string;
  end_date: string;
}

const CreatorProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(
    null
  );
  const [travelSchedules, setTravelSchedules] = useState<TravelSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchCreatorData = async () => {
      setIsLoading(true);
      try {
        // 1. Get the profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile not found
            notFound();
          }
          throw profileError;
        }

        // Set profile data
        setProfile(profileData);

        // Check if this is the current user's profile
        if (user && profileData.id === user.id) {
          setIsCurrentUser(true);
        }

        // 2. Get creator profile data
        const { data: creatorData, error: creatorError } = await supabase
          .from('creator_profile')
          .select('*')
          .eq('creator_id', profileData.id)
          .single();

        if (creatorError) {
          if (creatorError.code !== 'PGRST116') {
            throw creatorError;
          } else if (profileData.user_type !== 'creator') {
            // This user isn't a creator
            notFound();
          }
        } else {
          setCreatorProfile(creatorData);
        }

        // 3. Get travel schedules
        const { data: travelData, error: travelError } = await supabase
          .from('creator_travel_schedule')
          .select('*')
          .eq('creator_id', profileData.id)
          .order('start_date', { ascending: true });

        if (travelError) throw travelError;

        // Filter to only show current/future travel
        const today = new Date();
        const upcomingSchedules = (travelData || []).filter(
          (schedule) => new Date(schedule.end_date) >= today
        );

        setTravelSchedules(upcomingSchedules);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching creator profile:', err);
        setError(err.message || 'Failed to load creator profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchCreatorData();
    }
  }, [username, user]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Updated to always show year
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric', // Always include year regardless of current year
    };

    const formattedStart = start.toLocaleDateString('en-US', options);
    const formattedEnd = end.toLocaleDateString('en-US', options);

    return `${formattedStart} - ${formattedEnd}`;
  };

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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative">
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
                <div className="h-full w-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-600">
                    {profile?.username?.[0]?.toUpperCase() || 'C'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.username}
            </h1>
            <p className="text-gray-600 flex items-center mt-1">
              {profile?.location && (
                <>
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
              <div className="prose text-gray-600">
                <p>{creatorProfile?.description}</p>
              </div>
            </div>
          </div>

          {profile?.portfolio_items && profile.portfolio_items.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.portfolio_items.map((item, index) => {
                    // Check if the item is a video by testing against common video extensions
                    const videoExtensions = [
                      '.mp4',
                      '.mov',
                      '.avi',
                      '.webm',
                      '.mkv',
                      '.wmv',
                      '.flv',
                      '.m4v',
                      '.3gp',
                      '.ogv',
                    ];
                    const isVideo = videoExtensions.some((ext) =>
                      item.toLowerCase().endsWith(ext)
                    );

                    // Alternative approach: check for video MIME type in the URL if it exists
                    const hasVideoParam =
                      item.includes('video') ||
                      item.includes('content-type=video');

                    return (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-lg group"
                      >
                        {/* Square aspect ratio container */}
                        <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                          {isVideo || hasVideoParam ? (
                            // Video portfolio item
                            <video
                              src={item}
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                              onError={(e) => {
                                console.error('Video failed to load:', item);
                                // Replace broken video with placeholder
                                (e.target as HTMLVideoElement).style.display =
                                  'none';
                                const parent = (e.target as HTMLVideoElement)
                                  .parentElement;
                                if (parent) {
                                  parent.classList.add(
                                    'flex',
                                    'items-center',
                                    'justify-center'
                                  );
                                  parent.innerHTML +=
                                    '<div class="text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="mt-2 text-sm">Video unavailable</p></div>';
                                }
                              }}
                            />
                          ) : (
                            // Image portfolio item
                            <Image
                              src={item}
                              alt={`Portfolio item ${index + 1}`}
                              width={500}
                              height={500}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                console.error('Image failed to load:', item);
                                // Replace broken image with placeholder
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" font-family="Arial" font-size="20" text-anchor="middle" fill="%2394a3b8">Image not available</text></svg>';
                                target.onerror = null; // Prevent infinite loops
                              }}
                            />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 w-full flex justify-between items-center">
                            <span className="text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                              {isVideo ? 'Video' : 'Image'} {index + 1}
                            </span>
                            <button
                              className="text-white text-sm bg-indigo-600/90 hover:bg-indigo-700 py-1.5 px-3 rounded-md transition-colors"
                              onClick={() => window.open(item, '_blank')}
                            >
                              View Full
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* Additional content sections can be added here */}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Travel Schedule */}
          {travelSchedules.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Travel Schedule
                </h2>
                <ul className="space-y-3">
                  {travelSchedules.map((schedule) => (
                    <li
                      key={schedule.id}
                      className="bg-gray-50 p-3 rounded-lg flex flex-col"
                    >
                      <span className="font-medium text-indigo-600">
                        {schedule.city}, {schedule.country}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {formatDateRange(
                          schedule.start_date,
                          schedule.end_date
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfilePage;
