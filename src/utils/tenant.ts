import { getTenantBySlug } from '@/repositories/tenant-repository';
import { TenantValidationResult } from '@/types';

/**
 * Extracts tenant slug from URL pathname
 * Supports formats like:
 * - /tenant-slug -> tenant-slug
 * - /tenant-slug/ -> tenant-slug
 * - /tenant-slug/some/path -> tenant-slug
 * - / -> null (root path)
 */
export function extractTenantFromPath(pathname: string): string | null {
  if (!pathname || pathname === '/') {
    return null;
  }

  // Remove leading slash and split by slash
  const segments = pathname.replace(/^\//, '').split('/');

  // Get the first segment as potential tenant slug
  const potentialSlug = segments[0];

  if (!potentialSlug || potentialSlug.trim() === '') {
    return null;
  }

  // Basic validation - tenant slug should only contain alphanumeric, hyphens, and underscores
  const slugRegex = /^[a-zA-Z0-9-_]+$/;
  if (!slugRegex.test(potentialSlug)) {
    return null;
  }

  return potentialSlug;
}

/**
 * Validates if a tenant slug is valid and exists
 * Returns validation result with error details and database ID
 */
export async function validateTenantSlug(
  slug: string | null
): Promise<TenantValidationResult> {
  if (!slug) {
    return {
      isValid: false,
      error: 'No tenant slug provided',
    };
  }

  // Check format
  const slugRegex = /^[a-zA-Z0-9-_]+$/;
  if (!slugRegex.test(slug)) {
    return {
      isValid: false,
      error:
        'Invalid tenant slug format. Only alphanumeric characters, hyphens, and underscores are allowed.',
    };
  }

  // Check length
  if (slug.length < 2 || slug.length > 50) {
    return {
      isValid: false,
      error: 'Tenant slug must be between 2 and 50 characters long.',
    };
  }

  try {
    // Check if tenant exists and is active in database
    const tenant = await getTenantBySlug(slug);
    if (!tenant || !tenant.is_active) {
      return {
        isValid: false,
        error: `Tenant '${slug}' not found or inactive.`,
      };
    }

    return {
      isValid: true,
      tenantId: tenant.id as number,
      slug,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error validating tenant: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Gets the default tenant slug for fallback scenarios
 */
export function getDefaultTenantId(): string {
  return 'default';
}

/**
 * Checks if a tenant slug is the default tenant
 */
export function isDefaultTenant(tenantSlug: string | null): boolean {
  return tenantSlug === getDefaultTenantId() || tenantSlug === null;
}

/**
 * Generates a tenant-specific URL path using slug
 */
export function getTenantPath(
  tenantSlug: string,
  subPath: string = ''
): string {
  if (isDefaultTenant(tenantSlug)) {
    if (!subPath) return '/';
    return subPath.startsWith('/') ? subPath : `/${subPath}`;
  }

  const cleanSubPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
  return `/${tenantSlug}${cleanSubPath}`;
}

/**
 * Extracts tenant slug from Next.js request URL
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
