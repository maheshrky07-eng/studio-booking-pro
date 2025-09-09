import type { Booking, NewBooking } from '../types';

const getSheetUrl = (): string => {
  // Hardcode the single, shared URL for all users.
  return 'https://script.google.com/macros/s/AKfycbzf7lkIAUrdkg8ilqEPbbTTKu1OzGKpZSInAMpQSL7LMZSxcgvvEQxwsSsLKrjXVBYv/exec';
};

// Helper for POST requests
const postToActionApi = async (payload: object): Promise<any> => {
    const url = getSheetUrl();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Apps Script needs this for POST
        },
        body: JSON.stringify(payload),
        mode: 'cors', // Required for cross-origin requests
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok. Status: ${response.status}. Message: ${errorText}`);
    }
    return response.json();
}


export const bookingService = {
  getBookings: async (): Promise<Booking[]> => {
    // Add a cache-busting query parameter to ensure fresh data is fetched every time.
    // Google Apps Script GET requests can be aggressively cached, leading to stale data.
    const url = `${getSheetUrl()}?timestamp=${new Date().getTime()}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch from Google Sheet. Check your URL and script permissions. Status: ${response.status}. Message: ${errorText}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
             // The Apps Script now reliably returns clean data. We just need to ensure correct types.
            const sanitizedData = result.data
              .filter((b: any) => b && b.id) // Filter out empty or invalid rows
              .map((b: any) => {
                // The Apps Script now reliably provides a 'YYYY-MM-DD' string.
                // No complex client-side parsing is needed. Trust the data from the source.
                return {
                    id: String(b.id || ''),
                    studio: String(b.studio || ''),
                    date: String(b.date || '').split('T')[0], // Should be 'YYYY-MM-DD', split is for safety.
                    startTime: String(b.startTime || ''),
                    endTime: String(b.endTime || ''),
                    userName: String(b.userName || ''),
                    purpose: b.purpose || 'YouTube',
                    subject: String(b.subject || ''),
                };
            });
            return sanitizedData as Booking[];
        } else {
            // Handle cases where result.data is not an array or success is false
            const errorMessage = result.message || 'An error occurred while fetching data from the sheet.';
            if (!Array.isArray(result.data)) {
                console.error("Received non-array data from API:", result.data);
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error; // Re-throw the error to be caught by the hook
    }
  },

  addBooking: async (newBooking: NewBooking): Promise<Booking> => {
    try {
        const response = await postToActionApi({ action: 'add', data: newBooking });
        if (response.success) {
            return response.data as Booking;
        } else {
            throw new Error(response.message || 'Failed to add booking via Google Sheet.');
        }
    } catch (error) {
        throw error;
    }
  },
  
  deleteBooking: async (bookingId: string): Promise<void> => {
    try {
        const response = await postToActionApi({ action: 'delete', data: { id: bookingId } });
         if (response.success) {
            return;
        } else {
            throw new Error(response.message || 'Failed to delete booking via Google Sheet.');
        }
    } catch (error) {
        throw error;
    }
  },
};