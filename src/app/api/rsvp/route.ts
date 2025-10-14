import { NextRequest, NextResponse } from 'next/server';
import { writeRSVPData, readRSVPData } from '@/utils/csv';
import { RSVPData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rsvpData: RSVPData = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      attendance: body.attendance,
      guestCount: parseInt(body.guestCount) || 1,
      message: body.message || '',
      submittedAt: new Date().toISOString(),
    };

    await writeRSVPData(rsvpData);

    return NextResponse.json(
      { message: 'RSVP submitted successfully', data: rsvpData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to submit RSVP' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rsvpData = await readRSVPData();
    return NextResponse.json({ data: rsvpData });
  } catch (error) {
    console.error('Error reading RSVP data:', error);
    return NextResponse.json(
      { error: 'Failed to read RSVP data' },
      { status: 500 }
    );
  }
}
