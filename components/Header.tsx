
import React from 'react';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-brand-primary to-brand-secondary shadow-md">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-2 rounded-lg">
             <CalendarIcon />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Studio Booking Pro
          </h1>
        </div>
      </div>
    </header>
  );
};
