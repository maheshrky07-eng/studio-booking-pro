import React, { useState, FormEvent, useMemo } from 'react';
import { START_HOUR, END_HOUR, RECORDING_PURPOSES } from '../constants';
import { generateTimeSlots, timeToMinutes, getNextSevenDays, formatDateToISO } from '../utils/dateUtils';
import type { Booking, NewBooking, RecordingPurpose } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studio: string;
  studioId: string;
  date: Date; // Initial date
  allBookings: Booking[];
  onConfirm: (details: Omit<NewBooking, 'studio'>) => void;
}

const FormRow: React.FC<{ label: string; htmlFor: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        {children}
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${props.className}`} />
);

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, studio, studioId, date, allBookings, onConfirm }) => {
  const [userName, setUserName] = useState('');
  const [modalDate, setModalDate] = useState(date);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState<RecordingPurpose | ''>('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const availableDates = useMemo(() => getNextSevenDays(), []);

  const bookingsForDayAndStudio = useMemo(() => {
    const isoDate = formatDateToISO(modalDate);
    return allBookings.filter(b => b.studio === studioId && b.date === isoDate);
  }, [allBookings, modalDate, studioId]);

  const bookedMinutes = useMemo(() => {
    const minutes = new Set<number>();
    bookingsForDayAndStudio.forEach(slot => {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        for (let i = start; i < end; i++) {
            minutes.add(i);
        }
    });
    return minutes;
  }, [bookingsForDayAndStudio]);

  const availableStartTimes = useMemo(() => {
    const allSlots = generateTimeSlots(START_HOUR, END_HOUR, 30);
    return allSlots.filter(time => !bookedMinutes.has(timeToMinutes(time)));
  }, [bookedMinutes]);
  
  const availableEndTimes = useMemo(() => {
    if (!startTime) return [];
    
    const startMin = timeToMinutes(startTime);
    let nextBookingStartMin = timeToMinutes(`${END_HOUR}:00`);
    
    const sortedBookings = [...bookingsForDayAndStudio].sort((a,b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    for (const booking of sortedBookings) {
        const bookingStartMin = timeToMinutes(booking.startTime);
        if (bookingStartMin > startMin) {
            nextBookingStartMin = bookingStartMin;
            break;
        }
    }
    
    const endSlots: string[] = [];
    for (let min = startMin + 30; min <= nextBookingStartMin; min += 30) {
        const hour = Math.floor(min / 60);
        const minute = min % 60;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        endSlots.push(time);
    }
    return endSlots;
  }, [startTime, bookingsForDayAndStudio]);
  
  if (!isOpen) return null;

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedISO = e.target.value;
    const newDate = availableDates.find(d => formatDateToISO(d) === selectedISO);
    if (newDate) {
        setModalDate(newDate);
        setStartTime('');
        setEndTime('');
        setPurpose('');
        setSubject('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (userName.trim() === '' || subject.trim() === '' || !startTime || !endTime || !purpose) {
      alert('Please complete all fields to confirm your booking.');
      return;
    }
    setIsLoading(true);
    await onConfirm({ userName, subject, date: formatDateToISO(modalDate), startTime, endTime, purpose });
    setIsLoading(false);
  };
  
  const getDisplayTime = (time: string) => new Date(`1970-01-01T${time}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg mx-auto relative transform transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Book Your Session</h2>
        <p className="text-slate-500 mb-6">Studio: <span className="font-semibold text-brand-dark">{studio}</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <FormRow label="Your Name" htmlFor="userName">
                <input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary bg-white text-slate-900 placeholder-slate-400"
                />
            </FormRow>

            <FormRow label="Recording Purpose" htmlFor="purpose">
                <Select id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value as RecordingPurpose)} required>
                    <option value="" disabled>Select a purpose</option>
                    {RECORDING_PURPOSES.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </Select>
            </FormRow>

            <FormRow label="Subject Name" htmlFor="subject">
                <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Physics - Chapter 5"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary bg-white text-slate-900 placeholder-slate-400"
                />
            </FormRow>

            <FormRow label="Select Date" htmlFor="bookingDate">
                <Select id="bookingDate" value={formatDateToISO(modalDate)} onChange={handleDateChange}>
                    {availableDates.map(d => (
                        <option key={d.toISOString()} value={formatDateToISO(d)}>
                            {d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </option>
                    ))}
                </Select>
            </FormRow>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormRow label="Select Start Time" htmlFor="startTime">
                    <Select id="startTime" value={startTime} onChange={(e) => { setStartTime(e.target.value); setEndTime(''); }} required disabled={availableStartTimes.length === 0}>
                        <option value="" disabled>{availableStartTimes.length === 0 ? 'No slots available' : 'Choose a time'}</option>
                        {availableStartTimes.map(time => (
                            <option key={time} value={time}>{getDisplayTime(time)}</option>
                        ))}
                    </Select>
                </FormRow>

                <FormRow label="Select End Time" htmlFor="endTime">
                    <Select id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required disabled={!startTime || availableEndTimes.length === 0}>
                        <option value="" disabled>Choose a time</option>
                        {availableEndTimes.map(time => (
                             <option key={time} value={time}>{getDisplayTime(time)}</option>
                        ))}
                    </Select>
                </FormRow>
            </div>
            
          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !userName || !subject || !startTime || !endTime || !purpose}
              className="px-5 py-2 text-sm font-semibold text-brand-primary bg-white border border-brand-secondary hover:bg-brand-light rounded-lg transition flex items-center disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};