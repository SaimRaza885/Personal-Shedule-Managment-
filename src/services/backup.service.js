import { format } from "date-fns";
import { execute, executeTransaction, query } from "@/lib/database";

/**
 * Local backup: export every app table into one JSON snapshot, and restore
 * from such a snapshot. The `_migrations` bookkeeping table is schema state,
 * not user data — it is never exported or overwritten.
 *
 * Column order below doubles as the insert order (parents before children),
 * so its reverse is the safe delete order (children before parents).
 */

export const SNAPSHOT_APP = "personal-schedule-management";
export const SNAPSHOT_VERSION = 1;

const TABLE_COLUMNS = {
  goals: [
    "id",
    "title",
    "description",
    "year",
    "status",
    "created_at",
    "updated_at",
  ],
  milestones: [
    "id",
    "goal_id",
    "title",
    "description",
    "period_type",
    "target_date",
    "status",
    "created_at",
    "updated_at",
  ],
  projects: [
    "id",
    "goal_id",
    "name",
    "description",
    "status",
    "created_at",
    "updated_at",
  ],
  tasks: [
    "id",
    "project_id",
    "goal_id",
    "milestone_id",
    "title",
    "description",
    "scheduled_date",
    "start_time",
    "end_time",
    "planned_minutes",
    "actual_minutes",
    "priority",
    "status",
    "energy_level",
    "created_at",
    "updated_at",
    "completed_at",
  ],
  task_steps: [
    "id",
    "task_id",
    "title",
    "is_completed",
    "sort_order",
    "created_at",
    "updated_at",
  ],
  daily_schedules: [
    "id",
    "task_id",
    "date",
    "start_time",
    "end_time",
    "planned_minutes",
    "created_at",
    "updated_at",
  ],
  daily_top_three: ["id", "date", "task_id", "position", "created_at"],
  focus_sessions: [
    "id",
    "task_id",
    "started_at",
    "ended_at",
    "planned_minutes",
    "actual_minutes",
    "status",
    "created_at",
  ],
  distractions: [
    "id",
    "focus_session_id",
    "reason",
    "notes",
    "occurred_at",
    "created_at",
  ],
  learning_entries: [
    "id",
    "title",
    "content",
    "date",
    "created_at",
    "updated_at",
  ],
  tech_concepts: [
    "id",
    "title",
    "category",
    "description",
    "status",
    "created_at",
    "updated_at",
  ],
  watch_later: [
    "id",
    "title",
    "url",
    "scheduled_date",
    "status",
    "created_at",
    "updated_at",
  ],
  ideas: ["id", "title", "description", "status", "created_at", "updated_at"],
  quick_captures: [
    "id",
    "content",
    "captured_at",
    "converted_type",
    "converted_id",
    "created_at",
  ],
  diary_entries: ["id", "date", "content", "created_at", "updated_at"],
  daily_reviews: [
    "id",
    "date",
    "planned_tasks",
    "completed_tasks",
    "partial_tasks",
    "missed_tasks",
    "focus_minutes",
    "review_notes",
    "created_at",
    "updated_at",
  ],
  weekly_reviews: [
    "id",
    "week_start",
    "week_end",
    "what_went_well",
    "what_did_not_go_well",
    "accomplishments",
    "changes_for_next_week",
    "priorities",
    "created_at",
    "updated_at",
  ],
  finance_transactions: [
    "id",
    "type",
    "amount",
    "category",
    "description",
    "date",
    "created_at",
    "updated_at",
  ],
  settings: ["key", "value"],
  backups: ["id", "file_path", "size", "created_at"],
};

const INSERT_ORDER = Object.keys(TABLE_COLUMNS);
const DELETE_ORDER = [...INSERT_ORDER].reverse();

/**
 * Read every app table and package it as one JSON snapshot.
 * @returns {Promise<{ content: string, fileName: string, byteSize: number }>}
 */
export async function buildSnapshot() {
  try {
    const tables = {};
    for (const table of INSERT_ORDER) {
      tables[table] = await query(`SELECT * FROM ${table}`);
    }
    const content = JSON.stringify(
      {
        app: SNAPSHOT_APP,
        version: SNAPSHOT_VERSION,
        exportedAt: new Date().toISOString(),
        tables,
      },
      null,
      2,
    );
    return {
      content,
      fileName: `schedule-backup-${format(new Date(), "yyyy-MM-dd")}.json`,
      byteSize: new TextEncoder().encode(content).length,
    };
  } catch (error) {
    console.error("[backup.service:buildSnapshot]", error);
    throw new Error("Could not read your data for backup. Please try again.");
  }
}

/**
 * Validate a backup file's text and return its table rows. Friendly
 * messages for the shapes a corrupt or foreign file can take.
 * @param {string} content
 * @returns {Record<string, Record<string, unknown>[]>}
 */
export function parseSnapshot(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("That file is not a valid backup — it isn't readable JSON.");
  }
  if (!parsed || typeof parsed !== "object" || parsed.app !== SNAPSHOT_APP) {
    throw new Error("That file doesn't look like a Schedule backup.");
  }
  if (parsed.version !== SNAPSHOT_VERSION) {
    throw new Error(
      "This backup was made by a different version of the app and can't be restored here.",
    );
  }
  if (!parsed.tables || typeof parsed.tables !== "object") {
    throw new Error("That backup file is missing its data.");
  }
  for (const table of INSERT_ORDER) {
    if (!Array.isArray(parsed.tables[table])) {
      throw new Error(
        "That backup file is missing some data and can't be restored.",
      );
    }
  }
  return parsed.tables;
}

/**
 * Replace all app data with the snapshot's rows, inside one transaction —
 * a failure leaves the current database untouched.
 * @param {Record<string, Record<string, unknown>[]>} tables
 * @returns {Promise<void>}
 */
export async function restoreSnapshot(tables) {
  const statements = DELETE_ORDER.map((table) => `DELETE FROM ${table}`);
  const params = [];

  for (const table of INSERT_ORDER) {
    // Table and column names come from TABLE_COLUMNS, never from the file;
    // only row values are user data and those are bound as parameters.
    const columns = TABLE_COLUMNS[table];
    const placeholders = columns.map(() => "?").join(", ");
    const insertSql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
    for (const row of tables[table]) {
      statements.push(insertSql);
      params.push(...columns.map((column) => row[column] ?? null));
    }
  }

  try {
    await executeTransaction(statements.join(";\n"), params);
  } catch (error) {
    console.error("[backup.service:restoreSnapshot]", error);
    throw new Error(
      "Could not restore that backup. Your current data was left unchanged.",
    );
  }
}

/**
 * Record a successful export so the UI can show backup history.
 * Best-effort: the file is already saved even if this write fails.
 * @param {{ filePath: string, size: number }} input
 * @returns {Promise<void>}
 */
export async function recordBackup({ filePath, size }) {
  try {
    await execute(
      "INSERT INTO backups (id, file_path, size, created_at) VALUES (?, ?, ?, ?)",
      [crypto.randomUUID(), filePath, size, new Date().toISOString()],
    );
  } catch (error) {
    console.error("[backup.service:recordBackup]", error);
  }
}

/**
 * Most recent exports, newest first.
 * @param {number} [limit]
 * @returns {Promise<Array<{ id: string, filePath: string, size: number, createdAt: string }>>}
 */
export async function listRecentBackups(limit = 5) {
  try {
    return await query(
      `SELECT id, file_path AS filePath, size, created_at AS createdAt
       FROM backups
       ORDER BY created_at DESC, rowid DESC
       LIMIT ?`,
      [limit],
    );
  } catch (error) {
    console.error("[backup.service:listRecentBackups]", error);
    throw new Error("Could not load your backup history. Please try again.");
  }
}
