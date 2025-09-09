export type RecordingPurpose = 'YouTube' | 'Planner' | 'Smart Course' | 'Live';

export interface Booking {
  id: string;
  studio: string;
  date: string; // ISO format: 'YYYY-MM-DD'
  startTime: string; // 'HH:MM' format, 24-hour
  endTime: string; // 'HH:MM' format, 24-hour
  userName: string;
  purpose: RecordingPurpose;
  subject: string;
}

export type NewBooking = Omit<Booking, 'id'>;