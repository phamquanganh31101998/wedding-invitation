import { NextRequest, NextResponse } from 'next/server';
import {
  createRSVP,
  getRSVPs,
  getRSVPById,
  updateRSVP,
} from '@/utils/database';
import { validateTenantId } from '@/utils/tenant';
import { RSVPData } from '@/types';

interface DatabaseRecord {
  [key: string]: unknown;
}
import {
  rsvpValidationSchema,
  tenantIdValidationSchema,
  guestIdValidationSchema,
} from './validation';
import { handleApiError, InputSanitizer } from '@/utils/error-handling';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');
    const guestParam = searchParams.get('guest');
    const body = await request.json();

    // Sanitize and validate tenant parameter
    let tenantId = 'default';
    if (tenantParam) {
      const sanitizedTenantParam = InputSanitizer.sanitizeTenantId(tenantParam);

      // Validate tenant parameter format
      await tenantIdValidationSchema.validate({
        tenantId: sanitizedTenantParam,
      });

      // Validate tenant exists and is active
      const tenantValidation = await validateTenantId(sanitizedTenantParam);
      if (!tenantValidation.isValid) {
        return NextResponse.json(
          {
            error: 'Invalid tenant',
            type: 'validation',
            details: tenantValidation.error,
          },
          { status: 400 }
        );
      }
      tenantId = tenantValidation.tenantId as string;
    }

    // Sanitize and validate guest ID if provided
    let guestId: string | null = null;
    if (guestParam) {
      const sanitizedGuestId = InputSanitizer.sanitizeNumericId(guestParam);
      if (!sanitizedGuestId) {
        return NextResponse.json(
          {
            error: 'Invalid guest ID',
            type: 'validation',
            details: 'Guest ID must be a valid positive number',
          },
          { status: 400 }
        );
      }

      // Validate guest ID format
      await guestIdValidationSchema.validate({
        id: sanitizedGuestId.toString(),
      });
      guestId = sanitizedGuestId.toString();
    }

    // Sanitize input data
    const sanitizedBody = {
      name: InputSanitizer.sanitizeString(body.name || ''),
      relationship: InputSanitizer.sanitizeString(body.relationship || ''),
      attendance: body.attendance,
      message: InputSanitizer.sanitizeMessage(body.message || ''),
    };

    // Validate sanitized request body
    const validatedData = await rsvpValidationSchema.validate(sanitizedBody, {
      abortEarly: false,
      stripUnknown: true,
    });

    let dbRsvp: DatabaseRecord;
    let isUpdate = false;

    // Determine if this is create or update operation
    if (guestId) {
      // Check if guest exists
      const existingGuest = await getRSVPById(tenantId, guestId);

      if (existingGuest) {
        // Case: Update existing guest
        dbRsvp = await updateRSVP(tenantId, guestId, {
          name: validatedData.name,
          relationship: validatedData.relationship,
          attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
          message: validatedData.message || undefined,
        });
        isUpdate = true;
      } else {
        // Case: Guest ID provided but guest not found -> Create new
        dbRsvp = await createRSVP({
          tenantId,
          name: validatedData.name,
          relationship: validatedData.relationship,
          attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
          message: validatedData.message || undefined,
        });
      }
    } else {
      // Case: No guest ID provided -> Create new
      dbRsvp = await createRSVP({
        tenantId,
        name: validatedData.name,
        relationship: validatedData.relationship,
        attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
        message: validatedData.message || undefined,
      });
    }

    // Transform database response to match frontend expectations
    const rsvpData: RSVPData = {
      id: (dbRsvp.id as number).toString(),
      name: dbRsvp.name as string,
      relationship: dbRsvp.relationship as string,
      attendance: dbRsvp.attendance as 'yes' | 'no' | 'maybe',
      message: (dbRsvp.message as string) || '',
      submittedAt: dbRsvp.submitted_at as string,
    };

    const response = {
      message: isUpdate
        ? 'RSVP updated successfully'
        : 'RSVP submitted successfully',
      data: rsvpData,
      ...(tenantParam && { tenant: tenantId }),
    };

    return NextResponse.json(response, { status: isUpdate ? 200 : 201 });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');

    // Sanitize and validate tenant parameter
    let tenantId = 'default';
    if (tenantParam) {
      const sanitizedTenantParam = InputSanitizer.sanitizeTenantId(tenantParam);

      // Validate tenant parameter format
      await tenantIdValidationSchema.validate({
        tenantId: sanitizedTenantParam,
      });

      // Validate tenant exists and is active
      const tenantValidation = await validateTenantId(sanitizedTenantParam);
      if (!tenantValidation.isValid) {
        return NextResponse.json(
          {
            error: 'Invalid tenant',
            type: 'validation',
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
    const rsvpData: RSVPData[] = (dbRsvps as DatabaseRecord[]).map(
      (dbRsvp) => ({
        id: (dbRsvp.id as number).toString(),
        name: dbRsvp.name as string,
        relationship: dbRsvp.relationship as string,
        attendance: dbRsvp.attendance as 'yes' | 'no' | 'maybe',
        message: (dbRsvp.message as string) || '',
        submittedAt: dbRsvp.submitted_at as string,
      })
    );

    const response = {
      data: rsvpData,
      count: rsvpData.length,
      ...(tenantParam && { tenant: tenantId }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error reading RSVP data:', error);
    return handleApiError(error);
  }
}
