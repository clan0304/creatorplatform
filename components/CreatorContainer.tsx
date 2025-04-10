/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/utils/supabase/client';
import type { Profile } from '@/types';
import Image from 'next/image';

interface CreatorProfile {
  id: string;
  creator_id: string;
  description: string;
  country: string;
  city: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

interface TravelSchedule {
  id: string;
  creator_id: string;
  country: string;
  city: string;
  start_date: string;
  end_date: string;
}

interface CreatorContainerProps {
  user: any; // Can be null for non-logged-in users
  isCreator: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  setIsTravelModalOpen: (isOpen: boolean) => void;
  userHasCreatorProfile: boolean;
  userHasTravelSchedule: boolean;
  searchQuery?: string;
  selectedCountry?: string;
}

const CreatorContainer = ({
  user,
  isCreator,
  setIsProfileModalOpen,
  setIsTravelModalOpen,
  userHasCreatorProfile,
  userHasTravelSchedule,
  searchQuery = '',
  selectedCountry = '',
}: CreatorContainerProps) => {
  const router = useRouter();

  const [creatorProfiles, setCreatorProfiles] = useState<CreatorProfile[]>([]);
  const [filteredCreatorProfiles, setFilteredCreatorProfiles] = useState<
    CreatorProfile[]
  >([]);
  const [travelSchedules, setTravelSchedules] = useState<
    Record<string, TravelSchedule[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      setIsLoading(true);
      try {
        // Get all creator profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('creator_profile')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        let enhancedProfiles: CreatorProfile[] = [];

        if (profilesData && profilesData.length > 0) {
          // Get all creator IDs to fetch their profiles
          const creatorIds = profilesData.map((profile) => profile.creator_id);

          // Fetch all related profiles
          const { data: profilesInfo, error: profilesInfoError } =
            await supabase.from('profiles').select('*').in('id', creatorIds);

          if (profilesInfoError) throw profilesInfoError;

          enhancedProfiles = profilesData.map((creatorProfile) => {
            const relatedProfile = profilesInfo?.find(
              (p) => p.id === creatorProfile.creator_id
            );
            return {
              ...creatorProfile,
              profile: relatedProfile,
            };
          });

          await fetchTravelSchedules(creatorIds);
        }

        setCreatorProfiles(enhancedProfiles);
        setFilteredCreatorProfiles(enhancedProfiles);
      } catch (err: any) {
        console.error('Error fetching creator data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorData();
  }, []);

  // Apply filters when search query or country selection changes
  useEffect(() => {
    if (!creatorProfiles.length) return;

    // Function to check if a date is within the travel window (30 days before start date to end date)
    const isWithinTravelWindow = (
      schedule: TravelSchedule,
      today = new Date()
    ): boolean => {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);

      // Calculate the date 30 days before start date
      const thirtyDaysBeforeStart = new Date(startDate);
      thirtyDaysBeforeStart.setDate(thirtyDaysBeforeStart.getDate() - 30);

      // Check if today is within the window (30 days before start to end date)
      return today >= thirtyDaysBeforeStart && today <= endDate;
    };

    // Function to check if a schedule matches search criteria
    const scheduleMatchesSearch = (
      schedule: TravelSchedule,
      query: string
    ): boolean => {
      query = query.toLowerCase();
      return (
        schedule.country.toLowerCase().includes(query) ||
        schedule.city.toLowerCase().includes(query)
      );
    };

    // Function to check if a schedule matches country filter
    const scheduleMatchesCountry = (
      schedule: TravelSchedule,
      country: string
    ): boolean => {
      return schedule.country === country;
    };

    // Create a Set to track creator IDs that match the criteria (to avoid duplicates)
    const matchingCreatorIds = new Set<string>();

    // Filter creators based on their profile data
    creatorProfiles.forEach((creator) => {
      const profile = creator.profile as Profile;
      let matchesSearch = true;
      let matchesCountry = true;

      // Check if creator matches search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          creator.description?.toLowerCase().includes(query) ||
          profile?.username?.toLowerCase().includes(query) ||
          false ||
          creator.city?.toLowerCase().includes(query) ||
          creator.country?.toLowerCase().includes(query) ||
          profile?.languages?.some((lang) =>
            lang.toLowerCase().includes(query)
          ) ||
          false;

        // If creator profile doesn't match, check their travel schedules
        if (!matchesSearch) {
          const creatorSchedules = travelSchedules[creator.creator_id] || [];
          const today = new Date();

          // Check if any current or upcoming travel schedule matches the search query
          matchesSearch = creatorSchedules.some(
            (schedule) =>
              isWithinTravelWindow(schedule, today) &&
              scheduleMatchesSearch(schedule, searchQuery)
          );
        }
      }

      // Check if creator matches country filter
      if (selectedCountry) {
        matchesCountry = creator.country === selectedCountry;

        // If creator profile doesn't match, check their travel schedules
        if (!matchesCountry) {
          const creatorSchedules = travelSchedules[creator.creator_id] || [];
          const today = new Date();

          // Check if any current or upcoming travel schedule matches the country filter
          matchesCountry = creatorSchedules.some(
            (schedule) =>
              isWithinTravelWindow(schedule, today) &&
              scheduleMatchesCountry(schedule, selectedCountry)
          );
        }
      }

      // Add to matching set if creator matches both search query and country filter
      if (matchesSearch && matchesCountry) {
        matchingCreatorIds.add(creator.creator_id);
      }
    });

    // Filter the creator profiles based on the matching IDs
    const results = creatorProfiles.filter((creator) =>
      matchingCreatorIds.has(creator.creator_id)
    );

    setFilteredCreatorProfiles(results);
  }, [searchQuery, selectedCountry, creatorProfiles, travelSchedules]);

  const fetchTravelSchedules = async (creatorIds: string[]) => {
    try {
      // Skip if there are no creator IDs
      if (!creatorIds.length) {
        return;
      }

      const { data: travelData, error: travelError } = await supabase
        .from('creator_travel_schedule')
        .select('*')
        .in('creator_id', creatorIds)
        .order('start_date', { ascending: true });

      if (travelError) throw travelError;

      const schedulesMap: Record<string, TravelSchedule[]> = {};

      // Initialize empty arrays for all creator IDs
      creatorIds.forEach((id) => {
        schedulesMap[id] = [];
      });

      // Fill in the data for creators who have schedules
      travelData?.forEach((schedule) => {
        schedulesMap[schedule.creator_id].push(schedule);
      });

      setTravelSchedules(schedulesMap);
    } catch (err: any) {
      console.error('Error fetching travel schedules:', err);
    }
  };

  const navigateToProfile = (username: string) => {
    router.push(`/${username}`);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    const currentYear = new Date().getFullYear();
    if (start.getFullYear() !== currentYear) {
      options.year = 'numeric';
    }

    const formattedStart = start.toLocaleDateString('en-US', options);
    const formattedEnd = end.toLocaleDateString('en-US', options);

    return `${formattedStart} - ${formattedEnd}`;
  };

  const isCurrentOrUpcoming = (schedule: TravelSchedule) => {
    const today = new Date();
    const endDate = new Date(schedule.end_date);
    return endDate >= today;
  };

  // Function to highlight why this creator appears in search results
  const getHighlightedTravelSchedules = (
    creatorId: string,
    searchQuery: string,
    selectedCountry: string
  ): TravelSchedule[] => {
    if (!searchQuery && !selectedCountry) return [];

    const creatorSchedules = travelSchedules[creatorId] || [];
    const today = new Date();

    return creatorSchedules.filter((schedule) => {
      // Calculate 30 days before start date
      const startDate = new Date(schedule.start_date);
      const thirtyDaysBefore = new Date(startDate);
      thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);

      // Check if schedule is current or upcoming (within window)
      const isWithinWindow =
        today >= thirtyDaysBefore && today <= new Date(schedule.end_date);

      if (!isWithinWindow) return false;

      // Check if schedule matches search query or country filter
      const matchesQuery = searchQuery
        ? schedule.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          schedule.city.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      const matchesCountry = selectedCountry
        ? schedule.country === selectedCountry
        : false;

      return matchesQuery || matchesCountry;
    });
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-white"></div>
            </div>
          </div>
          <p className="ml-3 text-indigo-600 font-medium">
            Loading creators...
          </p>
        </div>
      ) : filteredCreatorProfiles.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-8 text-center shadow-sm border border-indigo-100">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {creatorProfiles.length === 0
              ? 'No Creators Found'
              : 'No creators match your search criteria'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {creatorProfiles.length === 0
              ? 'There are currently no creator profiles available.'
              : 'Try adjusting your search or filter to find creators. We also search their travel schedules for matches.'}
          </p>
          {/* Only show the "Be the First" button for logged-in creators without a profile */}
          {user &&
            isCreator &&
            !userHasCreatorProfile &&
            creatorProfiles.length === 0 && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow flex items-center mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Be the First to Add a Creator Profile
              </button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCreatorProfiles.map((creatorProfile) => {
            const creator = creatorProfile.profile as Profile;
            const creatorSchedules =
              travelSchedules[creatorProfile.creator_id] || [];

            // Skip if no profile data is joined
            if (!creator) return null;

            // Filter for current and upcoming travel
            const upcomingSchedules = creatorSchedules
              .filter(isCurrentOrUpcoming)
              .slice(0, 3); // Show at most 3 upcoming schedules

            // Get travel schedules that match search criteria (for highlighting)
            const matchingSchedules =
              searchQuery || selectedCountry
                ? getHighlightedTravelSchedules(
                    creatorProfile.creator_id,
                    searchQuery,
                    selectedCountry
                  )
                : [];

            // Check if this creator profile belongs to the logged-in user
            const isOwnProfile = user && creatorProfile.creator_id === user.id;

            return (
              <div
                key={creatorProfile.id}
                onClick={() => navigateToProfile(creator.username)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-indigo-100 hover:translate-y-[-2px] cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-5">
                    {creator.profile_photo_url ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-indigo-50">
                        <Image
                          src={creator.profile_photo_url || '/placeholder.svg'}
                          alt={creator.username || 'Creator'}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center ring-2 ring-indigo-50">
                        <span className="text-indigo-600 text-xl font-medium">
                          {creator.username?.charAt(0).toUpperCase() || 'C'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {creator.username}
                      </h3>
                      {/* Display city and country from creator profile */}
                      <p className="text-gray-500 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 mr-1 text-gray-400"
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
                        {creatorProfile.city && creatorProfile.country
                          ? `${creatorProfile.city}, ${creatorProfile.country}`
                          : creatorProfile.city ||
                            creatorProfile.country ||
                            'No location'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-5">
                    <p className="text-gray-600 line-clamp-3 italic text-sm">
                      &quot;{creatorProfile.description}&quot;
                    </p>
                  </div>

                  {/* Show highlighted travel schedules first if they match search criteria */}
                  {matchingSchedules.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-indigo-700 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-indigo-500"
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
                        Matching Travel Plans
                      </h4>
                      <ul className="space-y-2 bg-indigo-50 rounded-lg border border-indigo-100 p-2.5">
                        {matchingSchedules.map((schedule) => (
                          <li
                            key={schedule.id}
                            className="text-xs flex items-center"
                          >
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                            <span className="font-medium text-indigo-700">
                              {schedule.city}, {schedule.country}:
                            </span>{' '}
                            <span className="text-indigo-600 ml-1">
                              {formatDateRange(
                                schedule.start_date,
                                schedule.end_date
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Show regular travel schedules if they're not already shown as matching */}
                  {upcomingSchedules.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-primary"
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
                      </h4>
                      <ul className="space-y-2 bg-white rounded-lg border border-gray-100 p-2.5">
                        {upcomingSchedules
                          // Filter out schedules that are already shown in matching schedules
                          .filter(
                            (schedule) =>
                              !matchingSchedules.some(
                                (ms) => ms.id === schedule.id
                              )
                          )
                          .map((schedule) => (
                            <li
                              key={schedule.id}
                              className="text-xs flex items-center"
                            >
                              <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                              <span className="font-medium text-indigo-600">
                                {schedule.city}, {schedule.country}:
                              </span>{' '}
                              <span className="text-gray-600 ml-1">
                                {formatDateRange(
                                  schedule.start_date,
                                  schedule.end_date
                                )}
                              </span>
                            </li>
                          ))}
                        {creatorSchedules.length > 3 && (
                          <li className="text-xs text-gray-500 italic pl-4 mt-1">
                            +{creatorSchedules.length - 3} more schedule
                            {creatorSchedules.length - 3 > 1 ? 's' : ''}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Social media links - keeping these as they provide important contact info */}
                  {creator.social_links && (
                    <div className="flex space-x-3 mt-2">
                      {creator.social_links.instagram && (
                        <a
                          href={creator.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 transition-colors p-1.5 rounded-full hover:bg-pink-50"
                          aria-label="Instagram"
                          onClick={(e) => e.stopPropagation()} // Prevent clicking from triggering the parent card click
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {creator.social_links.youtube && (
                        <a
                          href={creator.social_links.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 transition-colors p-1.5 rounded-full hover:bg-red-50"
                          aria-label="YouTube"
                          onClick={(e) => e.stopPropagation()} // Prevent clicking from triggering the parent card click
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                          </svg>
                        </a>
                      )}
                      {creator.social_links.tiktok && (
                        <a
                          href={creator.social_links.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                          aria-label="TikTok"
                          onClick={(e) => e.stopPropagation()} // Prevent clicking from triggering the parent card click
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Only show edit buttons for user's own profile if they are logged in */}
                  {user && isCreator && isOwnProfile && (
                    <div
                      className="mt-5 pt-4 border-t border-gray-100 flex justify-between"
                      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking on these buttons
                    >
                      <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Profile
                      </button>
                      {userHasTravelSchedule ? (
                        <button
                          onClick={() => setIsTravelModalOpen(true)}
                          className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit Travel Schedule
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsTravelModalOpen(true)}
                          className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Add Travel Schedule
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreatorContainer;
