/**
 * Database migrations. Each migration is a list of SQL statements applied
 * in order inside a transaction managed by the migration runner.
 *
 * Ids are monotonically increasing and never reused. Add new migrations
 * to the END of this array only — existing entries must never be edited.
 */

const TIMESTAMP_DEFAULT = "(strftime('%Y-%m-%dT%H:%M:%fZ','now'))";

const initialSchema = [
  `CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    year INTEGER,
    status TEXT NOT NULL DEFAULT 'planned'
      CHECK (status IN ('planned', 'in_progress', 'completed', 'archived')),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    period_type TEXT NOT NULL
      CHECK (period_type IN ('year', 'month', 'week')),
    target_date TEXT,
    status TEXT NOT NULL DEFAULT 'planned'
      CHECK (status IN ('planned', 'in_progress', 'completed')),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
    milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    scheduled_date TEXT,
    start_time TEXT,
    end_time TEXT,
    planned_minutes INTEGER NOT NULL DEFAULT 30
      CHECK (planned_minutes > 0),
    actual_minutes INTEGER NOT NULL DEFAULT 0
      CHECK (actual_minutes >= 0),
    priority TEXT NOT NULL DEFAULT 'medium'
      CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'not_started'
      CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused', 'cancelled')),
    energy_level TEXT
      CHECK (energy_level IN ('high', 'medium', 'low')),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS task_steps (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0
      CHECK (is_completed IN (0, 1)),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS daily_schedules (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    planned_minutes INTEGER NOT NULL DEFAULT 30
      CHECK (planned_minutes > 0),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS daily_top_three (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL
      CHECK (position BETWEEN 1 AND 3),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    UNIQUE (date, position),
    UNIQUE (date, task_id)
  )`,

  `CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    planned_minutes INTEGER,
    actual_minutes INTEGER NOT NULL DEFAULT 0
      CHECK (actual_minutes >= 0),
    status TEXT NOT NULL DEFAULT 'started'
      CHECK (status IN ('started', 'paused', 'completed', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS distractions (
    id TEXT PRIMARY KEY,
    focus_session_id TEXT NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    occurred_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS learning_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS tech_concepts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'not_started'
      CHECK (status IN ('not_started', 'learning', 'learned', 'review')),
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS watch_later (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL DEFAULT '',
    scheduled_date TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS quick_captures (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    captured_at TEXT NOT NULL,
    converted_type TEXT,
    converted_id TEXT,
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS daily_reviews (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    planned_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    partial_tasks INTEGER NOT NULL DEFAULT 0,
    missed_tasks INTEGER NOT NULL DEFAULT 0,
    focus_minutes INTEGER NOT NULL DEFAULT 0,
    review_notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS weekly_reviews (
    id TEXT PRIMARY KEY,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    what_went_well TEXT NOT NULL DEFAULT '',
    what_did_not_go_well TEXT NOT NULL DEFAULT '',
    accomplishments TEXT NOT NULL DEFAULT '',
    changes_for_next_week TEXT NOT NULL DEFAULT '',
    priorities TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS finance_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL
      CHECK (type IN ('income', 'expense')),
    amount REAL NOT NULL
      CHECK (amount >= 0),
    category TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT},
    updated_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  )`,

  `CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
  )`,

  "CREATE INDEX IF NOT EXISTS idx_milestones_goal ON milestones(goal_id)",
  "CREATE INDEX IF NOT EXISTS idx_projects_goal ON projects(goal_id)",
  "CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)",
  "CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date)",
  "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)",
  "CREATE INDEX IF NOT EXISTS idx_task_steps_task ON task_steps(task_id)",
  "CREATE INDEX IF NOT EXISTS idx_daily_schedules_date ON daily_schedules(date)",
  "CREATE INDEX IF NOT EXISTS idx_daily_top_three_date ON daily_top_three(date)",
  "CREATE INDEX IF NOT EXISTS idx_focus_sessions_task ON focus_sessions(task_id)",
  "CREATE INDEX IF NOT EXISTS idx_distractions_session ON distractions(focus_session_id)",
  "CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date)",
  "CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(date)",
  "CREATE INDEX IF NOT EXISTS idx_learning_entries_date ON learning_entries(date)",
  "CREATE INDEX IF NOT EXISTS idx_watch_later_scheduled_date ON watch_later(scheduled_date)",
  "CREATE INDEX IF NOT EXISTS idx_quick_captures_captured ON quick_captures(captured_at)",
];

export const MIGRATIONS = [
  {
    id: 1,
    name: "001_initial_schema",
    statements: initialSchema,
  },
];

/**
 * Apply any unapplied migrations. Safe to call on every startup —
 * applied migrations are recorded in `_migrations` and skipped.
 * @param {{ execute: (sql: string, params?: unknown[]) => Promise<unknown> }} db
 */
export async function runMigrations(db) {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT ${TIMESTAMP_DEFAULT}
    )`
  );

  const applied = new Set(
    (await db.select("SELECT id FROM _migrations")).map((row) => row.id)
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    for (const statement of migration.statements) {
      await db.execute(statement);
    }
    await db.execute("INSERT INTO _migrations (id, name) VALUES (?, ?)", [
      migration.id,
      migration.name,
    ]);
  }
}
