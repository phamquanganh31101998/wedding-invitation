/**
 * Client-safe tenant utilities that don't depend on Node.js modules
 * These functions can be used in client components
 */

import { SlugValidation } from '@/types';

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
 * Client-side tenant slug format validation (without server-side existence check)
 * Returns validation result for format only
 */
export function validateTenantIdFormat(slug: string | null): SlugValidation {
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

  return {
    isValid: true,
    slug,
  };
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
 * Sanitizes a tenant slug by removing invalid characters
 */
export function sanitizeTenantId(input: string): string {
  return input.replace(/[^a-zA-Z0-9-_]/g, '');
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

/**
 * Creates a tenant-aware redirect URL using slug
 */
export function createTenantRedirectUrl(
  tenantSlug: string | null,
  targetPath: string = '/'
): string {
  if (isDefaultTenant(tenantSlug)) {
    return targetPath;
  }

  return getTenantPath(tenantSlug!, targetPath);
}
