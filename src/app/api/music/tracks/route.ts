import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration: number;
}

// Supported audio file extensions
const SUPPORTED_FORMATS = ['.mp3', '.wav', '.ogg'];

/**
 * Parse track metadata from filename
 * Supports formats like "Artist - Title.mp3" or "Title.mp3"
 */
function parseTrackMetadata(filename: string): {
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
 * Generate unique ID for track based on filename
 */
function generateTrackId(filename: string): string {
  return Buffer.from(filename)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '');
}

export async function GET(
  _request: NextRequest
): Promise<NextResponse<Track[] | { error: string }>> {
  try {
    const musicFolderPath = path.join(process.cwd(), 'data', 'musics');

    // Check if music folder exists
    try {
      await fs.access(musicFolderPath);
    } catch {
      return NextResponse.json(
        { error: 'Music folder not found' },
        { status: 404 }
      );
    }

    // Read all files in the music directory
    const files = await fs.readdir(musicFolderPath);

    // Filter for supported audio files
    const audioFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_FORMATS.includes(ext);
    });

    // Convert files to track objects
    const tracks: Track[] = audioFiles.map((filename) => {
      const { title, artist } = parseTrackMetadata(filename);
      const id = generateTrackId(filename);

      return {
        id,
        title,
        artist,
        url: `/api/music/serve/${encodeURIComponent(filename)}`,
        duration: 0, // We'll set this to 0 for now, could be enhanced to read actual duration
      };
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error reading music files:', error);
    return NextResponse.json(
      { error: 'Failed to load music tracks' },
      { status: 500 }
    );
  }
}
