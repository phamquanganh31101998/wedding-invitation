// Query keys for guest-related queries
export const GUEST_QUERY_KEYS = {
  all: ['guest'] as const,
  byId: (id: string, tenantSlug?: string) =>
    ['guest', 'byId', id, tenantSlug] as const,
} as const;

// Mutation keys for guest-related mutations
export const GUEST_MUTATION_KEYS = {
  create: ['guest', 'create'] as const,
  update: ['guest', 'update'] as const,
  submit: ['guest', 'submit'] as const,
} as const;
