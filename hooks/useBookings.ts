import { useState, useEffect, useCallback } from 'react';
import type { Booking, NewBooking } from '../types';
import { bookingService } from '../services/bookingService';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (newBooking: NewBooking) => {
    try {
      const addedBooking = await bookingService.addBooking(newBooking);
      setBookings((prevBookings) => [...prevBookings, addedBooking]);
      return addedBooking;
    } catch (err) {
      // Re-fetch bookings to ensure UI is in sync with the "source of truth"
      fetchBookings();
      throw err; // Re-throw error to be handled by the component
    }
  };
  
  const cancelBooking = async (bookingId: string) => {
    try {
      await bookingService.deleteBooking(bookingId);
      setBookings((prevBookings) => prevBookings.filter(b => b.id !== bookingId));
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
      // Re-fetch to ensure UI is in sync
      fetchBookings();
      throw err;
    }
  };

  return { bookings, isLoading, error, createBooking, cancelBooking, refetch: fetchBookings };
};
