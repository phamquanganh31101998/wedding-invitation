import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { TENANT_QUERY_KEYS } from './tenant.constants';
import { getTenantConfig } from './tenant.requests';
import {
  GetTenantConfigResponse,
  UseTenantConfigOptions,
} from './tenant.types';

/**
 * Hook to fetch tenant configuration using React Query
 */
export function useTenantConfig(
  tenantSlug: string | null,
  options: UseTenantConfigOptions = {}
): UseQueryResult<GetTenantConfigResponse, Error> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return useQuery({
    queryKey: TENANT_QUERY_KEYS.config(tenantSlug || ''),
    queryFn: () => {
      if (!tenantSlug) {
        throw new Error('Tenant slug is required');
      }
      return getTenantConfig({ tenantSlug });
    },
    enabled: enabled && !!tenantSlug,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (tenant not found)
      if (error.message.includes('not found')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}
