import { GalleryApiResponse, GalleryErrorResponse } from '@/types/gallery';

// Request types for gallery API calls
export interface GetGalleryPhotosRequest {
  tenantSlug?: string;
  type?: string;
}

// Response types (re-exported for service layer)
export type GetGalleryPhotosResponse = GalleryApiResponse;
export type GalleryServiceErrorResponse = GalleryErrorResponse;

// Hook options for gallery services
export interface UseGalleryPhotosOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}
