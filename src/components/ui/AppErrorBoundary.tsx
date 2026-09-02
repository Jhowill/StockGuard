import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { ErrorState } from './ErrorState';
import { ScreenContainer } from './ScreenContainer';
import { useI18n } from '@/hooks/useI18n';

type BoundaryProps = {
  children: ReactNode;
  fallback: (reset: () => void) => ReactNode;
};

type BoundaryState = { failed: boolean };

class RenderErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Intentionally avoid logging user data or native error details in production.
  }

  reset = () => this.setState({ failed: false });

  render() {
    return this.state.failed ? this.props.fallback(this.reset) : this.props.children;
  }
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <RenderErrorBoundary
      fallback={(reset) => (
        <ScreenContainer padded>
          <ErrorState
            title={t('errors.genericTitle')}
            description={t('errors.genericBody')}
            actionLabel={t('common.retry')}
            onActionPress={() => {
              reset();
              router.replace('/');
            }}
          />
        </ScreenContainer>
      )}
    >
      {children}
    </RenderErrorBoundary>
  );
}
