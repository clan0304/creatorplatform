// components/BusinessForm.tsx with basic formatting controls
'use client';

import React, { useState, useRef } from 'react';

interface BusinessFormProps {
  initialValues: {
    description: string;
    business_name: string;
    business_address: string;
  };
  onSubmit: (values: {
    description: string;
    business_name: string;
    business_address: string;
  }) => void;
  onCancel: () => void;
}

const BusinessForm: React.FC<BusinessFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxDescriptionLength = 1000;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (!values.business_address.trim()) {
      setError('Business address cannot be empty');
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
      await onSubmit(values);
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
          htmlFor="business_address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Business Address
        </label>
        <input
          id="business_address"
          name="business_address"
          type="text"
          value={values.business_address}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Full Address"
          disabled={isSubmitting}
        />
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
