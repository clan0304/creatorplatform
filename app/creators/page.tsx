// app/creator/page.tsx
'use client';

import { useState, useEffect } from 'react';
import supabase from '@/utils/supabase/client';
import Modal from '@/components/Modal';
import CreatorForm from '@/components/CreatorForm';
import TravelScheduleForm from '@/components/TravelScheduleForm';
import CreatorContainer from '@/components/CreatorContainer';
import { useAuth } from '@/hooks/useAuth';

const CreatorsPage = () => {
  const { user, isCreator, refreshProfile } = useAuth();

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);

  // User-specific states (only relevant for authenticated creators)
  const [userDescription, setUserDescription] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [hasTravelSchedule, setHasTravelSchedule] = useState(false);

  // Search and filter states (available to all users)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  // Fetch user-specific data (only for authenticated users)
  useEffect(() => {
    if (!user) return; // Skip if no user is logged in

    const fetchUserData = async () => {
      try {
        const { data: profileData } = await supabase
          .from('creator_profile')
          .select('description, country, city')
          .eq('creator_id', user.id)
          .single();

        if (profileData) {
          setUserDescription(profileData.description);
          setUserCountry(profileData.country || '');
          setUserCity(profileData.city || '');
          setHasCreatorProfile(true);

          const { data: travelData } = await supabase
            .from('creator_travel_schedule')
            .select('id')
            .eq('creator_id', user.id);

          setHasTravelSchedule(!!travelData && travelData.length > 0);
        } else {
          setHasCreatorProfile(false);
          setHasTravelSchedule(false);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [user]);

  // Fetch available countries for filter (runs for all users)
  useEffect(() => {
    const fetchAvailableCountries = async () => {
      try {
        const { data: profileCountries, error: profileError } = await supabase
          .from('creator_profile')
          .select('country')
          .not('country', 'is', null);

        if (profileError) throw profileError;

        const { data: travelCountries, error: travelError } = await supabase
          .from('creator_travel_schedule')
          .select('country')
          .not('country', 'is', null);

        if (travelError) throw travelError;

        const allCountries = [
          ...(profileCountries || []).map((item) => item.country),
          ...(travelCountries || []).map((item) => item.country),
        ];

        const countries = [...new Set(allCountries.filter(Boolean))].sort();
        setAvailableCountries(countries as string[]);
      } catch (err) {
        console.error('Error fetching available countries:', err);
      }
    };

    fetchAvailableCountries();
  }, []);

  const handleSaveProfile = async (data: {
    description: string;
    country: string;
    city: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('creator_profile').upsert(
        {
          creator_id: user.id,
          description: data.description,
          country: data.country,
          city: data.city,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'creator_id' }
      );

      if (error) throw error;

      setUserDescription(data.description);
      setUserCountry(data.country);
      setUserCity(data.city);
      setHasCreatorProfile(true);
      setIsProfileModalOpen(false);

      await refreshProfile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error saving creator profile:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 sm:mb-0">
            Creators
          </h1>

          {/* Show buttons only for authenticated creators */}
          {user && isCreator && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {hasCreatorProfile ? 'Edit Profile' : 'Add Profile'}
              </button>

              {hasCreatorProfile && (
                <button
                  onClick={() => setIsTravelModalOpen(true)}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  {hasTravelSchedule
                    ? 'Edit Travel Schedule'
                    : 'Add Travel Schedule'}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-600 max-w-3xl mb-6">
          Browse talented creators from around the world. Connect with creators
          based on their location, languages, and travel schedule to find the
          perfect match for your needs.
        </p>

        {/* Filter/Search Section - Available to all users */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 md:items-center">
            <div className="flex-grow flex md:w-1/2">
              <input
                type="text"
                placeholder="Search for creators..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md "
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary font-semibold text-white rounded-r-md hover:bg-indigo-700 transition-colors hover:cursor-pointer"
              >
                Search
              </button>
            </div>

            <div className="md:w-64">
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Countries</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Creator profiles - Accessible to all users */}
      <CreatorContainer
        user={user} // Can be null for non-authenticated users
        isCreator={isCreator || false}
        setIsProfileModalOpen={setIsProfileModalOpen}
        setIsTravelModalOpen={setIsTravelModalOpen}
        userHasCreatorProfile={hasCreatorProfile}
        userHasTravelSchedule={hasTravelSchedule}
        searchQuery={searchQuery}
        selectedCountry={selectedCountry}
      />

      {/* Modals - Only for authenticated creators */}
      {user && isCreator && (
        <>
          <Modal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            title={
              hasCreatorProfile ? 'Edit Creator Profile' : 'Add Creator Profile'
            }
          >
            <CreatorForm
              initialDescription={userDescription || ''}
              initialCountry={userCountry || ''}
              initialCity={userCity || ''}
              onSubmit={handleSaveProfile}
              onCancel={() => setIsProfileModalOpen(false)}
            />
          </Modal>

          {hasCreatorProfile && (
            <Modal
              isOpen={isTravelModalOpen}
              onClose={() => setIsTravelModalOpen(false)}
              title="Travel Schedule"
              size="lg"
            >
              <TravelScheduleForm
                creatorId={user.id}
                onCancel={() => setIsTravelModalOpen(false)}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default CreatorsPage;
