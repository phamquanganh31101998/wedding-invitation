import { NextRequest, NextResponse } from 'next/server';
import { getGuestById } from '@/repositories/guest-repository';
import { getTenantBySlug } from '@/repositories/tenant-repository';
import { RSVPData } from '@/types';
import {
  guestIdValidationSchema,
  tenantSlugValidationSchema,
} from '../rsvp/validation';
import {
  handleApiError,
  InputSanitizer,
  handleGuestNotFoundError,
} from '@/utils/error-handling';
import { toCamelCase } from '@/utils/case-conversion';

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

    // Get tenant database ID from slug
    let tenantDbId = 1; // Default tenant database ID
    if (tenantParam) {
      const sanitizedTenantParam = InputSanitizer.sanitizeTenantId(tenantParam);

      // Validate tenant parameter format
      await tenantSlugValidationSchema.validate({
        tenantSlug: sanitizedTenantParam,
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

    // Transform database response (snake_case) to client format (camelCase)
    const guest: RSVPData = toCamelCase<RSVPData>(dbGuest);

    const response = {
      data: guest,
      ...(tenantParam && { tenant: tenantParam }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching guest data:', error);
    return handleApiError(error);
  }
}
