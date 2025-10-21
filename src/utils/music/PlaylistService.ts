import { Track } from '@/types/music';

/**
 * Playlist Service utility for managing music tracks
 */
export class PlaylistService {
  /**
   * Load tracks from the music folder via API
   * The folderPath parameter is kept for interface consistency but not used
   * as the API endpoint handles the folder path internally
   */
  static async loadTracksFromFolder(_folderPath?: string): Promise<Track[]> {
    try {
      const response = await fetch('/api/music/tracks');
      if (!response.ok) {
        throw new Error(`Failed to load tracks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error('Error loading tracks:', error);
      throw error;
    }
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * Creates a new shuffled copy without modifying the original array
   */
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Parse track metadata from filename
   * Supports formats like "Artist - Title.mp3" or "Title.mp3"
   */
  static parseTrackMetadata(filename: string): {
    title: string;
    artist?: string;
  } {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Check if filename contains " - " separator
    if (nameWithoutExt.includes(' - ')) {
      const [artist, title] = nameWithoutExt.split(' - ', 2);
      return {
        title: title.trim(),
        artist: artist.trim(),
      };
    }

    // No artist separator found, use entire name as title
    return {
      title: nameWithoutExt.trim(),
    };
  }

  /**
   * Generate unique ID for a track based on filename
   */
  static generateTrackId(filename: string): string {
    return Buffer.from(filename)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Validate if file format is supported
   */
  static isSupportedFormat(
    filename: string,
    supportedFormats: string[]
  ): boolean {
    const extension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf('.'));
    return supportedFormats.includes(extension);
  }

  /**
   * Create a shuffled playlist from tracks
   * Returns a new array with tracks in random order
   */
  static createShuffledPlaylist(tracks: Track[]): Track[] {
    return this.shuffleArray(tracks);
  }

  /**
   * Find next track in playlist
   */
  static getNextTrack(playlist: Track[], currentIndex: number): number {
    if (playlist.length === 0) return -1;
    return (currentIndex + 1) % playlist.length;
  }

  /**
   * Find previous track in playlist
   */
  static getPreviousTrack(playlist: Track[], currentIndex: number): number {
    if (playlist.length === 0) return -1;
    return currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
  }
}
