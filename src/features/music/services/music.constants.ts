// Query keys for music-related queries
export const MUSIC_QUERY_KEYS = {
  all: ['music'] as const,
  tracks: (tenantSlug?: string) => ['music', 'tracks', tenantSlug] as const,
} as const;
