import { useCallback, useEffect, useRef, useState } from 'react';
import type { PremiumFeature } from '@/types/ads';
import { getFeatureAccessState, type FeatureAccessState } from '@/services/featureGateService';

export function useFeatureGate(featureKey?: PremiumFeature) {
  const [state, setState] = useState<FeatureAccessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  const refreshAccess = useCallback(async (key: PremiumFeature = featureKey ?? 'csv_export') => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const nextState = await getFeatureAccessState(key);
      if (requestId === requestIdRef.current) {
        setState(nextState);
      }
    } catch (nextError) {
      if (requestId === requestIdRef.current) {
        setState(null);
        setError(nextError instanceof Error ? nextError.message : 'FEATURE_GATE_LOAD_FAILED');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [featureKey]);

  useEffect(() => {
    void refreshAccess(featureKey);
    return () => {
      requestIdRef.current += 1;
    };
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
