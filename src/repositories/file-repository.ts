import {
  ensureDatabaseConnection,
  ensureInitialized,
  DatabaseRecord,
} from './database';

/**
 * Get file by ID and tenant ID
 */
export async function getFileById(
  tenantId: number,
  fileId: number
): Promise<DatabaseRecord | null> {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT id, tenant_id, type, url, name, display_order, created_at
      FROM files 
      WHERE tenant_id = ${tenantId} AND id = ${fileId}
    `;
    return (result as DatabaseRecord[])[0] || null;
  } catch (error) {
    console.error('Failed to get file by ID:', error);
    throw new Error(`Failed to get file by ID: ${error}`);
  }
}

/**
 * Get all files for a tenant by type using tenant slug
 */
export async function getFilesByTenantAndType(
  tenantSlug: string,
  type?: string
): Promise<DatabaseRecord[]> {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    let result;
    if (type) {
      result = await db`
        SELECT f.id, f.tenant_id, f.type, f.url, f.name, f.display_order, f.created_at
        FROM files f
        INNER JOIN tenants t ON f.tenant_id = t.id
        WHERE t.slug = ${tenantSlug} AND t.is_active = true AND f.type = ${type}
        ORDER BY f.display_order ASC, f.created_at ASC
      `;
    } else {
      result = await db`
        SELECT f.id, f.tenant_id, f.type, f.url, f.name, f.display_order, f.created_at
        FROM files f
        INNER JOIN tenants t ON f.tenant_id = t.id
        WHERE t.slug = ${tenantSlug} AND t.is_active = true
        ORDER BY f.type ASC, f.display_order ASC, f.created_at ASC
      `;
    }
    return result as DatabaseRecord[];
  } catch (error) {
    console.error('Failed to get files by tenant slug and type:', error);
    throw new Error(`Failed to get files by tenant slug and type: ${error}`);
  }
}
