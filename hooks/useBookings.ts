import { useState, useEffect, useCallback } from 'react';
import type { Booking, NewBooking } from '../types';
import { bookingService } from '../services/bookingService';

const POLLING_INTERVAL = 15000; // Poll for new data every 15 seconds

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (isBackgroundTask = false) => {
    try {
      if (!isBackgroundTask) {
        // Only show the main full-page spinner on initial load or manual refetch
        setIsLoading(true);
      }
      setError(null);
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      // Display a more specific error message to help with debugging.
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to fetch bookings. Reason: ${errorMessage}`);
    } finally {
      if (!isBackgroundTask) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // 1. Initial fetch when the component mounts
    fetchBookings(false);

    // 2. Set up polling to refetch data periodically in the background
    const intervalId = setInterval(() => {
      fetchBookings(true); // `true` indicates a background task
    }, POLLING_INTERVAL);

    // 3. Cleanup function to clear the interval when the component is no longer in use
    return () => clearInterval(intervalId);
  }, [fetchBookings]);

  const createBooking = async (newBooking: NewBooking) => {
    try {
      const addedBooking = await bookingService.addBooking(newBooking);
      // Optimistically update the UI for a snappy feel
      setBookings((prevBookings) => [...prevBookings, addedBooking]);
      // Trigger a background refetch to ensure consistency with the sheet
      await fetchBookings(true);
      return addedBooking;
    } catch (err) {
      // If something went wrong, refetch to get the true state from the sheet
      await fetchBookings(true);
      throw err; // Re-throw error to be handled by the component's notification
    }
  };
  
  const cancelBooking = async (bookingId: string) => {
    try {
      // Optimistically remove from UI
      setBookings((prevBookings) => prevBookings.filter(b => b.id !== bookingId));
      await bookingService.deleteBooking(bookingId);
    } catch (err) {
      // Re-fetch to ensure UI is in sync if the delete failed
      await fetchBookings(true);
      throw err; // Re-throw error to be handled by the component's notification
    }
  };
  
  // The refetch passed to the App component should trigger the main loading spinner
  const fullRefetch = useCallback(() => fetchBookings(false), [fetchBookings]);

  return { bookings, isLoading, error, createBooking, cancelBooking, refetch: fullRefetch };
};