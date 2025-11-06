import { Guest, GuestFormData } from '@/types';

// API Request types
export interface GetGuestRequest {
  id: string;
  tenantSlug?: string;
}

export interface SubmitGuestRequest {
  data: GuestFormData;
  guestId?: string | number | null;
  tenantSlug?: string | null;
}

// API Response types
export interface GetGuestResponse {
  data: Guest | null;
  tenant?: string;
}

export interface SubmitGuestResponse {
  message: string;
  data: Guest;
  tenant?: string;
}

export interface GuestErrorResponse {
  error: string;
  type: string;
  code?: string;
  details?: string;
}

// Hook options
export interface UseGuestOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseSubmitGuestOptions {
  onSuccess?: (data: Guest) => void;
  onError?: (error: string) => void;
}
