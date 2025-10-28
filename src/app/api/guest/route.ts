import { NextRequest, NextResponse } from 'next/server';
import { getRSVPById } from '@/utils/database';
import { validateTenantId } from '@/utils/tenant';
import { RSVPData } from '@/types';

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

    let tenantId = 'default'; // Default tenant

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
    }

    // Get specific RSVP by ID and tenant from database
    const dbRsvp = await getRSVPById(tenantId, id);

    if (!dbRsvp) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Transform database response to match frontend expectations
    const guest: RSVPData = {
      id: dbRsvp.id.toString(),
      name: dbRsvp.name,
      relationship: dbRsvp.relationship,
      attendance: dbRsvp.attendance,
      message: dbRsvp.message || '',
      submittedAt: dbRsvp.submitted_at,
    };

    const response = {
      data: guest,
      ...(tenantParam && { tenant: tenantId }),
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
