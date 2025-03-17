// components/CreatorForm.tsx
'use client';

import React, { useState } from 'react';

interface CreatorFormProps {
  initialDescription: string;
  onSubmit: (description: string) => void;
  onCancel: () => void;
}

const CreatorForm: React.FC<CreatorFormProps> = ({
  initialDescription,
  onSubmit,
  onCancel,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxLength = 1000;

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

    setIsSubmitting(true);

    try {
      await onSubmit(description);
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
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Tell potential clients about your skills, experience, and what makes
          you unique as a creator.
        </p>
        <textarea
          id="description"
          rows={6}
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
          {isSubmitting ? 'Saving...' : 'Save Description'}
        </button>
      </div>
    </form>
  );
};

export default CreatorForm;
