import { execute, query } from "@/lib/database";
import { TRANSACTION_TYPE } from "@/lib/constants";

/**
 * Read + write operations for the Finance Tracker. Income and expenses
 * share one table, distinguished by `type`; amounts are stored as positive
 * numbers and displayed with a sign at the UI boundary.
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {"income" | "expense"} type
 * @property {number} amount
 * @property {string} category
 * @property {string} description
 * @property {string} date        yyyy-MM-dd
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category ?? "",
    description: row.description ?? "",
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const VALID_TYPES = Object.values(TRANSACTION_TYPE);

function parseAmount(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }
  return parsed;
}

/**
 * @returns {Promise<Transaction[]>}
 */
export async function listTransactions() {
  try {
    const rows = await query(
      "SELECT * FROM finance_transactions ORDER BY date DESC, created_at DESC",
    );
    return rows.map(toTransaction);
  } catch (error) {
    console.error("[finance.service:listTransactions]", error);
    throw new Error("Could not load your transactions. Please try again.");
  }
}

/**
 * @param {{ type: string, amount: number | string, category: string,
 *   description: string, date: string }} input
 * @returns {Promise<string>} id of the created transaction
 */
export async function createTransaction({
  type,
  amount,
  category,
  description,
  date,
}) {
  if (!VALID_TYPES.includes(type)) throw new Error("Pick a transaction type.");
  const parsedAmount = parseAmount(amount);
  const trimmedDate = date.trim();
  if (!trimmedDate) throw new Error("Pick a date for this transaction.");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO finance_transactions
         (id, type, amount, category, description, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        type,
        parsedAmount,
        category.trim(),
        description.trim(),
        trimmedDate,
        now,
        now,
      ],
    );
  } catch (error) {
    console.error("[finance.service:createTransaction]", error);
    throw new Error("Could not save the transaction. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, type: string, amount: number | string,
 *   category: string, description: string, date: string }} input
 * @returns {Promise<void>}
 */
export async function updateTransaction({
  id,
  type,
  amount,
  category,
  description,
  date,
}) {
  if (!VALID_TYPES.includes(type)) throw new Error("Pick a transaction type.");
  const parsedAmount = parseAmount(amount);
  const trimmedDate = date.trim();
  if (!trimmedDate) throw new Error("Pick a date for this transaction.");

  try {
    const result = await execute(
      `UPDATE finance_transactions
       SET type = ?, amount = ?, category = ?, description = ?, date = ?,
           updated_at = ?
       WHERE id = ?`,
      [
        type,
        parsedAmount,
        category.trim(),
        description.trim(),
        trimmedDate,
        new Date().toISOString(),
        id,
      ],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Transaction ${id} not found`);
    }
  } catch (error) {
    console.error("[finance.service:updateTransaction]", error);
    throw new Error("Could not update the transaction. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteTransaction({ id }) {
  try {
    const result = await execute(
      "DELETE FROM finance_transactions WHERE id = ?",
      [id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Transaction ${id} not found`);
    }
  } catch (error) {
    console.error("[finance.service:deleteTransaction]", error);
    throw new Error("Could not delete the transaction. Please try again.");
  }
}
