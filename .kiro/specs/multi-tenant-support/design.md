# Multi-Tenant Support Design Document

## Overview

This design transforms the existing single-tenant wedding invitation website into a multi-tenant platform that can serve multiple couples simultaneously. The solution uses a path-based tenant identification approach (e.g., `/couple-name/`) and implements tenant isolation at the data storage and application levels while maintaining the existing CSV-based storage approach.

## Architecture

### Tenant Identification Strategy

**Path-Based Routing**: Use URL path segments to identify tenants

- Format: `/{tenant-id}/`
- Examples: `/john-jane`, `/smith-wedding`
- Fallback: Root path `/` serves a default tenant

**Benefits of Path-Based Approach**:

- Simple implementation with Next.js App Router
- No DNS configuration required
- Easy to test and develop locally
- SEO-friendly URLs

### Multi-Tenant Data Isolation

**Tenant-Specific Data Storage**:

- Current: Single `data/rsvp.csv` file
- New: `data/{tenant-id}/rsvp.csv` per tenant
- Directory structure: `data/{tenant-id}/` contains all tenant data

**Tenant Configuration**:

- Static configuration files: `data/{tenant-id}/config.json`
- Contains wedding details, customization settings, and metadata
- Hardcoded settings as per requirements (no dashboard needed)

## Components and Interfaces

### 1. Tenant Context System

**TenantProvider Component**:

```typescript
interface TenantContext {
  tenantId: string | null;
  config: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}

interface TenantConfig {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: {
    name: string;
    address: string;
    mapLink: string;
  };
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
  isActive: boolean;
}
```

**Tenant Hook**:

```typescript
const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
```

### 2. Tenant-Aware Routing

**Dynamic Route Structure**:

- `src/app/[tenant]/page.tsx` - Tenant home page
- `src/app/page.tsx` - Default/landing page

**Tenant Middleware**:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const tenantId = extractTenantFromPath(pathname);

  if (tenantId) {
    // Validate tenant exists
    // Add tenant context to headers
  }
}
```

### 3. Tenant-Aware Data Layer

**Enhanced CSV Utilities**:

```typescript
interface TenantAwareCSVOperations {
  readRSVPData(tenantId: string): Promise<RSVPData[]>;
  writeRSVPData(tenantId: string, data: RSVPData): Promise<void>;
  getTenantConfig(tenantId: string): Promise<TenantConfig>;
  validateTenantExists(tenantId: string): Promise<boolean>;
}
```

**Tenant Data Directory Structure**:

```
data/
├── john-jane/
│   ├── config.json
│   ├── rsvp.csv
│   └── assets/ (optional)
├── smith-wedding/
│   ├── config.json
│   ├── rsvp.csv
│   └── assets/
└── default/
    ├── config.json
    └── rsvp.csv
```

### 4. API Route Updates

**Tenant-Aware API Routes**:

- `src/app/api/rsvp/route.ts` - Tenant-specific RSVP operations, detect tenant by tenant param
- `src/app/api/config/route.ts` - Tenant configuration (read-only), detect tenant by tenant param

**API Route Pattern**:

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  const tenantId = params.tenant;

  // Validate tenant exists
  if (!(await validateTenantExists(tenantId))) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Process with tenant context
  const rsvpData = await request.json();
  await writeRSVPData(tenantId, rsvpData);
}
```

## Data Models

### Enhanced Types

```typescript
// Extended existing types
export interface TenantConfig {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: {
    name: string;
    address: string;
    mapLink: string;
  };
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantRSVPData extends RSVPData {
  tenantId: string; // Add tenant context to RSVP data
}

export interface TenantContextType {
  tenantId: string | null;
  config: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}
```

### Configuration File Format

```json
{
  "id": "john-jane",
  "brideName": "Jane Smith",
  "groomName": "John Doe",
  "weddingDate": "2025-12-29",
  "venue": {
    "name": "Grand Ballroom",
    "address": "123 Wedding St, City, State",
    "mapLink": "abcd"
  },
  "theme": {
    "primaryColor": "#D69E2E",
    "secondaryColor": "#2D3748"
  },
  "isActive": true,
  "createdAt": "2025-10-27T00:00:00Z",
  "updatedAt": "2025-10-27T00:00:00Z"
}
```

## Error Handling

### Tenant Validation

**Tenant Not Found**:

- Display custom 404 page with tenant context
- Suggest valid tenant URLs if applicable
- Log invalid tenant access attempts

**Configuration Errors**:

- Graceful fallback to default values
- Error boundary components for tenant-specific failures
- Detailed error logging for debugging

**Data Isolation Failures**:

- Prevent cross-tenant data leakage
- Validate tenant context in all data operations
- Fail securely if tenant validation fails

### Error Boundary Strategy

```typescript
interface TenantErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  tenantId: string | null;
}

class TenantErrorBoundary extends Component<Props, TenantErrorBoundaryState> {
  // Handle tenant-specific errors
  // Provide fallback UI with tenant context
  // Log errors with tenant information
}
```

## Testing Strategy

### Unit Testing

**Tenant Context Testing**:

- Test tenant identification from URLs
- Validate tenant configuration loading
- Test tenant data isolation

**Data Layer Testing**:

- Test tenant-specific CSV operations
- Validate cross-tenant data isolation
- Test error handling for invalid tenants

### Integration Testing

**Multi-Tenant Scenarios**:

- Test multiple tenants accessing simultaneously
- Validate RSVP data isolation between tenants
- Test tenant-specific configuration loading

**API Route Testing**:

- Test tenant-aware API endpoints
- Validate tenant parameter extraction
- Test error responses for invalid tenants

### End-to-End Testing

**User Journey Testing**:

- Test complete guest RSVP flow per tenant
- Validate tenant-specific content display
- Test error scenarios (invalid tenant URLs)

**Performance Testing**:

- Test concurrent access by multiple tenants
- Validate response times with multiple tenant data
- Test file system performance with tenant directories

## Performance Considerations

### Caching Strategy

**Tenant Configuration Caching**:

- Cache tenant configs in memory
- Implement cache invalidation strategy
- Use Next.js built-in caching where possible

**Data Access Optimization**:

- Minimize file system operations
- Implement efficient tenant validation
- Use streaming for large CSV files if needed

### Scalability

**File System Limits**:

- Monitor tenant directory count
- Implement archiving strategy for inactive tenants
- Consider database migration path for future scaling

**Memory Management**:

- Limit concurrent tenant context loading
- Implement tenant data cleanup strategies
- Monitor memory usage with multiple tenants

## Security Considerations

### Tenant Isolation

**Data Access Control**:

- Validate tenant context in all operations
- Prevent path traversal attacks
- Sanitize tenant identifiers

**File System Security**:

- Restrict file access to tenant directories
- Validate file paths and names
- Implement proper error handling without information leakage

### Input Validation

**Tenant ID Validation**:

- Whitelist allowed characters in tenant IDs
- Prevent special characters and path traversal
- Implement length limits and format validation

**Configuration Validation**:

- Validate tenant configuration file format
- Sanitize configuration values
- Implement schema validation for config files
