// components/BusinessForm.tsx with basic formatting controls and country/city fields
'use client';

import React, { useState, useRef } from 'react';
import { getNames } from 'country-list';

interface BusinessFormProps {
  initialValues: {
    description: string;
    business_name: string;
    title: string;
    business_country?: string;
    business_city?: string;
  };
  onSubmit: (values: {
    description: string;
    business_name: string;
    title: string;
    business_country?: string;
    business_city?: string;
  }) => void;
  onCancel: () => void;
}

const BusinessForm: React.FC<BusinessFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState({
    business_country: '',
    business_city: '',
    ...initialValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxDescriptionLength = 1000;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to convert original country-list name to our customized name
  const getCustomizedCountryName = (originalName: string): string => {
    const countryNameOverrides: Record<string, string> = {
      'Taiwan, Province of China': 'Taiwan',
    };

    return countryNameOverrides[originalName] || originalName;
  };

  // Function to convert customized country name back to original country-list name
  const getOriginalCountryName = (customizedName: string): string => {
    // Create a reverse mapping from custom names to original names
    const reverseOverrides: Record<string, string> = {
      Taiwan: 'Taiwan, Province of China',
    };

    return reverseOverrides[customizedName] || customizedName;
  };

  // Get list of countries from country-list package and customize certain names
  const getCustomizedCountries = () => {
    const originalCountries = getNames().sort();

    // Apply the overrides
    return originalCountries.map((countryName) =>
      getCustomizedCountryName(countryName)
    );
  };

  const countries = getCustomizedCountries();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    if (!values.business_name.trim()) {
      setError('Business name cannot be empty');
      return;
    }

    if (!values.title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    if (!values.description.trim()) {
      setError('Description cannot be empty');
      return;
    }

    if (values.description.length > maxDescriptionLength) {
      setError(
        `Description must be ${maxDescriptionLength} characters or less`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert customized country name back to original for submission
      const originalCountryName = values.business_country
        ? getOriginalCountryName(values.business_country)
        : undefined;

      await onSubmit({
        ...values,
        business_country: originalCountryName,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions to apply formatting to textarea
  const insertFormat = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = values.description.substring(start, end);

    let newText = '';

    switch (format) {
      case 'bold':
        newText =
          values.description.substring(0, start) +
          `**${selectedText}**` +
          values.description.substring(end);
        break;
      case 'italic':
        newText =
          values.description.substring(0, start) +
          `_${selectedText}_` +
          values.description.substring(end);
        break;
      case 'heading':
        newText =
          values.description.substring(0, start) +
          `## ${selectedText}` +
          values.description.substring(end);
        break;
      case 'list':
        // Split selected text into lines and add bullet points
        const bulletPoints = selectedText
          .split('\n')
          .map((line) => `- ${line}`)
          .join('\n');
        newText =
          values.description.substring(0, start) +
          bulletPoints +
          values.description.substring(end);
        break;
      default:
        newText = values.description;
    }

    setValues({
      ...values,
      description: newText,
    });

    // Set focus back to textarea after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start,
        end + (newText.length - values.description.length)
      );
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="business_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Business Name
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          value={values.business_name}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Your Business Name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Title"
          disabled={isSubmitting}
        />
      </div>

      {/* Country and City fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="business_country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country
          </label>
          <select
            id="business_country"
            name="business_country"
            value={values.business_country}
            onChange={handleChange}
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

        <div>
          <label
            htmlFor="business_city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City
          </label>
          <input
            id="business_city"
            name="business_city"
            type="text"
            value={values.business_city}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="City"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Tell creators about your business, what kind of projects you typically
          need help with, and why they should work with you.
        </p>

        {/* Simple formatting toolbar */}
        <div className="flex space-x-2 mb-2">
          <button
            type="button"
            onClick={() => insertFormat('bold')}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormat('italic')}
            className="px-2 py-1 border border-gray-300 rounded text-sm italic hover:bg-gray-50"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormat('heading')}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
            title="Heading"
          >
            H
          </button>
          <button
            type="button"
            onClick={() => insertFormat('list')}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
            title="Bullet List"
          >
            • List
          </button>
        </div>

        <textarea
          ref={textareaRef}
          id="description"
          name="description"
          rows={8}
          value={values.description}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="We are a company specializing in... (Use ** for bold, _ for italic, and ## for headings)"
          maxLength={maxDescriptionLength}
          disabled={isSubmitting}
        />

        <div
          className={`mt-1 text-sm flex justify-between ${
            values.description.length > maxDescriptionLength * 0.9
              ? 'text-red-500'
              : 'text-gray-500'
          }`}
        >
          <span className="text-xs text-gray-500">
            Use **bold**, _italic_, ## heading, and - for lists
          </span>
          <span>
            {values.description.length}/{maxDescriptionLength} characters
          </span>
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
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default BusinessForm;
