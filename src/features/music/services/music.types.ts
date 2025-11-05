import { Track } from '@/types/music';

// API Request types
export interface GetTracksRequest {
  tenantSlug?: string;
}

// API Response types
export type GetTracksResponse = Track[];

export interface MusicErrorResponse {
  error: string;
  details?: string;
}

// Hook options
export interface UseTracksOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}
