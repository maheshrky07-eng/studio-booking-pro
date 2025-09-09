import type { Booking, NewBooking } from '../types';
import { timeToMinutes } from '../utils/dateUtils';

const STORAGE_KEY = 'studioBookings';
const API_DELAY = 500; // milliseconds

const getStoredBookings = (): Booking[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse bookings from localStorage", error);
    return [];
  }
};

const setStoredBookings = (bookings: Booking[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error("Failed to save bookings to localStorage", error);
  }
};

export const bookingService = {
  getBookings: async (): Promise<Booking[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredBookings());
      }, API_DELAY);
    });
  },

  addBooking: async (newBooking: NewBooking): Promise<Booking> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const bookings = getStoredBookings();
        
        const isOverlapping = bookings.some(
          (b) => {
            if (b.date !== newBooking.date || b.studio !== newBooking.studio) {
              return false;
            }
            const existingStart = timeToMinutes(b.startTime);
            const existingEnd = timeToMinutes(b.endTime);
            const newStart = timeToMinutes(newBooking.startTime);
            const newEnd = timeToMinutes(newBooking.endTime);

            // Overlap condition: (StartA < EndB) and (EndA > StartB)
            return newStart < existingEnd && newEnd > existingStart;
          }
        );

        if (isOverlapping) {
          reject(new Error('This time slot overlaps with an existing booking.'));
          return;
        }

        const bookingWithId: Booking = {
          ...newBooking,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };

        const updatedBookings = [...bookings, bookingWithId];
        setStoredBookings(updatedBookings);
        resolve(bookingWithId);
      }, API_DELAY);
    });
  },
  
  deleteBooking: async (bookingId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let bookings = getStoredBookings();
        bookings = bookings.filter(b => b.id !== bookingId);
        setStoredBookings(bookings);
        resolve();
      }, API_DELAY);
    });
  },
};
