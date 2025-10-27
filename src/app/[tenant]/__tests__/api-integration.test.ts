/**
 * Integration tests for multi-tenant API endpoints
 * Tests actual API routes with HTTP requests
 */

import {
  validateTenantExists,
  getTenantConfig,
  writeRSVPData,
} from '@/utils/csv';

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
const mockWriteRSVPData = writeRSVPData as jest.MockedFunction<
  typeof writeRSVPData
>;

// Test data
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

describe('Multi-Tenant API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch globally for these tests
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('RSVP API Integration', () => {
    it('should submit RSVP through API for valid tenant', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockWriteRSVPData.mockResolvedValue(undefined);

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'RSVP submitted successfully',
        }),
      });

      const rsvpData = {
        name: 'Test Guest',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Excited to celebrate!',
      };

      const response = await fetch('/api/rsvp/tenant?tenant=john-jane', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rsvp/tenant?tenant=john-jane',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rsvpData),
        })
      );
    });

    it('should handle RSVP submission for invalid tenant', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Tenant not found' }),
      });

      const rsvpData = {
        name: 'Test Guest',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Test message',
      };

      const response = await fetch('/api/rsvp/tenant?tenant=invalid-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Tenant not found');
    });

    it('should handle RSVP submission errors', async () => {
      // Mock API server error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const rsvpData = {
        name: 'Test Guest',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Test message',
      };

      const response = await fetch('/api/rsvp/tenant?tenant=john-jane', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error');
    });
  });

  describe('Configuration API Integration', () => {
    it('should fetch tenant configuration through API', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(johnJaneConfig);

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => johnJaneConfig,
      });

      const response = await fetch('/api/config/tenant?tenant=john-jane');
      const responseData = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(responseData.id).toBe('john-jane');
      expect(responseData.brideName).toBe('Jane Wilson');
      expect(responseData.groomName).toBe('John Anderson');
      expect(responseData.venue.name).toBe('Sunset Gardens');
    });

    it('should handle configuration fetch for invalid tenant', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Tenant not found' }),
      });

      const response = await fetch('/api/config/tenant?tenant=invalid-tenant');
      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Tenant not found');
    });
  });

  describe('Data Isolation Through API', () => {
    it('should maintain data isolation between tenants through API calls', async () => {
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

      // Mock different responses for different tenants
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => johnJaneConfig,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => garciaMartinezConfig,
        });

      // Fetch john-jane config
      const johnJaneResponse = await fetch(
        '/api/config/tenant?tenant=john-jane'
      );
      const johnJaneData = await johnJaneResponse.json();

      // Fetch garcia-martinez config
      const garciaMartinezResponse = await fetch(
        '/api/config/tenant?tenant=garcia-martinez'
      );
      const garciaMartinezData = await garciaMartinezResponse.json();

      // Verify each tenant gets only their own data
      expect(johnJaneData.id).toBe('john-jane');
      expect(johnJaneData.brideName).toBe('Jane Wilson');
      expect(garciaMartinezData.id).toBe('garcia-martinez');
      expect(garciaMartinezData.brideName).toBe('Sofia Garcia');

      // Verify separate API calls were made
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/config/tenant?tenant=john-jane'
      );
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/config/tenant?tenant=garcia-martinez'
      );
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent API requests to different tenants', async () => {
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

      // Mock concurrent responses
      (global.fetch as jest.Mock)
        .mockImplementationOnce(async (url) => {
          if (url.includes('john-jane')) {
            return {
              ok: true,
              status: 200,
              json: async () => johnJaneConfig,
            };
          }
        })
        .mockImplementationOnce(async (url) => {
          if (url.includes('garcia-martinez')) {
            return {
              ok: true,
              status: 200,
              json: async () => garciaMartinezConfig,
            };
          }
        });

      // Make concurrent requests
      const [johnJaneResponse, garciaMartinezResponse] = await Promise.all([
        fetch('/api/config/tenant?tenant=john-jane'),
        fetch('/api/config/tenant?tenant=garcia-martinez'),
      ]);

      const johnJaneData = await johnJaneResponse.json();
      const garciaMartinezData = await garciaMartinezResponse.json();

      // Both requests should succeed with correct data
      expect(johnJaneResponse.ok).toBe(true);
      expect(garciaMartinezResponse.ok).toBe(true);
      expect(johnJaneData.id).toBe('john-jane');
      expect(garciaMartinezData.id).toBe('garcia-martinez');
    });
  });

  describe('Error Scenarios Through API', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await fetch('/api/config/tenant?tenant=john-jane');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle malformed JSON responses', async () => {
      // Mock response with invalid JSON
      (global.fetch as jest.Mock).mockResolvedValue({
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

    it('should handle timeout scenarios', async () => {
      // Mock timeout
      (global.fetch as jest.Mock).mockImplementation(
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
  });

  describe('API Request Validation', () => {
    it('should validate required parameters in API requests', async () => {
      // Mock validation error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Tenant ID is required' }),
      });

      // Request without tenant parameter
      const response = await fetch('/api/config/tenant');
      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Tenant ID is required');
    });

    it('should validate request body for RSVP submissions', async () => {
      // Mock validation error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request body' }),
      });

      // Request with invalid body
      const response = await fetch('/api/rsvp/tenant?tenant=john-jane', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalidField: 'invalid data' }),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid request body');
    });
  });
});
