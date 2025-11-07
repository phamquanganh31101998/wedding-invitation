import { NextRequest, NextResponse } from 'next/server';
import { getFilesByTenantAndType } from '@/repositories/file-repository';
import { getTenantBySlug } from '@/repositories/tenant-repository';
import { toCamelCase } from '@/utils/case-conversion';
import { File } from '@/types';

interface GalleryPhoto {
  id: number;
  tenantId: number;
  type: string;
  url: string;
  name: string | null;
  displayOrder: number;
  createdAt: string;
}

interface GalleryApiResponse {
  photos: GalleryPhoto[];
  total: number;
}

interface GalleryErrorResponse {
  error: string;
  details?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GalleryApiResponse | GalleryErrorResponse>> {
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

    // Get gallery photos from database using tenant slug and type
    const dbFiles = await getFilesByTenantAndType(tenantSlug, 'image');

    if (!dbFiles || dbFiles.length === 0) {
      return NextResponse.json({
        photos: [],
        total: 0,
      });
    }

    // Convert database records to client format
    const files: File[] = dbFiles.map((dbFile) => toCamelCase<File>(dbFile));

    // Transform files to gallery photos format
    const photos: GalleryPhoto[] = files.map((file) => ({
      id: file.id,
      tenantId: file.tenantId,
      type: file.type,
      url: file.url,
      name: file.name || null,
      displayOrder: file.displayOrder,
      createdAt: file.createdAt,
    }));

    // Sort photos by display order, then by creation date
    photos.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return NextResponse.json({
      photos,
      total: photos.length,
    });
  } catch (error) {
    console.error('Error loading gallery photos:', error);
    return NextResponse.json(
      {
        error: 'Failed to load gallery photos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
