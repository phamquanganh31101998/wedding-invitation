'use client';

import { RSVPData } from '@/types';
import { useGetGuest as useGuestQuery } from '@/features/guest/services/guest.hooks';

interface UseGuestReturn {
  guest: RSVPData | null;
  loading: boolean;
  error: string | null;
}

interface UseGuestOptions {
  tenantSlug?: string | null;
}

/**
 * Legacy hook wrapper for backward compatibility
 * Uses React Query internally
 */
export function useGuest(
  id: string | null,
  options?: UseGuestOptions
): UseGuestReturn {
  const { data, isLoading, error } = useGuestQuery(id, options?.tenantSlug, {
    enabled: !!id,
  });

  return {
    guest: data?.data || null,
    loading: isLoading,
    error: error?.message || null,
  };
}
