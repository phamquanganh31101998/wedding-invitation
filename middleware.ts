import { NextRequest, NextResponse } from 'next/server';
import { extractTenantFromRequest, validateTenantId } from '@/utils/tenant';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract tenant ID from the request URL
  const tenantId = extractTenantFromRequest(request.url);

  // If no tenant ID in path, allow request to proceed (default tenant)
  if (!tenantId) {
    return NextResponse.next();
  }

  try {
    // Validate the tenant ID
    const validation = await validateTenantId(tenantId);

    if (validation.isValid) {
      // Tenant is valid, allow request to proceed
      const response = NextResponse.next();

      // Add tenant ID to headers for use in components
      response.headers.set('x-tenant-id', tenantId);

      return response;
    } else {
      // Invalid tenant - redirect to error page or show not found
      console.warn(
        `Invalid tenant access attempt: ${tenantId}`,
        validation.error
      );

      // Create a URL for the tenant error page
      const errorUrl = new URL(`/tenant-error`, request.url);
      errorUrl.searchParams.set('tenant', tenantId);
      errorUrl.searchParams.set(
        'error',
        validation.error || 'Tenant not found'
      );

      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    // Error during validation - log and allow request to proceed
    // This prevents the middleware from breaking the entire site
    console.error('Error in tenant validation middleware:', error);

    // Optionally redirect to a generic error page
    const errorUrl = new URL(`/tenant-error`, request.url);
    errorUrl.searchParams.set('tenant', tenantId);
    errorUrl.searchParams.set('error', 'System error during tenant validation');

    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
  runtime: 'nodejs',
};
