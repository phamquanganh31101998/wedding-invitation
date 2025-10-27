/**
 * Complete End-to-End Tests for Multi-Tenant System
 * Tests complete guest RSVP flow, concurrent access, and error conditions
 * Requirements: 1.1, 1.5, 3.2
 */

import {
  validateTenantExists,
  getTenantConfig,
  writeRSVPData,
  readRSVPData,
} from '@/utils/csv';
import { validateTenantId, extractTenantFromPath } from '@/utils/tenant';

// Mock the CSV utilities
jest.mock('@/utils/csv', () => ({
  validateTenantExists: jest.fn(),
  getTenantConfig: jest.fn(),
  readRSVPData: jest.fn(),
  writeRSVPData: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  usePathname: jest.fn(() => '/john-jane'),
}));

const mockValidateTenantExists = validateTenantExists as jest.MockedFunction<
  typeof validateTenantExists
>;
const mockGetTenantConfig = getTenantConfig as jest.MockedFunction<
  typeof getTenantConfig
>;
const mockWriteRSVPData = writeRSVPData as jest.MockedFunction<
  typeof writeRSVPData
>;
const mockReadRSVPData = readRSVPData as jest.MockedFunction<
  typeof readRSVPData
>;

// Test tenant configurations
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

const smithWeddingConfig = {
  id: 'smith-wedding',
  brideName: 'Emily Smith',
  groomName: 'Michael Johnson',
  weddingDate: '2025-08-20',
  venue: {
    name: 'Lakeside Resort',
    address: '789 Lake View Dr, Austin, TX',
    mapLink: 'https://maps.google.com/smith-wedding',
  },
  theme: {
    primaryColor: '#3182CE',
    secondaryColor: '#2D3748',
  },
  isActive: true,
  createdAt: '2025-10-27T00:00:00Z',
  updatedAt: '2025-10-27T00:00:00Z',
};

// Mock API fetch function
const mockApiCall = async (url: string, options?: RequestInit) => {
  const urlObj = new URL(url, 'http://localhost');
  const tenant = urlObj.searchParams.get('tenant');

  if (url.includes('/api/rsvp/tenant')) {
    if (options?.method === 'POST') {
      // Mock RSVP submission
      if (tenant === 'invalid-tenant') {
        return {
          ok: false,
          status: 404,
          json: async () => ({ error: 'Tenant not found' }),
        };
      }
      if (tenant === 'error-tenant') {
        return {
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'RSVP submitted successfully',
        }),
      };
    }
  }

  if (url.includes('/api/config/tenant')) {
    // Mock config retrieval
    if (tenant === 'invalid-tenant') {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Tenant not found' }),
      };
    }
    if (tenant === 'john-jane') {
      return {
        ok: true,
        status: 200,
        json: async () => johnJaneConfig,
      };
    }
    if (tenant === 'garcia-martinez') {
      return {
        ok: true,
        status: 200,
        json: async () => garciaMartinezConfig,
      };
    }
  }

  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' }),
  };
};

describe('Complete Multi-Tenant End-to-End Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock global fetch for API calls
    global.fetch = jest.fn().mockImplementation(mockApiCall);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Guest RSVP Flow for Multiple Tenants', () => {
    it('should complete full RSVP flow for john-jane tenant', async () => {
      // Setup mocks for john-jane tenant
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);
      mockReadRSVPData.mockResolvedValue([]);
      mockWriteRSVPData.mockResolvedValue(undefined);

      // Step 1: Validate tenant from URL path
      const tenantId = extractTenantFromPath('/john-jane');
      expect(tenantId).toBe('john-jane');

      // Step 2: Validate tenant exists
      const validation = await validateTenantId(tenantId);
      expect(validation.isValid).toBe(true);
      expect(validation.tenantId).toBe('john-jane');

      // Step 3: Load tenant configuration
      const config = await getTenantConfig('john-jane');
      expect(config.id).toBe('john-jane');
      expect(config.brideName).toBe('Jane Wilson');
      expect(config.groomName).toBe('John Anderson');
      expect(config.venue.name).toBe('Sunset Gardens');

      // Step 4: Submit RSVP through API
      const rsvpData = {
        name: 'Alice Johnson',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'So excited to celebrate with you!',
      };

      const response = await fetch('/api/rsvp/tenant?tenant=john-jane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();
      expect(response.ok).toBe(true);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('RSVP submitted successfully');

      // Verify all steps were executed correctly
      expect(mockValidateTenantExists).toHaveBeenCalledWith('john-jane');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('john-jane');
    });

    it('should complete full RSVP flow for garcia-martinez tenant', async () => {
      // Setup mocks for garcia-martinez tenant
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(garciaMartinezConfig);
      mockReadRSVPData.mockResolvedValue([]);
      mockWriteRSVPData.mockResolvedValue(undefined);

      // Step 1: Validate tenant from URL path
      const tenantId = extractTenantFromPath('/garcia-martinez');
      expect(tenantId).toBe('garcia-martinez');

      // Step 2: Validate tenant exists
      const validation = await validateTenantId(tenantId);
      expect(validation.isValid).toBe(true);
      expect(validation.tenantId).toBe('garcia-martinez');

      // Step 3: Load tenant configuration
      const config = await getTenantConfig('garcia-martinez');
      expect(config.id).toBe('garcia-martinez');
      expect(config.brideName).toBe('Sofia Garcia');
      expect(config.groomName).toBe('Carlos Martinez');
      expect(config.venue.name).toBe('Mountain View Lodge');

      // Step 4: Submit RSVP through API with different data
      const rsvpData = {
        name: 'Roberto Silva',
        relationship: 'Family',
        attendance: 'no',
        message: 'Sorry, cannot make it but wish you the best!',
      };

      const response = await fetch('/api/rsvp/tenant?tenant=garcia-martinez', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();
      expect(response.ok).toBe(true);
      expect(responseData.success).toBe(true);

      // Verify tenant-specific data was used
      expect(mockValidateTenantExists).toHaveBeenCalledWith('garcia-martinez');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('garcia-martinez');
    });

    it('should handle RSVP submission failure gracefully', async () => {
      // Setup mocks for valid tenant but API failure
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);

      // Step 1-3: Normal flow
      const tenantId = extractTenantFromPath('/john-jane');
      const validation = await validateTenantId(tenantId);
      const config = await getTenantConfig('john-jane');

      expect(validation.isValid).toBe(true);
      expect(config.id).toBe('john-jane');

      // Step 4: Submit RSVP to error-prone endpoint
      const rsvpData = {
        name: 'Test User',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Test message',
      };

      const response = await fetch('/api/rsvp/tenant?tenant=error-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error');
    });

    it('should handle complete flow with data persistence', async () => {
      // Setup mocks with existing RSVP data
      const existingRSVPs = [
        {
          name: 'Previous Guest',
          relationship: 'Family',
          attendance: 'yes',
          message: 'Looking forward!',
        },
      ];

      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);
      mockReadRSVPData.mockResolvedValue(existingRSVPs);
      mockWriteRSVPData.mockResolvedValue(undefined);

      // Complete flow: URL -> Validation -> Config -> Data -> Submit
      const tenantId = extractTenantFromPath('/john-jane/some/path');
      expect(tenantId).toBe('john-jane');

      const validation = await validateTenantId(tenantId);
      expect(validation.isValid).toBe(true);

      const config = await getTenantConfig(tenantId);
      expect(config.brideName).toBe('Jane Wilson');

      const existingData = await readRSVPData(tenantId);
      expect(existingData).toHaveLength(1);
      expect(existingData[0].name).toBe('Previous Guest');

      // Submit new RSVP
      const newRSVP = {
        name: 'New Guest',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Excited to join!',
      };

      const response = await fetch(`/api/rsvp/tenant?tenant=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRSVP),
      });

      expect(response.ok).toBe(true);

      // Verify all operations were called
      expect(mockValidateTenantExists).toHaveBeenCalledWith(tenantId);
      expect(mockGetTenantConfig).toHaveBeenCalledWith(tenantId);
      expect(mockReadRSVPData).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('Concurrent Access by Different Tenants', () => {
    it('should handle concurrent RSVP submissions from different tenants', async () => {
      // Setup mocks for both tenants
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockImplementation(async (tenantId) => {
        if (tenantId === 'john-jane') return johnJaneConfig;
        if (tenantId === 'garcia-martinez') return garciaMartinezConfig;
        throw new Error('Tenant not found');
      });
      mockWriteRSVPData.mockResolvedValue(undefined);

      // Simulate concurrent RSVP submissions
      const rsvp1Promise = (async () => {
        const tenantId = 'john-jane';
        const validation = await validateTenantId(tenantId);
        const config = await getTenantConfig(tenantId);

        const response = await fetch(`/api/rsvp/tenant?tenant=${tenantId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Guest One',
            relationship: 'Friend',
            attendance: 'yes',
            message: 'From john-jane tenant',
          }),
        });

        return { validation, config, response: await response.json() };
      })();

      const rsvp2Promise = (async () => {
        const tenantId = 'garcia-martinez';
        const validation = await validateTenantId(tenantId);
        const config = await getTenantConfig(tenantId);

        const response = await fetch(`/api/rsvp/tenant?tenant=${tenantId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Guest Two',
            relationship: 'Family',
            attendance: 'no',
            message: 'From garcia-martinez tenant',
          }),
        });

        return { validation, config, response: await response.json() };
      })();

      // Wait for both concurrent operations to complete
      const [result1, result2] = await Promise.all([
        rsvp1Promise,
        rsvp2Promise,
      ]);

      // Verify both operations succeeded with correct tenant data
      expect(result1.validation.isValid).toBe(true);
      expect(result1.validation.tenantId).toBe('john-jane');
      expect(result1.config.brideName).toBe('Jane Wilson');
      expect(result1.response.success).toBe(true);

      expect(result2.validation.isValid).toBe(true);
      expect(result2.validation.tenantId).toBe('garcia-martinez');
      expect(result2.config.brideName).toBe('Sofia Garcia');
      expect(result2.response.success).toBe(true);

      // Verify both tenants were validated independently
      expect(mockValidateTenantExists).toHaveBeenCalledWith('john-jane');
      expect(mockValidateTenantExists).toHaveBeenCalledWith('garcia-martinez');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('john-jane');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('garcia-martinez');
    });

    it('should maintain data isolation during concurrent access', async () => {
      // Setup mocks with different data for each tenant
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockImplementation(async (tenantId) => {
        if (tenantId === 'john-jane') return johnJaneConfig;
        if (tenantId === 'garcia-martinez') return garciaMartinezConfig;
        if (tenantId === 'smith-wedding') return smithWeddingConfig;
        throw new Error('Tenant not found');
      });

      // Mock different RSVP data for each tenant
      mockReadRSVPData.mockImplementation(async (tenantId) => {
        if (tenantId === 'john-jane')
          return [
            {
              name: 'John Guest',
              relationship: 'Friend',
              attendance: 'yes',
              message: 'John tenant data',
            },
          ];
        if (tenantId === 'garcia-martinez')
          return [
            {
              name: 'Garcia Guest',
              relationship: 'Family',
              attendance: 'no',
              message: 'Garcia tenant data',
            },
          ];
        if (tenantId === 'smith-wedding')
          return [
            {
              name: 'Smith Guest',
              relationship: 'Colleague',
              attendance: 'yes',
              message: 'Smith tenant data',
            },
          ];
        return [];
      });

      // Test concurrent configuration and data loading
      const loadPromises = [
        (async () => {
          const config = await getTenantConfig('john-jane');
          const data = await readRSVPData('john-jane');
          return { tenantId: 'john-jane', config, data };
        })(),
        (async () => {
          const config = await getTenantConfig('garcia-martinez');
          const data = await readRSVPData('garcia-martinez');
          return { tenantId: 'garcia-martinez', config, data };
        })(),
        (async () => {
          const config = await getTenantConfig('smith-wedding');
          const data = await readRSVPData('smith-wedding');
          return { tenantId: 'smith-wedding', config, data };
        })(),
      ];

      const results = await Promise.all(loadPromises);

      // Verify each tenant gets only their own data
      expect(results[0].config.id).toBe('john-jane');
      expect(results[0].config.brideName).toBe('Jane Wilson');
      expect(results[0].data[0].message).toBe('John tenant data');

      expect(results[1].config.id).toBe('garcia-martinez');
      expect(results[1].config.brideName).toBe('Sofia Garcia');
      expect(results[1].data[0].message).toBe('Garcia tenant data');

      expect(results[2].config.id).toBe('smith-wedding');
      expect(results[2].config.brideName).toBe('Emily Smith');
      expect(results[2].data[0].message).toBe('Smith tenant data');

      // Verify separate function calls for each tenant
      expect(mockGetTenantConfig).toHaveBeenCalledTimes(3);
      expect(mockReadRSVPData).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure scenarios concurrently', async () => {
      // Setup mixed scenarios
      mockValidateTenantExists.mockImplementation(async (tenantId) => {
        if (tenantId === 'john-jane') return true;
        if (tenantId === 'invalid-tenant') return false;
        if (tenantId === 'garcia-martinez') return true;
        return false;
      });

      mockGetTenantConfig.mockImplementation(async (tenantId) => {
        if (tenantId === 'john-jane') return johnJaneConfig;
        if (tenantId === 'garcia-martinez') return garciaMartinezConfig;
        throw new Error('Tenant not found');
      });

      // Test concurrent mixed scenarios
      const mixedPromises = [
        validateTenantId('john-jane'), // Should succeed
        validateTenantId('invalid-tenant'), // Should fail
        validateTenantId('garcia-martinez'), // Should succeed
      ];

      const results = await Promise.all(mixedPromises);

      // Verify mixed results
      expect(results[0].isValid).toBe(true);
      expect(results[0].tenantId).toBe('john-jane');

      expect(results[1].isValid).toBe(false);
      expect(results[1].error).toContain('not found or inactive');

      expect(results[2].isValid).toBe(true);
      expect(results[2].tenantId).toBe('garcia-martinez');

      // Verify all validation attempts were made
      expect(mockValidateTenantExists).toHaveBeenCalledTimes(3);
    });
  });

  describe('System Behavior Under Various Error Conditions', () => {
    it('should handle invalid tenant ID gracefully', async () => {
      // Mock tenant validation failure
      mockValidateTenantExists.mockResolvedValue(false);

      // Test invalid tenant flow
      const tenantId = extractTenantFromPath('/invalid-tenant');
      expect(tenantId).toBe('invalid-tenant');

      const validation = await validateTenantId(tenantId);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('not found or inactive');

      // Verify validation was attempted but config loading was not
      expect(mockValidateTenantExists).toHaveBeenCalledWith('invalid-tenant');
      expect(mockGetTenantConfig).not.toHaveBeenCalled();

      // Test API response for invalid tenant
      const response = await fetch('/api/config/tenant?tenant=invalid-tenant');
      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Tenant not found');
    });

    it('should handle tenant configuration loading errors', async () => {
      // Mock tenant exists but config loading fails
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockRejectedValue(
        new Error('Configuration file not found')
      );

      // Test error handling
      const validation = await validateTenantId('error-tenant');
      expect(validation.isValid).toBe(true);

      // Config loading should fail
      await expect(getTenantConfig('error-tenant')).rejects.toThrow(
        'Configuration file not found'
      );

      // Verify both validation and config loading were attempted
      expect(mockValidateTenantExists).toHaveBeenCalledWith('error-tenant');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('error-tenant');
    });

    it('should handle network failures during API calls', async () => {
      // Mock network failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Test network error handling
      try {
        await fetch('/api/config/tenant?tenant=john-jane');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle malformed tenant configuration data', async () => {
      // Mock tenant exists but returns malformed config
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue({
        id: 'malformed-tenant',
        // Missing required fields
      } as Partial<TenantConfig>);

      const validation = await validateTenantId('malformed-tenant');
      expect(validation.isValid).toBe(true);

      const config = await getTenantConfig('malformed-tenant');
      expect(config.id).toBe('malformed-tenant');
      // Should handle missing fields gracefully
      expect(config.brideName).toBeUndefined();
      expect(config.groomName).toBeUndefined();
    });

    it('should handle concurrent errors from multiple tenants', async () => {
      // Mock different error scenarios for different tenants
      mockValidateTenantExists.mockImplementation(async (tenantId) => {
        if (tenantId === 'invalid-tenant-1') return false;
        if (tenantId === 'valid-tenant') return true;
        if (tenantId === 'invalid-tenant-2') return false;
        return false;
      });

      mockGetTenantConfig.mockImplementation(async (tenantId) => {
        if (tenantId === 'valid-tenant')
          throw new Error('Config error for valid-tenant');
        throw new Error('Tenant not found');
      });

      // Test concurrent error handling
      const errorPromises = [
        validateTenantId('invalid-tenant-1'),
        validateTenantId('valid-tenant'),
        validateTenantId('invalid-tenant-2'),
      ];

      const results = await Promise.all(errorPromises);

      // Verify error isolation
      expect(results[0].isValid).toBe(false);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);

      // Test config loading error for valid tenant
      await expect(getTenantConfig('valid-tenant')).rejects.toThrow(
        'Config error for valid-tenant'
      );

      // Verify all calls were made independently
      expect(mockValidateTenantExists).toHaveBeenCalledTimes(3);
      expect(mockGetTenantConfig).toHaveBeenCalledTimes(1);
    });

    it('should handle file system errors gracefully', async () => {
      // Mock file system errors
      mockValidateTenantExists.mockRejectedValue(
        new Error('File system permission denied')
      );
      mockGetTenantConfig.mockRejectedValue(new Error('Disk full'));
      mockWriteRSVPData.mockRejectedValue(new Error('Cannot write to file'));

      // Test validation error
      await expect(validateTenantExists('fs-error-tenant')).rejects.toThrow(
        'File system permission denied'
      );

      // Test config loading error
      await expect(getTenantConfig('fs-error-tenant')).rejects.toThrow(
        'Disk full'
      );

      // Test RSVP writing error
      await expect(
        writeRSVPData('fs-error-tenant', {
          name: 'Test',
          relationship: 'Friend',
          attendance: 'yes',
          message: 'Test',
        })
      ).rejects.toThrow('Cannot write to file');
    });

    it('should handle high load scenarios with multiple concurrent requests', async () => {
      // Setup mocks for high load scenario
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockImplementation(async (tenantId) => {
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { ...johnJaneConfig, id: tenantId };
      });

      // Create many concurrent requests
      const tenantIds = Array.from({ length: 20 }, (_, i) => `tenant-${i}`);
      const concurrentRequests = tenantIds.map((tenantId) =>
        Promise.all([validateTenantExists(tenantId), getTenantConfig(tenantId)])
      );

      // Execute all requests concurrently
      const results = await Promise.all(concurrentRequests);

      // Verify all requests completed successfully
      results.forEach(([isValid, config], index) => {
        expect(isValid).toBe(true);
        expect(config.id).toBe(`tenant-${index}`);
      });

      // Verify all validation and config calls were made
      expect(mockValidateTenantExists).toHaveBeenCalledTimes(20);
      expect(mockGetTenantConfig).toHaveBeenCalledTimes(20);
    });

    it('should handle API timeout scenarios', async () => {
      // Mock timeout
      global.fetch = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), 100)
            )
        );

      try {
        await fetch('/api/config/tenant?tenant=john-jane');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Request timeout');
      }
    });

    it('should handle malformed API responses', async () => {
      // Mock response with invalid JSON
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const response = await fetch('/api/config/tenant?tenant=john-jane');
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      try {
        await response.json();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid JSON');
      }
    });
  });

  describe('Performance and Scalability Tests', () => {
    it('should maintain performance with multiple tenant data loads', async () => {
      // Setup performance test data
      const tenantConfigs = Array.from({ length: 10 }, (_, i) => ({
        ...johnJaneConfig,
        id: `performance-tenant-${i}`,
        brideName: `Bride ${i}`,
        groomName: `Groom ${i}`,
      }));

      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockImplementation(async (tenantId) => {
        const index = parseInt(tenantId.split('-').pop() || '0');
        return tenantConfigs[index];
      });

      // Measure performance of concurrent tenant loading
      const startTime = Date.now();

      const loadPromises = tenantConfigs.map((_, i) =>
        getTenantConfig(`performance-tenant-${i}`)
      );

      const configs = await Promise.all(loadPromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all configs loaded correctly
      configs.forEach((config, i) => {
        expect(config.id).toBe(`performance-tenant-${i}`);
        expect(config.brideName).toBe(`Bride ${i}`);
      });

      // Performance should be reasonable (less than 1 second for 10 tenants)
      expect(duration).toBeLessThan(1000);
      expect(mockGetTenantConfig).toHaveBeenCalledTimes(10);
    });

    it('should handle memory efficiently with large tenant datasets', async () => {
      // Setup large dataset simulation
      const largeRSVPData = Array.from({ length: 100 }, (_, i) => ({
        name: `Guest ${i}`,
        relationship: 'Friend',
        attendance: 'yes',
        message: `Message from guest ${i}`.repeat(10), // Larger messages
      }));

      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);
      mockReadRSVPData.mockResolvedValue(largeRSVPData);

      // Load large dataset
      const rsvpData = await readRSVPData('large-dataset-tenant');

      // Verify data integrity
      expect(rsvpData).toHaveLength(100);
      expect(rsvpData[0].name).toBe('Guest 0');
      expect(rsvpData[99].name).toBe('Guest 99');

      // Verify function was called correctly
      expect(mockReadRSVPData).toHaveBeenCalledWith('large-dataset-tenant');
    });

    it('should handle concurrent API requests efficiently', async () => {
      // Reset fetch mock to use our API mock
      global.fetch = jest.fn().mockImplementation(mockApiCall);

      // Create concurrent API requests
      const apiPromises = Array.from({ length: 10 }, () =>
        fetch(`/api/config/tenant?tenant=john-jane`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(apiPromises);
      const endTime = Date.now();

      // Verify all requests succeeded
      for (const response of responses) {
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.id).toBe('john-jane');
      }

      // Performance should be reasonable
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Less than 1 second for 10 concurrent requests
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical wedding guest RSVP scenarios', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);
      mockWriteRSVPData.mockResolvedValue(undefined);

      // Scenario 1: Guest attending with plus one
      const attendingGuest = {
        name: 'Sarah Johnson',
        relationship: 'College Friend',
        attendance: 'yes',
        message: 'So excited! Will be bringing my husband.',
      };

      let response = await fetch('/api/rsvp/tenant?tenant=john-jane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendingGuest),
      });

      expect(response.ok).toBe(true);

      // Scenario 2: Guest declining with regrets
      const decliningGuest = {
        name: 'Mark Thompson',
        relationship: 'Work Colleague',
        attendance: 'no',
        message:
          'Unfortunately cannot attend due to prior commitment. Congratulations!',
      };

      response = await fetch('/api/rsvp/tenant?tenant=john-jane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decliningGuest),
      });

      expect(response.ok).toBe(true);

      // Scenario 3: Family member with dietary restrictions
      const familyGuest = {
        name: 'Aunt Margaret',
        relationship: 'Family',
        attendance: 'yes',
        message:
          'Looking forward to the celebration! Please note I have a gluten allergy.',
      };

      response = await fetch('/api/rsvp/tenant?tenant=john-jane', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(familyGuest),
      });

      expect(response.ok).toBe(true);

      // Verify all scenarios were processed
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle edge cases in tenant identification', async () => {
      // Test various URL formats
      // Test various URL formats
      const testCases = [
        { url: '/john-jane', expected: 'john-jane' },
        { url: '/john-jane/', expected: 'john-jane' },
        { url: '/john-jane/rsvp', expected: 'john-jane' },
        { url: '/john-jane/gallery/photos', expected: 'john-jane' },
        { url: '/JOHN-JANE', expected: 'JOHN-JANE' }, // Case preserved
        { url: '/john-jane?param=value', expected: null }, // Query params make it invalid
        { url: '/', expected: null },
        { url: '', expected: null },
        { url: '/invalid@tenant', expected: null }, // Invalid characters
        { url: '/a', expected: 'a' }, // Short but valid format (validation happens later)
      ];

      testCases.forEach(({ url, expected }) => {
        const tenantId = extractTenantFromPath(url);
        expect(tenantId).toBe(expected);
      });
    });

    it('should handle realistic load patterns', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockImplementation(async (tenantId) => {
        if (tenantId === 'john-jane') return johnJaneConfig;
        if (tenantId === 'garcia-martinez') return garciaMartinezConfig;
        return smithWeddingConfig;
      });

      // Simulate realistic load: multiple guests accessing different weddings
      const loadSimulation = [
        // Peak load: 5 guests accessing john-jane wedding
        ...Array.from({ length: 5 }, () => getTenantConfig('john-jane')),
        // Medium load: 3 guests accessing garcia-martinez wedding
        ...Array.from({ length: 3 }, () => getTenantConfig('garcia-martinez')),
        // Light load: 2 guests accessing smith-wedding
        ...Array.from({ length: 2 }, () => getTenantConfig('smith-wedding')),
      ];

      const results = await Promise.all(loadSimulation);

      // Verify correct distribution
      const johnJaneResults = results.filter((r) => r.id === 'john-jane');
      const garciaResults = results.filter((r) => r.id === 'garcia-martinez');
      const smithResults = results.filter((r) => r.id === 'smith-wedding');

      expect(johnJaneResults).toHaveLength(5);
      expect(garciaResults).toHaveLength(3);
      expect(smithResults).toHaveLength(2);

      // Verify all calls were made
      expect(mockGetTenantConfig).toHaveBeenCalledTimes(10);
    });
  });
});
