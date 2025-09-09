import React from 'react';
import { formatDateToISO } from '../utils/dateUtils';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableDates: Date[];
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange, availableDates }) => {
  const selectedISO = formatDateToISO(selectedDate);
  const firstDateISO = formatDateToISO(availableDates[0]);
  const lastDateISO = formatDateToISO(availableDates[availableDates.length - 1]);

  const isFirstDay = selectedISO === firstDateISO;
  const isLastDay = selectedISO === lastDateISO;

  const changeDay = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + increment);
    onDateChange(newDate);
  };
  
  return (
    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
      <button 
        onClick={() => changeDay(-1)} 
        disabled={isFirstDay}
        className="px-3 py-2 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-brand-light transition"
        aria-label="Previous day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="text-center">
        <div className="font-bold text-lg md:text-xl text-brand-primary">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="text-sm text-slate-500">
            {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      <button 
        onClick={() => changeDay(1)} 
        disabled={isLastDay}
        className="px-3 py-2 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-brand-light transition"
        aria-label="Next day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
