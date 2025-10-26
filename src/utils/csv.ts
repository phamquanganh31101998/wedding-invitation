import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import * as createCsvWriter from 'csv-writer';
import { RSVPData } from '@/types';

const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'rsvp.csv');

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

export async function readRSVPData(): Promise<RSVPData[]> {
  return new Promise((resolve, reject) => {
    const results: RSVPData[] = [];

    if (!fs.existsSync(CSV_FILE_PATH)) {
      resolve([]);
      return;
    }

    fs.createReadStream(CSV_FILE_PATH)
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
        console.error('Error reading RSVP data from CSV:', error);
        reject(new Error(`Failed to read RSVP data: ${error.message}`));
      });
  });
}

export async function writeRSVPData(data: RSVPData): Promise<void> {
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

    // Ensure data directory exists
    const dataDir = path.dirname(CSV_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write header if file doesn't exist
    if (!fs.existsSync(CSV_FILE_PATH)) {
      await csvWriter.writeRecords([]);
    }

    // Sanitize data for CSV writing
    const sanitizedData = {
      ...data,
      name: data.name.replace(/"/g, '""'), // Escape quotes for CSV
      relationship: data.relationship.replace(/"/g, '""'),
      message: data.message ? data.message.replace(/"/g, '""') : '',
    };

    await csvWriter.writeRecords([sanitizedData]);
  } catch (error) {
    console.error('Error writing RSVP data to CSV:', error);
    throw new Error(
      `Failed to write RSVP data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getNextRSVPId(): Promise<string> {
  try {
    const existingData = await readRSVPData();

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
    console.error('Error getting next RSVP ID:', error);
    // Fallback to timestamp-based ID if CSV reading fails
    return Date.now().toString();
  }
}

export async function findRSVPById(id: string): Promise<RSVPData | null> {
  try {
    const existingData = await readRSVPData();
    return existingData.find((record) => record.id === id) || null;
  } catch (error) {
    console.error('Error finding RSVP by ID:', error);
    return null;
  }
}

export async function updateRSVPData(data: RSVPData): Promise<void> {
  try {
    const existingData = await readRSVPData();
    const recordIndex = existingData.findIndex(
      (record) => record.id === data.id
    );

    if (recordIndex === -1) {
      throw new Error(`RSVP record with ID ${data.id} not found`);
    }

    // Update the existing record
    existingData[recordIndex] = data;

    // Rewrite the entire CSV file
    await rewriteCSVFile(existingData);
  } catch (error) {
    console.error('Error updating RSVP data:', error);
    throw new Error(
      `Failed to update RSVP data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function rewriteCSVFile(data: RSVPData[]): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CSV_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create a new CSV writer that overwrites the file
    const csvWriterOverwrite = createCsvWriter.createObjectCsvWriter({
      path: CSV_FILE_PATH,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'relationship', title: 'Relationship' },
        { id: 'attendance', title: 'Attendance' },
        { id: 'message', title: 'Message' },
        { id: 'submittedAt', title: 'Submitted At' },
      ],
      append: false, // Overwrite the file
    });

    // Sanitize all data for CSV writing
    const sanitizedData = data.map((record) => ({
      ...record,
      name: record.name.replace(/"/g, '""'),
      relationship: record.relationship.replace(/"/g, '""'),
      message: record.message ? record.message.replace(/"/g, '""') : '',
    }));

    await csvWriterOverwrite.writeRecords(sanitizedData);
  } catch (error) {
    console.error('Error rewriting CSV file:', error);
    throw error;
  }
}

export async function initializeCSV(): Promise<void> {
  const dataDir = path.dirname(CSV_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(CSV_FILE_PATH)) {
    await csvWriter.writeRecords([]);
  }
}
