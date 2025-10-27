/**
 * Client-safe tenant utilities that don't depend on Node.js modules
 * These functions can be used in client components
 */

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
 * Client-side tenant ID format validation (without server-side existence check)
 * Returns validation result for format only
 */
export function validateTenantIdFormat(tenantId: string | null): {
  isValid: boolean;
  error?: string;
  tenantId?: string;
} {
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

  return {
    isValid: true,
    tenantId,
  };
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
