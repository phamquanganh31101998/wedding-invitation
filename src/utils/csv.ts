import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import * as createCsvWriter from 'csv-writer';
import { RSVPData, TenantConfig } from '@/types';

const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'rsvp.csv');

// Helper function to get tenant-specific file paths
function getTenantFilePath(tenantId: string, filename: string): string {
  return path.join(process.cwd(), 'data', tenantId, filename);
}

function getTenantRSVPPath(tenantId: string): string {
  return getTenantFilePath(tenantId, 'rsvp.csv');
}

function getTenantConfigPath(tenantId: string): string {
  return getTenantFilePath(tenantId, 'config.json');
}

// Helper function to create CSV writer for a specific tenant
function createTenantCSVWriter(tenantId: string, append: boolean = true) {
  const csvPath = getTenantRSVPPath(tenantId);
  return createCsvWriter.createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'name', title: 'Name' },
      { id: 'relationship', title: 'Relationship' },
      { id: 'attendance', title: 'Attendance' },
      { id: 'message', title: 'Message' },
      { id: 'submittedAt', title: 'Submitted At' },
    ],
    append,
  });
}

const csvWriter = createCsvWriter.createObjectCsvWriter({
  path: CSV_FILE_PATH,
  header: [
    { id: 'id', title: 'ID' },
    { id: 'name', title: 'Name' },
    { id: 'relationship', title: 'Relationship' },
    { id: 'attendance', title: 'Attendance' },
    { id: 'message', title: 'Message' },
    { id: 'submittedAt', title: 'Submitted At' },
  ],
  append: true,
});

// Legacy function for backward compatibility
export async function readRSVPData(): Promise<RSVPData[]> {
  return readTenantRSVPData('default');
}

// New tenant-aware function
export async function readTenantRSVPData(
  tenantId: string
): Promise<RSVPData[]> {
  return new Promise((resolve, reject) => {
    const results: RSVPData[] = [];
    const csvPath = getTenantRSVPPath(tenantId);

    if (!fs.existsSync(csvPath)) {
      resolve([]);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Validate and transform data to ensure compatibility
        const rsvpData: RSVPData = {
          id: data.ID || data.id || '',
          name: data.Name || data.name || '',
          relationship:
            data.Relationship || data.relationship || data.position || '', // Support legacy 'position' field
          attendance: data.Attendance || data.attendance || '',
          message: data.Message || data.message || '',
          submittedAt: data['Submitted At'] || data.submittedAt || '',
        };

        // Only add valid records
        if (
          rsvpData.id &&
          rsvpData.name &&
          rsvpData.relationship &&
          rsvpData.attendance
        ) {
          results.push(rsvpData);
        }
      })
      .on('end', () => resolve(results))
      .on('error', (error) => {
        console.error(
          `Error reading RSVP data from CSV for tenant ${tenantId}:`,
          error
        );
        reject(
          new Error(
            `Failed to read RSVP data for tenant ${tenantId}: ${error.message}`
          )
        );
      });
  });
}

// Legacy function for backward compatibility
export async function writeRSVPData(data: RSVPData): Promise<void> {
  return writeTenantRSVPData('default', data);
}

// New tenant-aware function
export async function writeTenantRSVPData(
  tenantId: string,
  data: RSVPData
): Promise<void> {
  try {
    // Validate data structure
    if (
      !data.id ||
      !data.name ||
      !data.relationship ||
      !data.attendance ||
      !data.submittedAt
    ) {
      throw new Error('Invalid RSVP data: missing required fields');
    }

    const csvPath = getTenantRSVPPath(tenantId);

    // Ensure tenant directory exists
    const tenantDir = path.dirname(csvPath);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const tenantCsvWriter = createTenantCSVWriter(tenantId);

    // Write header if file doesn't exist
    if (!fs.existsSync(csvPath)) {
      // Write header manually since csv-writer doesn't write headers for empty records
      const headerLine =
        'ID,Name,Relationship,Attendance,Message,Submitted At\n';
      fs.writeFileSync(csvPath, headerLine);
    }

    await tenantCsvWriter.writeRecords([data]);
  } catch (error) {
    console.error(
      `Error writing RSVP data to CSV for tenant ${tenantId}:`,
      error
    );
    throw new Error(
      `Failed to write RSVP data for tenant ${tenantId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Legacy function for backward compatibility
export async function getNextRSVPId(): Promise<string> {
  return getTenantNextRSVPId('default');
}

// New tenant-aware function
export async function getTenantNextRSVPId(tenantId: string): Promise<string> {
  try {
    const existingData = await readTenantRSVPData(tenantId);

    if (existingData.length === 0) {
      return '1';
    }

    // Find the highest numeric ID
    const maxId = existingData.reduce((max, record) => {
      const numericId = parseInt(record.id, 10);
      return isNaN(numericId) ? max : Math.max(max, numericId);
    }, 0);

    return (maxId + 1).toString();
  } catch (error) {
    console.error(`Error getting next RSVP ID for tenant ${tenantId}:`, error);
    // Fallback to timestamp-based ID if CSV reading fails
    return Date.now().toString();
  }
}

// Legacy function for backward compatibility
export async function findRSVPById(id: string): Promise<RSVPData | null> {
  return findTenantRSVPById('default', id);
}

// New tenant-aware function
export async function findTenantRSVPById(
  tenantId: string,
  id: string
): Promise<RSVPData | null> {
  try {
    const existingData = await readTenantRSVPData(tenantId);
    return existingData.find((record) => record.id === id) || null;
  } catch (error) {
    console.error(`Error finding RSVP by ID for tenant ${tenantId}:`, error);
    return null;
  }
}

// Legacy function for backward compatibility
export async function updateRSVPData(data: RSVPData): Promise<void> {
  return updateTenantRSVPData('default', data);
}

// New tenant-aware function
export async function updateTenantRSVPData(
  tenantId: string,
  data: RSVPData
): Promise<void> {
  try {
    const existingData = await readTenantRSVPData(tenantId);
    const recordIndex = existingData.findIndex(
      (record) => record.id === data.id
    );

    if (recordIndex === -1) {
      throw new Error(
        `RSVP record with ID ${data.id} not found for tenant ${tenantId}`
      );
    }

    // Update the existing record
    existingData[recordIndex] = data;

    // Rewrite the entire CSV file
    await rewriteTenantCSVFile(tenantId, existingData);
  } catch (error) {
    console.error(`Error updating RSVP data for tenant ${tenantId}:`, error);
    throw new Error(
      `Failed to update RSVP data for tenant ${tenantId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Legacy function for backward compatibility
async function rewriteCSVFile(data: RSVPData[]): Promise<void> {
  return rewriteTenantCSVFile('default', data);
}

// New tenant-aware function
async function rewriteTenantCSVFile(
  tenantId: string,
  data: RSVPData[]
): Promise<void> {
  try {
    const csvPath = getTenantRSVPPath(tenantId);

    // Ensure tenant directory exists
    const tenantDir = path.dirname(csvPath);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    // Create a new CSV writer that overwrites the file
    const csvWriterOverwrite = createTenantCSVWriter(tenantId, false);

    await csvWriterOverwrite.writeRecords(data);
  } catch (error) {
    console.error(`Error rewriting CSV file for tenant ${tenantId}:`, error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function initializeCSV(): Promise<void> {
  return initializeTenantCSV('default');
}

// New tenant-aware function
export async function initializeTenantCSV(tenantId: string): Promise<void> {
  const csvPath = getTenantRSVPPath(tenantId);
  const tenantDir = path.dirname(csvPath);

  if (!fs.existsSync(tenantDir)) {
    fs.mkdirSync(tenantDir, { recursive: true });
  }

  if (!fs.existsSync(csvPath)) {
    // Write header manually since csv-writer doesn't write headers for empty records
    const headerLine = 'ID,Name,Relationship,Attendance,Message,Submitted At\n';
    fs.writeFileSync(csvPath, headerLine);
  }
}
// Tenant Configuration Management Functions

export async function getTenantConfig(
  tenantId: string
): Promise<TenantConfig | null> {
  try {
    const configPath = getTenantConfigPath(tenantId);

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData) as TenantConfig;

    // Validate required fields
    if (
      !config.id ||
      !config.brideName ||
      !config.groomName ||
      !config.weddingDate
    ) {
      throw new Error(
        `Invalid tenant configuration for ${tenantId}: missing required fields`
      );
    }

    return config;
  } catch (error) {
    console.error(`Error reading tenant configuration for ${tenantId}:`, error);
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in tenant configuration for ${tenantId}`);
    }
    throw new Error(
      `Failed to read tenant configuration for ${tenantId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function validateTenantExists(tenantId: string): Promise<boolean> {
  try {
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      return false;
    }

    // Sanitize tenant ID to prevent path traversal
    const sanitizedTenantId = tenantId.replace(/[^a-zA-Z0-9-_]/g, '');
    if (sanitizedTenantId !== tenantId) {
      return false;
    }

    const configPath = getTenantConfigPath(tenantId);

    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      return false;
    }

    // Try to read and validate the configuration
    const config = await getTenantConfig(tenantId);

    // Check if tenant is active
    return config !== null && config.isActive === true;
  } catch (error) {
    console.error(`Error validating tenant ${tenantId}:`, error);
    return false;
  }
}

export async function getTenantDirectory(tenantId: string): Promise<string> {
  const tenantDir = path.join(process.cwd(), 'data', tenantId);
  return tenantDir;
}

export async function createTenantDirectory(tenantId: string): Promise<void> {
  try {
    const tenantDir = await getTenantDirectory(tenantId);

    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }
  } catch (error) {
    console.error(`Error creating tenant directory for ${tenantId}:`, error);
    throw new Error(
      `Failed to create tenant directory for ${tenantId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function listTenants(): Promise<string[]> {
  try {
    const dataDir = path.join(process.cwd(), 'data');

    if (!fs.existsSync(dataDir)) {
      return [];
    }

    const entries = fs.readdirSync(dataDir, { withFileTypes: true });
    const tenantDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    // Filter to only include directories with valid config files
    const validTenants: string[] = [];
    for (const tenantId of tenantDirs) {
      if (await validateTenantExists(tenantId)) {
        validTenants.push(tenantId);
      }
    }

    return validTenants;
  } catch (error) {
    console.error('Error listing tenants:', error);
    return [];
  }
}

export async function getTenantStats(tenantId: string): Promise<{
  rsvpCount: number;
  configExists: boolean;
  isActive: boolean;
} | null> {
  try {
    if (!(await validateTenantExists(tenantId))) {
      return null;
    }

    const rsvpData = await readTenantRSVPData(tenantId);
    const config = await getTenantConfig(tenantId);

    return {
      rsvpCount: rsvpData.length,
      configExists: config !== null,
      isActive: config?.isActive ?? false,
    };
  } catch (error) {
    console.error(`Error getting tenant stats for ${tenantId}:`, error);
    return null;
  }
}
