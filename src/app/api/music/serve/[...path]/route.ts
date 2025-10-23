import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join('/');
    const fullPath = path.join(process.cwd(), 'data', 'musics', filePath);

    // Security check: ensure the path is within the musics directory
    const musicDir = path.join(process.cwd(), 'data', 'musics');
    const resolvedPath = path.resolve(fullPath);
    const resolvedMusicDir = path.resolve(musicDir);

    if (!resolvedPath.startsWith(resolvedMusicDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(fullPath);

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      case '.ogg':
        contentType = 'audio/ogg';
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error serving audio file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
