export const migration007AdDisplayFrequency = {
  version: 7,
  name: 'ad_display_frequency',
  statements: [
    `CREATE TABLE IF NOT EXISTS ad_display_events (
      id TEXT PRIMARY KEY NOT NULL,
      placement TEXT NOT NULL,
      displayed_at TEXT NOT NULL,
      date_key TEXT NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_ad_display_events_placement_time
     ON ad_display_events(placement, displayed_at DESC);`,
  ],
} as const;
