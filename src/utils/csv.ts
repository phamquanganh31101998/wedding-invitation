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
    { id: 'email', title: 'Email' },
    { id: 'phone', title: 'Phone' },
    { id: 'attendance', title: 'Attendance' },
    { id: 'guestCount', title: 'Guest Count' },
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
      .on('data', (data) => results.push(data as RSVPData))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

export async function writeRSVPData(data: RSVPData): Promise<void> {
  // Ensure data directory exists
  const dataDir = path.dirname(CSV_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write header if file doesn't exist
  if (!fs.existsSync(CSV_FILE_PATH)) {
    await csvWriter.writeRecords([]);
  }

  await csvWriter.writeRecords([data]);
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
