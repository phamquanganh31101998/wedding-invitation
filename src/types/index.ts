export interface RSVPData {
  id: string;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
  submittedAt: string;
}

export interface RSVPFormData {
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe' | '';
  message?: string;
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

// Tenant Configuration Types
export interface TenantConfig {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: {
    name: string;
    address: string;
    mapLink: string;
  };
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantContextType {
  tenantId: string | null;
  config: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}

export interface TenantRSVPData extends RSVPData {
  tenantId: string;
}

// Music Player Types
export * from './music';
