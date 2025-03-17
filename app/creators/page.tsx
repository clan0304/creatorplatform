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

  // User-specific states
  const [userDescription, setUserDescription] = useState<string | null>(null);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [hasTravelSchedule, setHasTravelSchedule] = useState(false);

  // Fetch user-specific data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Check if user has a creator profile
        const { data: profileData } = await supabase
          .from('creator_profile')
          .select('description')
          .eq('creator_id', user.id)
          .single();

        if (profileData) {
          setUserDescription(profileData.description);
          setHasCreatorProfile(true);

          // Check if user has travel schedules
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

  const handleSaveDescription = async (description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('creator_profile').upsert(
        {
          creator_id: user.id,
          description,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'creator_id' }
      );

      if (error) throw error;

      setUserDescription(description);
      setHasCreatorProfile(true);
      setIsProfileModalOpen(false);

      await refreshProfile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error saving creator profile:', err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 sm:mb-0">
            Creators
          </h1>

          {isCreator && (
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

        <p className="text-gray-600 max-w-3xl">
          Discover talented creators available for your projects. Each creator
          brings unique skills and expertise. Browse through their profiles and
          travel schedules to find the perfect match for your creative needs.
        </p>
      </div>

      <CreatorContainer
        user={user}
        isCreator={isCreator}
        setIsProfileModalOpen={setIsProfileModalOpen}
        setIsTravelModalOpen={setIsTravelModalOpen}
        userHasCreatorProfile={hasCreatorProfile}
        userHasTravelSchedule={hasTravelSchedule}
      />

      {/* Creator Profile Modal */}
      {isCreator && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title={
            hasCreatorProfile ? 'Edit Creator Profile' : 'Add Creator Profile'
          }
        >
          <CreatorForm
            initialDescription={userDescription || ''}
            onSubmit={handleSaveDescription}
            onCancel={() => setIsProfileModalOpen(false)}
          />
        </Modal>
      )}

      {/* Travel Schedule Modal */}
      {isCreator && hasCreatorProfile && user && (
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
    </div>
  );
};

export default CreatorsPage;
