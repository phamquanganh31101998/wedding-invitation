import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { MUSIC_QUERY_KEYS } from './music.constants';
import { getTrackList } from './music.requests';
import { GetTracksResponse, UseTracksOptions } from './music.types';

/**
 * Hook to fetch music tracks using React Query
 */
export function useGetTrackList(
  tenantSlug?: string,
  options: UseTracksOptions = {}
): UseQueryResult<GetTracksResponse, Error> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return useQuery({
    queryKey: MUSIC_QUERY_KEYS.tracks(tenantSlug),
    queryFn: () => getTrackList({ tenantSlug }),
    enabled,
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
