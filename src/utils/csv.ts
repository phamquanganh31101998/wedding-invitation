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

export async function initializeCSV(): Promise<void> {
  const dataDir = path.dirname(CSV_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(CSV_FILE_PATH)) {
    await csvWriter.writeRecords([]);
  }
}
