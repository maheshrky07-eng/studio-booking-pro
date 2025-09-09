import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { DateNavigator } from './components/DateNavigator';
import { StudioSchedule } from './components/StudioSchedule';
import { BookingModal } from './components/BookingModal';
import { Notification } from './components/Notification';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useBookings } from './hooks/useBookings';
import { getNextSevenDays, formatDateToISO, timeToMinutes } from './utils/dateUtils';
import { STUDIOS } from './constants';
import type { Booking, NewBooking } from './types';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalState, setModalState] = useState<{ isOpen: boolean; studio?: string }>({ isOpen: false });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const { bookings, isLoading, error, createBooking, cancelBooking } = useBookings();

  const availableDates = useMemo(() => getNextSevenDays(), []);

  const modalStudioObject = useMemo(() => modalState.studio ? STUDIOS.find(s => s.id === modalState.studio) : null, [modalState.studio]);

  const handleShowBookingModal = useCallback((studio: string) => {
    setModalState({ isOpen: true, studio });
  }, []);

  const handleCloseBookingModal = useCallback(() => {
    setModalState({ isOpen: false });
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBookingConfirm = async (bookingDetails: Omit<NewBooking, 'studio'>) => {
    if (!modalState.studio) return;

    const newBooking: NewBooking = {
      ...bookingDetails,
      studio: modalState.studio,
    };

    try {
      await createBooking(newBooking);
      showNotification('Booking successful!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      showNotification(`Booking failed: ${errorMessage}`, 'error');
    } finally {
      handleCloseBookingModal();
    }
  };
  
  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
        await cancelBooking(bookingToCancel.id);
        showNotification('Booking cancelled successfully!', 'success');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        showNotification(`Cancellation failed: ${errorMessage}`, 'error');
    } finally {
        setBookingToCancel(null);
    }
  };

  const bookingsByStudio = useMemo(() => {
    const isoDate = formatDateToISO(selectedDate);
    const filtered = bookings.filter((b) => b.date === isoDate);
    
    return STUDIOS.reduce((acc, studio) => {
      acc[studio.id] = filtered
        .filter(b => b.studio === studio.id)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      return acc;
    }, {} as Record<string, Booking[]>);
  }, [bookings, selectedDate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
          <DateNavigator 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            availableDates={availableDates}
          />
          
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {STUDIOS.map(studio => (
                <StudioSchedule 
                  key={studio.id}
                  studio={studio.name}
                  bookings={bookingsByStudio[studio.id] || []}
                  onBook={() => handleShowBookingModal(studio.id)}
                  onCancel={(booking) => setBookingToCancel(booking)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {modalState.isOpen && modalStudioObject && (
        <BookingModal
          isOpen={modalState.isOpen}
          onClose={handleCloseBookingModal}
          studio={modalStudioObject.name}
          studioId={modalStudioObject.id}
          date={selectedDate}
          allBookings={bookings}
          onConfirm={handleBookingConfirm}
        />
      )}

      {bookingToCancel && (
          <ConfirmationModal
            isOpen={!!bookingToCancel}
            onClose={() => setBookingToCancel(null)}
            onConfirm={handleConfirmCancel}
            title="Cancel Booking"
            message={`Are you sure you want to cancel the booking for ${bookingToCancel.userName} from ${new Date(`1970-01-01T${bookingToCancel.startTime}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'})} to ${new Date(`1970-01-01T${bookingToCancel.endTime}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'})}?`}
          />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}