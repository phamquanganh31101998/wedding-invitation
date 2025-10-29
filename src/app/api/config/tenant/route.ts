import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySlug } from '@/utils/database';
import { TenantConfig } from '@/types';
import { tenantIdValidationSchema } from '../../rsvp/validation';
import {
  handleApiError,
  InputSanitizer,
  handleTenantError,
} from '@/utils/error-handling';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');

    if (!tenantParam) {
      return NextResponse.json(
        {
          error: 'Tenant parameter is required',
          type: 'validation',
          details: 'Tenant ID must be provided',
        },
        { status: 400 }
      );
    }

    // Sanitize and validate tenant parameter
    const sanitizedTenantParam = InputSanitizer.sanitizeTenantId(tenantParam);

    // Validate tenant parameter format
    await tenantIdValidationSchema.validate({ tenantId: sanitizedTenantParam });

    // Get tenant configuration from database
    const dbTenant = await getTenantBySlug(sanitizedTenantParam);

    if (!dbTenant || !dbTenant.is_active) {
      const tenantError = handleTenantError(
        sanitizedTenantParam,
        `Tenant '${sanitizedTenantParam}' not found or inactive in database`
      );
      return NextResponse.json(
        {
          error: tenantError.message,
          type: tenantError.type,
          code: tenantError.code,
          details: tenantError.details,
        },
        { status: tenantError.statusCode }
      );
    }

    // Transform database response to match frontend expectations
    const config: TenantConfig = {
      id: dbTenant.id as number,
      slug: dbTenant.slug as string,
      brideName: dbTenant.bride_name as string,
      groomName: dbTenant.groom_name as string,
      weddingDate: dbTenant.wedding_date as string,
      venue: {
        name: dbTenant.venue_name as string,
        address: dbTenant.venue_address as string,
        mapLink:
          (dbTenant.venue_map_link as string) || 'https://maps.google.com',
      },
      theme: {
        primaryColor: dbTenant.theme_primary_color as string,
        secondaryColor: dbTenant.theme_secondary_color as string,
      },
      isActive: dbTenant.is_active as boolean,
      createdAt: dbTenant.created_at as string,
      updatedAt: dbTenant.updated_at as string,
    };

    // Return read-only configuration data
    return NextResponse.json({
      data: config,
      tenant: sanitizedTenantParam,
    });
  } catch (error) {
    console.error('Error reading tenant configuration:', error);
    return handleApiError(error);
  }
}

// Explicitly disable other HTTP methods to ensure read-only access
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Configuration is read-only.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Configuration is read-only.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Configuration is read-only.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. Configuration is read-only.' },
    { status: 405 }
  );
}
