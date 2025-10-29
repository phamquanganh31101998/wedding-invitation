import { NextRequest, NextResponse } from 'next/server';
import { validateTenantSlug } from '@/utils/tenant';

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

    // Validate tenant slug
    const validation = await validateTenantSlug(tenantParam);

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
