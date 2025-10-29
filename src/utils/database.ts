import { neon } from '@neondatabase/serverless';

// Type definitions for database results
interface DatabaseRecord {
  [key: string]: unknown;
}

// Initialize Neon database connection
let sql: ReturnType<typeof neon> | null = null;

// Initialize connection only when DATABASE_URL is available
if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
}

// Auto-initialize flag to ensure tables are created
let isInitialized = false;

// Helper function to ensure database connection is available
function ensureDatabaseConnection() {
  if (!sql) {
    throw new Error(
      'Database connection not available. Please check DATABASE_URL environment variable.'
    );
  }
  return sql;
}

// Initialize database tables automatically
async function ensureInitialized() {
  if (isInitialized) return;

  const db = ensureDatabaseConnection();

  try {
    // Create tenants table
    await db`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) UNIQUE NOT NULL,
        bride_name VARCHAR(100) NOT NULL,
        groom_name VARCHAR(100) NOT NULL,
        wedding_date DATE NOT NULL,
        venue_name VARCHAR(200) NOT NULL,
        venue_address TEXT NOT NULL,
        venue_map_link TEXT,
        theme_primary_color VARCHAR(7) DEFAULT '#E53E3E',
        theme_secondary_color VARCHAR(7) DEFAULT '#FED7D7',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create guests table
    await db`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        relationship VARCHAR(50) NOT NULL,
        attendance VARCHAR(10) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign key constraint
        CONSTRAINT guests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        
        -- Check constraint for attendance values
        CONSTRAINT guests_attendance_check CHECK (attendance IN ('yes', 'no', 'maybe'))
      )
    `;

    // Create indexes for better performance
    await db`CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants USING BTREE (is_active)`;
    await db`CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON tenants USING BTREE (slug)`;
    await db`CREATE UNIQUE INDEX IF NOT EXISTS tenants_pkey ON tenants USING BTREE (id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_guests_attendance ON guests USING BTREE (attendance)`;
    await db`CREATE INDEX IF NOT EXISTS idx_guests_tenant_id ON guests USING BTREE (tenant_id)`;
    await db`CREATE UNIQUE INDEX IF NOT EXISTS guests_pkey ON guests USING BTREE (id)`;

    // Ensure default tenant exists
    await ensureDefaultTenant();

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }
}

// Ensure default tenant exists
async function ensureDefaultTenant() {
  const db = ensureDatabaseConnection();

  try {
    const existing = await db`SELECT id FROM tenants WHERE id = 1`;

    if (Array.isArray(existing) && existing.length === 0) {
      await db`
        INSERT INTO tenants (
          id, slug, bride_name, groom_name, wedding_date, 
          venue_name, venue_address, venue_map_link
        ) VALUES (
          1, 'default', '[Bride Name]', '[Groom Name]', 
          '2024-12-31', '[Venue Name]', '[Venue Address]',
          'https://maps.google.com'
        )
      `;
    }
  } catch (error) {
    console.error('Failed to ensure default tenant:', error);
  }
}

export async function getTenant(tenantId: number) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT * FROM tenants 
      WHERE id = ${tenantId} AND is_active = true
    `;
    return (result as DatabaseRecord[])[0] || null;
  } catch (error) {
    console.error('Failed to get tenant:', error);
    throw new Error(`Failed to get tenant: ${error}`);
  }
}

export async function getTenantBySlug(slug: string) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT * FROM tenants 
      WHERE slug = ${slug} AND is_active = true
    `;
    return (result as DatabaseRecord[])[0] || null;
  } catch (error) {
    console.error('Failed to get tenant by slug:', error);
    throw new Error(`Failed to get tenant by slug: ${error}`);
  }
}

// Guest operations (formerly RSVP operations)
export async function createGuest(guestData: {
  tenantId: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
}) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      INSERT INTO guests (tenant_id, name, relationship, attendance, message)
      VALUES (${guestData.tenantId}, ${guestData.name}, ${guestData.relationship}, 
              ${guestData.attendance}, ${guestData.message || null})
      RETURNING *
    `;
    return (result as DatabaseRecord[])[0];
  } catch (error) {
    console.error('Failed to create guest:', error);
    throw new Error(`Failed to create guest: ${error}`);
  }
}

export async function getGuestById(tenantId: number, guestId: number) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT id, name, relationship, attendance, message
      FROM guests 
      WHERE tenant_id = ${tenantId} AND id = ${guestId}
    `;
    return (result as DatabaseRecord[])[0] || null;
  } catch (error) {
    console.error('Failed to get guest by ID:', error);
    throw new Error(`Failed to get guest by ID: ${error}`);
  }
}

export async function updateGuest(
  tenantId: number,
  guestId: number,
  guestData: {
    name: string;
    relationship: string;
    attendance: 'yes' | 'no' | 'maybe';
    message?: string;
  }
) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      UPDATE guests 
      SET 
        name = ${guestData.name},
        relationship = ${guestData.relationship},
        attendance = ${guestData.attendance},
        message = ${guestData.message || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = ${tenantId} AND id = ${guestId}
      RETURNING *
    `;
    return (result as DatabaseRecord[])[0];
  } catch (error) {
    console.error('Failed to update guest:', error);
    throw new Error(`Failed to update guest: ${error}`);
  }
}

// Backward compatibility functions (deprecated - use guest functions instead)
export async function createRSVP(rsvpData: {
  tenantId: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
}) {
  return createGuest(rsvpData);
}

export async function getRSVPById(tenantId: number, rsvpId: number) {
  return getGuestById(tenantId, rsvpId);
}

export async function updateRSVP(
  tenantId: number,
  rsvpId: number,
  rsvpData: {
    name: string;
    relationship: string;
    attendance: 'yes' | 'no' | 'maybe';
    message?: string;
  }
) {
  return updateGuest(tenantId, rsvpId, rsvpData);
}

export { sql };
