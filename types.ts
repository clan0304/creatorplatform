// types/profiles.ts

export type UserType = 'creator' | 'business';

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  username: string;
  user_type: UserType | null;
  is_profile_complete: boolean;
  social_links?: SocialLinks | null;
  portfolio_url?: string | null;
  location?: string | null;
  languages?: string[] | null;
  profile_photo_url?: string | null;
  portfolio_items?: string[] | null;
  business_name?: string | null;
  business_address?: string | null;
}
