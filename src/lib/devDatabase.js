/**
 * DEV-ONLY database engine backed by sql.js (SQLite compiled to WASM) so the
 * app runs in a plain browser during development without the Rust/Tauri
 * toolchain. The desktop application always uses tauri-plugin-sql instead.
 * Data persists to localStorage and mirrors the production schema.
 */

import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

const STORAGE_KEY = "psm-dev-sqlite";

let enginePromise = null;

function loadPersistedBytes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function persist(db) {
  const bytes = db.export();
  // sql.js db.export() closes and reopens the underlying connection, which
  // resets connection-level pragmas — re-enable FK enforcement after every
  // export or CASCADE / SET NULL silently stop working after the first write.
  db.run("PRAGMA foreign_keys = ON;");
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  localStorage.setItem(STORAGE_KEY, btoa(binary));
}

async function createEngine() {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
  const bytes = loadPersistedBytes();
  const db = bytes ? new SQL.Database(bytes) : new SQL.Database();

  // sql.js defaults foreign_keys OFF; tauri-plugin-sql (sqlx) defaults it ON.
  // Enable it here so ON DELETE CASCADE / SET NULL behave identically in both
  // engines (e.g. deleting a goal cascades to its milestones in dev too).
  db.run("PRAGMA foreign_keys = ON;");

  // db.export() (used by persist) cannot run mid-transaction: it silently
  // ends the open transaction, so COMMIT then fails. Track transaction
  // state and only persist once the database is back in autocommit mode.
  let inTransaction = false;

  return {
    async execute(sql, params = []) {
      const stmt = db.prepare(sql);
      // getRowsModified must be read before stmt.free(): freeing the
      // statement resets the change counter, which made every UPDATE/DELETE
      // report rowsAffected: 0 and broke not-found checks in services.
      let rowsAffected = 0;
      try {
        stmt.bind(params);
        stmt.step();
        rowsAffected = db.getRowsModified();
      } finally {
        stmt.free();
      }
      const keyword = sql.trimStart().split(/\s+/, 1)[0].toUpperCase();
      if (keyword === "BEGIN") inTransaction = true;
      else if (keyword === "COMMIT" || keyword === "ROLLBACK") inTransaction = false;
      if (!inTransaction) persist(db);
      return { rowsAffected };
    },

    async select(sql, params = []) {
      const stmt = db.prepare(sql);
      const rows = [];
      try {
        stmt.bind(params);
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
      } finally {
        stmt.free();
      }
      return rows;
    },

    async close() {
      persist(db);
      db.close();
    },
  };
}

/**
 * @returns {Promise<{ execute: Function, select: Function, close: Function }>}
 */
export function getDevDb() {
  if (!enginePromise) {
    enginePromise = createEngine();
  }
  return enginePromise;
}
