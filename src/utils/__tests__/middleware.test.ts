/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../../middleware';

// Mock the tenant utilities
jest.mock('../tenant', () => ({
  extractTenantFromRequest: jest.fn(),
  validateTenantId: jest.fn(),
}));

import { extractTenantFromRequest, validateTenantId } from '../tenant';

const mockExtractTenantFromRequest =
  extractTenantFromRequest as jest.MockedFunction<
    typeof extractTenantFromRequest
  >;
const mockValidateTenantId = validateTenantId as jest.MockedFunction<
  typeof validateTenantId
>;

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (url: string) => {
    return new NextRequest(url);
  };

  describe('Static file handling', () => {
    it('should skip middleware for _next paths', async () => {
      const request = createMockRequest(
        'http://localhost:3000/_next/static/test.js'
      );
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(mockExtractTenantFromRequest).not.toHaveBeenCalled();
    });

    it('should skip middleware for API routes', async () => {
      const request = createMockRequest('http://localhost:3000/api/rsvp');
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(mockExtractTenantFromRequest).not.toHaveBeenCalled();
    });

    it('should skip middleware for favicon', async () => {
      const request = createMockRequest('http://localhost:3000/favicon.ico');
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(mockExtractTenantFromRequest).not.toHaveBeenCalled();
    });

    it('should skip middleware for files with extensions', async () => {
      const request = createMockRequest('http://localhost:3000/image.png');
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(mockExtractTenantFromRequest).not.toHaveBeenCalled();
    });
  });

  describe('Tenant validation', () => {
    it('should allow requests with no tenant ID', async () => {
      const request = createMockRequest('http://localhost:3000/');
      mockExtractTenantFromRequest.mockReturnValue(null);

      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(mockExtractTenantFromRequest).toHaveBeenCalledWith(
        'http://localhost:3000/'
      );
      expect(mockValidateTenantId).not.toHaveBeenCalled();
    });

    it('should allow requests with valid tenant ID', async () => {
      const request = createMockRequest('http://localhost:3000/john-jane');
      mockExtractTenantFromRequest.mockReturnValue('john-jane');
      mockValidateTenantId.mockResolvedValue({
        isValid: true,
        tenantId: 'john-jane',
      });

      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(mockExtractTenantFromRequest).toHaveBeenCalledWith(
        'http://localhost:3000/john-jane'
      );
      expect(mockValidateTenantId).toHaveBeenCalledWith('john-jane');
      expect(response.headers.get('x-tenant-id')).toBe('john-jane');
    });

    it('should redirect for invalid tenant ID', async () => {
      const request = createMockRequest('http://localhost:3000/invalid-tenant');
      mockExtractTenantFromRequest.mockReturnValue('invalid-tenant');
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error: 'Tenant not found',
      });

      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toContain('/tenant-error');
      expect(response.headers.get('location')).toContain(
        'tenant=invalid-tenant'
      );
      expect(response.headers.get('location')).toContain(
        'error=Tenant+not+found'
      );
    });

    it('should handle validation errors gracefully', async () => {
      const request = createMockRequest('http://localhost:3000/error-tenant');
      mockExtractTenantFromRequest.mockReturnValue('error-tenant');
      mockValidateTenantId.mockRejectedValue(new Error('Database error'));

      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toContain('/tenant-error');
      expect(response.headers.get('location')).toContain('tenant=error-tenant');
    });
  });

  describe('Error handling', () => {
    it('should redirect to error page when tenant validation fails', async () => {
      const request = createMockRequest('http://localhost:3000/bad-tenant');
      mockExtractTenantFromRequest.mockReturnValue('bad-tenant');
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error: 'Tenant is inactive',
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/tenant-error');
      expect(location).toContain('tenant=bad-tenant');
      expect(location).toContain('error=Tenant+is+inactive');
    });

    it('should handle missing error message', async () => {
      const request = createMockRequest(
        'http://localhost:3000/no-error-tenant'
      );
      mockExtractTenantFromRequest.mockReturnValue('no-error-tenant');
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/tenant-error');
      expect(location).toContain('tenant=no-error-tenant');
      expect(location).toContain('error=Tenant+not+found');
    });
  });
});
