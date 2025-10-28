import { NextRequest, NextResponse } from 'next/server';
import { getRSVPById } from '@/utils/database';
import { validateTenantId } from '@/utils/tenant';
import { RSVPData } from '@/types';
import {
  guestIdValidationSchema,
  tenantIdValidationSchema,
} from '../rsvp/validation';
import {
  handleApiError,
  InputSanitizer,
  handleGuestNotFoundError,
} from '@/utils/error-handling';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const tenantParam = searchParams.get('tenant');

    // Validate guest ID parameter
    if (!id) {
      return NextResponse.json(
        {
          error: 'ID parameter is required',
          type: 'validation',
          details: 'Guest ID must be provided',
        },
        { status: 400 }
      );
    }

    // Sanitize and validate guest ID
    const sanitizedId = InputSanitizer.sanitizeNumericId(id);
    if (!sanitizedId) {
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
    await guestIdValidationSchema.validate({ id: sanitizedId.toString() });

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

    // Get specific RSVP by ID and tenant from database
    const dbRsvp = await getRSVPById(tenantId, sanitizedId.toString());

    if (!dbRsvp) {
      const guestError = handleGuestNotFoundError(sanitizedId.toString());
      return NextResponse.json(
        {
          error: guestError.message,
          type: guestError.type,
          code: guestError.code,
          details: guestError.details,
        },
        { status: guestError.statusCode }
      );
    }

    // Transform database response to match frontend expectations
    const guest: RSVPData = {
      id: (dbRsvp.id as number).toString(),
      name: dbRsvp.name as string,
      relationship: dbRsvp.relationship as string,
      attendance: dbRsvp.attendance as 'yes' | 'no' | 'maybe',
      message: (dbRsvp.message as string) || '',
      submittedAt: dbRsvp.submitted_at as string,
    };

    const response = {
      data: guest,
      ...(tenantParam && { tenant: tenantId }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching guest data:', error);
    return handleApiError(error);
  }
}
