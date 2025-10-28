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
        id VARCHAR(50) PRIMARY KEY,
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

    // Create rsvps table
    await db`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        relationship VARCHAR(50) NOT NULL,
        attendance VARCHAR(10) CHECK (attendance IN ('yes', 'no', 'maybe')) NOT NULL,
        message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await db`CREATE INDEX IF NOT EXISTS idx_rsvps_tenant_id ON rsvps(tenant_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_rsvps_attendance ON rsvps(attendance)`;
    await db`CREATE INDEX IF NOT EXISTS idx_rsvps_submitted_at ON rsvps(submitted_at)`;
    await db`CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active)`;

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
    const existing = await db`SELECT id FROM tenants WHERE id = 'default'`;

    if (Array.isArray(existing) && existing.length === 0) {
      await db`
        INSERT INTO tenants (
          id, bride_name, groom_name, wedding_date, 
          venue_name, venue_address, venue_map_link
        ) VALUES (
          'default', '[Bride Name]', '[Groom Name]', 
          '2024-12-31', '[Venue Name]', '[Venue Address]',
          'https://maps.google.com'
        )
      `;
    }
  } catch (error) {
    console.error('Failed to ensure default tenant:', error);
  }
}

// Tenant operations
export async function createTenant(tenantData: {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueMapLink?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
}) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      INSERT INTO tenants (
        id, bride_name, groom_name, wedding_date, 
        venue_name, venue_address, venue_map_link,
        theme_primary_color, theme_secondary_color
      ) VALUES (
        ${tenantData.id}, ${tenantData.brideName}, ${tenantData.groomName}, 
        ${tenantData.weddingDate}, ${tenantData.venueName}, ${tenantData.venueAddress},
        ${tenantData.venueMapLink || null}, 
        ${tenantData.themePrimaryColor || '#E53E3E'}, 
        ${tenantData.themeSecondaryColor || '#FED7D7'}
      )
      RETURNING *
    `;
    return (result as DatabaseRecord[])[0];
  } catch (error) {
    console.error('Failed to create tenant:', error);
    throw new Error(`Failed to create tenant: ${error}`);
  }
}

export async function getTenant(tenantId: string) {
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

// RSVP operations
export async function createRSVP(rsvpData: {
  tenantId: string;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
}) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      INSERT INTO rsvps (tenant_id, name, relationship, attendance, message)
      VALUES (${rsvpData.tenantId}, ${rsvpData.name}, ${rsvpData.relationship}, 
              ${rsvpData.attendance}, ${rsvpData.message || null})
      RETURNING *
    `;
    return (result as DatabaseRecord[])[0];
  } catch (error) {
    console.error('Failed to create RSVP:', error);
    throw new Error(`Failed to create RSVP: ${error}`);
  }
}

export async function getRSVPs(tenantId: string) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT id, name, relationship, attendance, message, submitted_at
      FROM rsvps 
      WHERE tenant_id = ${tenantId}
      ORDER BY submitted_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Failed to get RSVPs:', error);
    throw new Error(`Failed to get RSVPs: ${error}`);
  }
}

export async function getRSVPById(tenantId: string, rsvpId: string) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT id, name, relationship, attendance, message, submitted_at
      FROM rsvps 
      WHERE tenant_id = ${tenantId} AND id = ${parseInt(rsvpId)}
    `;
    return (result as DatabaseRecord[])[0] || null;
  } catch (error) {
    console.error('Failed to get RSVP by ID:', error);
    throw new Error(`Failed to get RSVP by ID: ${error}`);
  }
}

export async function getRSVPStats(tenantId: string) {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT 
        attendance,
        COUNT(*) as count
      FROM rsvps 
      WHERE tenant_id = ${tenantId}
      GROUP BY attendance
    `;
    return result;
  } catch (error) {
    console.error('Failed to get RSVP stats:', error);
    throw new Error(`Failed to get RSVP stats: ${error}`);
  }
}

export { sql };
