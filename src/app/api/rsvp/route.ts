import { NextRequest, NextResponse } from 'next/server';
import { writeRSVPData, readRSVPData } from '@/utils/csv';
import { RSVPData } from '@/types';
import * as yup from 'yup';

import { rsvpValidationSchema } from './validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body using Yup
    const validatedData = await rsvpValidationSchema.validate(body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
    });

    const rsvpData: RSVPData = {
      id: Date.now().toString(),
      name: validatedData.name,
      relationship: validatedData.relationship,
      attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
      message: validatedData.message || '',
      submittedAt: new Date().toISOString(),
    };

    await writeRSVPData(rsvpData);

    return NextResponse.json(
      { message: 'RSVP submitted successfully', data: rsvpData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting RSVP:', error);

    // Handle Yup validation errors
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

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
