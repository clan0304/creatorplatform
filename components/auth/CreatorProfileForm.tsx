/* eslint-disable @typescript-eslint/no-explicit-any */
// components/auth/CreatorProfileForm.tsx
'use client';

import { useState, useEffect } from 'react';
import supabase from '@/utils/supabase/client';
import { SocialLinks } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type CreatorProfileFormProps = {
  onComplete: (profileData: any) => void;
};

const CreatorProfileForm: React.FC<CreatorProfileFormProps> = ({
  onComplete,
}) => {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const [portfolioItems, setPortfolioItems] = useState<File[]>([]);
  const [portfolioItemPreviews, setPortfolioItemPreviews] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Korean',
    'Russian',
    'Portuguese',
    'Italian',
    'Arabic',
  ];

  const filteredLanguageOptions = languageOptions.filter(
    (lang) =>
      !languages.includes(lang) &&
      lang.toLowerCase().includes(languageInput.toLowerCase())
  );

  const handleAddLanguage = (language: string) => {
    if (!languages.includes(language)) {
      setLanguages([...languages, language]);
    }
    setLanguageInput('');
  };

  const handleRemoveLanguage = (language: string) => {
    setLanguages(languages.filter((lang) => lang !== language));
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePortfolioItemsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Limit to 8 items total
      const totalItems = [...portfolioItems, ...newFiles].slice(0, 8);
      setPortfolioItems(totalItems);

      // Create preview URLs for the new files
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPortfolioItemPreviews(
        [...portfolioItemPreviews, ...newPreviews].slice(0, 8)
      );
    }
  };

  const handleRemovePortfolioItem = (index: number) => {
    setPortfolioItems(portfolioItems.filter((_, i) => i !== index));

    // Also remove the preview URL
    const newPreviews = [...portfolioItemPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPortfolioItemPreviews(newPreviews);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
      portfolioItemPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [profilePhotoPreview, portfolioItemPreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session found');
      }

      const userId = session.user.id;
      let profilePhotoUrl = null;
      const portfolioUrls: string[] = [];

      // Upload profile photo if selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${userId}/profile-photo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, profilePhoto, {
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        profilePhotoUrl = urlData.publicUrl;
      }

      // Upload portfolio items
      if (portfolioItems.length > 0) {
        for (let i = 0; i < portfolioItems.length; i++) {
          const file = portfolioItems[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/portfolio-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('portfolio-items')
            .upload(fileName, file, {
              upsert: true,
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from('portfolio-items')
            .getPublicUrl(fileName);

          portfolioUrls.push(urlData.publicUrl);
        }
      }

      const socialLinks: SocialLinks = {
        instagram: instagramUrl || undefined,
        youtube: youtubeUrl || undefined,
        tiktok: tiktokUrl || undefined,
      };

      const profileData = {
        social_links: socialLinks,
        portfolio_url: portfolioUrl || null,
        location,
        languages,
        profile_photo_url: profilePhotoUrl,
        portfolio_items: portfolioUrls,
        user_type: 'creator',
      };

      onComplete(profileData);
      toast.success('Profile created successfully!');
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'An error occurred while saving your profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
          <div className="mt-2 flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profilePhotoPreview ? (
                <Image
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  width={100}
                  height={100}
                />
              ) : (
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {profilePhoto ? 'Change photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="instagramUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Instagram URL (optional)
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="instagramUrl"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://instagram.com/yourusername"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="youtubeUrl"
              className="block text-sm font-medium text-gray-700"
            >
              YouTube URL (optional)
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://youtube.com/c/yourchannel"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tiktokUrl"
              className="block text-sm font-medium text-gray-700"
            >
              TikTok URL (optional)
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="tiktokUrl"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://tiktok.com/@yourusername"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="portfolioUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Portfolio URL (optional)
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="portfolioUrl"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Languages
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Add languages you speak"
            />
            {languageInput && filteredLanguageOptions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white shadow-lg max-h-40 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                {filteredLanguageOptions.map((language) => (
                  <li
                    key={language}
                    onClick={() => handleAddLanguage(language)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50"
                  >
                    {language}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {languages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {languages.map((language) => (
                <span
                  key={language}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(language)}
                    className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                  >
                    <span className="sr-only">Remove {language}</span>
                    <svg
                      className="h-2 w-2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 8 8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M1 1l6 6m0-6L1 7"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Portfolio Items</h3>
          <p className="text-sm text-gray-500">
            Upload up to 8 images or videos to showcase your work
          </p>

          <div className="mt-2">
            <label className="cursor-pointer inline-flex items-center space-x-2 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Upload files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handlePortfolioItemsChange}
                disabled={portfolioItems.length >= 8}
              />
            </label>
            <span className="ml-2 text-sm text-gray-500">
              {portfolioItems.length}/8 items
            </span>
          </div>

          {portfolioItems.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {portfolioItems.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                    {file.type.startsWith('image/') ? (
                      <Image
                        src={portfolioItemPreviews[index]}
                        alt={`Portfolio item ${index + 1}`}
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-500">
                          Video
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolioItem(index)}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200"
                  >
                    <span className="sr-only">Remove</span>
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-5">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  );
};

export default CreatorProfileForm;
