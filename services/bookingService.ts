// services/bookingService.ts

import type { Booking, NewBooking } from '../types';

const GOOGLE_SHEET_URL_KEY = 'googleSheetWebAppUrl';
const API_DELAY = 500; // Keep delay for user feedback on network activity

const getSheetUrl = (): string | null => {
  return localStorage.getItem(GOOGLE_SHEET_URL_KEY);
};

// Helper for POST requests
const postToActionApi = async (payload: object): Promise<any> => {
    const url = getSheetUrl();
    if (!url) {
        throw new Error('Google Sheet URL not configured.');
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Apps Script needs this for POST
        },
        body: JSON.stringify(payload),
        mode: 'cors', // Required for cross-origin requests
    });

    if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
    }
    return response.json();
}


export const bookingService = {
  getBookings: async (): Promise<Booking[]> => {
    const url = getSheetUrl();
    if (!url) {
        // Return empty array if not configured; the UI will handle the prompt.
        return []; 
    }
    
    // Using a promise to keep the async structure and delay consistent
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    mode: 'cors',
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch from Google Sheet. Check your URL and script permissions. Status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    // Ensure all booking fields are present, providing defaults if necessary
                    const sanitizedData = result.data.map((b: any) => ({
                        id: b.id || '',
                        studio: b.studio || '',
                        date: b.date || '',
                        startTime: b.startTime || '',
                        endTime: b.endTime || '',
                        userName: b.userName || '',
                        purpose: b.purpose || 'YouTube',
                        subject: b.subject || '',
                    }));
                    resolve(sanitizedData as Booking[]);
                } else {
                    throw new Error(result.message || 'An error occurred while fetching data from the sheet.');
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                reject(error);
            }
        }, API_DELAY);
    });
  },

  addBooking: async (newBooking: NewBooking): Promise<Booking> => {
     return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await postToActionApi({ action: 'add', data: newBooking });
                if (response.success) {
                    resolve(response.data as Booking);
                } else {
                    reject(new Error(response.message || 'Failed to add booking via Google Sheet.'));
                }
            } catch (error) {
                reject(error);
            }
        }, API_DELAY);
    });
  },
  
  deleteBooking: async (bookingId: string): Promise<void> => {
     return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await postToActionApi({ action: 'delete', data: { id: bookingId } });
                 if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.message || 'Failed to delete booking via Google Sheet.'));
                }
            } catch (error) {
                reject(error);
            }
        }, API_DELAY);
    });
  },
};