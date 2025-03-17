/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/utils/supabase/client';
import { Profile } from '@/types';
import Image from 'next/image';

// Define an interface for business profiles
interface BusinessProfile {
  id: string;
  business_id: string;
  business_name: string;
  business_address: string;
  description: string;
  created_at: string;
  updated_at: string;
  profile?: Profile; // Joined profile data
}

interface BusinessContainerProps {
  user: any;
  isBusiness: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  userHasBusinessProfile: boolean;
  refreshProfiles: boolean;
}

const BusinessContainer = ({
  user,
  isBusiness,
  setIsProfileModalOpen,
  userHasBusinessProfile,
  refreshProfiles,
}: BusinessContainerProps) => {
  const router = useRouter();
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all business profiles
  useEffect(() => {
    const fetchBusinessProfiles = async () => {
      setIsLoading(true);
      try {
        // Get all business profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('business_profile')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        let enhancedProfiles: BusinessProfile[] = [];

        if (profilesData && profilesData.length > 0) {
          // Get all business IDs to fetch their profiles
          const businessIds = profilesData.map(
            (profile) => profile.business_id
          );

          // Fetch all related profiles
          const { data: profilesInfo, error: profilesInfoError } =
            await supabase.from('profiles').select('*').in('id', businessIds);

          if (profilesInfoError) throw profilesInfoError;

          // Join the data
          enhancedProfiles = profilesData.map((businessProfile) => {
            const relatedProfile = profilesInfo?.find(
              (p) => p.id === businessProfile.business_id
            );
            return {
              ...businessProfile,
              profile: relatedProfile,
            };
          });
        }

        setBusinessProfiles(enhancedProfiles);
      } catch (err: any) {
        console.error('Error fetching business profiles:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfiles();
  }, [refreshProfiles]); // Refetch when refreshProfiles changes

  const handleDeleteBusinessProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('business_profile')
        .delete()
        .eq('business_id', user.id);

      if (error) throw error;

      // Update the profiles list
      setBusinessProfiles(
        businessProfiles.filter((profile) => profile.business_id !== user.id)
      );
    } catch (err: any) {
      console.error('Error deleting business profile:', err);
      setError(err.message);
    }
  };

  const handleViewBusinessProfile = (username: string) => {
    router.push(`/findwork/${username}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
        {error}
      </div>
    );
  }

  if (businessProfiles.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Business Profiles Found
        </h3>
        <p className="text-gray-500">
          There are currently no business profiles available.
        </p>
        {isBusiness && !userHasBusinessProfile && (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Be the First to Add a Business Profile
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businessProfiles.map((business) => {
        // Skip if there's no profile data
        if (!business.profile) return null;

        return (
          <div
            key={business.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                {business.profile.profile_photo_url ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={business.profile.profile_photo_url}
                      alt={business.business_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl font-medium">
                      {business.business_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {business.business_name}
                  </h3>
                  <p className="text-gray-500">
                    {business.profile.location || 'No location'}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-6 line-clamp-3">
                {business.description}
              </p>

              <div className="flex justify-between items-center">
                {business.profile.social_links && (
                  <div className="flex space-x-3">
                    {business.profile.social_links.instagram && (
                      <a
                        href={business.profile.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                        aria-label="Instagram"
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
                  </div>
                )}
                <button
                  onClick={() =>
                    handleViewBusinessProfile(business.profile!.username)
                  }
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View Profile
                </button>
              </div>

              {business.business_id === user?.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleDeleteBusinessProfile}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BusinessContainer;
