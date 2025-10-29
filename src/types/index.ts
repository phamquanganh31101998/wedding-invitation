export interface RSVPData {
  id: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
}

export interface RSVPFormData {
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe' | '';
  message?: string;
}

// Countdown Timer Types
export interface UseCountdownReturn {
  days: number;
  isToday: boolean;
  isPast: boolean;
  error?: string;
  errorType?: 'validation' | 'calculation' | 'timezone' | 'unknown';
}

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

// Countdown timer size configurations mapping
export type CountdownSizeConfigs = Record<
  'sm' | 'md' | 'lg',
  CountdownSizeConfig
>;

// Tenant Configuration Types
export interface TenantConfig {
  id: number;
  slug: string;
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
  tenantSlug: string | null; // The slug from URL path
  config: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}

// Slug-related types
export interface SlugValidation {
  isValid: boolean;
  error?: string;
  slug?: string;
}

export interface TenantSlugLookup {
  tenantId: number | null;
  slug: string | null;
  isValid: boolean;
  error?: string;
}

// Migration and validation types
export interface TenantValidationResult {
  isValid: boolean;
  tenantId?: number;
  slug?: string;
  error?: string;
}

// Music Player Types
export * from './music';
