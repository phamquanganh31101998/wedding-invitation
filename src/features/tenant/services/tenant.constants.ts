// Query keys for tenant-related queries
export const TENANT_QUERY_KEYS = {
  all: ['tenant'] as const,
  config: (slug: string) => ['tenant', 'config', slug] as const,
} as const;
