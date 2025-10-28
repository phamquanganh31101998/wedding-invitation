import { getTenant } from './database';

/**
 * Extracts tenant ID from URL pathname
 * Supports formats like:
 * - /tenant-id -> tenant-id
 * - /tenant-id/ -> tenant-id
 * - /tenant-id/some/path -> tenant-id
 * - / -> null (root path)
 */
export function extractTenantFromPath(pathname: string): string | null {
  if (!pathname || pathname === '/') {
    return null;
  }

  // Remove leading slash and split by slash
  const segments = pathname.replace(/^\//, '').split('/');

  // Get the first segment as potential tenant ID
  const potentialTenantId = segments[0];

  if (!potentialTenantId || potentialTenantId.trim() === '') {
    return null;
  }

  // Basic validation - tenant ID should only contain alphanumeric, hyphens, and underscores
  const tenantIdRegex = /^[a-zA-Z0-9-_]+$/;
  if (!tenantIdRegex.test(potentialTenantId)) {
    return null;
  }

  return potentialTenantId;
}

/**
 * Validates if a tenant ID is valid and exists
 * Returns validation result with error details
 */
export async function validateTenantId(tenantId: string | null): Promise<{
  isValid: boolean;
  error?: string;
  tenantId?: string;
}> {
  if (!tenantId) {
    return {
      isValid: false,
      error: 'No tenant ID provided',
    };
  }

  // Check format
  const tenantIdRegex = /^[a-zA-Z0-9-_]+$/;
  if (!tenantIdRegex.test(tenantId)) {
    return {
      isValid: false,
      error:
        'Invalid tenant ID format. Only alphanumeric characters, hyphens, and underscores are allowed.',
    };
  }

  // Check length
  if (tenantId.length < 2 || tenantId.length > 50) {
    return {
      isValid: false,
      error: 'Tenant ID must be between 2 and 50 characters long.',
    };
  }

  try {
    // Check if tenant exists and is active in database
    const tenant = await getTenant(tenantId);
    if (!tenant || !tenant.is_active) {
      return {
        isValid: false,
        error: `Tenant '${tenantId}' not found or inactive.`,
      };
    }

    return {
      isValid: true,
      tenantId,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error validating tenant: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Gets the default tenant ID for fallback scenarios
 */
export function getDefaultTenantId(): string {
  return 'default';
}

/**
 * Checks if a tenant ID is the default tenant
 */
export function isDefaultTenant(tenantId: string | null): boolean {
  return tenantId === getDefaultTenantId() || tenantId === null;
}

/**
 * Sanitizes a tenant ID by removing invalid characters
 */
export function sanitizeTenantId(input: string): string {
  return input.replace(/[^a-zA-Z0-9-_]/g, '');
}

/**
 * Generates a tenant-specific URL path
 */
export function getTenantPath(tenantId: string, subPath: string = ''): string {
  if (isDefaultTenant(tenantId)) {
    if (!subPath) return '/';
    return subPath.startsWith('/') ? subPath : `/${subPath}`;
  }

  const cleanSubPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
  return `/${tenantId}${cleanSubPath}`;
}

/**
 * Extracts tenant ID from Next.js request URL
 */
export function extractTenantFromRequest(url: string): string | null {
  try {
    const urlObj = new URL(url, 'http://localhost');
    return extractTenantFromPath(urlObj.pathname);
  } catch (error) {
    // If URL parsing fails, try to extract directly from the string
    // This handles cases where the input is not a valid URL
    if (url && !url.includes('://')) {
      return extractTenantFromPath(url);
    }
    console.error('Error parsing URL for tenant extraction:', error);
    return null;
  }
}

/**
 * Handles tenant identification with fallback logic
 */
export async function identifyTenant(pathname: string): Promise<{
  tenantId: string | null;
  isValid: boolean;
  error?: string;
  shouldFallback: boolean;
}> {
  const extractedTenantId = extractTenantFromPath(pathname);

  // If no tenant ID in path, use default
  if (!extractedTenantId) {
    return {
      tenantId: null,
      isValid: true,
      shouldFallback: false,
    };
  }

  // Validate the extracted tenant ID
  const validation = await validateTenantId(extractedTenantId);

  if (validation.isValid) {
    return {
      tenantId: extractedTenantId,
      isValid: true,
      shouldFallback: false,
    };
  }

  // Invalid tenant - suggest fallback
  return {
    tenantId: extractedTenantId,
    isValid: false,
    error: validation.error,
    shouldFallback: true,
  };
}

/**
 * Creates a tenant-aware redirect URL
 */
export function createTenantRedirectUrl(
  tenantId: string | null,
  targetPath: string = '/'
): string {
  if (isDefaultTenant(tenantId)) {
    return targetPath;
  }

  return getTenantPath(tenantId!, targetPath);
}
