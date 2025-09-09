
import React from 'react';

interface StudioSelectorProps {
  studios: string[];
  selectedStudio: string;
  onSelectStudio: (studio: string) => void;
}

export const StudioSelector: React.FC<StudioSelectorProps> = ({ studios, selectedStudio, onSelectStudio }) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {studios.map((studio) => (
        <button
          key={studio}
          onClick={() => onSelectStudio(studio)}
          className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary
            ${
              selectedStudio === studio
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-brand-light hover:text-brand-dark'
            }
          `}
        >
          {studio}
        </button>
      ))}
    </div>
  );
};
