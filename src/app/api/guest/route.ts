import { NextRequest, NextResponse } from 'next/server';
import { readRSVPData, readTenantRSVPData } from '@/utils/csv';
import { validateTenantId } from '@/utils/tenant';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const tenantParam = searchParams.get('tenant');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    let rsvpData;
    let tenantId: string | null = null;

    // Check if tenant parameter is provided
    if (tenantParam) {
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
      tenantId = tenantValidation.tenantId as string;
      rsvpData = await readTenantRSVPData(tenantId);
    } else {
      rsvpData = await readRSVPData();
    }

    const guest = rsvpData.find((record) => record.id === id);

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const response = {
      data: guest,
      ...(tenantId && { tenant: tenantId }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching guest data:', error);

    if (error instanceof Error && error.message.includes('tenant')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch guest data' },
      { status: 500 }
    );
  }
}
