/**
 * Client-safe tenant utilities that don't depend on Node.js modules
 * These functions can be used in client components
 */

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
