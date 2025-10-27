/**
 * End-to-end tests for multi-tenant functionality
 * Tests tenant identification, validation, and data isolation
 */

import { validateTenantId, extractTenantFromPath } from '@/utils/tenant';
import { validateTenantExists, getTenantConfig } from '@/utils/csv';

// Mock the CSV utilities
jest.mock('@/utils/csv', () => ({
  validateTenantExists: jest.fn(),
  getTenantConfig: jest.fn(),
  readRSVPData: jest.fn(),
  writeRSVPData: jest.fn(),
}));

const mockValidateTenantExists = validateTenantExists as jest.MockedFunction<
  typeof validateTenantExists
>;
const mockGetTenantConfig = getTenantConfig as jest.MockedFunction<
  typeof getTenantConfig
>;

// Test data for different tenants
const johnJaneConfig = {
  id: 'john-jane',
  brideName: 'Jane Wilson',
  groomName: 'John Anderson',
  weddingDate: '2025-11-15',
  venue: {
    name: 'Sunset Gardens',
    address: '456 Garden Ave, Springfield, IL',
    mapLink: 'https://maps.google.com/john-jane',
  },
  theme: {
    primaryColor: '#E53E3E',
    secondaryColor: '#1A202C',
  },
  isActive: true,
  createdAt: '2025-10-27T00:00:00Z',
  updatedAt: '2025-10-27T00:00:00Z',
};

const garciaMartinezConfig = {
  id: 'garcia-martinez',
  brideName: 'Sofia Garcia',
  groomName: 'Carlos Martinez',
  weddingDate: '2026-03-14',
  venue: {
    name: 'Mountain View Lodge',
    address: '321 Pine Ridge Rd, Denver, CO',
    mapLink: 'https://maps.google.com/garcia-martinez',
  },
  theme: {
    primaryColor: '#38A169',
    secondaryColor: '#2D3748',
  },
  isActive: true,
  createdAt: '2025-10-27T00:00:00Z',
  updatedAt: '2025-10-27T00:00:00Z',
};

describe('Multi-Tenant End-to-End Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tenant identification and validation', () => {
    it('should extract tenant ID from URL paths correctly', () => {
      expect(extractTenantFromPath('/john-jane')).toBe('john-jane');
      expect(extractTenantFromPath('/john-jane/')).toBe('john-jane');
      expect(extractTenantFromPath('/garcia-martinez/some/path')).toBe(
        'garcia-martinez'
      );
      expect(extractTenantFromPath('/')).toBe(null);
      expect(extractTenantFromPath('')).toBe(null);
    });

    it('should validate tenant IDs correctly', async () => {
      mockValidateTenantExists.mockResolvedValue(true);

      const validResult = await validateTenantId('john-jane');
      expect(validResult.isValid).toBe(true);
      expect(validResult.tenantId).toBe('john-jane');

      const invalidFormatResult = await validateTenantId('invalid@tenant');
      expect(invalidFormatResult.isValid).toBe(false);
      expect(invalidFormatResult.error).toContain('Invalid tenant ID format');

      const nullResult = await validateTenantId(null);
      expect(nullResult.isValid).toBe(false);
      expect(nullResult.error).toContain('No tenant ID provided');
    });

    it('should handle non-existent tenants', async () => {
      mockValidateTenantExists.mockResolvedValue(false);

      const result = await validateTenantId('non-existent-tenant');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not found or inactive');
      expect(mockValidateTenantExists).toHaveBeenCalledWith(
        'non-existent-tenant'
      );
    });

    it('should validate tenant ID format restrictions', async () => {
      // Test various invalid formats
      const invalidFormats = [
        'tenant with spaces',
        'tenant@domain.com',
        'tenant/path',
        'tenant\\path',
        'tenant?query=1',
        'tenant#fragment',
        'a', // too short
        'a'.repeat(51), // too long
      ];

      for (const invalidFormat of invalidFormats) {
        const result = await validateTenantId(invalidFormat);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      }

      // Test valid formats
      mockValidateTenantExists.mockResolvedValue(true);
      const validFormats = [
        'john-jane',
        'garcia_martinez',
        'smith123',
        'wedding-2025',
        'couple_name_123',
      ];

      for (const validFormat of validFormats) {
        const result = await validateTenantId(validFormat);
        expect(result.isValid).toBe(true);
        expect(result.tenantId).toBe(validFormat);
      }
    });
  });

  describe('Tenant-specific configuration loading', () => {
    it('should load john-jane tenant configuration', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);

      const validation = await validateTenantId('john-jane');
      expect(validation.isValid).toBe(true);

      const config = await getTenantConfig('john-jane');
      expect(config.id).toBe('john-jane');
      expect(config.brideName).toBe('Jane Wilson');
      expect(config.groomName).toBe('John Anderson');
      expect(config.venue.name).toBe('Sunset Gardens');
      expect(config.venue.address).toBe('456 Garden Ave, Springfield, IL');
      expect(config.theme?.primaryColor).toBe('#E53E3E');

      expect(mockValidateTenantExists).toHaveBeenCalledWith('john-jane');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('john-jane');
    });

    it('should load garcia-martinez tenant configuration', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(garciaMartinezConfig);

      const validation = await validateTenantId('garcia-martinez');
      expect(validation.isValid).toBe(true);

      const config = await getTenantConfig('garcia-martinez');
      expect(config.id).toBe('garcia-martinez');
      expect(config.brideName).toBe('Sofia Garcia');
      expect(config.groomName).toBe('Carlos Martinez');
      expect(config.venue.name).toBe('Mountain View Lodge');
      expect(config.venue.address).toBe('321 Pine Ridge Rd, Denver, CO');
      expect(config.theme?.primaryColor).toBe('#38A169');

      expect(mockValidateTenantExists).toHaveBeenCalledWith('garcia-martinez');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('garcia-martinez');
    });

    it('should maintain data isolation between tenants', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig
        .mockResolvedValueOnce(johnJaneConfig)
        .mockResolvedValueOnce(garciaMartinezConfig);

      // Load john-jane config
      const johnJaneValidation = await validateTenantId('john-jane');
      expect(johnJaneValidation.isValid).toBe(true);
      const johnJaneConfigResult = await getTenantConfig('john-jane');

      // Load garcia-martinez config
      const garciaMartinezValidation =
        await validateTenantId('garcia-martinez');
      expect(garciaMartinezValidation.isValid).toBe(true);
      const garciaMartinezConfigResult =
        await getTenantConfig('garcia-martinez');

      // Verify each tenant gets only their own data
      expect(johnJaneConfigResult.id).toBe('john-jane');
      expect(johnJaneConfigResult.brideName).toBe('Jane Wilson');
      expect(garciaMartinezConfigResult.id).toBe('garcia-martinez');
      expect(garciaMartinezConfigResult.brideName).toBe('Sofia Garcia');

      // Verify separate function calls for each tenant
      expect(mockGetTenantConfig).toHaveBeenCalledWith('john-jane');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('garcia-martinez');
      expect(mockGetTenantConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling for edge cases', () => {
    it('should handle tenant validation errors gracefully', async () => {
      mockValidateTenantExists.mockRejectedValue(
        new Error('File system error')
      );

      const result = await validateTenantId('error-tenant');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Error validating tenant');
      expect(result.error).toContain('File system error');
    });

    it('should handle configuration loading errors', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockRejectedValue(new Error('Config file not found'));

      const validation = await validateTenantId('valid-tenant');
      expect(validation.isValid).toBe(true);

      await expect(getTenantConfig('valid-tenant')).rejects.toThrow(
        'Config file not found'
      );
      expect(mockGetTenantConfig).toHaveBeenCalledWith('valid-tenant');
    });

    it('should handle invalid tenant IDs with special characters', async () => {
      const invalidTenantIds = [
        'invalid/../tenant',
        'tenant%20with%20spaces',
        'tenant<script>',
        'tenant"quotes"',
        "tenant'quotes'",
        'tenant&amp;entity',
      ];

      for (const invalidTenantId of invalidTenantIds) {
        const result = await validateTenantId(invalidTenantId);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid tenant ID format');
      }
    });

    it('should handle concurrent tenant validation requests', async () => {
      mockValidateTenantExists.mockResolvedValue(true);

      // Make concurrent validation requests
      const validationPromises = [
        validateTenantId('john-jane'),
        validateTenantId('garcia-martinez'),
        validateTenantId('smith-wedding'),
      ];

      const results = await Promise.all(validationPromises);

      // All should succeed
      results.forEach((result, index) => {
        expect(result.isValid).toBe(true);
      });

      expect(results[0].tenantId).toBe('john-jane');
      expect(results[1].tenantId).toBe('garcia-martinez');
      expect(results[2].tenantId).toBe('smith-wedding');

      // Verify all validation calls were made
      expect(mockValidateTenantExists).toHaveBeenCalledWith('john-jane');
      expect(mockValidateTenantExists).toHaveBeenCalledWith('garcia-martinez');
      expect(mockValidateTenantExists).toHaveBeenCalledWith('smith-wedding');
      expect(mockValidateTenantExists).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed valid and invalid tenant requests', async () => {
      mockValidateTenantExists
        .mockResolvedValueOnce(true) // john-jane - valid
        .mockResolvedValueOnce(false) // invalid-tenant - not found
        .mockResolvedValueOnce(true); // garcia-martinez - valid

      const results = await Promise.all([
        validateTenantId('john-jane'),
        validateTenantId('invalid-tenant'),
        validateTenantId('garcia-martinez'),
      ]);

      expect(results[0].isValid).toBe(true);
      expect(results[0].tenantId).toBe('john-jane');

      expect(results[1].isValid).toBe(false);
      expect(results[1].error).toContain('not found or inactive');

      expect(results[2].isValid).toBe(true);
      expect(results[2].tenantId).toBe('garcia-martinez');
    });

    it('should handle tenant configuration with missing or invalid data', async () => {
      mockValidateTenantExists.mockResolvedValue(true);

      // Test with incomplete configuration
      const incompleteConfig = {
        id: 'incomplete-tenant',
        brideName: 'Jane',
        groomName: 'John',
        // Missing required fields
      };

      mockGetTenantConfig.mockResolvedValue(incompleteConfig as unknown);

      const validation = await validateTenantId('incomplete-tenant');
      expect(validation.isValid).toBe(true);

      const config = await getTenantConfig('incomplete-tenant');
      expect(config.id).toBe('incomplete-tenant');
      expect(config.brideName).toBe('Jane');
      expect(config.groomName).toBe('John');
      // Should handle missing fields gracefully
    });
  });

  describe('Real-world tenant scenarios', () => {
    it('should handle typical wedding invitation tenant IDs', async () => {
      mockValidateTenantExists.mockResolvedValue(true);

      const typicalTenantIds = [
        'john-and-jane',
        'smith_wedding_2025',
        'garcia-martinez',
        'wedding-celebration',
        'our-special-day',
        'couple123',
      ];

      for (const tenantId of typicalTenantIds) {
        const result = await validateTenantId(tenantId);
        expect(result.isValid).toBe(true);
        expect(result.tenantId).toBe(tenantId);
      }
    });

    it('should verify tenant data structure matches expected format', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);

      const config = await getTenantConfig('john-jane');

      // Verify all required fields are present
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('brideName');
      expect(config).toHaveProperty('groomName');
      expect(config).toHaveProperty('weddingDate');
      expect(config).toHaveProperty('venue');
      expect(config).toHaveProperty('isActive');
      expect(config).toHaveProperty('createdAt');
      expect(config).toHaveProperty('updatedAt');

      // Verify venue structure
      expect(config.venue).toHaveProperty('name');
      expect(config.venue).toHaveProperty('address');
      expect(config.venue).toHaveProperty('mapLink');

      // Verify optional theme structure
      if (config.theme) {
        expect(config.theme).toHaveProperty('primaryColor');
        expect(config.theme).toHaveProperty('secondaryColor');
      }

      // Verify data types
      expect(typeof config.id).toBe('string');
      expect(typeof config.brideName).toBe('string');
      expect(typeof config.groomName).toBe('string');
      expect(typeof config.weddingDate).toBe('string');
      expect(typeof config.isActive).toBe('boolean');
    });
  });
});
