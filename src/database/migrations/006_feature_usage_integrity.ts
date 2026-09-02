export const migration006FeatureUsageIntegrity = {
  version: 6,
  name: 'feature_usage_integrity',
  statements: [
    `DELETE FROM feature_usage_limits
     WHERE rowid NOT IN (
       SELECT MAX(rowid)
       FROM feature_usage_limits
       GROUP BY feature_key, date_key, period
     );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_usage_unique
     ON feature_usage_limits(feature_key, date_key, period);`,
  ],
} as const;
