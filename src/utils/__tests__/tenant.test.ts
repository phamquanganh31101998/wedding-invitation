import {
  extractTenantFromPath,
  validateTenantId,
  getDefaultTenantId,
  isDefaultTenant,
  sanitizeTenantId,
  getTenantPath,
  extractTenantFromRequest,
  identifyTenant,
  createTenantRedirectUrl,
} from '../tenant';
import { validateTenantExists } from '../csv';
import fs from 'fs';
import path from 'path';

// Mock the CSV utilities
jest.mock('../csv', () => ({
  validateTenantExists: jest.fn(),
}));

const mockValidateTenantExists = validateTenantExists as jest.MockedFunction<
  typeof validateTenantExists
>;

describe('Tenant Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTenantFromPath', () => {
    it('should extract tenant ID from simple path', () => {
      expect(extractTenantFromPath('/john-jane')).toBe('john-jane');
      expect(extractTenantFromPath('/smith-wedding')).toBe('smith-wedding');
    });

    it('should extract tenant ID from path with trailing slash', () => {
      expect(extractTenantFromPath('/john-jane/')).toBe('john-jane');
    });

    it('should extract tenant ID from nested path', () => {
      expect(extractTenantFromPath('/john-jane/rsvp')).toBe('john-jane');
      expect(extractTenantFromPath('/smith-wedding/gallery/photos')).toBe(
        'smith-wedding'
      );
    });

    it('should return null for root path', () => {
      expect(extractTenantFromPath('/')).toBeNull();
      expect(extractTenantFromPath('')).toBeNull();
    });

    it('should return null for invalid tenant ID format', () => {
      expect(extractTenantFromPath('/invalid@tenant')).toBeNull();
      expect(extractTenantFromPath('/tenant with spaces')).toBeNull();
      expect(extractTenantFromPath('/tenant.with.dots')).toBeNull();
    });

    it('should handle valid tenant ID characters', () => {
      expect(extractTenantFromPath('/valid-tenant_123')).toBe(
        'valid-tenant_123'
      );
      expect(extractTenantFromPath('/ABC123')).toBe('ABC123');
    });

    it('should return null for empty segments', () => {
      expect(extractTenantFromPath('//nested')).toBeNull();
      expect(extractTenantFromPath('/ /nested')).toBeNull();
    });
  });

  describe('validateTenantId', () => {
    it('should validate existing active tenant', async () => {
      mockValidateTenantExists.mockResolvedValue(true);

      const result = await validateTenantId('valid-tenant');
      expect(result).toEqual({
        isValid: true,
        tenantId: 'valid-tenant',
      });
      expect(mockValidateTenantExists).toHaveBeenCalledWith('valid-tenant');
    });

    it('should reject null tenant ID', async () => {
      const result = await validateTenantId(null);
      expect(result).toEqual({
        isValid: false,
        error: 'No tenant ID provided',
      });
      expect(mockValidateTenantExists).not.toHaveBeenCalled();
    });

    it('should reject invalid format', async () => {
      const result = await validateTenantId('invalid@tenant');
      expect(result).toEqual({
        isValid: false,
        error:
          'Invalid tenant ID format. Only alphanumeric characters, hyphens, and underscores are allowed.',
      });
      expect(mockValidateTenantExists).not.toHaveBeenCalled();
    });

    it('should reject tenant ID that is too short', async () => {
      const result = await validateTenantId('a');
      expect(result).toEqual({
        isValid: false,
        error: 'Tenant ID must be between 2 and 50 characters long.',
      });
    });

    it('should reject tenant ID that is too long', async () => {
      const longTenantId = 'a'.repeat(51);
      const result = await validateTenantId(longTenantId);
      expect(result).toEqual({
        isValid: false,
        error: 'Tenant ID must be between 2 and 50 characters long.',
      });
    });

    it('should reject non-existent tenant', async () => {
      mockValidateTenantExists.mockResolvedValue(false);

      const result = await validateTenantId('non-existent');
      expect(result).toEqual({
        isValid: false,
        error: "Tenant 'non-existent' not found or inactive.",
      });
    });

    it('should handle validation errors', async () => {
      mockValidateTenantExists.mockRejectedValue(new Error('Database error'));

      const result = await validateTenantId('error-tenant');
      expect(result).toEqual({
        isValid: false,
        error: 'Error validating tenant: Database error',
      });
    });
  });

  describe('getDefaultTenantId', () => {
    it('should return default tenant ID', () => {
      expect(getDefaultTenantId()).toBe('default');
    });
  });

  describe('isDefaultTenant', () => {
    it('should identify default tenant', () => {
      expect(isDefaultTenant('default')).toBe(true);
      expect(isDefaultTenant(null)).toBe(true);
    });

    it('should identify non-default tenant', () => {
      expect(isDefaultTenant('john-jane')).toBe(false);
      expect(isDefaultTenant('smith-wedding')).toBe(false);
    });
  });

  describe('sanitizeTenantId', () => {
    it('should remove invalid characters', () => {
      expect(sanitizeTenantId('valid-tenant_123')).toBe('valid-tenant_123');
      expect(sanitizeTenantId('invalid@tenant.com')).toBe('invalidtenantcom');
      expect(sanitizeTenantId('tenant with spaces')).toBe('tenantwithspaces');
    });

    it('should handle empty string', () => {
      expect(sanitizeTenantId('')).toBe('');
    });
  });

  describe('getTenantPath', () => {
    it('should generate tenant-specific paths', () => {
      expect(getTenantPath('john-jane')).toBe('/john-jane/');
      expect(getTenantPath('john-jane', 'rsvp')).toBe('/john-jane/rsvp');
      expect(getTenantPath('john-jane', '/rsvp')).toBe('/john-jane/rsvp');
    });

    it('should handle default tenant', () => {
      expect(getTenantPath('default')).toBe('/');
      expect(getTenantPath('default', 'rsvp')).toBe('/rsvp');
      expect(getTenantPath('default', '/rsvp')).toBe('/rsvp');
    });

    it('should handle null tenant', () => {
      expect(getTenantPath(null as any)).toBe('/');
    });
  });

  describe('extractTenantFromRequest', () => {
    it('should extract tenant from request URL', () => {
      expect(extractTenantFromRequest('http://localhost:3000/john-jane')).toBe(
        'john-jane'
      );
      expect(
        extractTenantFromRequest('https://example.com/smith-wedding/rsvp')
      ).toBe('smith-wedding');
    });

    it('should handle root URLs', () => {
      expect(extractTenantFromRequest('http://localhost:3000/')).toBeNull();
      expect(extractTenantFromRequest('https://example.com')).toBeNull();
    });

    it('should handle invalid URLs', () => {
      expect(extractTenantFromRequest('not-a-url')).toBe('not-a-url');
    });
  });

  describe('identifyTenant', () => {
    it('should identify valid tenant', async () => {
      mockValidateTenantExists.mockResolvedValue(true);

      const result = await identifyTenant('/john-jane/rsvp');
      expect(result).toEqual({
        tenantId: 'john-jane',
        isValid: true,
        shouldFallback: false,
      });
    });

    it('should handle root path', async () => {
      const result = await identifyTenant('/');
      expect(result).toEqual({
        tenantId: null,
        isValid: true,
        shouldFallback: false,
      });
      expect(mockValidateTenantExists).not.toHaveBeenCalled();
    });

    it('should handle invalid tenant', async () => {
      mockValidateTenantExists.mockResolvedValue(false);

      const result = await identifyTenant('/invalid-tenant');
      expect(result).toEqual({
        tenantId: 'invalid-tenant',
        isValid: false,
        error: "Tenant 'invalid-tenant' not found or inactive.",
        shouldFallback: true,
      });
    });

    it('should handle tenant validation errors', async () => {
      mockValidateTenantExists.mockRejectedValue(new Error('Validation error'));

      const result = await identifyTenant('/error-tenant');
      expect(result).toEqual({
        tenantId: 'error-tenant',
        isValid: false,
        error: 'Error validating tenant: Validation error',
        shouldFallback: true,
      });
    });

    it('should handle invalid tenant ID format', async () => {
      const result = await identifyTenant('/invalid@tenant');
      expect(result).toEqual({
        tenantId: null,
        isValid: true,
        shouldFallback: false,
      });
      expect(mockValidateTenantExists).not.toHaveBeenCalled();
    });
  });

  describe('createTenantRedirectUrl', () => {
    it('should create tenant-specific redirect URLs', () => {
      expect(createTenantRedirectUrl('john-jane', '/rsvp')).toBe(
        '/john-jane/rsvp'
      );
      expect(createTenantRedirectUrl('smith-wedding', '/gallery')).toBe(
        '/smith-wedding/gallery'
      );
    });

    it('should handle default tenant', () => {
      expect(createTenantRedirectUrl('default', '/rsvp')).toBe('/rsvp');
      expect(createTenantRedirectUrl(null, '/gallery')).toBe('/gallery');
    });

    it('should handle root target path', () => {
      expect(createTenantRedirectUrl('john-jane')).toBe('/john-jane/');
      expect(createTenantRedirectUrl('default')).toBe('/');
    });
  });
});
