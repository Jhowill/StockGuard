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
        await db.execAsync(statement);
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
        id, theme, language, currency, app_lock_enabled, biometric_unlock_enabled,
        hide_financial_values, ads_enabled, personalized_ads_consent,
        expiration_warning_days, low_stock_warning_enabled, expiration_warning_enabled,
        backup_reminder_enabled, last_backup_at, created_at, updated_at
      ) VALUES (?, 'system', 'system', 'BRL', 0, 0, 0, 1, 'unknown', 7, 1, 1, 0, NULL, ?, ?)`,
      'default',
      new Date().toISOString(),
      new Date().toISOString(),
    );
  }

  return db;
}

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = initializeDatabase();
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
