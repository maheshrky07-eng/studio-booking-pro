import type { RecordingPurpose } from './types';

export const STUDIOS: { id: string; name: string }[] = [
  { id: 'studio-1', name: 'Studio 1' },
  { id: 'studio-2', name: 'Studio 2' },
  { id: 'studio-3', name: 'Studio 3' },
  { id: 'studio-4', name: 'Studio 4' },
  { id: 'golden-studio', name: '312 Golden Studio' },
  { id: 'sargasan-studio-1', name: 'Sargasan Studio 1' },
  { id: 'sargasan-studio-2', name: 'Sargasan Studio 2' }
];

export const START_HOUR: number = 8; // 8 AM
export const END_HOUR: number = 23; // 11 PM

export const RECORDING_PURPOSES: RecordingPurpose[] = ['YouTube', 'Planner', 'Smart Course', 'Live'];