'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import supabase from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface BusinessProfile {
  id: string;
  business_id: string;
  business_name: string;
  title: string;
  description: string;
  slug?: string;
  city?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

const BusinessProfilePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      setIsLoading(true);
      try {
        const { data: businessData, error: businessError } = await supabase
          .from('business_profile')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (!businessData && businessError) {
          const { data: idBusinessData, error: idBusinessError } =
            await supabase
              .from('business_profile')
              .select('*')
              .eq('id', slug)
              .maybeSingle();

          if (idBusinessError || !idBusinessData) {
            notFound();
          }

          setBusinessProfile(idBusinessData);
        } else {
          setBusinessProfile(businessData);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching business profile:', err);
        setError(err.message || 'Failed to load business profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchBusinessData();
  }, [slug, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading profile details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-xl mx-auto mt-10 border-red-200">
        <CardContent className="pt-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <p className="font-medium">Error loading profile</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = businessProfile?.created_at
    ? new Date(businessProfile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Top header bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center">
            <Badge
              variant="outline"
              className="text-green-600 bg-green-50 border-green-200 mr-3"
            >
              Business Profile
            </Badge>
            <h1 className="text-xl font-medium text-gray-700 truncate">
              {businessProfile?.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6">
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-white pb-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {businessProfile?.title}
                </h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {businessProfile?.business_name}
                  </span>
                </div>

                {businessProfile?.city && businessProfile?.country && (
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {businessProfile.city}, {businessProfile.country}
                    </span>
                  </div>
                )}

                <div className="flex items-center mt-2 text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Posted on {formattedDate}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    Last updated:{' '}
                    {new Date(
                      businessProfile?.updated_at ?? ''
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator className="my-6" />

          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  About the Role
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {businessProfile?.description}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
