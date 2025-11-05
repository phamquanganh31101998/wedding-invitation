import { neon } from '@neondatabase/serverless';

// Type definitions for database results
export interface DatabaseRecord {
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
export function ensureDatabaseConnection() {
  if (!sql) {
    throw new Error(
      'Database connection not available. Please check DATABASE_URL environment variable.'
    );
  }
  return sql;
}

// Initialize database tables automatically
export async function ensureInitialized() {
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
        email VARCHAR(255),
        phone VARCHAR(20),
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

    // Create files table
    await db`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        name TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign key constraint
        CONSTRAINT files_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      )
    `;

    // Create indexes for better performance
    await db`CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants USING BTREE (is_active)`;
    await db`CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON tenants USING BTREE (slug)`;
    await db`CREATE UNIQUE INDEX IF NOT EXISTS tenants_pkey ON tenants USING BTREE (id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_guests_attendance ON guests USING BTREE (attendance)`;
    await db`CREATE INDEX IF NOT EXISTS idx_guests_tenant_id ON guests USING BTREE (tenant_id)`;
    await db`CREATE UNIQUE INDEX IF NOT EXISTS guests_pkey ON guests USING BTREE (id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_files_tenant_id ON files USING BTREE (tenant_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_files_type ON files USING BTREE (type)`;

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

export { sql };
