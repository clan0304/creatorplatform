/* eslint-disable @typescript-eslint/no-explicit-any */
// components/TravelScheduleForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import supabase from '@/utils/supabase/client';

interface TravelSchedule {
  id?: string;
  creator_id?: string;
  location: string;
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
    location: '',
    start_date: '',
    end_date: '',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSchedule({ ...newSchedule, [name]: value });
  };

  const validateSchedule = (schedule: TravelSchedule) => {
    if (!schedule.location.trim()) {
      setError('Location is required');
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

    if (schedules.length >= 10) {
      setError('Maximum of 10 travel schedules allowed');
      return;
    }

    setSchedules([...schedules, newSchedule]);
    setNewSchedule({ location: '', start_date: '', end_date: '' });
    setError(null);
  };

  const handleRemoveSchedule = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (schedules.length === 0) {
      setError('Add at least one travel schedule');
      return;
    }

    setIsSaving(true);

    try {
      // First delete all existing schedules
      const { error: deleteError } = await supabase
        .from('creator_travel_schedule')
        .delete()
        .eq('creator_id', creatorId);

      if (deleteError) throw deleteError;

      // Then insert all the new schedules
      const schedulesWithCreatorId = schedules.map((schedule) => ({
        ...schedule,
        creator_id: creatorId,
      }));

      const { error: insertError } = await supabase
        .from('creator_travel_schedule')
        .insert(schedulesWithCreatorId);

      if (insertError) throw insertError;

      // Close the modal on success
      onCancel();
    } catch (err: any) {
      console.error('Error saving travel schedules:', err);
      setError(err.message || 'Failed to save travel schedules');
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
          {schedules.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Current Schedules ({schedules.length}/10)
              </h4>
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <div className="font-medium">{schedule.location}</div>
                    <div className="text-sm text-gray-500">
                      {formatDateForInput(schedule.start_date)} to{' '}
                      {formatDateForInput(schedule.end_date)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(index)}
                    className="text-red-500 hover:text-red-700"
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
              ))}
            </div>
          )}

          {/* Add New Schedule */}
          {schedules.length < 10 && (
            <div className="mt-4 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Add New Schedule
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newSchedule.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
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
                <div>
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
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
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
                </button>
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
