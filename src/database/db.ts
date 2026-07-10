import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { migrations } from './migrations';
import { SCHEMA_VERSION } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('estoqueguard.db');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
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
      await db.execAsync('ROLLBACK');
      throw error;
    }
  }

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

export async function withDatabase<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>) {
  const db = await getDatabase();
  return callback(db);
}

export async function withTransaction<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>) {
  const db = await getDatabase();
  let result!: T;
  await db.withTransactionAsync(async () => {
    result = await callback(db);
  });
  return result;
}

export { SCHEMA_VERSION };
