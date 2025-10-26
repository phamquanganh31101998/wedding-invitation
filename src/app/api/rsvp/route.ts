import { NextRequest, NextResponse } from 'next/server';
import {
  writeRSVPData,
  readRSVPData,
  getNextRSVPId,
  findRSVPById,
  updateRSVPData,
} from '@/utils/csv';
import { RSVPData } from '@/types';
import * as yup from 'yup';

import { rsvpValidationSchema } from './validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('id');

    // Validate request body using Yup
    const validatedData = await rsvpValidationSchema.validate(body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
    });

    let rsvpData: RSVPData;
    let isUpdate = false;

    if (guestId) {
      // Check if guest exists
      const existingGuest = await findRSVPById(guestId);

      if (existingGuest) {
        // Update existing record
        rsvpData = {
          ...existingGuest,
          name: validatedData.name,
          relationship: validatedData.relationship,
          attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
          message: validatedData.message || '',
          submittedAt: new Date().toISOString(),
        };

        await updateRSVPData(rsvpData);
        isUpdate = true;
      } else {
        const nextId = await getNextRSVPId();
        // Create new record with specified ID
        rsvpData = {
          id: nextId,
          name: validatedData.name,
          relationship: validatedData.relationship,
          attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
          message: validatedData.message || '',
          submittedAt: new Date().toISOString(),
        };

        await writeRSVPData(rsvpData);
      }
    } else {
      // Create new record with auto-generated ID
      const nextId = await getNextRSVPId();

      rsvpData = {
        id: nextId,
        name: validatedData.name,
        relationship: validatedData.relationship,
        attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
        message: validatedData.message || '',
        submittedAt: new Date().toISOString(),
      };

      await writeRSVPData(rsvpData);
    }

    return NextResponse.json(
      {
        message: isUpdate
          ? 'RSVP updated successfully'
          : 'RSVP submitted successfully',
        data: rsvpData,
      },
      { status: isUpdate ? 200 : 201 }
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
