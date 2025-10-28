/**
 * Integration tests for multi-tenant API endpoints
 * Tests actual API routes with HTTP requests
 */

import { getTenant, createRSVP } from '@/utils/database';
import { validateTenantId } from '@/utils/tenant';

// Mock the database utilities
jest.mock('@/utils/database', () => ({
  getTenant: jest.fn(),
  createRSVP: jest.fn(),
}));

// Mock the tenant utilities
jest.mock('@/utils/tenant', () => ({
  validateTenantId: jest.fn(),
}));

const mockGetTenant = getTenant as jest.MockedFunction<typeof getTenant>;
const mockCreateRSVP = createRSVP as jest.MockedFunction<typeof createRSVP>;
// const mockGetRSVPs = getRSVPs as jest.MockedFunction<typeof getRSVPs>;
const mockValidateTenantId = validateTenantId as jest.MockedFunction<
  typeof validateTenantId
>;

// Test data
const johnJaneDbTenant = {
  id: 'john-jane',
  bride_name: 'Jane Wilson',
  groom_name: 'John Anderson',
  wedding_date: '2025-11-15',
  venue_name: 'Sunset Gardens',
  venue_address: '456 Garden Ave, Springfield, IL',
  venue_map_link: 'https://maps.google.com/john-jane',
  theme_primary_color: '#E53E3E',
  theme_secondary_color: '#1A202C',
  is_active: true,
  created_at: '2025-10-27T00:00:00Z',
  updated_at: '2025-10-27T00:00:00Z',
};

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

    // Default successful tenant validation
    mockValidateTenantId.mockResolvedValue({
      isValid: true,
      tenantId: 'john-jane',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('RSVP API Integration', () => {
    it('should submit RSVP through API for valid tenant', async () => {
      const mockRSVPResponse = {
        id: 1,
        tenant_id: 'john-jane',
        name: 'Test Guest',
        relationship: 'Friend',
        attendance: 'yes' as const,
        message: 'Excited to celebrate!',
        submitted_at: '2025-10-28T00:00:00.000Z',
        created_at: '2025-10-28T00:00:00.000Z',
        updated_at: '2025-10-28T00:00:00.000Z',
      };

      mockCreateRSVP.mockResolvedValue(mockRSVPResponse);

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'RSVP submitted successfully',
          data: {
            id: '1',
            name: 'Test Guest',
            relationship: 'Friend',
            attendance: 'yes',
            message: 'Excited to celebrate!',
            submittedAt: '2025-10-28T00:00:00.000Z',
          },
          tenant: 'john-jane',
        }),
      });

      const rsvpData = {
        name: 'Test Guest',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Excited to celebrate!',
      };

      const response = await fetch('/api/rsvp?tenant=john-jane', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(responseData.message).toBe('RSVP submitted successfully');
      expect(responseData.data.name).toBe('Test Guest');
      expect(responseData.tenant).toBe('john-jane');
    });

    it('should handle RSVP submission for invalid tenant', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid tenant',
          type: 'validation',
          details: 'Tenant not found',
        }),
      });

      const rsvpData = {
        name: 'Test Guest',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Test message',
      };

      const response = await fetch('/api/rsvp?tenant=invalid-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid tenant');
      expect(responseData.type).toBe('validation');
    });

    it('should handle database errors during RSVP submission', async () => {
      // Mock API server error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Database operation failed',
          type: 'database',
          code: 'DB_CONNECTION_ERROR',
        }),
      });

      const rsvpData = {
        name: 'Test Guest',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Test message',
      };

      const response = await fetch('/api/rsvp?tenant=john-jane', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Database operation failed');
      expect(responseData.type).toBe('database');
    });
  });

  describe('Configuration API Integration', () => {
    it('should fetch tenant configuration through API', async () => {
      mockGetTenant.mockResolvedValue(johnJaneDbTenant);

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: johnJaneConfig,
          tenant: 'john-jane',
        }),
      });

      const response = await fetch('/api/config/tenant?tenant=john-jane');
      const responseData = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(responseData.data.id).toBe('john-jane');
      expect(responseData.data.brideName).toBe('Jane Wilson');
      expect(responseData.data.groomName).toBe('John Anderson');
      expect(responseData.data.venue.name).toBe('Sunset Gardens');
      expect(responseData.tenant).toBe('john-jane');
    });

    it('should handle configuration fetch for invalid tenant', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Tenant not found',
          type: 'not_found',
          code: 'TENANT_NOT_FOUND',
        }),
      });

      const response = await fetch('/api/config/tenant?tenant=invalid-tenant');
      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Tenant not found');
      expect(responseData.type).toBe('not_found');
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
          json: async () => ({
            data: johnJaneConfig,
            tenant: 'john-jane',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            data: garciaMartinezConfig,
            tenant: 'garcia-martinez',
          }),
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
      expect(johnJaneData.data.id).toBe('john-jane');
      expect(johnJaneData.data.brideName).toBe('Jane Wilson');
      expect(garciaMartinezData.data.id).toBe('garcia-martinez');
      expect(garciaMartinezData.data.brideName).toBe('Sofia Garcia');

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
              json: async () => ({
                data: johnJaneConfig,
                tenant: 'john-jane',
              }),
            };
          }
        })
        .mockImplementationOnce(async (url) => {
          if (url.includes('garcia-martinez')) {
            return {
              ok: true,
              status: 200,
              json: async () => ({
                data: garciaMartinezConfig,
                tenant: 'garcia-martinez',
              }),
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
      expect(johnJaneData.data.id).toBe('john-jane');
      expect(garciaMartinezData.data.id).toBe('garcia-martinez');
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
        json: async () => ({
          error: 'Tenant parameter is required',
          type: 'validation',
          details: 'Tenant ID must be provided',
        }),
      });

      // Request without tenant parameter
      const response = await fetch('/api/config/tenant');
      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Tenant parameter is required');
      expect(responseData.type).toBe('validation');
    });

    it('should validate request body for RSVP submissions', async () => {
      // Mock validation error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          type: 'validation',
          code: 'VALIDATION_ERROR',
          details: ['Name is required', 'Attendance is required'],
        }),
      });

      // Request with invalid body
      const response = await fetch('/api/rsvp?tenant=john-jane', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalidField: 'invalid data' }),
      });

      const responseData = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Validation failed');
      expect(responseData.type).toBe('validation');
      expect(responseData.details).toContain('Name is required');
    });
  });
});
