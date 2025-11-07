// Gallery-specific types for the wedding photo gallery feature

// Gallery photo interface extending the base File interface
export interface GalleryPhoto {
  id: number;
  tenantId: number;
  type: string;
  url: string;
  name: string | null;
  displayOrder: number;
  createdAt: string;
}

// API response type for gallery endpoints
export interface GalleryApiResponse {
  photos: GalleryPhoto[];
  total: number;
}

// Error response type for gallery API
export interface GalleryErrorResponse {
  error: string;
  details?: string;
}

// Props for gallery components
export interface GallerySectionProps {
  tenantSlug: string;
  title?: string;
  description?: string;
}

export interface PhotoGridProps {
  photos: GalleryPhoto[];
  onPhotoClick: (index: number) => void;
  isLoading?: boolean;
}

export interface PhotoItemProps {
  photo: GalleryPhoto;
  onClick: () => void;
  loading?: boolean;
}

export interface LightboxProps {
  photos: GalleryPhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

// Gallery service hook options
export interface UseGalleryPhotosOptions {
  tenantSlug?: string;
  type?: string;
  enabled?: boolean;
}

// Gallery service hook return type
export interface UseGalleryPhotosReturn {
  photos: GalleryPhoto[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
