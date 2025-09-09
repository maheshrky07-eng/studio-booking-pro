// components/Header.tsx

import React from 'react';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export const Header: React.FC<{ onSettingsClick: () => void }> = ({ onSettingsClick }) => {
  return (
    <header className="bg-gradient-to-r from-brand-primary to-brand-secondary shadow-md">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-2 rounded-lg">
             <CalendarIcon />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Studio Booking Pro
          </h1>
        </div>
        <button
            onClick={onSettingsClick}
            className="p-2 rounded-full text-white hover:bg-white/20 transition"
            aria-label="Open Google Sheets settings"
        >
            <SettingsIcon />
        </button>
      </div>
    </header>
  );
};