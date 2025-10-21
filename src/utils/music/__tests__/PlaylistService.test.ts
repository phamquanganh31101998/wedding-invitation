import { PlaylistService } from '../PlaylistService';
import { Track } from '@/types/music';

// Mock fetch for API tests
global.fetch = jest.fn();

describe('PlaylistService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shuffleArray', () => {
    it('should return a new array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = PlaylistService.shuffleArray(original);

      expect(shuffled).not.toBe(original); // Different reference
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort()); // Same elements
    });

    it('should handle empty array', () => {
      const result = PlaylistService.shuffleArray([]);
      expect(result).toEqual([]);
    });

    it('should handle single element array', () => {
      const result = PlaylistService.shuffleArray([1]);
      expect(result).toEqual([1]);
    });
  });

  describe('parseTrackMetadata', () => {
    it('should parse artist and title from filename with separator', () => {
      const result = PlaylistService.parseTrackMetadata(
        'Artist Name - Song Title.mp3'
      );
      expect(result).toEqual({
        title: 'Song Title',
        artist: 'Artist Name',
      });
    });

    it('should handle filename without artist separator', () => {
      const result = PlaylistService.parseTrackMetadata('Song Title.mp3');
      expect(result).toEqual({
        title: 'Song Title',
      });
    });

    it('should handle multiple separators by using first one', () => {
      const result = PlaylistService.parseTrackMetadata(
        'Artist - Song - Version.mp3'
      );
      expect(result).toEqual({
        title: 'Song',
        artist: 'Artist',
      });
    });

    it('should trim whitespace from artist and title', () => {
      const result = PlaylistService.parseTrackMetadata(
        '  Artist Name  -  Song Title  .mp3'
      );
      expect(result).toEqual({
        title: 'Song Title',
        artist: 'Artist Name',
      });
    });
  });

  describe('generateTrackId', () => {
    it('should generate consistent ID for same filename', () => {
      const filename = 'test-song.mp3';
      const id1 = PlaylistService.generateTrackId(filename);
      const id2 = PlaylistService.generateTrackId(filename);
      expect(id1).toBe(id2);
    });

    it('should generate different IDs for different filenames', () => {
      const id1 = PlaylistService.generateTrackId('song1.mp3');
      const id2 = PlaylistService.generateTrackId('song2.mp3');
      expect(id1).not.toBe(id2);
    });

    it('should generate alphanumeric ID', () => {
      const id = PlaylistService.generateTrackId('test.mp3');
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('isSupportedFormat', () => {
    const supportedFormats = ['.mp3', '.wav', '.ogg'];

    it('should return true for supported formats', () => {
      expect(
        PlaylistService.isSupportedFormat('song.mp3', supportedFormats)
      ).toBe(true);
      expect(
        PlaylistService.isSupportedFormat('song.wav', supportedFormats)
      ).toBe(true);
      expect(
        PlaylistService.isSupportedFormat('song.ogg', supportedFormats)
      ).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(
        PlaylistService.isSupportedFormat('song.flac', supportedFormats)
      ).toBe(false);
      expect(
        PlaylistService.isSupportedFormat('song.m4a', supportedFormats)
      ).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(
        PlaylistService.isSupportedFormat('song.MP3', supportedFormats)
      ).toBe(true);
      expect(
        PlaylistService.isSupportedFormat('song.WAV', supportedFormats)
      ).toBe(true);
    });
  });

  describe('getNextTrack', () => {
    const mockTracks: Track[] = [
      { id: '1', filename: 'song1.mp3', title: 'Song 1', src: '/song1.mp3' },
      { id: '2', filename: 'song2.mp3', title: 'Song 2', src: '/song2.mp3' },
      { id: '3', filename: 'song3.mp3', title: 'Song 3', src: '/song3.mp3' },
    ];

    it('should return next index in sequence', () => {
      expect(PlaylistService.getNextTrack(mockTracks, 0)).toBe(1);
      expect(PlaylistService.getNextTrack(mockTracks, 1)).toBe(2);
    });

    it('should wrap to beginning at end of playlist', () => {
      expect(PlaylistService.getNextTrack(mockTracks, 2)).toBe(0);
    });

    it('should return -1 for empty playlist', () => {
      expect(PlaylistService.getNextTrack([], 0)).toBe(-1);
    });
  });

  describe('getPreviousTrack', () => {
    const mockTracks: Track[] = [
      { id: '1', filename: 'song1.mp3', title: 'Song 1', src: '/song1.mp3' },
      { id: '2', filename: 'song2.mp3', title: 'Song 2', src: '/song2.mp3' },
      { id: '3', filename: 'song3.mp3', title: 'Song 3', src: '/song3.mp3' },
    ];

    it('should return previous index in sequence', () => {
      expect(PlaylistService.getPreviousTrack(mockTracks, 2)).toBe(1);
      expect(PlaylistService.getPreviousTrack(mockTracks, 1)).toBe(0);
    });

    it('should wrap to end at beginning of playlist', () => {
      expect(PlaylistService.getPreviousTrack(mockTracks, 0)).toBe(2);
    });

    it('should return -1 for empty playlist', () => {
      expect(PlaylistService.getPreviousTrack([], 0)).toBe(-1);
    });
  });

  describe('loadTracksFromFolder', () => {
    it('should fetch tracks from API successfully', async () => {
      const mockTracks = [
        { id: '1', filename: 'song1.mp3', title: 'Song 1', src: '/song1.mp3' },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: mockTracks }),
      });

      const result = await PlaylistService.loadTracksFromFolder();
      expect(result).toEqual(mockTracks);
      expect(fetch).toHaveBeenCalledWith('/api/music/tracks');
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(PlaylistService.loadTracksFromFolder()).rejects.toThrow(
        'Failed to load tracks: Not Found'
      );
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(PlaylistService.loadTracksFromFolder()).rejects.toThrow(
        'Network error'
      );
    });

    it('should return empty array when no tracks in response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await PlaylistService.loadTracksFromFolder();
      expect(result).toEqual([]);
    });
  });

  describe('createShuffledPlaylist', () => {
    it('should return shuffled copy of tracks', () => {
      const tracks: Track[] = [
        { id: '1', filename: 'song1.mp3', title: 'Song 1', src: '/song1.mp3' },
        { id: '2', filename: 'song2.mp3', title: 'Song 2', src: '/song2.mp3' },
        { id: '3', filename: 'song3.mp3', title: 'Song 3', src: '/song3.mp3' },
      ];

      const shuffled = PlaylistService.createShuffledPlaylist(tracks);
      expect(shuffled).not.toBe(tracks);
      expect(shuffled).toHaveLength(tracks.length);
      expect(shuffled.sort((a, b) => a.id.localeCompare(b.id))).toEqual(
        tracks.sort((a, b) => a.id.localeCompare(b.id))
      );
    });
  });
});
