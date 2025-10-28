import { NextRequest, NextResponse } from 'next/server';
import { createRSVP, getRSVPs, getTenant } from '@/utils/database';
import { validateTenantId } from '@/utils/tenant';
import { RSVPData, DatabaseRSVP } from '@/types';
import * as yup from 'yup';

import { rsvpValidationSchema } from './validation';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');
    const body = await request.json();

    // Validate request body using Yup
    const validatedData = await rsvpValidationSchema.validate(body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
    });

    let tenantId = 'default'; // Default tenant

    // Check if tenant parameter is provided
    if (tenantParam) {
      // Validate tenant parameter
      const tenantValidation = await validateTenantId(tenantParam);
      if (!tenantValidation.isValid) {
        return NextResponse.json(
          {
            error: 'Invalid tenant',
            details: tenantValidation.error,
          },
          { status: 400 }
        );
      }
      tenantId = tenantValidation.tenantId as string;
    }

    // Create new RSVP record in database
    const dbRsvp = await createRSVP({
      tenantId,
      name: validatedData.name,
      relationship: validatedData.relationship,
      attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
      message: validatedData.message || undefined,
    });

    // Transform database response to match frontend expectations
    const rsvpData: RSVPData = {
      id: dbRsvp.id.toString(),
      name: dbRsvp.name,
      relationship: dbRsvp.relationship,
      attendance: dbRsvp.attendance,
      message: dbRsvp.message || '',
      submittedAt: dbRsvp.submitted_at,
    };

    const response = {
      message: 'RSVP submitted successfully',
      data: rsvpData,
      ...(tenantParam && { tenant: tenantId }),
    };

    return NextResponse.json(response, { status: 201 });
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

    // Handle database errors
    if (error instanceof Error) {
      if (error.message.includes('tenant')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error.message.includes('Database')) {
        return NextResponse.json(
          { error: 'Failed to save RSVP data - database error' },
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');

    let tenantId = 'default'; // Default tenant

    // Check if tenant parameter is provided
    if (tenantParam) {
      // Validate tenant parameter
      const tenantValidation = await validateTenantId(tenantParam);
      if (!tenantValidation.isValid) {
        return NextResponse.json(
          {
            error: 'Invalid tenant',
            details: tenantValidation.error,
          },
          { status: 400 }
        );
      }
      tenantId = tenantValidation.tenantId as string;
    }

    // Get RSVPs from database
    const dbRsvps = await getRSVPs(tenantId);

    // Transform database response to match frontend expectations
    const rsvpData: RSVPData[] = dbRsvps.map((dbRsvp: DatabaseRSVP) => ({
      id: dbRsvp.id.toString(),
      name: dbRsvp.name,
      relationship: dbRsvp.relationship,
      attendance: dbRsvp.attendance,
      message: dbRsvp.message || '',
      submittedAt: dbRsvp.submitted_at,
    }));

    const response = {
      data: rsvpData,
      count: rsvpData.length,
      ...(tenantParam && { tenant: tenantId }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error reading RSVP data:', error);

    if (error instanceof Error && error.message.includes('tenant')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to read RSVP data' },
      { status: 500 }
    );
  }
}
