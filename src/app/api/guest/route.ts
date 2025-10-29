import { NextRequest, NextResponse } from 'next/server';
import { getGuestById } from '@/utils/database';
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
    let tenantSlug = 'default';
    let tenantDbId = 1; // Default tenant database ID
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
      tenantSlug = sanitizedTenantParam;
      tenantDbId = tenantValidation.tenantId as number;
    }

    // Get specific guest by ID and tenant from database
    const dbGuest = await getGuestById(tenantDbId, sanitizedId);

    if (!dbGuest) {
      const guestError = handleGuestNotFoundError(sanitizedId);
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
      id: dbGuest.id as number,
      name: dbGuest.name as string,
      relationship: dbGuest.relationship as string,
      attendance: dbGuest.attendance as 'yes' | 'no' | 'maybe',
      message: (dbGuest.message as string) || '',
      submittedAt: dbGuest.submitted_at as string,
    };

    const response = {
      data: guest,
      ...(tenantParam && { tenant: tenantSlug }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching guest data:', error);
    return handleApiError(error);
  }
}
