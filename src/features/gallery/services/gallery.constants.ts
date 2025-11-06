// Query keys for gallery-related queries
export const GALLERY_QUERY_KEYS = {
  all: ['gallery'] as const,
  photos: (tenantSlug?: string, type?: string) =>
    ['gallery', 'photos', tenantSlug, type] as const,
} as const;
