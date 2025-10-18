import { NextRequest, NextResponse } from 'next/server';
import { writeRSVPData, readRSVPData } from '@/utils/csv';
import { RSVPData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validationErrors: string[] = [];

    if (
      !body.name ||
      typeof body.name !== 'string' ||
      body.name.trim().length === 0
    ) {
      validationErrors.push('Name is required');
    } else if (body.name.length < 2 || body.name.length > 50) {
      validationErrors.push('Name must be between 2 and 50 characters');
    }

    if (
      !body.relationship ||
      typeof body.relationship !== 'string' ||
      body.relationship.trim().length === 0
    ) {
      validationErrors.push('Relationship is required');
    } else if (body.relationship.length < 1 || body.relationship.length > 100) {
      validationErrors.push(
        'Relationship must be between 1 and 100 characters'
      );
    }

    if (!body.attendance || !['yes', 'no', 'maybe'].includes(body.attendance)) {
      validationErrors.push('Attendance must be one of: yes, no, maybe');
    }

    if (
      body.message &&
      (typeof body.message !== 'string' || body.message.length > 500)
    ) {
      validationErrors.push('Message must be no more than 500 characters');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const rsvpData: RSVPData = {
      id: Date.now().toString(),
      name: body.name.trim(),
      relationship: body.relationship.trim(),
      attendance: body.attendance,
      message: body.message ? body.message.trim() : '',
      submittedAt: new Date().toISOString(),
    };

    await writeRSVPData(rsvpData);

    return NextResponse.json(
      { message: 'RSVP submitted successfully', data: rsvpData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting RSVP:', error);

    // Handle specific CSV writing errors
    if (error instanceof Error) {
      if (
        error.message.includes('ENOENT') ||
        error.message.includes('permission')
      ) {
        return NextResponse.json(
          { error: 'Failed to save RSVP data - file system error' },
          { status: 500 }
        );
      }
    }

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
