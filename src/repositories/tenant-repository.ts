import {
  ensureDatabaseConnection,
  ensureInitialized,
  DatabaseRecord,
} from './database';

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(
  slug: string
): Promise<DatabaseRecord | null> {
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

/**
 * Get tenant by ID
 */
export async function getTenantById(
  id: number
): Promise<DatabaseRecord | null> {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT * FROM tenants 
      WHERE id = ${id} AND is_active = true
    `;
    return (result as DatabaseRecord[])[0] || null;
  } catch (error) {
    console.error('Failed to get tenant by ID:', error);
    throw new Error(`Failed to get tenant by ID: ${error}`);
  }
}
