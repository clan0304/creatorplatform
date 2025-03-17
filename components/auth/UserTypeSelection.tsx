// components/auth/UserTypeSelection.tsx
import React from 'react';
import { UserType } from '@/types';

type UserTypeSelectionProps = {
  onSelect: (type: UserType) => void;
};

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">I am a...</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          onClick={() => onSelect('creator')}
          className="relative flex items-center px-6 py-5 space-x-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:border-indigo-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
        >
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="focus:outline-none">
              <p className="text-lg font-medium text-gray-900">Creator</p>
              <p className="text-sm text-gray-500">
                I create content and offer creative services
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onSelect('business')}
          className="relative flex items-center px-6 py-5 space-x-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:border-indigo-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
        >
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="focus:outline-none">
              <p className="text-lg font-medium text-gray-900">
                Business Owner
              </p>
              <p className="text-sm text-gray-500">
                I&apos;m looking to hire creators for projects
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
