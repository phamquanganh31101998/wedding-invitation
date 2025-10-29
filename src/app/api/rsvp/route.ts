import { NextRequest, NextResponse } from 'next/server';
import {
  createGuest,
  getGuestById,
  updateGuest,
  getTenantBySlug,
} from '@/utils/database';
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

    // Get tenant database ID from slug
    let tenantDbId = 1; // Default tenant database ID
    if (tenantParam) {
      const sanitizedTenantParam = InputSanitizer.sanitizeTenantId(tenantParam);

      // Validate tenant parameter format
      await tenantIdValidationSchema.validate({
        tenantId: sanitizedTenantParam,
      });

      // Get tenant by slug to get database ID
      const tenant = await getTenantBySlug(sanitizedTenantParam);
      if (!tenant || !tenant.is_active) {
        return NextResponse.json(
          {
            error: 'Invalid tenant',
            type: 'validation',
            details: `Tenant '${sanitizedTenantParam}' not found or inactive.`,
          },
          { status: 400 }
        );
      }
      tenantDbId = tenant.id as number;
    }

    // Sanitize and validate guest ID if provided
    let guestId: number | null = null;
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
      guestId = sanitizedGuestId;
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
      const existingGuest = await getGuestById(tenantDbId, guestId);

      if (existingGuest) {
        // Case: Update existing guest
        dbRsvp = await updateGuest(tenantDbId, guestId, {
          name: validatedData.name,
          relationship: validatedData.relationship,
          attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
          message: validatedData.message || undefined,
        });
        isUpdate = true;
      } else {
        // Case: Guest ID provided but guest not found -> Create new
        dbRsvp = await createGuest({
          tenantId: tenantDbId,
          name: validatedData.name,
          relationship: validatedData.relationship,
          attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
          message: validatedData.message || undefined,
        });
      }
    } else {
      // Case: No guest ID provided -> Create new
      dbRsvp = await createGuest({
        tenantId: tenantDbId,
        name: validatedData.name,
        relationship: validatedData.relationship,
        attendance: validatedData.attendance as 'yes' | 'no' | 'maybe',
        message: validatedData.message || undefined,
      });
    }

    // Transform database response to match frontend expectations
    const rsvpData: RSVPData = {
      id: dbRsvp.id as number,
      name: dbRsvp.name as string,
      relationship: dbRsvp.relationship as string,
      attendance: dbRsvp.attendance as 'yes' | 'no' | 'maybe',
      message: (dbRsvp.message as string) || '',
    };

    const response = {
      message: isUpdate
        ? 'RSVP updated successfully'
        : 'RSVP submitted successfully',
      data: rsvpData,
      ...(tenantParam && { tenant: tenantParam }),
    };

    return NextResponse.json(response, { status: isUpdate ? 200 : 201 });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return handleApiError(error);
  }
}
