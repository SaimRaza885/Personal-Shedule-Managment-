import { execute, query } from "@/lib/database";
import { IDEA_STATUS } from "@/lib/constants";

/**
 * Read + write operations for the Ideas Vault. Ideas are deliberately
 * separate from tasks and projects — the vault is for thinking, not for
 * doing. Nothing here schedules or converts an idea; that stays manual.
 */

const STATUS_ORDER = [
  IDEA_STATUS.NEW,
  IDEA_STATUS.EXPLORING,
  IDEA_STATUS.PARKED,
  IDEA_STATUS.DONE,
];

/**
 * @typedef {Object} Idea
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toIdea(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * All ideas: un-acted-on first (new → exploring → parked → done), newest
 * first within each status.
 * @returns {Promise<Idea[]>}
 */
export async function listIdeas() {
  try {
    const rows = await query("SELECT * FROM ideas ORDER BY created_at DESC");
    const ideas = rows.map(toIdea);
    // Status rank sorted in JS — no enum literals in SQL.
    return ideas.sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    );
  } catch (error) {
    console.error("[idea.service:listIdeas]", error);
    throw new Error("Could not load your ideas. Please try again.");
  }
}

/**
 * Validate an idea and build its INSERT as a standalone statement so services
 * that need to create an idea inside a larger transaction (e.g. quick capture
 * conversion) can compose it without duplicating the SQL.
 * @param {{ title: string, description?: string }} input
 * @returns {{ id: string, sql: string, params: unknown[] }}
 */
export function buildCreateIdeaStatement({ title, description = "" }) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Give the idea a title");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    id,
    sql: `INSERT INTO ideas (id, title, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    params: [id, trimmed, description.trim(), IDEA_STATUS.NEW, now, now],
  };
}

/**
 * @param {{ title: string, description?: string }} input
 * @returns {Promise<string>} id of the created idea
 */
export async function createIdea(input) {
  const statement = buildCreateIdeaStatement(input);

  try {
    await execute(statement.sql, statement.params);
  } catch (error) {
    console.error("[idea.service:createIdea]", error);
    throw new Error("Could not save the idea. Please try again.");
  }
  return statement.id;
}

/**
 * @param {{ id: string, title: string, description: string, status: string }} input
 * @returns {Promise<void>}
 */
export async function updateIdea({ id, title, description, status }) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Give the idea a title");

  try {
    const result = await execute(
      `UPDATE ideas
       SET title = ?, description = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [trimmed, description.trim(), status, new Date().toISOString(), id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Idea ${id} not found`);
    }
  } catch (error) {
    console.error("[idea.service:updateIdea]", error);
    throw new Error("Could not update the idea. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteIdea({ id }) {
  try {
    const result = await execute("DELETE FROM ideas WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Idea ${id} not found`);
    }
  } catch (error) {
    console.error("[idea.service:deleteIdea]", error);
    throw new Error("Could not delete the idea. Please try again.");
  }
}
