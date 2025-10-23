import { writeRSVPData, readRSVPData } from '../csv';
import { RSVPData } from '@/types';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

describe('CSV Utilities', () => {
  const mockRSVPData: RSVPData = {
    id: '1234567890',
    name: 'John Doe',
    relationship: 'Friend',
    attendance: 'yes',
    message: 'Congratulations!',
    submittedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('writeRSVPData', () => {
    it('should create new CSV file with headers when file does not exist', async () => {
      mockFs.access.mockRejectedValueOnce(new Error('ENOENT'));
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      mockFs.appendFile.mockResolvedValueOnce(undefined);

      await writeRSVPData(mockRSVPData);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'data/rsvp.csv',
        'ID,Name,Relationship,Attendance,Message,Submitted At\n',
        'utf8'
      );
      expect(mockFs.appendFile).toHaveBeenCalledWith(
        'data/rsvp.csv',
        '1234567890,"John Doe",Friend,yes,"Congratulations!","2023-01-01T00:00:00.000Z"\n',
        'utf8'
      );
    });

    it('should append to existing CSV file when file exists', async () => {
      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.appendFile.mockResolvedValueOnce(undefined);

      await writeRSVPData(mockRSVPData);

      expect(mockFs.writeFile).not.toHaveBeenCalled();
      expect(mockFs.appendFile).toHaveBeenCalledWith(
        'data/rsvp.csv',
        '1234567890,"John Doe",Friend,yes,"Congratulations!","2023-01-01T00:00:00.000Z"\n',
        'utf8'
      );
    });

    it('should handle data with commas in fields', async () => {
      const dataWithCommas: RSVPData = {
        ...mockRSVPData,
        name: 'John, Jr. Doe',
        message: 'Congratulations, and best wishes!',
      };

      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.appendFile.mockResolvedValueOnce(undefined);

      await writeRSVPData(dataWithCommas);

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        'data/rsvp.csv',
        '1234567890,"John, Jr. Doe",Friend,yes,"Congratulations, and best wishes!","2023-01-01T00:00:00.000Z"\n',
        'utf8'
      );
    });

    it('should handle data with quotes in fields', async () => {
      const dataWithQuotes: RSVPData = {
        ...mockRSVPData,
        name: 'John "Johnny" Doe',
        message: 'He said "Congratulations!"',
      };

      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.appendFile.mockResolvedValueOnce(undefined);

      await writeRSVPData(dataWithQuotes);

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        'data/rsvp.csv',
        '1234567890,"John ""Johnny"" Doe",Friend,yes,"He said ""Congratulations!""","2023-01-01T00:00:00.000Z"\n',
        'utf8'
      );
    });

    it('should handle empty message field', async () => {
      const dataWithEmptyMessage: RSVPData = {
        ...mockRSVPData,
        message: '',
      };

      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.appendFile.mockResolvedValueOnce(undefined);

      await writeRSVPData(dataWithEmptyMessage);

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        'data/rsvp.csv',
        '1234567890,"John Doe",Friend,yes,"","2023-01-01T00:00:00.000Z"\n',
        'utf8'
      );
    });

    it('should handle undefined message field', async () => {
      const dataWithUndefinedMessage: RSVPData = {
        ...mockRSVPData,
        message: undefined,
      };

      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.appendFile.mockResolvedValueOnce(undefined);

      await writeRSVPData(dataWithUndefinedMessage);

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        'data/rsvp.csv',
        '1234567890,"John Doe",Friend,yes,"","2023-01-01T00:00:00.000Z"\n',
        'utf8'
      );
    });

    it('should throw error when file write fails', async () => {
      mockFs.access.mockRejectedValueOnce(new Error('ENOENT'));
      mockFs.writeFile.mockRejectedValueOnce(new Error('Permission denied'));

      await expect(writeRSVPData(mockRSVPData)).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should throw error when file append fails', async () => {
      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.appendFile.mockRejectedValueOnce(new Error('Disk full'));

      await expect(writeRSVPData(mockRSVPData)).rejects.toThrow('Disk full');
    });
  });

  describe('readRSVPData', () => {
    it('should read and parse CSV data correctly', async () => {
      const csvContent = `ID,Name,Relationship,Attendance,Message,Submitted At
1,"John Doe",Friend,yes,"Congratulations!","2023-01-01T00:00:00.000Z"
2,"Jane Smith",Family,no,"","2023-01-02T00:00:00.000Z"
3,"Bob Johnson",Colleague,maybe,"Looking forward to it!","2023-01-03T00:00:00.000Z"`;

      mockFs.readFile.mockResolvedValueOnce(csvContent);

      const result = await readRSVPData();

      expect(result).toEqual([
        {
          id: '1',
          name: 'John Doe',
          relationship: 'Friend',
          attendance: 'yes',
          message: 'Congratulations!',
          submittedAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          relationship: 'Family',
          attendance: 'no',
          message: '',
          submittedAt: '2023-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          name: 'Bob Johnson',
          relationship: 'Colleague',
          attendance: 'maybe',
          message: 'Looking forward to it!',
          submittedAt: '2023-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('should handle CSV data with commas in fields', async () => {
      const csvContent = `ID,Name,Relationship,Attendance,Message,Submitted At
1,"John, Jr. Doe",Friend,yes,"Congratulations, and best wishes!","2023-01-01T00:00:00.000Z"`;

      mockFs.readFile.mockResolvedValueOnce(csvContent);

      const result = await readRSVPData();

      expect(result[0].name).toBe('John, Jr. Doe');
      expect(result[0].message).toBe('Congratulations, and best wishes!');
    });

    it('should handle CSV data with quotes in fields', async () => {
      const csvContent = `ID,Name,Relationship,Attendance,Message,Submitted At
1,"John ""Johnny"" Doe",Friend,yes,"He said ""Congratulations!""","2023-01-01T00:00:00.000Z"`;

      mockFs.readFile.mockResolvedValueOnce(csvContent);

      const result = await readRSVPData();

      expect(result[0].name).toBe('John "Johnny" Doe');
      expect(result[0].message).toBe('He said "Congratulations!"');
    });

    it('should return empty array when file does not exist', async () => {
      mockFs.readFile.mockRejectedValueOnce(
        new Error('ENOENT: no such file or directory')
      );

      const result = await readRSVPData();

      expect(result).toEqual([]);
    });

    it('should return empty array when file is empty', async () => {
      mockFs.readFile.mockResolvedValueOnce('');

      const result = await readRSVPData();

      expect(result).toEqual([]);
    });

    it('should return empty array when file contains only headers', async () => {
      const csvContent =
        'ID,Name,Relationship,Attendance,Message,Submitted At\n';

      mockFs.readFile.mockResolvedValueOnce(csvContent);

      const result = await readRSVPData();

      expect(result).toEqual([]);
    });

    it('should handle malformed CSV gracefully', async () => {
      const csvContent = `ID,Name,Relationship,Attendance,Message,Submitted At
1,"John Doe",Friend,yes,"Congratulations!","2023-01-01T00:00:00.000Z"
2,"Jane Smith",Family,no
3,"Bob Johnson",Colleague,maybe,"Looking forward to it!","2023-01-03T00:00:00.000Z"`;

      mockFs.readFile.mockResolvedValueOnce(csvContent);

      const result = await readRSVPData();

      // Should still parse the valid rows
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Bob Johnson');
    });

    it('should throw error when file read fails with permission error', async () => {
      mockFs.readFile.mockRejectedValueOnce(new Error('Permission denied'));

      await expect(readRSVPData()).rejects.toThrow('Permission denied');
    });

    it('should handle different attendance values', async () => {
      const csvContent = `ID,Name,Relationship,Attendance,Message,Submitted At
1,"John Doe",Friend,yes,"","2023-01-01T00:00:00.000Z"
2,"Jane Smith",Family,no,"","2023-01-02T00:00:00.000Z"
3,"Bob Johnson",Colleague,maybe,"","2023-01-03T00:00:00.000Z"`;

      mockFs.readFile.mockResolvedValueOnce(csvContent);

      const result = await readRSVPData();

      expect(result[0].attendance).toBe('yes');
      expect(result[1].attendance).toBe('no');
      expect(result[2].attendance).toBe('maybe');
    });
  });
});
