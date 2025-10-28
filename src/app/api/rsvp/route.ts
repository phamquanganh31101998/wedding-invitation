import { NextRequest, NextResponse } from 'next/server';
import { createRSVP, getRSVPs } from '@/utils/database';
import { validateTenantId } from '@/utils/tenant';
import { RSVPData } from '@/types';

interface DatabaseRecord {
  [key: string]: unknown;
}
import { rsvpValidationSchema, tenantIdValidationSchema } from './validation';
import { handleApiError, InputSanitizer } from '@/utils/error-handling';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');
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
      id: (dbRsvp.id as number).toString(),
      name: dbRsvp.name as string,
      relationship: dbRsvp.relationship as string,
      attendance: dbRsvp.attendance as 'yes' | 'no' | 'maybe',
      message: (dbRsvp.message as string) || '',
      submittedAt: dbRsvp.submitted_at as string,
    };

    const response = {
      message: 'RSVP submitted successfully',
      data: rsvpData,
      ...(tenantParam && { tenant: tenantId }),
    };

    return NextResponse.json(response, { status: 201 });
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
