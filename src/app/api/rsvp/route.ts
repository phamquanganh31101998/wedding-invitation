import { NextRequest, NextResponse } from 'next/server';
import {
  writeRSVPData,
  readRSVPData,
  getNextRSVPId,
  findRSVPById,
  updateRSVPData,
  writeTenantRSVPData,
  readTenantRSVPData,
  getTenantNextRSVPId,
  findTenantRSVPById,
  updateTenantRSVPData,
} from '@/utils/csv';
import { validateTenantId } from '@/utils/tenant';
import { RSVPData } from '@/types';
import * as yup from 'yup';

import { rsvpValidationSchema } from './validation';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');
    const guestId = searchParams.get('id');
    const body = await request.json();

    // Validate request body using Yup
    const validatedData = await rsvpValidationSchema.validate(body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
    });

    let rsvpData: RSVPData;
    let isUpdate = false;
    let tenantId: string | null = null;

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

    if (guestId) {
      // Check if guest exists
      const existingGuest = tenantId
        ? await findTenantRSVPById(tenantId, guestId)
        : await findRSVPById(guestId);

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

        if (tenantId) {
          await updateTenantRSVPData(tenantId, rsvpData);
        } else {
          await updateRSVPData(rsvpData);
        }
        isUpdate = true;
      } else {
        const nextId = tenantId
          ? await getTenantNextRSVPId(tenantId)
          : await getNextRSVPId();

        // Create new record with specified ID
        rsvpData = {
          id: nextId,
          name: validatedData.name,
          relationship: validatedData.relationship,
          attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
          message: validatedData.message || '',
          submittedAt: new Date().toISOString(),
        };

        if (tenantId) {
          await writeTenantRSVPData(tenantId, rsvpData);
        } else {
          await writeRSVPData(rsvpData);
        }
      }
    } else {
      // Create new record with auto-generated ID
      const nextId = tenantId
        ? await getTenantNextRSVPId(tenantId)
        : await getNextRSVPId();

      rsvpData = {
        id: nextId,
        name: validatedData.name,
        relationship: validatedData.relationship,
        attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
        message: validatedData.message || '',
        submittedAt: new Date().toISOString(),
      };

      if (tenantId) {
        await writeTenantRSVPData(tenantId, rsvpData);
      } else {
        await writeRSVPData(rsvpData);
      }
    }

    const response = {
      message: isUpdate
        ? 'RSVP updated successfully'
        : 'RSVP submitted successfully',
      data: rsvpData,
      ...(tenantId && { tenant: tenantId }),
    };

    return NextResponse.json(response, { status: isUpdate ? 200 : 201 });
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

      if (error.message.includes('tenant')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
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

    let rsvpData;
    let tenantId: string | null = null;

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
      rsvpData = await readTenantRSVPData(tenantId);
    } else {
      rsvpData = await readRSVPData();
    }

    const response = {
      data: rsvpData,
      count: rsvpData.length,
      ...(tenantId && { tenant: tenantId }),
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
