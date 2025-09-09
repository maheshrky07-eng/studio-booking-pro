
import React from 'react';
import { formatDateToISO } from '../utils/dateUtils';

interface DatePickerProps {
  dates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ dates, selectedDate, onSelectDate }) => {
  const selectedISO = formatDateToISO(selectedDate);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-3">
      {dates.map((date) => {
        const isSelected = selectedISO === formatDateToISO(date);
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelectDate(date)}
            className={`p-3 rounded-lg text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary
              ${
                isSelected
                  ? 'bg-brand-primary text-white font-bold shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-brand-light hover:text-brand-dark'
              }
            `}
          >
            <div className="text-xs md:text-sm font-medium uppercase">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-lg md:text-2xl font-bold">
              {date.getDate()}
            </div>
            <div className="text-xs md:text-sm">
              {date.toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </button>
        );
      })}
    </div>
  );
};
