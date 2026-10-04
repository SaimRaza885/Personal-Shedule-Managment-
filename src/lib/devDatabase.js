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

  return {
    async execute(sql, params = []) {
      const stmt = db.prepare(sql);
      try {
        stmt.bind(params);
        stmt.step();
      } finally {
        stmt.free();
      }
      persist(db);
      return { rowsAffected: db.getRowsModified() };
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
