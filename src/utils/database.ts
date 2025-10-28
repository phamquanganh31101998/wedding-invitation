import { neon } from '@neondatabase/serverless';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL!);

// Auto-initialize flag to ensure tables are created
let isInitialized = false;

// Initialize database tables automatically
async function ensureInitialized() {
  if (isInitialized) return;

  try {
    // Create tenants table
    await sql`
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
    await sql`
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
    await sql`CREATE INDEX IF NOT EXISTS idx_rsvps_tenant_id ON rsvps(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rsvps_attendance ON rsvps(attendance)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rsvps_submitted_at ON rsvps(submitted_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active)`;

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
  try {
    const existing = await sql`SELECT id FROM tenants WHERE id = 'default'`;

    if (existing.length === 0) {
      await sql`
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
  await ensureInitialized();

  try {
    const result = await sql`
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
    return result[0];
  } catch (error) {
    console.error('Failed to create tenant:', error);
    throw new Error(`Failed to create tenant: ${error}`);
  }
}

export async function getTenant(tenantId: string) {
  await ensureInitialized();

  try {
    const result = await sql`
      SELECT * FROM tenants 
      WHERE id = ${tenantId} AND is_active = true
    `;
    return result[0] || null;
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
  await ensureInitialized();

  try {
    const result = await sql`
      INSERT INTO rsvps (tenant_id, name, relationship, attendance, message)
      VALUES (${rsvpData.tenantId}, ${rsvpData.name}, ${rsvpData.relationship}, 
              ${rsvpData.attendance}, ${rsvpData.message || null})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Failed to create RSVP:', error);
    throw new Error(`Failed to create RSVP: ${error}`);
  }
}

export async function getRSVPs(tenantId: string) {
  await ensureInitialized();

  try {
    const result = await sql`
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
  await ensureInitialized();

  try {
    const result = await sql`
      SELECT id, name, relationship, attendance, message, submitted_at
      FROM rsvps 
      WHERE tenant_id = ${tenantId} AND id = ${parseInt(rsvpId)}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get RSVP by ID:', error);
    throw new Error(`Failed to get RSVP by ID: ${error}`);
  }
}

export async function getRSVPStats(tenantId: string) {
  await ensureInitialized();

  try {
    const result = await sql`
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
