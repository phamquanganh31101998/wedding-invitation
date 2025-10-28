import { NextRequest, NextResponse } from 'next/server';
import { validateTenantId } from '@/utils/tenant';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');

    if (!tenantParam) {
      return NextResponse.json(
        {
          error: 'Tenant ID is required',
          details: 'Please provide a tenant parameter in the query string',
        },
        { status: 400 }
      );
    }

    // Validate tenant ID
    const validation = await validateTenantId(tenantParam);

    return NextResponse.json({
      isValid: validation.isValid,
      tenantId: validation.tenantId,
      error: validation.error,
    });
  } catch (error) {
    console.error('Error validating tenant:', error);

    return NextResponse.json(
      {
        isValid: false,
        error: 'Failed to validate tenant',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Explicitly disable other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for tenant validation.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for tenant validation.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for tenant validation.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for tenant validation.' },
    { status: 405 }
  );
}
