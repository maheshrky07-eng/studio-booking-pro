import React, { useMemo, useState, useEffect } from 'react';
import { START_HOUR, END_HOUR } from '../constants';
import { generateTimeSlots, timeToMinutes } from '../utils/dateUtils';
import type { Booking } from '../types';

interface TimeSlotGridProps {
  bookedSlots: Pick<Booking, 'startTime' | 'endTime'>[];
  onRangeSelect: (range: { startTime: string; endTime: string } | null) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ bookedSlots, onRangeSelect }) => {
  const [startTime, setStartTime] = useState<string | null>(null);

  useEffect(() => {
    setStartTime(null);
    onRangeSelect(null);
  }, [bookedSlots, onRangeSelect]);
  
  const timeSlots = useMemo(() => generateTimeSlots(START_HOUR, END_HOUR, 30), []);

  const bookedMinutes = useMemo(() => {
    const minutes = new Set<number>();
    bookedSlots.forEach(slot => {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        for (let i = start; i < end; i++) {
            minutes.add(i);
        }
    });
    return minutes;
  }, [bookedSlots]);
  
  const handleSlotClick = (time: string) => {
    if (!startTime) {
      setStartTime(time);
      onRangeSelect(null);
    } else {
      const startMin = timeToMinutes(startTime);
      const endMin = timeToMinutes(time) + 30; // End time is exclusive, booking is up to the start of next slot.

      if (endMin <= startMin) {
        setStartTime(time);
        onRangeSelect(null);
        return;
      }
      
      for (let i = startMin; i < endMin - 30; i++) {
        if (bookedMinutes.has(i)) {
          // Invalid range, contains a booking
          setStartTime(null);
          onRangeSelect(null);
          alert('Invalid time range. The selected range overlaps with an existing booking.');
          return;
        }
      }
      onRangeSelect({ startTime, endTime: time });
      setStartTime(null);
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {timeSlots.map((time) => {
        const currentMin = timeToMinutes(time);
        const isBooked = bookedMinutes.has(currentMin);
        const isSelectedStart = startTime === time;

        const date = new Date();
        const [hour, minute] = time.split(':');
        date.setHours(parseInt(hour), parseInt(minute), 0, 0);
        const displayTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        let buttonClass = 'bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-secondary hover:bg-brand-light hover:text-brand-dark hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary';
        if (isBooked) {
            buttonClass = 'bg-slate-200 text-slate-400 cursor-not-allowed line-through';
        } else if (isSelectedStart) {
            buttonClass = 'bg-brand-primary text-white border-brand-primary scale-105 ring-2 ring-offset-2 ring-brand-secondary';
        }

        return (
          <button
            key={time}
            disabled={isBooked}
            onClick={() => handleSlotClick(time)}
            className={`p-3 rounded-lg text-sm md:text-base font-semibold transition-transform duration-200 ${buttonClass}`}
          >
            {displayTime}
          </button>
        );
      })}
    </div>
  );
};
