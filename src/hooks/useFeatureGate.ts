import { useCallback, useEffect, useState } from 'react';
import type { PremiumFeature } from '@/types/ads';
import { getFeatureAccessState, type FeatureAccessState } from '@/services/featureGateService';

export function useFeatureGate(featureKey?: PremiumFeature) {
  const [state, setState] = useState<FeatureAccessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refreshAccess = useCallback(async (key: PremiumFeature = featureKey ?? 'csv_export') => {
    setLoading(true);
    setError(undefined);
    try {
      setState(await getFeatureAccessState(key));
    } catch (nextError) {
      setState(null);
      setError(nextError instanceof Error ? nextError.message : 'FEATURE_GATE_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, [featureKey]);

  useEffect(() => {
    void refreshAccess(featureKey);
  }, [featureKey, refreshAccess]);

  return {
    state,
    loading,
    error,
    refreshAccess,
    canUseFeature: async (key: PremiumFeature) => {
      try {
        const next = await getFeatureAccessState(key);
        setState(next);
        setError(undefined);
        return next.allowed;
      } catch (nextError) {
        setState(null);
        setError(nextError instanceof Error ? nextError.message : 'FEATURE_GATE_LOAD_FAILED');
        return false;
      }
    },
  };
}
