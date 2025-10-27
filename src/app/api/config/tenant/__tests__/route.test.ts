import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE, PATCH } from '../route';
import * as csvUtils from '@/utils/csv';
import * as tenantUtils from '@/utils/tenant';
import { TenantConfig } from '@/types';

// Mock the utilities
jest.mock('@/utils/csv', () => ({
  getTenantConfig: jest.fn(),
}));

jest.mock('@/utils/tenant', () => ({
  validateTenantId: jest.fn(),
}));

const mockGetTenantConfig = csvUtils.getTenantConfig as jest.MockedFunction<
  typeof csvUtils.getTenantConfig
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
    const mockTenantConfig: TenantConfig = {
      id: 'john-jane',
      brideName: 'Jane Smith',
      groomName: 'John Doe',
      weddingDate: '2025-12-29',
      venue: {
        name: 'Grand Ballroom',
        address: '123 Wedding St, City, State',
        mapLink: 'abcd',
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
      mockGetTenantConfig.mockResolvedValueOnce(mockTenantConfig);

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockTenantConfig);
      expect(responseData.tenant).toBe('john-jane');
      expect(mockValidateTenantId).toHaveBeenCalledWith('john-jane');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('john-jane');
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
      expect(mockGetTenantConfig).not.toHaveBeenCalled();
    });

    it('should reject request without tenant parameter', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: false,
        error: 'No tenant ID provided',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid tenant');
      expect(responseData.details).toBe('No tenant ID provided');
    });

    it('should return 404 when configuration file not found', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantConfig.mockResolvedValueOnce(null);

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Tenant configuration not found');
      expect(responseData.details).toBe(
        "Configuration file not found for tenant 'john-jane'"
      );
    });

    it('should handle invalid JSON configuration', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantConfig.mockRejectedValueOnce(
        new Error('Invalid JSON in tenant configuration for john-jane')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Invalid configuration format');
      expect(responseData.details).toBe(
        'Invalid JSON in tenant configuration for john-jane'
      );
    });

    it('should handle missing required fields in configuration', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantConfig.mockRejectedValueOnce(
        new Error(
          'Invalid tenant configuration for john-jane: missing required fields'
        )
      );

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Invalid configuration data');
      expect(responseData.details).toBe(
        'Invalid tenant configuration for john-jane: missing required fields'
      );
    });

    it('should handle tenant-specific errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantConfig.mockRejectedValueOnce(
        new Error(
          'Failed to read tenant configuration for john-jane: Permission denied'
        )
      );

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe(
        'Failed to read tenant configuration for john-jane: Permission denied'
      );
    });

    it('should handle generic errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantConfig.mockRejectedValueOnce(new Error('Generic error'));

      const request = new NextRequest(
        'http://localhost:3000/api/config/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to read tenant configuration');
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
