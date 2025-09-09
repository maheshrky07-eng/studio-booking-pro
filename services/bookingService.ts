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
    const url = getSheetUrl();
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
             // Ensure all booking fields are present and data formats are correct.
            const sanitizedData = result.data
              .filter((b: any) => b && b.id) // Filter out empty or invalid rows
              .map((b: any) => {
                let dateString = '';
                if (b.date) {
                  // The date from Google Sheets is often a full ISO string (e.g., 2025-09-09T04:00:00.000Z).
                  // We must robustly parse just the 'YYYY-MM-DD' part to avoid timezone issues.
                  // Creating a Date and using UTC methods ensures we get the date as it appears in the sheet.
                  try {
                    const d = new Date(b.date);
                    // Check if date is valid
                    if (isNaN(d.getTime())) {
                        throw new Error('Invalid date value');
                    }
                    const year = d.getUTCFullYear();
                    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(d.getUTCDate()).padStart(2, '0');
                    dateString = `${year}-${month}-${day}`;
                  } catch (e) {
                      console.error("Could not parse date, falling back:", b.date, e);
                      // Fallback for non-standard date strings like '2025-09-09'
                      dateString = String(b.date).split('T')[0];
                  }
                }

                return {
                    id: b.id || '',
                    studio: b.studio || '',
                    date: dateString,
                    startTime: b.startTime || '',
                    endTime: b.endTime || '',
                    userName: b.userName || '',
                    purpose: b.purpose || 'YouTube',
                    subject: b.subject || '',
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