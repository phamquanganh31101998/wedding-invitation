import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import * as csvUtils from '@/utils/csv';

// Mock the CSV utilities
jest.mock('@/utils/csv', () => ({
  writeRSVPData: jest.fn(),
  readRSVPData: jest.fn(),
}));

const mockWriteRSVPData = csvUtils.writeRSVPData as jest.MockedFunction<
  typeof csvUtils.writeRSVPData
>;
const mockReadRSVPData = csvUtils.readRSVPData as jest.MockedFunction<
  typeof csvUtils.readRSVPData
>;

describe('/api/rsvp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() for consistent ID generation
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    // Mock Date constructor for consistent timestamps
    jest.spyOn(global, 'Date').mockImplementation(
      () =>
        ({
          toISOString: () => '2023-01-01T00:00:00.000Z',
        }) as any
    );
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

      mockWriteRSVPData.mockResolvedValueOnce(undefined);

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.message).toBe('RSVP submitted successfully');
      expect(responseData.data).toEqual({
        id: '1234567890',
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
        submittedAt: '2023-01-01T00:00:00.000Z',
      });

      expect(mockWriteRSVPData).toHaveBeenCalledWith({
        id: '1234567890',
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
        submittedAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should handle RSVP submission without message', async () => {
      const validRSVPData = {
        name: 'Jane Smith',
        relationship: 'Family',
        attendance: 'no',
      };

      mockWriteRSVPData.mockResolvedValueOnce(undefined);

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Validation failed');
      expect(responseData.details).toContain('Name is required');
    });

    it('should validate name length constraints', async () => {
      const invalidRSVPData = {
        name: 'A', // Too short
        relationship: 'Friend',
        attendance: 'yes',
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.details).toContain(
        'Name must be between 2 and 50 characters'
      );
    });

    it('should validate required relationship field', async () => {
      const invalidRSVPData = {
        name: 'John Doe',
        attendance: 'yes',
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.details).toContain('Relationship is required');
    });

    it('should validate relationship length constraints', async () => {
      const invalidRSVPData = {
        name: 'John Doe',
        relationship: 'A'.repeat(101), // Too long
        attendance: 'yes',
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.details).toContain(
        'Relationship must be between 1 and 100 characters'
      );
    });

    it('should validate attendance field values', async () => {
      const invalidRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'invalid',
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.details).toContain(
        'Attendance must be one of: yes, no, maybe'
      );
    });

    it('should validate message length constraint', async () => {
      const invalidRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'A'.repeat(501), // Too long
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.details).toContain(
        'Message must be no more than 500 characters'
      );
    });

    it('should handle CSV write errors', async () => {
      const validRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
      };

      mockWriteRSVPData.mockRejectedValueOnce(
        new Error('ENOENT: no such file or directory')
      );

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe(
        'Failed to save RSVP data - file system error'
      );
    });

    it('should handle permission errors', async () => {
      const validRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
      };

      mockWriteRSVPData.mockRejectedValueOnce(new Error('permission denied'));

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe(
        'Failed to save RSVP data - file system error'
      );
    });

    it('should handle generic errors', async () => {
      const validRSVPData = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
      };

      mockWriteRSVPData.mockRejectedValueOnce(new Error('Generic error'));

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to submit RSVP');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to submit RSVP');
    });
  });

  describe('GET', () => {
    it('should successfully retrieve RSVP data', async () => {
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

      mockReadRSVPData.mockResolvedValueOnce(mockRSVPData);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockRSVPData);
      expect(mockReadRSVPData).toHaveBeenCalledTimes(1);
    });

    it('should handle CSV read errors', async () => {
      mockReadRSVPData.mockRejectedValueOnce(new Error('Failed to read CSV'));

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to read RSVP data');
    });

    it('should return empty array when no data exists', async () => {
      mockReadRSVPData.mockResolvedValueOnce([]);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual([]);
    });
  });
});
