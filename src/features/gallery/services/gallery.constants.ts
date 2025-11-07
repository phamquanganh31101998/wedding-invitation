// Query keys for gallery-related queries
export const GALLERY_QUERY_KEYS = {
  all: ['gallery'] as const,
  photos: (tenantSlug?: string) => ['gallery', 'photos', tenantSlug] as const,
} as const;
