import { useCallback, useEffect, useState } from 'react';
import type { PremiumFeature } from '@/types/ads';
import { getFeatureAccessState, type FeatureAccessState } from '@/services/featureGateService';

export function useFeatureGate(featureKey?: PremiumFeature) {
  const [state, setState] = useState<FeatureAccessState | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccess = useCallback(async (key: PremiumFeature = featureKey ?? 'csv_export') => {
    setLoading(true);
    try {
      setState(await getFeatureAccessState(key));
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
    refreshAccess,
    canUseFeature: async (key: PremiumFeature) => {
      const next = await getFeatureAccessState(key);
      setState(next);
      return next.allowed;
    },
  };
}
