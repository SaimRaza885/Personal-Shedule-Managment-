import Database from "@tauri-apps/plugin-sql";
import { getDevDb } from "./devDatabase";
import { runMigrations } from "./migrations";

const SQLITE_DB_URL = "sqlite:schedule.db";

let dbPromise = null;

/**
 * Returns true when running inside the Tauri desktop shell.
 * The Vite dev server in a plain browser has no Tauri IPC.
 * @returns {boolean}
 */
export function isTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Singleton connection to the local SQLite database.
 * Uses tauri-plugin-sql on desktop; the sql.js dev engine in a browser.
 * Runs pending migrations once per connection.
 * @returns {Promise<{ execute: Function, select: Function, close?: Function }>}
 */
export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = isTauri()
        ? await Database.load(SQLITE_DB_URL)
        : await getDevDb();
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}

/**
 * Run a parameterized write query.
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Promise<{ rowsAffected: number }>}
 */
export async function execute(sql, params = []) {
  const db = await getDb();
  return db.execute(sql, params);
}

/**
 * Run a parameterized read query and return all matching rows.
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function query(sql, params = []) {
  const db = await getDb();
  return db.select(sql, params);
}

/**
 * Run a parameterized read query expected to return at most one row.
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Promise<Record<string, unknown>|undefined>}
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}
