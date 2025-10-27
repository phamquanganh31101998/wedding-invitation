import {
  readTenantRSVPData,
  writeTenantRSVPData,
  getTenantNextRSVPId,
  findTenantRSVPById,
  updateTenantRSVPData,
  initializeTenantCSV,
  getTenantConfig,
  validateTenantExists,
  createTenantDirectory,
  listTenants,
  getTenantStats,
} from '../csv';
import { RSVPData, TenantConfig } from '@/types';
import fs from 'fs';
import path from 'path';

// Suppress console.error during tests to reduce noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Test data
const mockRSVPData: RSVPData = {
  id: '1',
  name: 'John Doe',
  relationship: 'Friend',
  attendance: 'yes',
  message: 'Congratulations!',
  submittedAt: '2023-01-01T00:00:00.000Z',
};

const mockTenantConfig: TenantConfig = {
  id: 'test-tenant',
  brideName: 'Jane Smith',
  groomName: 'John Doe',
  weddingDate: '2024-12-25',
  venue: {
    name: 'Test Venue',
    address: '123 Test St, Test City',
    mapLink: 'test-map-link',
  },
  theme: {
    primaryColor: '#D69E2E',
    secondaryColor: '#2D3748',
  },
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('Tenant-Aware CSV Utilities', () => {
  const testTenantId = 'test-tenant';
  const testDataDir = path.join(process.cwd(), 'data', testTenantId);
  const testCSVPath = path.join(testDataDir, 'rsvp.csv');
  const testConfigPath = path.join(testDataDir, 'config.json');

  beforeEach(() => {
    // Clean up test data before each test
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test data after each test
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('Tenant Directory Operations', () => {
    it('should create tenant directory', async () => {
      await createTenantDirectory(testTenantId);
      expect(fs.existsSync(testDataDir)).toBe(true);
    });

    it('should not fail when creating existing directory', async () => {
      fs.mkdirSync(testDataDir, { recursive: true });
      await expect(createTenantDirectory(testTenantId)).resolves.not.toThrow();
    });
  });

  describe('Tenant Configuration Management', () => {
    beforeEach(() => {
      // Create test tenant directory and config
      fs.mkdirSync(testDataDir, { recursive: true });
      fs.writeFileSync(
        testConfigPath,
        JSON.stringify(mockTenantConfig, null, 2)
      );
    });

    it('should read tenant configuration', async () => {
      const config = await getTenantConfig(testTenantId);
      expect(config).toEqual(mockTenantConfig);
    });

    it('should return null for non-existent tenant config', async () => {
      const config = await getTenantConfig('non-existent-tenant');
      expect(config).toBeNull();
    });

    it('should validate existing active tenant', async () => {
      const isValid = await validateTenantExists(testTenantId);
      expect(isValid).toBe(true);
    });

    it('should reject non-existent tenant', async () => {
      const isValid = await validateTenantExists('non-existent-tenant');
      expect(isValid).toBe(false);
    });

    it('should reject inactive tenant', async () => {
      const inactiveConfig = { ...mockTenantConfig, isActive: false };
      fs.writeFileSync(testConfigPath, JSON.stringify(inactiveConfig, null, 2));

      const isValid = await validateTenantExists(testTenantId);
      expect(isValid).toBe(false);
    });

    it('should reject tenant with invalid characters', async () => {
      const isValid = await validateTenantExists('invalid/../tenant');
      expect(isValid).toBe(false);
    });

    it('should reject empty tenant ID', async () => {
      const isValid = await validateTenantExists('');
      expect(isValid).toBe(false);
    });

    it('should handle malformed JSON config', async () => {
      fs.writeFileSync(testConfigPath, 'invalid json');

      await expect(getTenantConfig(testTenantId)).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('should handle config with missing required fields', async () => {
      const invalidConfig = { id: testTenantId }; // Missing required fields
      fs.writeFileSync(testConfigPath, JSON.stringify(invalidConfig));

      await expect(getTenantConfig(testTenantId)).rejects.toThrow(
        'missing required fields'
      );
    });
  });

  describe('Tenant RSVP Data Operations', () => {
    beforeEach(async () => {
      // Create test tenant directory and config
      fs.mkdirSync(testDataDir, { recursive: true });
      fs.writeFileSync(
        testConfigPath,
        JSON.stringify(mockTenantConfig, null, 2)
      );
      await initializeTenantCSV(testTenantId);
    });

    it('should initialize tenant CSV file', async () => {
      expect(fs.existsSync(testCSVPath)).toBe(true);
    });

    it('should write tenant RSVP data', async () => {
      await writeTenantRSVPData(testTenantId, mockRSVPData);

      const data = await readTenantRSVPData(testTenantId);
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual(mockRSVPData);
    });

    it('should read empty tenant RSVP data', async () => {
      const data = await readTenantRSVPData(testTenantId);
      expect(data).toEqual([]);
    });

    it('should read non-existent tenant RSVP data', async () => {
      const data = await readTenantRSVPData('non-existent-tenant');
      expect(data).toEqual([]);
    });

    it('should generate next RSVP ID for tenant', async () => {
      const nextId = await getTenantNextRSVPId(testTenantId);
      expect(nextId).toBe('1');

      await writeTenantRSVPData(testTenantId, mockRSVPData);
      const nextId2 = await getTenantNextRSVPId(testTenantId);
      expect(nextId2).toBe('2');
    });

    it('should find RSVP by ID for tenant', async () => {
      await writeTenantRSVPData(testTenantId, mockRSVPData);

      const found = await findTenantRSVPById(testTenantId, '1');
      expect(found).toEqual(mockRSVPData);
    });

    it('should return null when RSVP not found for tenant', async () => {
      const found = await findTenantRSVPById(testTenantId, 'non-existent');
      expect(found).toBeNull();
    });

    it('should update existing RSVP data for tenant', async () => {
      await writeTenantRSVPData(testTenantId, mockRSVPData);

      const updatedData = {
        ...mockRSVPData,
        name: 'Jane Doe',
        attendance: 'no' as const,
      };
      await updateTenantRSVPData(testTenantId, updatedData);

      const data = await readTenantRSVPData(testTenantId);
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Jane Doe');
      expect(data[0].attendance).toBe('no');
    });

    it('should throw error when updating non-existent RSVP for tenant', async () => {
      await expect(
        updateTenantRSVPData(testTenantId, mockRSVPData)
      ).rejects.toThrow('not found');
    });

    it('should handle data with special characters', async () => {
      const specialData = {
        ...mockRSVPData,
        name: 'John "Johnny" Doe, Jr.',
        message: 'Congratulations, and "best wishes"!',
      };

      await writeTenantRSVPData(testTenantId, specialData);
      const data = await readTenantRSVPData(testTenantId);

      expect(data[0].name).toBe('John "Johnny" Doe, Jr.');
      expect(data[0].message).toBe('Congratulations, and "best wishes"!');
    });
  });

  describe('Tenant Data Isolation', () => {
    const tenant1 = 'tenant-1';
    const tenant2 = 'tenant-2';
    const tenant1Dir = path.join(process.cwd(), 'data', tenant1);
    const tenant2Dir = path.join(process.cwd(), 'data', tenant2);

    beforeEach(async () => {
      // Create two test tenants
      for (const tenantId of [tenant1, tenant2]) {
        const tenantDir = path.join(process.cwd(), 'data', tenantId);
        const configPath = path.join(tenantDir, 'config.json');

        fs.mkdirSync(tenantDir, { recursive: true });
        fs.writeFileSync(
          configPath,
          JSON.stringify(
            {
              ...mockTenantConfig,
              id: tenantId,
            },
            null,
            2
          )
        );
        await initializeTenantCSV(tenantId);
      }
    });

    afterEach(() => {
      // Clean up both tenant directories
      for (const dir of [tenant1Dir, tenant2Dir]) {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      }
    });

    it('should isolate RSVP data between tenants', async () => {
      const rsvp1 = { ...mockRSVPData, id: '1', name: 'Tenant 1 Guest' };
      const rsvp2 = { ...mockRSVPData, id: '1', name: 'Tenant 2 Guest' };

      await writeTenantRSVPData(tenant1, rsvp1);
      await writeTenantRSVPData(tenant2, rsvp2);

      const data1 = await readTenantRSVPData(tenant1);
      const data2 = await readTenantRSVPData(tenant2);

      expect(data1).toHaveLength(1);
      expect(data2).toHaveLength(1);
      expect(data1[0].name).toBe('Tenant 1 Guest');
      expect(data2[0].name).toBe('Tenant 2 Guest');
    });

    it('should generate independent RSVP IDs for each tenant', async () => {
      const id1 = await getTenantNextRSVPId(tenant1);
      const id2 = await getTenantNextRSVPId(tenant2);

      expect(id1).toBe('1');
      expect(id2).toBe('1');

      await writeTenantRSVPData(tenant1, { ...mockRSVPData, id: id1 });
      await writeTenantRSVPData(tenant2, { ...mockRSVPData, id: id2 });

      const nextId1 = await getTenantNextRSVPId(tenant1);
      const nextId2 = await getTenantNextRSVPId(tenant2);

      expect(nextId1).toBe('2');
      expect(nextId2).toBe('2');
    });
  });

  describe('Tenant Listing and Stats', () => {
    const tenant1 = 'active-tenant';
    const tenant2 = 'inactive-tenant';

    beforeEach(async () => {
      // Create active tenant
      const tenant1Dir = path.join(process.cwd(), 'data', tenant1);
      fs.mkdirSync(tenant1Dir, { recursive: true });
      fs.writeFileSync(
        path.join(tenant1Dir, 'config.json'),
        JSON.stringify(
          { ...mockTenantConfig, id: tenant1, isActive: true },
          null,
          2
        )
      );
      await initializeTenantCSV(tenant1);
      await writeTenantRSVPData(tenant1, mockRSVPData);

      // Create inactive tenant
      const tenant2Dir = path.join(process.cwd(), 'data', tenant2);
      fs.mkdirSync(tenant2Dir, { recursive: true });
      fs.writeFileSync(
        path.join(tenant2Dir, 'config.json'),
        JSON.stringify(
          { ...mockTenantConfig, id: tenant2, isActive: false },
          null,
          2
        )
      );
    });

    afterEach(() => {
      // Clean up
      for (const tenantId of [tenant1, tenant2]) {
        const tenantDir = path.join(process.cwd(), 'data', tenantId);
        if (fs.existsSync(tenantDir)) {
          fs.rmSync(tenantDir, { recursive: true, force: true });
        }
      }
    });

    it('should list only active tenants', async () => {
      const tenants = await listTenants();
      expect(tenants).toContain(tenant1);
      expect(tenants).not.toContain(tenant2);
    });

    it('should get tenant stats for active tenant', async () => {
      const stats = await getTenantStats(tenant1);
      expect(stats).toEqual({
        rsvpCount: 1,
        configExists: true,
        isActive: true,
      });
    });

    it('should return null stats for inactive tenant', async () => {
      const stats = await getTenantStats(tenant2);
      expect(stats).toBeNull();
    });

    it('should return null stats for non-existent tenant', async () => {
      const stats = await getTenantStats('non-existent');
      expect(stats).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tenant data validation', async () => {
      const invalidData = {
        id: '',
        name: '',
        relationship: '',
        attendance: 'yes' as const,
        submittedAt: '',
      };

      await expect(
        writeTenantRSVPData(testTenantId, invalidData)
      ).rejects.toThrow('missing required fields');
    });

    it('should handle file system errors gracefully', async () => {
      // Try to read from a directory that doesn't exist and can't be created
      const invalidTenant = '/invalid/path/tenant';
      const data = await readTenantRSVPData(invalidTenant);
      expect(data).toEqual([]);
    });
  });
});
