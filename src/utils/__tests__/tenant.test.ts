import {
  validateTenantId,
  getTenanIdBySlug,
  getDefaultTenantDbId,
  extractTenantFromPath,
  isDefaultTenant,
} from '../tenant';
import * as database from '../database';

// Mock the database functions
jest.mock('../database', () => ({
  getTenantBySlug: jest.fn(),
}));

const mockGetTenantBySlug = database.getTenantBySlug as jest.MockedFunction<
  typeof database.getTenantBySlug
>;

describe('Tenant Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTenantId', () => {
    it('should validate existing tenant slug', async () => {
      const mockTenant = {
        id: 1,
        slug: 'john-jane-wedding',
        bride_name: 'Jane Smith',
        groom_name: 'John Doe',
        is_active: true,
        wedding_date: '2025-12-29',
        venue_name: 'Grand Ballroom',
        venue_address: '123 Wedding St',
        venue_map_link: 'https://maps.google.com',
        theme_primary_color: '#E53E3E',
        theme_secondary_color: '#FED7D7',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockGetTenantBySlug.mockResolvedValueOnce(mockTenant);

      const result = await validateTenantId('john-jane-wedding');

      expect(result.isValid).toBe(true);
      expect(result.tenantId).toBe(1); // Database ID
      expect(result.slug).toBe('john-jane-wedding');
      expect(mockGetTenantBySlug).toHaveBeenCalledWith('john-jane-wedding');
    });

    it('should reject non-existent tenant slug', async () => {
      mockGetTenantBySlug.mockResolvedValueOnce(null);

      const result = await validateTenantId('non-existent');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not found or inactive');
    });

    it('should reject invalid slug format', async () => {
      const result = await validateTenantId('invalid@slug!');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid tenant slug format');
      expect(mockGetTenantBySlug).not.toHaveBeenCalled();
    });

    it('should reject null slug', async () => {
      const result = await validateTenantId(null);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('No tenant slug provided');
    });
  });

  describe('getTenanIdBySlug', () => {
    it('should return tenant database ID for valid slug', async () => {
      const mockTenant = {
        id: 5,
        slug: 'test-wedding',
        is_active: true,
        bride_name: 'Test Bride',
        groom_name: 'Test Groom',
        wedding_date: '2025-12-29',
        venue_name: 'Test Venue',
        venue_address: 'Test Address',
        theme_primary_color: '#E53E3E',
        theme_secondary_color: '#FED7D7',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockGetTenantBySlug.mockResolvedValueOnce(mockTenant);

      const result = await getTenanIdBySlug('test-wedding');

      expect(result.isValid).toBe(true);
      expect(result.tenantId).toBe(5);
      expect(result.slug).toBe('test-wedding');
    });

    it('should handle non-existent slug', async () => {
      mockGetTenantBySlug.mockResolvedValueOnce(null);

      const result = await getTenanIdBySlug('non-existent');

      expect(result.isValid).toBe(false);
      expect(result.tenantId).toBe(null);
      expect(result.error).toContain('not found or inactive');
    });
  });

  describe('getDefaultTenantDbId', () => {
    it('should return integer 1 for default tenant database ID', () => {
      const result = getDefaultTenantDbId();
      expect(result).toBe(1);
      expect(typeof result).toBe('number');
    });
  });

  describe('extractTenantFromPath', () => {
    it('should extract tenant slug from URL path', () => {
      expect(extractTenantFromPath('/john-jane-wedding')).toBe(
        'john-jane-wedding'
      );
      expect(extractTenantFromPath('/john-jane-wedding/')).toBe(
        'john-jane-wedding'
      );
      expect(extractTenantFromPath('/john-jane-wedding/rsvp')).toBe(
        'john-jane-wedding'
      );
    });

    it('should return null for root path', () => {
      expect(extractTenantFromPath('/')).toBe(null);
      expect(extractTenantFromPath('')).toBe(null);
    });

    it('should reject invalid slug characters', () => {
      expect(extractTenantFromPath('/invalid@slug!')).toBe(null);
      expect(extractTenantFromPath('/slug with spaces')).toBe(null);
    });
  });

  describe('isDefaultTenant', () => {
    it('should identify default tenant', () => {
      expect(isDefaultTenant('default')).toBe(true);
      expect(isDefaultTenant(null)).toBe(true);
    });

    it('should identify non-default tenant', () => {
      expect(isDefaultTenant('john-jane-wedding')).toBe(false);
      expect(isDefaultTenant('custom-tenant')).toBe(false);
    });
  });
});
