'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import supabase from '@/utils/supabase/client';
import Modal from '@/components/Modal';
import BusinessForm from '@/components/BusinessForm';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface BusinessProfile {
  id: string;
  business_id: string;
  title: string;
  business_name: string;
  description: string;
  business_country?: string;
  business_city?: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

const FindworkPage = () => {
  const { user, profile, isBusiness, refreshProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userBusinessProfile, setUserBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>(
    []
  );
  const [filteredBusinessProfiles, setFilteredBusinessProfiles] = useState<
    BusinessProfile[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Function to generate a slug from a string
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '') // Remove special characters
      .replace(/ +/g, '-') // Replace spaces with hyphens
      .trim(); // Trim whitespace
  };

  // Function to convert customized country name back to original country-list name
  const getOriginalCountryName = (customizedName: string): string => {
    // Create a reverse mapping from custom names to original names
    const reverseOverrides: Record<string, string> = {
      Taiwan: 'Taiwan, Province of China',
    };

    return reverseOverrides[customizedName] || customizedName;
  };

  // Function to convert original country name to customized name
  const getCustomizedCountryName = (originalName: string): string => {
    const countryNameOverrides: Record<string, string> = {
      'Taiwan, Province of China': 'Taiwan',
    };

    return countryNameOverrides[originalName] || originalName;
  };

  // Check if the current user has a business profile
  useEffect(() => {
    const checkUserBusinessProfile = async () => {
      if (!user) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('business_profile')
          .select('*')
          .eq('business_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user business profile:', error);
        }

        if (data) {
          setUserBusinessProfile(data);
          setHasBusinessProfile(true);
        } else {
          setHasBusinessProfile(false);
        }
      } catch (err) {
        console.error('Error in business profile check:', err);
      }
    };

    checkUserBusinessProfile();
  }, [user]);

  // Fetch all business profiles
  useEffect(() => {
    const fetchBusinessProfiles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('business_profile')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Convert country names in the data for display purposes
        const processedData =
          data?.map((business) => ({
            ...business,
            business_country: business.business_country
              ? getCustomizedCountryName(business.business_country)
              : undefined,
          })) || [];

        setBusinessProfiles(processedData);
        setFilteredBusinessProfiles(processedData);
      } catch (err) {
        console.error('Error fetching business profiles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfiles();
  }, [hasBusinessProfile]);

  // Apply filters when search query or country selection changes
  useEffect(() => {
    if (!businessProfiles.length) return;

    let results = [...businessProfiles];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (business) =>
          business.title.toLowerCase().includes(query) ||
          business.description.toLowerCase().includes(query) ||
          business.business_name.toLowerCase().includes(query)
      );
    }

    // Filter by country
    if (selectedCountry) {
      results = results.filter(
        (business) => business.business_country === selectedCountry
      );
    }

    setFilteredBusinessProfiles(results);
  }, [searchQuery, selectedCountry, businessProfiles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is handled by the useEffect above
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  const handleSaveBusinessProfile = async (values: {
    description: string;
    business_name: string;
    title: string;
    business_country?: string;
    business_city?: string;
  }) => {
    if (!user) return;

    try {
      // Generate a slug from the business name
      const baseSlug = generateSlug(values.business_name);
      let slug = baseSlug;

      // Check if the slug already exists (only needed for new profiles or name changes)
      if (
        !userBusinessProfile ||
        userBusinessProfile.business_name !== values.business_name
      ) {
        let slugExists = true;
        let counter = 0;

        // Keep checking until we find a unique slug
        while (slugExists && counter < 100) {
          // Limit iterations as a safety measure
          const { data, error } = await supabase
            .from('business_profile')
            .select('id')
            .eq('slug', slug)
            .not('business_id', 'eq', user.id) // Exclude the current business
            .maybeSingle();

          if (error) throw error;

          if (data) {
            // Slug exists, try adding a number
            counter++;
            slug = `${baseSlug}-${counter}`;
          } else {
            slugExists = false;
          }
        }
      } else {
        // Keep the existing slug if the business name hasn't changed
        slug = userBusinessProfile.slug || slug;
      }

      // For saving to database, we need to convert our custom country name back to original if needed
      const originalCountryName = values.business_country
        ? getOriginalCountryName(values.business_country)
        : undefined;

      // Now update or insert the profile with the slug
      const { error } = await supabase.from('business_profile').upsert(
        {
          business_id: user.id,
          business_name: values.business_name,
          title: values.title,
          description: values.description,
          business_country: originalCountryName,
          business_city: values.business_city,
          slug: slug, // Add the slug
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      );

      if (error) throw error;

      setUserBusinessProfile({
        ...userBusinessProfile,
        business_name: values.business_name,
        title: values.title,
        description: values.description,
        business_country: values.business_country, // Keep the customized name in UI state
        business_city: values.business_city,
        slug: slug, // Include slug in local state
        business_id: user.id,
        id: userBusinessProfile?.id || '',
        created_at: userBusinessProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setHasBusinessProfile(true);
      setIsModalOpen(false);

      // Refresh profile data
      await refreshProfile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error saving business profile:', err);
    }
  };

  // Function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Function to format location from country and city
  const formatLocation = (business: BusinessProfile) => {
    if (business.business_city && business.business_country) {
      return `${business.business_city}, ${business.business_country}`;
    } else if (business.business_country) {
      return business.business_country;
    } else if (business.business_city) {
      return business.business_city;
    }
    return null;
  };

  // Function to get the URL path for a business profile
  const getBusinessUrl = (business: BusinessProfile) => {
    // Use slug if available, otherwise fallback to ID
    return `/findwork/${business.slug || business.id}`;
  };

  // Calculate unique countries from available business profiles
  const availableCountries = [
    ...new Set(
      businessProfiles
        .filter((business) => business.business_country)
        .map((business) => business.business_country)
    ),
  ].sort() as string[];

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Find Work</h1>
          {isBusiness && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-building-2"
              >
                <path d="M6 22V2a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v20" />
                <path d="M12 13V7" />
                <path d="M10 10h4" />
                <path d="M2 22h20" />
                <path d="M19 22V11" />
              </svg>
              {hasBusinessProfile
                ? 'Edit Business Profile'
                : 'Add Business Profile'}
            </button>
          )}
        </div>

        <p className="text-gray-600 max-w-3xl mb-8 text-lg">
          Browse businesses looking for talented creators. Each business profile
          shows what they&apos;re looking for and how to get in touch with them
          about potential work opportunities.
        </p>

        {/* Filter/Search Section */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            {/* Search Input */}
            <div className="flex-grow flex md:w-1/2 shadow-sm rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search for opportunities..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition-colors hover:cursor-pointer flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-search"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>

            {/* Country Dropdown */}
            <div className="md:w-64">
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm appearance-none"
                >
                  <option value="">All Countries</option>
                  {availableCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-down"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Job Listings */}
      <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading opportunities...
            </p>
          </div>
        ) : filteredBusinessProfiles.length === 0 ? (
          <div className="py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search-x mx-auto text-gray-400 mb-4"
            >
              <path d="m13.5 8.5-5 5" />
              <path d="m8.5 8.5 5 5" />
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-gray-600 text-lg">
              {businessProfiles.length === 0
                ? 'No business profiles available yet.'
                : 'No business profiles match your search criteria.'}
            </p>
          </div>
        ) : (
          filteredBusinessProfiles.map((business) => (
            <Link
              key={business.id}
              href={getBusinessUrl(business)}
              className="block transition-colors hover:bg-gray-50"
            >
              <div className="p-6 cursor-pointer">
                <div className="flex flex-col">
                  {/* Business name and date */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {business.business_name}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      Posted {formatDate(business.updated_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-purple-700 mb-3 hover:text-purple-800">
                    {business.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {truncateText(business.description, 200)}
                  </p>

                  {/* Location */}
                  {formatLocation(business) && (
                    <div className="text-sm text-gray-500 mt-auto flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 text-gray-400"
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
                      {formatLocation(business)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {isBusiness && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            hasBusinessProfile
              ? 'Edit Business Profile'
              : 'Add Business Profile'
          }
        >
          <BusinessForm
            initialValues={{
              business_name:
                userBusinessProfile?.business_name ||
                profile?.business_name ||
                '',
              title: userBusinessProfile?.title || '',
              description: userBusinessProfile?.description || '',
              business_country: userBusinessProfile?.business_country || '',
              business_city: userBusinessProfile?.business_city || '',
            }}
            onSubmit={handleSaveBusinessProfile}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default FindworkPage;
