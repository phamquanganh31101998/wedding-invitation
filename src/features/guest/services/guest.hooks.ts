import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { GUEST_QUERY_KEYS, GUEST_MUTATION_KEYS } from './guest.constants';
import { getGuest, submitGuest } from './guest.requests';
import {
  GetGuestResponse,
  SubmitGuestResponse,
  UseGuestOptions,
  UseSubmitGuestOptions,
  SubmitGuestRequest,
} from './guest.types';

/**
 * Hook to fetch guest data using React Query
 */
export function useGetGuest(
  id: string | null,
  tenantSlug?: string | null,
  options: UseGuestOptions = {}
): UseQueryResult<GetGuestResponse, Error> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return useQuery({
    queryKey: GUEST_QUERY_KEYS.byId(id || '', tenantSlug || ''),
    queryFn: () => {
      if (!id) {
        throw new Error('Guest ID is required');
      }
      return getGuest({ id, tenantSlug: tenantSlug || undefined });
    },
    enabled: enabled && !!id,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (guest not found)
      if (
        error.message.includes('not found') ||
        error.message.includes('404')
      ) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

/**
 * Hook to submit guest RSVP data using React Query mutation
 */
export function useSubmitGuest(
  options: UseSubmitGuestOptions = {}
): UseMutationResult<SubmitGuestResponse, Error, SubmitGuestRequest> {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationKey: GUEST_MUTATION_KEYS.submit,
    mutationFn: submitGuest,
    onSuccess: (data, variables) => {
      // Invalidate and refetch guest queries
      queryClient.invalidateQueries({
        queryKey: GUEST_QUERY_KEYS.all,
      });

      // Update the specific guest query cache if we have an ID
      if (variables.guestId) {
        queryClient.setQueryData(
          GUEST_QUERY_KEYS.byId(
            variables.guestId.toString(),
            variables.tenantSlug || ''
          ),
          { data: data.data }
        );
      }

      onSuccess?.(data.data);
    },
    onError: (error) => {
      onError?.(error.message);
    },
  });
}
