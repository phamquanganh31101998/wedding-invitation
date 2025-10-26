import { NextRequest, NextResponse } from 'next/server';
import { readRSVPData } from '@/utils/csv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const rsvpData = await readRSVPData();
    const guest = rsvpData.find((record) => record.id === id);

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ data: guest });
  } catch (error) {
    console.error('Error fetching guest data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest data' },
      { status: 500 }
    );
  }
}
