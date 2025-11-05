import { TenantConfig } from '@/types';

// API Request types
export interface GetTenantConfigRequest {
  tenantSlug: string;
}

// API Response types
export interface GetTenantConfigResponse {
  data: TenantConfig;
  tenant: string;
}

export interface TenantErrorResponse {
  error: string;
  type: string;
  details?: string;
}

// Hook options
export interface UseTenantConfigOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}
