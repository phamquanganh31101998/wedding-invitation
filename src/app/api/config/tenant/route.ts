import { NextRequest, NextResponse } from 'next/server';
import { getTenant } from '@/utils/database';
import { validateTenantId } from '@/utils/tenant';
import { DatabaseTenant, TenantConfig } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');

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

    const tenantId = tenantValidation.tenantId as string;

    // Get tenant configuration from database
    const dbTenant = await getTenant(tenantId);

    if (!dbTenant) {
      return NextResponse.json(
        {
          error: 'Tenant configuration not found',
          details: `Tenant '${tenantId}' not found in database`,
        },
        { status: 404 }
      );
    }

    // Transform database response to match frontend expectations
    const config: TenantConfig = {
      id: dbTenant.id,
      brideName: dbTenant.bride_name,
      groomName: dbTenant.groom_name,
      weddingDate: dbTenant.wedding_date,
      venue: {
        name: dbTenant.venue_name,
        address: dbTenant.venue_address,
        mapLink: dbTenant.venue_map_link || 'https://maps.google.com',
      },
      theme: {
        primaryColor: dbTenant.theme_primary_color,
        secondaryColor: dbTenant.theme_secondary_color,
      },
      isActive: dbTenant.is_active,
      createdAt: dbTenant.created_at,
      updatedAt: dbTenant.updated_at,
    };

    // Return read-only configuration data
    return NextResponse.json({
      data: config,
      tenant: tenantId,
    });
  } catch (error) {
    console.error('Error reading tenant configuration:', error);

    if (error instanceof Error) {
      // Handle specific configuration errors
      if (error.message.includes('Invalid JSON')) {
        return NextResponse.json(
          {
            error: 'Invalid configuration format',
            details: error.message,
          },
          { status: 500 }
        );
      }

      if (error.message.includes('missing required fields')) {
        return NextResponse.json(
          {
            error: 'Invalid configuration data',
            details: error.message,
          },
          { status: 500 }
        );
      }

      if (error.message.includes('tenant')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to read tenant configuration' },
      { status: 500 }
    );
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
