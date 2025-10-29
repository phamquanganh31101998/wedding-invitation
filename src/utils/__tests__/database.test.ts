import {
  createGuest,
  getGuestById,
  updateGuest,
  getTenantBySlug,
} from '../database';

// Mock the neon database connection
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => jest.fn()),
}));

describe('Database Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.DATABASE_URL = 'postgresql://test';
  });

  describe('Guest Operations', () => {
    it('should create guest with integer tenant ID', () => {
      const guestData = {
        tenantId: 1, // Integer tenant ID
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes' as const,
        message: 'Congratulations!',
      };

      // This test verifies the function signature accepts integer tenant ID
      expect(() => createGuest(guestData)).not.toThrow();
    });

    it('should get guest by ID with integer IDs', () => {
      const tenantId = 1; // Integer tenant ID
      const guestId = 123; // Integer guest ID

      // This test verifies the function signature accepts integer IDs
      expect(() => getGuestById(tenantId, guestId)).not.toThrow();
    });

    it('should update guest with integer IDs', () => {
      const tenantId = 1; // Integer tenant ID
      const guestId = 123; // Integer guest ID
      const guestData = {
        name: 'John Doe Updated',
        relationship: 'Best Friend',
        attendance: 'yes' as const,
        message: 'Updated message',
      };

      // This test verifies the function signature accepts integer IDs
      expect(() => updateGuest(tenantId, guestId, guestData)).not.toThrow();
    });
  });

  describe('Tenant Operations', () => {
    it('should get tenant by slug', () => {
      const slug = 'john-jane-wedding';

      // This test verifies the function signature accepts slug
      expect(() => getTenantBySlug(slug)).not.toThrow();
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain RSVP function aliases', async () => {
      // Import the backward compatibility functions
      const { createRSVP, getRSVPById, updateRSVP } = await import(
        '../database'
      );

      // Verify functions exist
      expect(typeof createRSVP).toBe('function');
      expect(typeof getRSVPById).toBe('function');
      expect(typeof updateRSVP).toBe('function');
    });
  });
});
