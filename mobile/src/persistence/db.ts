import type { SQLiteDatabase } from 'expo-sqlite';

export type MigratableDatabase = {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

const DATABASE_NAME = 'money-tracker.db';
const SCHEMA_VERSION = 1;

const migrationStatements: Record<number, string> = {
  1: `
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY NOT NULL,
      group_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE,
      UNIQUE(group_id, name)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      group_id TEXT NOT NULL,
      payer_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
      split_method TEXT NOT NULL CHECK(split_method IN ('equal', 'percent')),
      created_at TEXT NOT NULL,
      FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY(payer_id) REFERENCES members(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS expense_participants (
      expense_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      percent REAL,
      PRIMARY KEY(expense_id, member_id),
      FOREIGN KEY(expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY NOT NULL,
      expense_id TEXT,
      image_uri TEXT NOT NULL,
      raw_text TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(expense_id) REFERENCES expenses(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_members_group_id ON members(group_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
    CREATE INDEX IF NOT EXISTS idx_receipts_expense_id ON receipts(expense_id);
  `
};

export const initializeDatabase = async (db: MigratableDatabase): Promise<void> => {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = versionRow?.user_version ?? 0;

  for (let version = currentVersion + 1; version <= SCHEMA_VERSION; version += 1) {
    const statement = migrationStatements[version];
    if (!statement) {
      throw new Error(`Missing migration for version ${version}`);
    }

    await db.withTransactionAsync(async () => {
      await db.execAsync(statement);
      await db.execAsync(`PRAGMA user_version = ${version};`);
    });
  }
};

export const openAppDatabase = async (): Promise<SQLiteDatabase> => {
  const { openDatabaseAsync } = await import('expo-sqlite');
  const db = await openDatabaseAsync(DATABASE_NAME);
  await initializeDatabase(db);
  return db;
};

export const getSchemaVersion = (): number => SCHEMA_VERSION;

export const getDatabaseName = (): string => DATABASE_NAME;
