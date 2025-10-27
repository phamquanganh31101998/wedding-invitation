import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import * as csvUtils from '@/utils/csv';
import * as tenantUtils from '@/utils/tenant';

// Mock the utilities
jest.mock('@/utils/csv', () => ({
  writeTenantRSVPData: jest.fn(),
  readTenantRSVPData: jest.fn(),
  getTenantNextRSVPId: jest.fn(),
  findTenantRSVPById: jest.fn(),
  updateTenantRSVPData: jest.fn(),
}));

jest.mock('@/utils/tenant', () => ({
  validateTenantId: jest.fn(),
}));

const mockWriteTenantRSVPData =
  csvUtils.writeTenantRSVPData as jest.MockedFunction<
    typeof csvUtils.writeTenantRSVPData
  >;
const mockReadTenantRSVPData =
  csvUtils.readTenantRSVPData as jest.MockedFunction<
    typeof csvUtils.readTenantRSVPData
  >;
const mockGetTenantNextRSVPId =
  csvUtils.getTenantNextRSVPId as jest.MockedFunction<
    typeof csvUtils.getTenantNextRSVPId
  >;
const mockFindTenantRSVPById =
  csvUtils.findTenantRSVPById as jest.MockedFunction<
    typeof csvUtils.findTenantRSVPById
  >;
const mockUpdateTenantRSVPData =
  csvUtils.updateTenantRSVPData as jest.MockedFunction<
    typeof csvUtils.updateTenantRSVPData
  >;
const mockValidateTenantId =
  tenantUtils.validateTenantId as jest.MockedFunction<
    typeof tenantUtils.validateTenantId
  >;

describe('/api/rsvp/tenant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date constructor for consistent timestamps
    jest.spyOn(global, 'Date').mockImplementation(
      () =>
        ({
          toISOString: () => '2023-01-01T00:00:00.000Z',
        }) as Date
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST', () => {
    const validRSVPData = {
      name: 'John Doe',
      relationship: 'Friend',
      attendance: 'yes',
      message: 'Congratulations!',
    };

    it('should successfully submit valid RSVP data for valid tenant', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantNextRSVPId.mockResolvedValueOnce('1');
      mockWriteTenantRSVPData.mockResolvedValueOnce(undefined);

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane',
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
      expect(responseData.tenant).toBe('john-jane');
      expect(responseData.data).toEqual({
        id: '1',
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
        submittedAt: '2023-01-01T00:00:00.000Z',
      });

      expect(mockValidateTenantId).toHaveBeenCalledWith('john-jane');
      expect(mockWriteTenantRSVPData).toHaveBeenCalledWith('john-jane', {
        id: '1',
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
        submittedAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should update existing RSVP when guest ID is provided', async () => {
      const existingGuest = {
        id: '1',
        name: 'John Smith',
        relationship: 'Family',
        attendance: 'maybe' as const,
        message: 'Old message',
        submittedAt: '2023-01-01T00:00:00.000Z',
      };

      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockFindTenantRSVPById.mockResolvedValueOnce(existingGuest);
      mockUpdateTenantRSVPData.mockResolvedValueOnce(undefined);

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane&id=1',
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

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('RSVP updated successfully');
      expect(responseData.tenant).toBe('john-jane');
      expect(mockFindTenantRSVPById).toHaveBeenCalledWith('john-jane', '1');
      expect(mockUpdateTenantRSVPData).toHaveBeenCalledWith('john-jane', {
        ...existingGuest,
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
        submittedAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should reject request with invalid tenant', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: false,
        error: 'Tenant not found',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=invalid-tenant',
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
      expect(mockWriteTenantRSVPData).not.toHaveBeenCalled();
    });

    it('should reject request without tenant parameter', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: false,
        error: 'No tenant ID provided',
      });

      const request = new NextRequest('http://localhost:3000/api/rsvp/tenant', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid tenant');
      expect(responseData.details).toBe('No tenant ID provided');
    });

    it('should handle validation errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });

      const invalidData = {
        relationship: 'Friend',
        attendance: 'yes',
        // Missing required name field
      };

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
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

    it('should handle CSV write errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantNextRSVPId.mockResolvedValueOnce('1');
      mockWriteTenantRSVPData.mockRejectedValueOnce(
        new Error('ENOENT: no such file or directory')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane',
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

      expect(response.status).toBe(500);
      expect(responseData.error).toBe(
        'Failed to save RSVP data - file system error'
      );
    });

    it('should handle tenant-specific errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockGetTenantNextRSVPId.mockResolvedValueOnce('1');
      mockWriteTenantRSVPData.mockRejectedValueOnce(
        new Error(
          'Failed to write RSVP data for tenant john-jane: Invalid tenant directory'
        )
      );

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane',
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
      expect(responseData.error).toBe(
        'Failed to write RSVP data for tenant john-jane: Invalid tenant directory'
      );
    });
  });

  describe('GET', () => {
    it('should successfully retrieve RSVP data for valid tenant', async () => {
      const mockRSVPData = [
        {
          id: '1',
          name: 'John Doe',
          relationship: 'Friend',
          attendance: 'yes' as const,
          message: 'Congratulations!',
          submittedAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          relationship: 'Family',
          attendance: 'no' as const,
          message: '',
          submittedAt: '2023-01-02T00:00:00.000Z',
        },
      ];

      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockReadTenantRSVPData.mockResolvedValueOnce(mockRSVPData);

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockRSVPData);
      expect(responseData.tenant).toBe('john-jane');
      expect(responseData.count).toBe(2);
      expect(mockValidateTenantId).toHaveBeenCalledWith('john-jane');
      expect(mockReadTenantRSVPData).toHaveBeenCalledWith('john-jane');
    });

    it('should reject request with invalid tenant', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: false,
        error: 'Tenant not found',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=invalid-tenant'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid tenant');
      expect(responseData.details).toBe('Tenant not found');
      expect(mockReadTenantRSVPData).not.toHaveBeenCalled();
    });

    it('should return empty array when no data exists for tenant', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockReadTenantRSVPData.mockResolvedValueOnce([]);

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual([]);
      expect(responseData.tenant).toBe('john-jane');
      expect(responseData.count).toBe(0);
    });

    it('should handle CSV read errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockReadTenantRSVPData.mockRejectedValueOnce(
        new Error('Failed to read CSV')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to read RSVP data');
    });

    it('should handle tenant-specific read errors', async () => {
      mockValidateTenantId.mockResolvedValueOnce({
        isValid: true,
        tenantId: 'john-jane',
      });
      mockReadTenantRSVPData.mockRejectedValueOnce(
        new Error(
          'Failed to read RSVP data for tenant john-jane: Directory not found'
        )
      );

      const request = new NextRequest(
        'http://localhost:3000/api/rsvp/tenant?tenant=john-jane'
      );
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe(
        'Failed to read RSVP data for tenant john-jane: Directory not found'
      );
    });
  });
});
