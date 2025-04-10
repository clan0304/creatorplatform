'use client';

import React, { useState, useEffect } from 'react';
import { getNames, overwrite } from 'country-list';

interface CreatorFormProps {
  initialDescription: string;
  initialCountry?: string;
  initialCity?: string;
  onSubmit: (data: {
    description: string;
    country: string;
    city: string;
  }) => void;
  onCancel: () => void;
}

const CreatorForm: React.FC<CreatorFormProps> = ({
  initialDescription = '',
  initialCountry = '',
  initialCity = '',
  onSubmit,
  onCancel,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [country, setCountry] = useState(initialCountry);
  const [city, setCity] = useState(initialCity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxLength = 1000;

  // Modify country list to change "Taiwan, Province of China" to "Taiwan"
  useEffect(() => {
    // The exact key might vary depending on how country-list represents Taiwan
    // Common variations include "TW" or "TWN"
    overwrite([
      {
        code: 'TW',
        name: 'Taiwan',
      },
    ]);
  }, []);

  const countries = getNames().sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Description cannot be empty');
      return;
    }

    if (description.length > maxLength) {
      setError(`Description must be ${maxLength} characters or less`);
      return;
    }

    if (!country) {
      setError('Please select a country');
      return;
    }

    if (!city.trim()) {
      setError('City cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ description, country, city });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="I am a creative professional with expertise in..."
            maxLength={maxLength}
            disabled={isSubmitting}
          />
          <div
            className={`mt-1 text-sm flex justify-end ${
              description.length > maxLength * 0.9
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            {description.length}/{maxLength} characters
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <div className="mt-1">
            <select
              id="country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="">Select a country</option>
              {countries.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your city"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default CreatorForm;
