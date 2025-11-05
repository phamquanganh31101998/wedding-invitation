import {
  ensureDatabaseConnection,
  ensureInitialized,
  DatabaseRecord,
} from './database';

/**
 * Create a new guest
 */
export async function createGuest(guestData: {
  tenantId: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
}): Promise<DatabaseRecord> {
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

/**
 * Get guest by ID and tenant ID
 */
export async function getGuestById(
  tenantId: number,
  guestId: number
): Promise<DatabaseRecord | null> {
  const db = ensureDatabaseConnection();
  await ensureInitialized();

  try {
    const result = await db`
      SELECT id, tenant_id, name, relationship, attendance, message, created_at, updated_at
      FROM guests 
      WHERE tenant_id = ${tenantId} AND id = ${guestId}
    `;
    return (result as DatabaseRecord[])[0] || null;
  } catch (error) {
    console.error('Failed to get guest by ID:', error);
    throw new Error(`Failed to get guest by ID: ${error}`);
  }
}

/**
 * Update guest
 */
export async function updateGuest(
  tenantId: number,
  guestId: number,
  guestData: {
    name: string;
    relationship: string;
    attendance: 'yes' | 'no' | 'maybe';
    message?: string;
  }
): Promise<DatabaseRecord> {
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
