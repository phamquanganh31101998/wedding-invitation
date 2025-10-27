import { NextRequest, NextResponse } from 'next/server';
import { getTenantConfig } from '@/utils/csv';
import { validateTenantId } from '@/utils/tenant';

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

    const tenantId = tenantValidation.tenantId!;

    // Get tenant configuration
    const config = await getTenantConfig(tenantId);

    if (!config) {
      return NextResponse.json(
        {
          error: 'Tenant configuration not found',
          details: `Configuration file not found for tenant '${tenantId}'`,
        },
        { status: 404 }
      );
    }

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
