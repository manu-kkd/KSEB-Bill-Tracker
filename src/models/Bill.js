import pool, { ensureBillsTable } from '@/lib/postgres';

function normalizeBill(row) {
  return {
    id: row.id,
    billingDate: row.billing_date,
    unitsConsumed: Number(row.units_consumed),
    amountPaid: Number(row.amount_paid),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBills() {
  await ensureBillsTable();

  const result = await pool.query(
    `SELECT id, billing_date, units_consumed, amount_paid, notes, created_at, updated_at FROM bills ORDER BY billing_date DESC`
  );
  return result.rows.map(normalizeBill);
}

export async function createBill({ billingDate, unitsConsumed, amountPaid, notes = '' }) {
  await ensureBillsTable();

  if (!billingDate || unitsConsumed == null || amountPaid == null) {
    throw new Error('billingDate, unitsConsumed, and amountPaid are required');
  }

  const result = await pool.query(
    `INSERT INTO bills (billing_date, units_consumed, amount_paid, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING id, billing_date, units_consumed, amount_paid, notes, created_at, updated_at`,
    [new Date(billingDate), unitsConsumed, amountPaid, notes]
  );

  return normalizeBill(result.rows[0]);
}
