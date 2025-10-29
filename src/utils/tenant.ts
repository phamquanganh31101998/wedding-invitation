import { getTenant, getTenantBySlug } from './database';
import { TenantValidationResult, TenantSlugLookup } from '@/types';

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
export async function validateTenantId(
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
 * Converts a tenant slug to database ID
 */
export async function getTenanIdBySlug(
  slug: string
): Promise<TenantSlugLookup> {
  try {
    const tenant = await getTenantBySlug(slug);
    if (!tenant || !tenant.is_active) {
      return {
        tenantId: null,
        slug,
        isValid: false,
        error: `Tenant '${slug}' not found or inactive.`,
      };
    }

    return {
      tenantId: tenant.id as number,
      slug,
      isValid: true,
    };
  } catch (error) {
    return {
      tenantId: null,
      slug,
      isValid: false,
      error: `Error looking up tenant: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
 * Gets the default tenant database ID
 */
export function getDefaultTenantDbId(): number {
  return 1;
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
 * Handles tenant identification with fallback logic
 */
export async function identifyTenant(pathname: string): Promise<{
  tenantId: string | null; // slug
  tenantDbId: number | null; // database ID
  isValid: boolean;
  error?: string;
  shouldFallback: boolean;
}> {
  const extractedSlug = extractTenantFromPath(pathname);

  // If no tenant slug in path, use default
  if (!extractedSlug) {
    return {
      tenantId: null,
      tenantDbId: null,
      isValid: true,
      shouldFallback: false,
    };
  }

  // Validate the extracted tenant slug
  const validation = await validateTenantId(extractedSlug);

  if (validation.isValid) {
    return {
      tenantId: extractedSlug,
      tenantDbId: validation.tenantId || null,
      isValid: true,
      shouldFallback: false,
    };
  }

  // Invalid tenant - suggest fallback
  return {
    tenantId: extractedSlug,
    tenantDbId: null,
    isValid: false,
    error: validation.error,
    shouldFallback: true,
  };
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
