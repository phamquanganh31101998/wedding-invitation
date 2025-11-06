import { NextRequest, NextResponse } from 'next/server';
import { getFilesByTenantAndType } from '@/repositories/file-repository';
import { getTenantBySlug } from '@/repositories/tenant-repository';
import { toCamelCase } from '@/utils/case-conversion';
import { File } from '@/types';

interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration: number;
  displayOrder: number;
}

interface TrackErrorResponse {
  error: string;
  details?: string;
}

/**
 * Parse track metadata from filename or name
 * Supports formats like "Artist - Title.mp3" or "Title.mp3"
 */
function parseTrackMetadata(name: string): {
  title: string;
  artist?: string;
} {
  if (!name) {
    return { title: 'Unknown Track' };
  }

  // Remove file extension if present
  const nameWithoutExt = name.replace(/\.[^/.]+$/, '');

  // Check if name contains " - " separator
  if (nameWithoutExt.includes(' - ')) {
    const [artist, title] = nameWithoutExt.split(' - ', 2);
    return {
      title: title.trim() || 'Unknown Track',
      artist: artist.trim() || undefined,
    };
  }

  // No artist separator found, use entire name as title
  return {
    title: nameWithoutExt.trim() || 'Unknown Track',
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<Track[] | TrackErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');

    // Use tenant slug directly (default to 'default' if not provided)
    const tenantSlug = tenantParam || 'default';

    // Validate tenant exists and is active (optional validation)
    if (tenantParam) {
      try {
        const tenant = await getTenantBySlug(tenantParam);
        if (!tenant || !tenant.is_active) {
          return NextResponse.json(
            {
              error: 'Invalid tenant',
              details: `Tenant '${tenantParam}' not found or inactive.`,
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('Error validating tenant:', error);
        return NextResponse.json(
          {
            error: 'Failed to validate tenant',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Get music files from database using tenant slug
    const dbFiles = await getFilesByTenantAndType(tenantSlug, 'music');

    if (!dbFiles || dbFiles.length === 0) {
      return NextResponse.json([]);
    }

    // Convert database records to client format and then to tracks
    const files: File[] = dbFiles.map((dbFile) => toCamelCase<File>(dbFile));

    const tracks: Track[] = files.map((file) => {
      const { title, artist } = parseTrackMetadata(
        file.name || `track-${file.id}`
      );

      const track = {
        id: file.id.toString(),
        title,
        artist,
        url: file.url, // This should be the @vercel/blob URL
        duration: 0, // We'll set this to 0 for now, could be enhanced later
        displayOrder: file.displayOrder,
      };

      return track;
    });

    // Sort tracks by display order
    tracks.sort((a, b) => a.displayOrder - b.displayOrder);

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error loading music tracks:', error);
    return NextResponse.json(
      {
        error: 'Failed to load music tracks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
