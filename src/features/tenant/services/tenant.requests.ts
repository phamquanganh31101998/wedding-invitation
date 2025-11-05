import {
  GetTenantConfigRequest,
  GetTenantConfigResponse,
  TenantErrorResponse,
} from './tenant.types';

/**
 * Fetches tenant configuration from the API
 */
export async function getTenantConfig(
  request: GetTenantConfigRequest
): Promise<GetTenantConfigResponse> {
  const { tenantSlug } = request;

  const response = await fetch(
    `/api/tenant?tenant=${encodeURIComponent(tenantSlug)}`
  );

  if (!response.ok) {
    const errorData: TenantErrorResponse = await response.json();
    throw new Error(
      errorData.error || `Configuration not found for tenant '${tenantSlug}'`
    );
  }

  return response.json();
}
