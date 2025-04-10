'use client';

import React from 'react';
import Link from 'next/link';

const AboutUsPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Connecting Creators & Businesses
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
            We&apos;re building a global community where content creators and
            local businesses collaborate to create authentic experiences around
            the world.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We&apos;re on a mission to transform how creators and businesses
              connect globally. By building a platform that bridges geographical
              gaps, we&apos;re enabling meaningful collaborations that benefit
              both parties while showcasing unique local experiences.
            </p>
            <div className="mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    For Creators
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Whether you&apos;re a photographer, videographer, writer, or
                    social media influencer, our platform helps you discover
                    unique collaboration opportunities with local businesses
                    worldwide. Showcase your portfolio, highlight your travel
                    plans, and connect with businesses eager to work with
                    visiting talent.
                  </p>
                </div>
              </div>
              <div className="flex mt-10">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    For Businesses
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Find talented creators who can help showcase your business
                    to a global audience. Our platform enables you to discover
                    creators who are traveling to your area, making it easy to
                    plan collaborations with international talent without the
                    usual logistical hurdles.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 lg:mt-0">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Makes Us Unique
            </h2>

            <div className="mt-6 bg-gray-50 rounded-lg px-6 py-8">
              <h3 className="text-lg font-medium text-gray-900">
                Travel-Focused Collaboration
              </h3>
              <p className="mt-3 text-base text-gray-600">
                Our platform&apos;s standout feature is the ability for creators
                to share their travel plans. This innovative approach helps
                businesses connect with traveling creators who will be in their
                area, opening up collaboration opportunities that wouldn&apos;t
                otherwise exist.
              </p>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <blockquote>
                  <div>
                    <p className="text-base text-gray-600">
                      &quot;Some destinations have gained international
                      recognition thanks to content created by traveling
                      influencers. We&apos;re making it easier for more
                      businesses to benefit from this powerful form of authentic
                      promotion.&quot;
                    </p>
                  </div>
                </blockquote>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">
                How It Works
              </h3>
              <div className="mt-4 space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                      1
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base text-gray-600">
                      <strong>Create Your Profile</strong> - Sign up and build
                      your creator or business profile
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                      2
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base text-gray-600">
                      <strong>Share Travel Plans</strong> - Creators can add
                      upcoming travel destinations
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                      3
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base text-gray-600">
                      <strong>Discover Opportunities</strong> - Businesses post
                      collaboration needs
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                      4
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base text-gray-600">
                      <strong>Connect & Collaborate</strong> - Message potential
                      partners and create content together
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Global Impact
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-600">
                Our platform is helping create meaningful connections between
                creators and businesses across borders. These collaborations
                boost local economies while providing creators with authentic
                content opportunities.
              </p>
            </div>
            <div className="mt-10 lg:mt-0">
              <dl className="space-y-10">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg font-medium text-gray-900">
                      Sustainable Tourism
                    </dt>
                    <dd className="mt-2 text-base text-gray-600">
                      By connecting creators with authentic local businesses,
                      we&apos;re promoting responsible tourism and helping
                      showcase destinations beyond the typical tourist spots.
                    </dd>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg font-medium text-gray-900">
                      Community Building
                    </dt>
                    <dd className="mt-2 text-base text-gray-600">
                      We&apos;re creating a global network of creators and
                      businesses committed to authentic storytelling and
                      meaningful collaborations that benefit local communities.
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0">
            <div className="lg:self-center lg:max-w-3xl">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to get started?</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-100">
                Join our growing community of creators and businesses making
                meaningful connections around the world.
              </p>
              <div className="mt-8 flex space-x-4">
                <Link
                  href="/auth"
                  className="inline-block bg-white py-3 px-6 rounded-md font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  Sign Up
                </Link>
                <Link
                  href="/findwork"
                  className="inline-block bg-indigo-600 py-3 px-6 border border-transparent rounded-md font-medium text-white hover:bg-indigo-500"
                >
                  Browse Opportunities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
