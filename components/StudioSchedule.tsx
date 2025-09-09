import React from 'react';
import type { Booking } from '../types';

interface StudioScheduleProps {
  studio: string;
  bookings: Booking[];
  onBook: () => void;
  onCancel: (booking: Booking) => void;
}

const BookingItem: React.FC<{ booking: Booking; onCancel: () => void }> = ({ booking, onCancel }) => {
    const startTime = new Date(`1970-01-01T${booking.startTime}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTime = new Date(`1970-01-01T${booking.endTime}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <li className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
            <div>
                <p className="font-semibold text-slate-800">{booking.userName}</p>
                <p className="text-sm text-slate-700">{booking.subject}</p>
                <p className="text-sm text-slate-500">{startTime} - {endTime}</p>
                {booking.purpose && (
                    <p className="text-xs text-slate-600 font-medium mt-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full inline-block">
                        {booking.purpose}
                    </p>
                )}
            </div>
            <button 
                onClick={onCancel}
                className="text-sm font-medium text-red-600 hover:text-red-800"
                aria-label={`Cancel booking for ${booking.userName}`}
            >
                Cancel
            </button>
        </li>
    );
};


export const StudioSchedule: React.FC<StudioScheduleProps> = ({ studio, bookings, onBook, onCancel }) => {
  return (
    <div className="bg-slate-50 rounded-xl p-4 md:p-6 border flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-bold text-slate-700">{studio}</h3>
        <button
            onClick={onBook}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-lg transition"
        >
            Book Now
        </button>
      </div>
      <div className="bg-slate-100 rounded-lg p-3">
        {bookings.length > 0 ? (
          <ul className="space-y-2">
            {bookings.map(booking => (
              <BookingItem key={booking.id} booking={booking} onCancel={() => onCancel(booking)} />
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-slate-500">No bookings for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};