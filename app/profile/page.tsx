/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/utils/supabase/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TravelScheduleForm from '@/components/TravelScheduleForm';

interface Profile {
  id: string;
  username: string;
  profile_photo_url?: string;
  user_type: 'creator' | 'business';

  languages?: string[];
  social_links?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

interface CreatorProfile {
  id?: string;
  creator_id?: string;
  description: string;
}

interface BusinessProfile {
  id?: string;
  business_id?: string;
  business_name: string;

  description: string;
}

const ProfilePage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(
    null
  );
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [hasTravelSchedule, setHasTravelSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');

  // Function to convert customized country name back to original country-list name

  // Form fields
  const [username, setUsername] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [description, setDescription] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setUsername(profileData.username || '');
        setLanguages(profileData.languages || []);

        if (profileData.social_links) {
          setInstagramUrl(profileData.social_links.instagram || '');
          setYoutubeUrl(profileData.social_links.youtube || '');
          setTiktokUrl(profileData.social_links.tiktok || '');
        }

        // Fetch the specific profile based on user type
        if (profileData.user_type === 'creator') {
          const { data: creatorData, error: creatorError } = await supabase
            .from('creator_profile')
            .select('*')
            .eq('creator_id', user.id)
            .single();

          if (creatorError && creatorError.code !== 'PGRST116') {
            throw creatorError;
          }

          if (creatorData) {
            setCreatorProfile(creatorData);
            setDescription(creatorData.description || '');
          }

          // Check if creator has travel schedules
          const { data: travelData, error: travelError } = await supabase
            .from('creator_travel_schedule')
            .select('id')
            .eq('creator_id', user.id);

          if (travelError) throw travelError;
          setHasTravelSchedule(travelData && travelData.length > 0);
        } else if (profileData.user_type === 'business') {
          const { data: businessData, error: businessError } = await supabase
            .from('business_profile')
            .select('*')
            .eq('business_id', user.id)
            .single();

          if (businessError && businessError.code !== 'PGRST116') {
            throw businessError;
          }

          if (businessData) {
            setBusinessProfile(businessData);
            setBusinessName(businessData.business_name || '');

            setDescription(businessData.description || '');
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, authLoading, router]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhotoFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const validateUrls = () => {
    const urlPattern =
      /^(https?:\/\/)?([\w-])+\.{1}([a-zA-Z]{2,63})([/\w-]*)*\/?$/;

    if (instagramUrl && !urlPattern.test(instagramUrl)) {
      setError('Invalid Instagram URL format');
      return false;
    }

    if (youtubeUrl && !urlPattern.test(youtubeUrl)) {
      setError('Invalid YouTube URL format');
      return false;
    }

    if (tiktokUrl && !urlPattern.test(tiktokUrl)) {
      setError('Invalid TikTok URL format');
      return false;
    }

    return true;
  };

  const uploadProfilePhoto = async (): Promise<string | undefined> => {
    if (!profilePhotoFile) return profile?.profile_photo_url;

    try {
      const fileExt = profilePhotoFile.name.split('.').pop();
      // Remove the bucket name from the path - it's automatically included
      const filePath = `${user?.id}/profile-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, profilePhotoFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      setError('Failed to upload profile photo: ' + err.message);
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateUrls()) return;

    setIsSubmitting(true);

    try {
      // Upload profile photo if changed
      let photoUrl = profile?.profile_photo_url;
      if (profilePhotoFile) {
        photoUrl = await uploadProfilePhoto();
      }

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username,
          languages,
          profile_photo_url: photoUrl,
          social_links: {
            instagram: instagramUrl,
            youtube: youtubeUrl,
            tiktok: tiktokUrl,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update the specific profile based on user type
      if (profile?.user_type === 'creator' && creatorProfile) {
        const { error: creatorError } = await supabase
          .from('creator_profile')
          .update({
            description,
            updated_at: new Date().toISOString(),
          })
          .eq('creator_id', user?.id);

        if (creatorError) throw creatorError;
      } else if (profile?.user_type === 'business' && businessProfile) {
        const { error: businessError } = await supabase
          .from('business_profile')
          .update({
            business_name: businessName,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq('business_id', user?.id);

        if (businessError) throw businessError;
      }

      setSuccess('Profile updated successfully');

      // Update local state
      setProfile({
        ...profile!,
        username,
        languages,
        profile_photo_url: photoUrl,
        social_links: {
          instagram: instagramUrl,
          youtube: youtubeUrl,
          tiktok: tiktokUrl,
        },
      });

      if (profile?.user_type === 'creator' && creatorProfile) {
        setCreatorProfile({
          ...creatorProfile,
          description,
        });
      } else if (profile?.user_type === 'business' && businessProfile) {
        setBusinessProfile({
          ...businessProfile!,
          business_name: businessName,
          description,
        });
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'general'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General Information
            </button>
            {profile?.user_type === 'creator' && (
              <button
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'advanced'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced Settings
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                    {profilePhotoPreview || profile?.profile_photo_url ? (
                      <Image
                        src={
                          profilePhotoPreview ||
                          profile?.profile_photo_url ||
                          ''
                        }
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        <span className="text-xl font-medium">
                          {username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="profile-photo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                    <label
                      htmlFor="profile-photo"
                      className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Change Photo
                    </label>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Languages (for creators) */}
              {profile?.user_type === 'creator' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                        >
                          <span className="sr-only">Remove {lang}</span>
                          <svg
                            className="h-3 w-3"
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
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Add a language"
                    />
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Social Media Links (for creators) */}
              {profile?.user_type === 'creator' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Social Media Links
                  </label>

                  <div>
                    <label
                      htmlFor="instagram"
                      className="block text-xs text-gray-500 mb-1"
                    >
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="youtube"
                      className="block text-xs text-gray-500 mb-1"
                    >
                      YouTube URL
                    </label>
                    <input
                      type="text"
                      id="youtube"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="https://youtube.com/c/yourchannel"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tiktok"
                      className="block text-xs text-gray-500 mb-1"
                    >
                      TikTok URL
                    </label>
                    <input
                      type="text"
                      id="tiktok"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="https://tiktok.com/@yourusername"
                    />
                  </div>
                </div>
              )}

              {/* Business Details (for business users) */}
              {profile?.user_type === 'business' && (
                <>
                  <div>
                    <label
                      htmlFor="business-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="business-name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {profile?.user_type === 'creator'
                    ? 'Bio'
                    : 'Business Description'}
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={
                    profile?.user_type === 'creator'
                      ? 'Tell others about yourself, your work, and expertise'
                      : 'Tell creators about your business and what kind of work you typically need'
                  }
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Advanced Tab (for creators only) */}
          {activeTab === 'advanced' && profile?.user_type === 'creator' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Travel Schedule
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add locations where you&apos;ll be traveling so businesses can
                  find you for local collaborations.
                </p>

                <button
                  onClick={() => setIsTravelModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {hasTravelSchedule
                    ? 'Edit Travel Schedule'
                    : 'Add Travel Schedule'}
                </button>
              </div>

              {/* Account deletion or other advanced settings can go here */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-red-600 mb-2">
                  Danger Zone
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Actions here cannot be undone. Please be careful.
                </p>

                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Travel Schedule Modal */}
      {isTravelModalOpen && user?.id && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Travel Schedule</h2>
                <button
                  onClick={() => setIsTravelModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
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

              <TravelScheduleForm
                creatorId={user.id}
                onCancel={() => {
                  setIsTravelModalOpen(false);
                  // Set hasTravelSchedule based on whether schedules were added
                  // This would ideally be handled via a callback from the form
                  setHasTravelSchedule(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
