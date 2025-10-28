import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE, PATCH } from '../route';
import * as databaseUtils from '@/utils/database';
import * as tenantUtils from '@/utils/tenant';
import { TenantConfig, DatabaseTenant } from '@/types';

// Mock the utilities
jest.mock('@/utils/database', () => ({
  getTenant: jest.fn(),
}));

jest.mock('@/utils/tenant', () => ({
  validateTenantId: jest.fn(),
}));

// Mock the error handling utility
jest.mock('@/utils/error-handling', () => ({
  handleApiError: jest.fn(),
  InputSanitizer: {
    sanitizeTenantId: jest.fn((id) => id),
  },
  handleTenantError: jest.fn(),
}));

const mockGetTenant = databaseUtils.getTenant as jest.MockedFunction<
  typeof databaseUtils.getTenant
>;
const mockValidateTenantId =
  tenantUtils.validateTenantId as jest.MockedFunction<
    typeof tenantUtils.validateTenantId
  >;

describe('/api/config/tenant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    const mockDbTenant: DatabaseTenant = {
      id: 'john-jane',
      bride_name: 'Jane Smith',
      groom_name: 'John Doe',
      wedding_date: '2025-12-29',
      venue_name: 'Grand Ballroom',
      venue_address: '123 Wedding St, City, State',
      venue_map_link: 'https://maps.google.com/example',
      theme_primary_color: '#D69E2E',
      theme_secondary_color: '#2D3748',
      is_active: true,
      created_at: '2025-10-27T00:00:00Z',
      updated_at: '2025-10-27T00:00:00Z',
    };

    const expectedTenantConfig: TenantConfig = {
      id: 'john-jane',
      brideName: 'Jane Smith',
      groomName: 'John Doe',
      weddingDate: '2025-12-29',
      venue: {
        name: 'Grand Ballroom',
        address: '123 Wedding St, City, State',
        mapLink: 'https://maps.google.com/example',
      },
      theme: {
        primaryColor: '#D69E2E',
        secondaryColor: '#2D3748',
      },
      isActive: true,
      createdAt: '2025-10-27T00:00:00Z',
      updatedAt: '2025-10-27T00:00:00Z',
    };

    it('should successfully retrieve configuration for valid tenant', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenant.mockResolvedValueOnce(mockDbTenant);

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(expectedTenantConfig);
      expect(responseData.tenant).toBe('john-jane');
      expect(mockValidateTenantId).toHaveBeenCalledWith('john-jane');
      expect(mockGetTenant).toHaveBeenCalledWith('john-jane');
    });

    it('should reject request with invalid tenant', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: false,
        error: 'Tenant not found',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=invalid-tenant'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid tenant');
      expect(responseData.details).toBe('Tenant not found');
      expect(mockGetTenant).not.toHaveBeenCalled();
    });

    it('should reject request without tenant parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Tenant parameter is required');
      expect(responseData.details).toBe('Tenant ID must be provided');
    });

    it('should return 404 when tenant not found in database', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenant.mockResolvedValueOnce(null);

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);

      expect(response.status).toBe(404);
      // The handleTenantError mock should be called
    });

    it('should handle database connection errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenant.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      // The handleApiError mock should be called
    });

    it('should handle tenant with null map link', async () => {
      const tenantWithoutMapLink = {
        ...mockDbTenant,
        venue_map_link: null,
      };

      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenant.mockResolvedValueOnce(tenantWithoutMapLink);

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.venue.mapLink).toBe('https://maps.google.com');
    });
  });

  describe('Read-only enforcement', () => {
    it('should reject POST requests', async () => {
      const response = await POST();
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData.error).toBe(
        'Method not allowed. Configuration is read-only.'
      );
    });

    it('should reject PUT requests', async () => {
      const response = await PUT();
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData.error).toBe(
        'Method not allowed. Configuration is read-only.'
      );
    });

    it('should reject DELETE requests', async () => {
      const response = await DELETE();
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData.error).toBe(
        'Method not allowed. Configuration is read-only.'
      );
    });

    it('should reject PATCH requests', async () => {
      const response = await PATCH();
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData.error).toBe(
        'Method not allowed. Configuration is read-only.'
      );
    });
  });
});
