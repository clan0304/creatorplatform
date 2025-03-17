'use client';

import { useState, useEffect } from 'react';
import supabase from '@/utils/supabase/client';
import Modal from '@/components/Modal';
import BusinessForm from '@/components/BusinessForm';
import { useAuth } from '@/hooks/useAuth';
import BusinessContainer from '@/components/BusinessContainer';

interface BusinessProfile {
  id: string;
  business_id: string;
  business_name: string;
  business_address: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const FindworkPage = () => {
  const { user, profile, isBusiness, refreshProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userBusinessProfile, setUserBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);

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

  const handleSaveBusinessProfile = async (values: {
    description: string;
    business_name: string;
    business_address: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('business_profile').upsert(
        {
          business_id: user.id,
          business_name: values.business_name,
          business_address: values.business_address,
          description: values.description,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      );

      if (error) throw error;

      setUserBusinessProfile({
        ...userBusinessProfile,
        business_name: values.business_name,
        business_address: values.business_address,
        description: values.description,
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Find Work</h1>
          {isBusiness && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {hasBusinessProfile
                ? 'Edit Business Profile'
                : 'Add Business Profile'}
            </button>
          )}
        </div>

        <p className="text-gray-600 max-w-3xl">
          Browse businesses looking for talented creators. Each business profile
          shows what they&apos;re looking for and how to get in touch with them
          about potential work opportunities.
        </p>
      </div>

      <BusinessContainer
        user={user}
        isBusiness={isBusiness}
        setIsProfileModalOpen={setIsModalOpen}
        userHasBusinessProfile={hasBusinessProfile}
        refreshProfiles={hasBusinessProfile}
      />

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
              business_address:
                userBusinessProfile?.business_address ||
                profile?.business_address ||
                '',
              description: userBusinessProfile?.description || '',
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
