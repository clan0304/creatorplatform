/* eslint-disable @typescript-eslint/no-explicit-any */
// components/TravelScheduleForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import supabase from '@/utils/supabase/client';
import { getNames, overwrite } from 'country-list';

interface TravelSchedule {
  id?: string;
  creator_id?: string;
  country: string;
  city: string;
  start_date: string;
  end_date: string;
}

interface TravelScheduleFormProps {
  creatorId: string;
  onCancel: () => void;
}

const TravelScheduleForm: React.FC<TravelScheduleFormProps> = ({
  creatorId,
  onCancel,
}) => {
  const [schedules, setSchedules] = useState<TravelSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<TravelSchedule>({
    country: '',
    city: '',
    start_date: '',
    end_date: '',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modify country list to change "Taiwan, Province of China" to "Taiwan"
  useEffect(() => {
    // The exact key might vary depending on how country-list represents Taiwan
    overwrite([
      {
        code: 'TW',
        name: 'Taiwan',
      },
    ]);
  }, []);

  const countries = getNames().sort();

  // Load existing travel schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('creator_travel_schedule')
          .select('*')
          .eq('creator_id', creatorId)
          .order('start_date', { ascending: true });

        if (error) throw error;
        setSchedules(data || []);
      } catch (err: any) {
        console.error('Error fetching travel schedules:', err);
        setError('Failed to load travel schedules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [creatorId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewSchedule({ ...newSchedule, [name]: value });
  };

  const validateSchedule = (schedule: TravelSchedule) => {
    if (!schedule.country) {
      setError('Country is required');
      return false;
    }
    if (!schedule.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!schedule.start_date) {
      setError('Start date is required');
      return false;
    }
    if (!schedule.end_date) {
      setError('End date is required');
      return false;
    }
    if (new Date(schedule.start_date) > new Date(schedule.end_date)) {
      setError('End date must be after start date');
      return false;
    }
    return true;
  };

  const handleAddSchedule = () => {
    if (!validateSchedule(newSchedule)) return;

    if (schedules.length >= 10 && editingIndex === null) {
      setError('Maximum of 10 travel schedules allowed');
      return;
    }

    setError(null);

    if (isEditing && editingIndex !== null) {
      // Update existing schedule
      const updatedSchedules = [...schedules];
      // Preserve the original ID and creator_id if they exist
      updatedSchedules[editingIndex] = {
        ...newSchedule,
        id: updatedSchedules[editingIndex].id,
        creator_id: updatedSchedules[editingIndex].creator_id || creatorId,
      };
      setSchedules(updatedSchedules);
      setIsEditing(false);
      setEditingIndex(null);
    } else {
      // Add new schedule
      setSchedules([
        ...schedules,
        {
          ...newSchedule,
          // We don't set an ID here - Supabase will generate one when we save
          creator_id: creatorId,
        },
      ]);
    }

    // Reset the form
    setNewSchedule({ country: '', city: '', start_date: '', end_date: '' });
  };

  const handleEditSchedule = (index: number) => {
    const scheduleToEdit = schedules[index];
    setNewSchedule({
      country: scheduleToEdit.country,
      city: scheduleToEdit.city,
      start_date: formatDateForInput(scheduleToEdit.start_date),
      end_date: formatDateForInput(scheduleToEdit.end_date),
    });
    setEditingIndex(index);
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setNewSchedule({ country: '', city: '', start_date: '', end_date: '' });
    setEditingIndex(null);
    setIsEditing(false);
    setError(null);
  };

  const handleRemoveSchedule = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);

    // If removing the schedule that's being edited, reset the edit form
    if (editingIndex === index) {
      handleCancelEdit();
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editingIndex if we're removing a schedule before it
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // First delete all existing schedules
      const { error: deleteError } = await supabase
        .from('creator_travel_schedule')
        .delete()
        .eq('creator_id', creatorId);

      if (deleteError) throw deleteError;

      // Only insert if there are schedules to insert
      if (schedules.length > 0) {
        // Generate UUIDs for new schedules
        const schedulesToInsert = schedules.map((schedule) => {
          // If it's an existing schedule with an ID, keep it
          if (schedule.id) {
            return {
              ...schedule,
              creator_id: creatorId,
            };
          }

          // For new schedules, generate a random UUID
          const uuid = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

          return {
            ...schedule,
            id: uuid,
            creator_id: creatorId,
          };
        });

        console.log('Schedules to insert:', schedulesToInsert);

        const { error: insertError } = await supabase
          .from('creator_travel_schedule')
          .insert(schedulesToInsert);

        if (insertError) throw insertError;
      }

      // Close the modal on success
      onCancel();
    } catch (err: any) {
      console.error('Error saving travel schedules:', err);
      setError(`Failed to save travel schedules: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Format date from database to input field format (YYYY-MM-DD)
  const formatDateForInput = (date: string) => {
    return date.split('T')[0];
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Your Travel Schedule
          </h3>
          <p className="text-sm text-gray-500">
            Add locations where you&apos;ll be traveling. This helps businesses
            find creators who will be in their area.
          </p>

          {/* Existing Schedules */}
          {schedules.length > 0 ? (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Current Schedules ({schedules.length}/10)
              </h4>
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-md ${
                    editingIndex === index
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {schedule.city}, {schedule.country}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateForInput(schedule.start_date)} to{' '}
                      {formatDateForInput(schedule.end_date)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditSchedule(index)}
                      className="text-indigo-500 hover:text-indigo-700"
                      aria-label={`Edit ${schedule.city} schedule`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSchedule(index)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Remove ${schedule.city} schedule`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-gray-500 text-sm text-center">
              <p>No travel schedules added yet.</p>
              <p>
                Add a new schedule below or save an empty schedule if you
                prefer.
              </p>
            </div>
          )}

          {/* Add/Edit Schedule Form */}
          {(schedules.length < 10 || isEditing) && (
            <div className="mt-4 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {isEditing ? 'Edit Schedule' : 'Add New Schedule'}
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={newSchedule.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a country</option>
                    {countries.map((countryName) => (
                      <option key={countryName} value={countryName}>
                        {countryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={newSchedule.city}
                    onChange={handleInputChange}
                    placeholder="Enter city name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={newSchedule.start_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={newSchedule.end_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isEditing ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Schedule
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add to Schedule
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelScheduleForm;
