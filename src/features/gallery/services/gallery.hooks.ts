import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GALLERY_QUERY_KEYS } from './gallery.constants';
import { getGalleryPhotos } from './gallery.requests';
import {
  GetGalleryPhotosResponse,
  UseGalleryPhotosOptions,
} from './gallery.types';

/**
 * Hook to fetch gallery photos using React Query
 */
export function useGalleryPhotos(
  tenantSlug?: string,
  options: UseGalleryPhotosOptions = {}
): UseQueryResult<GetGalleryPhotosResponse, Error> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.photos(tenantSlug),
    queryFn: () => getGalleryPhotos({ tenantSlug }),
    enabled: !!tenantSlug || enabled,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error.message.includes('400') || error.message.includes('404')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}
