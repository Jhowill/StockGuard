import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { migrations } from './migrations';
import { SCHEMA_VERSION } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let transactionQueue: Promise<void> = Promise.resolve();

export type DatabaseHealth = {
  integrity: 'ok';
  foreignKeyViolations: number;
  schemaVersion: number;
};

async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('estoqueguard.db');
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);
  return db;
}

async function assertDatabaseQuickCheck(db: SQLite.SQLiteDatabase) {
  const integrity = await db.getFirstAsync<{ quick_check: string }>('PRAGMA quick_check(1)');
  if (integrity?.quick_check !== 'ok') {
    throw new Error('DATABASE_INTEGRITY_CHECK_FAILED');
  }
}

async function initializeDatabase() {
  const db = await openDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      version INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const migrationRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  );
  const applied = new Set(migrationRows.map((row) => row.version));

  for (const migration of migrations) {
    if (applied.has(migration.version)) {
      continue;
    }

    await db.execAsync('BEGIN');
    try {
      for (const statement of migration.statements) {
        try {
          await db.execAsync(statement);
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : '';
          const isDuplicateColumn = statement.toLowerCase().includes('add column') && message.includes('duplicate column');
          if (!isDuplicateColumn) {
            throw error;
          }
        }
      }

      await db.runAsync(
        'INSERT INTO schema_migrations (id, version, name, applied_at) VALUES (?, ?, ?, ?)',
        Crypto.randomUUID(),
        migration.version,
        migration.name,
        new Date().toISOString(),
      );
      await db.execAsync('COMMIT');
    } catch (error) {
      try {
        await db.execAsync('ROLLBACK');
      } catch {
        // Preserve the original migration failure if SQLite already ended the transaction.
      }
      throw error;
    }
  }

  await assertDatabaseQuickCheck(db);

  const settings = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM app_settings WHERE id = ?',
    'default',
  );

  if (!settings) {
    await db.runAsync(
      `INSERT INTO app_settings (
        id, user_name, theme, language, currency, usage_type, onboarding_completed, app_lock_enabled, biometric_unlock_enabled,
        hide_financial_values, ads_enabled, personalized_ads_consent,
        expiration_warning_days, low_stock_warning_enabled, expiration_warning_enabled,
        backup_reminder_enabled, last_backup_at, created_at, updated_at
      ) VALUES (?, NULL, 'system', 'system', 'BRL', 'other', 0, 0, 0, 0, 1, 'unknown', 7, 1, 1, 0, NULL, ?, ?)`,
      'default',
      new Date().toISOString(),
      new Date().toISOString(),
    );
  }

  return db;
}

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = initializeDatabase().catch((error) => {
      // A transient open/migration failure must not poison every subsequent retry.
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

export async function resetDatabaseCache() {
  dbPromise = null;
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const db = await getDatabase();
  const integrity = await db.getFirstAsync<{ integrity_check: string }>('PRAGMA integrity_check');
  if (integrity?.integrity_check !== 'ok') {
    throw new Error('DATABASE_INTEGRITY_CHECK_FAILED');
  }
  const foreignKeyRows = await db.getAllAsync('PRAGMA foreign_key_check');
  const migration = await db.getFirstAsync<{ version: number | null }>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );

  return {
    integrity: 'ok',
    foreignKeyViolations: foreignKeyRows.length,
    schemaVersion: migration?.version ?? 0,
  };
}

export async function withDatabase<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>) {
  const db = await getDatabase();
  return callback(db);
}

export async function withTransaction<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>) {
  const previous = transactionQueue;
  let release!: () => void;
  transactionQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous.catch(() => undefined);
  try {
    const db = await getDatabase();
    let result!: T;
    await db.withTransactionAsync(async () => {
      result = await callback(db);
    });
    return result;
  } finally {
    release();
  }
}

export async function withExclusiveTransaction<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>) {
  const previous = transactionQueue;
  let release!: () => void;
  transactionQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous.catch(() => undefined);
  try {
    const db = await getDatabase();
    let result!: T;
    await db.withExclusiveTransactionAsync(async (transaction) => {
      result = await callback(transaction);
    });
    return result;
  } finally {
    release();
  }
}

export { SCHEMA_VERSION };
