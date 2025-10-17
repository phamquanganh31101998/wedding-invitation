export interface RSVPData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  attendance: 'yes' | 'no' | 'maybe';
  guestCount: number;
  message?: string;
  submittedAt: string;
}

export interface WeddingDetails {
  bride: string;
  groom: string;
  weddingDate: string;
  venue: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

// Countdown Timer Types
export interface CountdownState {
  days: number;
  isToday: boolean;
  isPast: boolean;
  error?: string;
  errorType?: 'validation' | 'calculation' | 'timezone' | 'unknown';
}

export type UseCountdownReturn = CountdownState;

export interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Size configuration types for CountdownTimer
export interface CountdownSizeConfig {
  containerPadding: number;
  titleSize: string;
  numberSize: string;
  maxWidth: string;
}

export type CountdownSize = 'sm' | 'md' | 'lg';

// Countdown timer size configurations mapping
export type CountdownSizeConfigs = Record<CountdownSize, CountdownSizeConfig>;
