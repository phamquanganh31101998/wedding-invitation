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
 * Get all files for a tenant by type
 */
export async function getFilesByTenantAndType(
  tenantId: number,
  type?: string
): Promise<DatabaseRecord[]> {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    let result;
    if (type) {
      result = await db`
        SELECT id, tenant_id, type, url, name, display_order, created_at
        FROM files 
        WHERE tenant_id = ${tenantId} AND type = ${type}
        ORDER BY display_order ASC, created_at ASC
      `;
    } else {
      result = await db`
        SELECT id, tenant_id, type, url, name, display_order, created_at
        FROM files 
        WHERE tenant_id = ${tenantId}
        ORDER BY type ASC, display_order ASC, created_at ASC
      `;
    }
    return result as DatabaseRecord[];
  } catch (error) {
    console.error('Failed to get files by tenant and type:', error);
    throw new Error(`Failed to get files by tenant and type: ${error}`);
  }
}
