import { NextRequest } from 'next/server';
import { POST } from '../route';
import * as databaseUtils from '@/utils/database';
import * as tenantUtils from '@/utils/tenant';

// Mock the database utilities
jest.mock('@/utils/database', () => ({
  createGuest: jest.fn(),
  getGuestById: jest.fn(),
  updateGuest: jest.fn(),
  // Backward compatibility
  createRSVP: jest.fn(),
}));

// Mock the tenant utilities
jest.mock('@/utils/tenant', () => ({
  validateTenantId: jest.fn(),
}));

// Mock the error handling utility
jest.mock('@/utils/error-handling', () => ({
  handleApiError: jest.fn(),
  InputSanitizer: {
    sanitizeTenantId: jest.fn((id) => id),
    sanitizeString: jest.fn((str) => str),
    sanitizeMessage: jest.fn((msg) => msg),
  },
}));

const mockCreateGuest = databaseUtils.createGuest as jest.MockedFunction<
  typeof databaseUtils.createGuest
>;
const mockValidateTenantId =
  tenantUtils.validateTenantId as jest.MockedFunction<
    typeof tenantUtils.validateTenantId
  >;

describe('/api/rsvp', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful tenant validation by default
    mockValidateTenantId.mockResolvedValue({
      isValid: true,
      tenantId: 1, // Database ID
      slug: 'default',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST', () => {
    it('should successfully submit valid RSVP data', async () => {
      const validRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
      };

      const mockDbResponse = {
        id: 1,
        tenant_id: 1, // Integer tenant ID
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes' as const,
        message: 'Congratulations!',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      };

      mockCreateGuest.mockResolvedValueOnce(mockDbResponse);

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp?tenant=default',
        {
          method: 'POST',
          body: JSON.stringify(validRSVPData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.message).toBe('RSVP submitted successfully');
      expect(responseData.data).toEqual({
        id: 1, // Now integer
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
      });

      expect(mockCreateGuest).toHaveBeenCalledWith({
        tenantId: 1, // Database ID
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
      });
    });

    it('should handle RSVP submission without message', async () => {
      const validRSVPData = {
        name: 'Jane Smith',
        relationship: 'Family',
        attendance: 'no',
      };

      const mockDbResponse = {
        id: 2,
        tenant_id: 1, // Integer tenant ID
        name: 'Jane Smith',
        relationship: 'Family',
        attendance: 'no' as const,
        message: null,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      };

      mockCreateGuest.mockResolvedValueOnce(mockDbResponse);

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp?tenant=default',
        {
          method: 'POST',
          body: JSON.stringify(validRSVPData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.data.message).toBe('');
    });

    it('should validate required name field', async () => {
      const invalidRSVPData = {
        relationship: 'Friend',
        attendance: 'yes',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp?tenant=default',
        {
          method: 'POST',
          body: JSON.stringify(invalidRSVPData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Validation failed');
      expect(responseData.details).toContain('Name is required');
    });

    it('should validate attendance field values', async () => {
      const invalidRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'invalid',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp?tenant=default',
        {
          method: 'POST',
          body: JSON.stringify(invalidRSVPData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.details).toContain(
        'Attendance must be one of: yes, no, maybe'
      );
    });

    it('should handle invalid tenant', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: false,
        error: 'Tenant not found',
      });

      const validRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp?tenant=invalid',
        {
          method: 'POST',
          body: JSON.stringify(validRSVPData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid tenant');
      expect(responseData.details).toBe('Tenant not found');
    });

    it('should handle database errors', async () => {
      const validRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
      };

      mockCreateGuest.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp?tenant=default',
        {
          method: 'POST',
          body: JSON.stringify(validRSVPData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);

      // The handleApiError mock should be called
      expect(response.status).toBe(500);
    });
  });
});
