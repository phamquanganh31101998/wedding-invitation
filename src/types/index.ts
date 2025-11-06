// Guest data for client (camelCase)
export interface Guest {
  id: number;
  tenantId: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

// Guest data for server/database (snake_case)
export interface GuestDb {
  id: number;
  tenant_id: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
  created_at: string;
  updated_at: string;
}

// Form data for guest RSVP submission
export interface GuestFormData {
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe' | '';
  message?: string;
}

// File data for client (camelCase)
export interface File {
  id: number;
  tenantId: number;
  type: string;
  url: string;
  name?: string;
  displayOrder: number;
  createdAt: string;
}

// File data for server/database (snake_case)
export interface FileDb {
  id: number;
  tenant_id: number;
  type: string;
  url: string;
  name?: string;
  display_order: number;
  created_at: string;
}

// User data for client (camelCase)
export interface User {
  id: number;
  username: string;
  passwordHash: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

// User data for server/database (snake_case)
export interface UserDb {
  id: number;
  username: string;
  password_hash: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

// Legacy aliases for backward compatibility
export type RSVPData = Guest;
export type RSVPFormData = GuestFormData;

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

// Tenant data for client (camelCase)
export interface Tenant {
  id: number;
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueMapLink?: string;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  isActive: boolean;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Tenant data for server/database (snake_case)
export interface TenantDb {
  id: number;
  slug: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  venue_map_link?: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  is_active: boolean;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Formatted tenant config for UI consumption
export interface TenantConfig {
  id: number;
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: {
    name: string;
    address: string;
    mapLink?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  contact?: {
    email?: string;
    phone?: string;
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
