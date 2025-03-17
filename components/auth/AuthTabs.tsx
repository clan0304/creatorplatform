// src/components/auth/AuthTabs.tsx
import React from 'react';

type AuthTabsProps = {
  currentView: 'sign-in' | 'sign-up';
  onViewChange: (view: 'sign-in' | 'sign-up') => void;
};

const AuthTabs: React.FC<AuthTabsProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          <button
            onClick={() => onViewChange('sign-in')}
            className={`${
              currentView === 'sign-in'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Sign In
          </button>
          <button
            onClick={() => onViewChange('sign-up')}
            className={`${
              currentView === 'sign-up'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Sign Up
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AuthTabs;
