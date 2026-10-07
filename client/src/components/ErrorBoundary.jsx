import { Component } from 'react';
import { PiArrowClockwise, PiWarning } from 'react-icons/pi';

/**
 * React error boundary — DESIGN-SYSTEM §8.13.
 * Wrap around any major section that fetches data or renders third-party components (map, gallery, etc.).
 * Renders a warm, on-brand fallback with a retry button instead of crashing the whole page.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<p>Custom fallback</p>}>…</ErrorBoundary>
 *
 * Set `section` to true for a narrower in-page fallback; omit for a full-content-area fallback.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // In production you could ship error + info to an observability service here.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    const { children, fallback, section = false } = this.props;

    if (!error) return children;

    if (fallback) {
      return typeof fallback === 'function' ? fallback({ error, reset: this.reset }) : fallback;
    }

    return (
      <div
        role="alert"
        className={`flex flex-col items-center gap-4 text-center ${section ? 'py-10 px-edge' : 'px-edge py-20'}`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-mithila-pill text-mithila-primary">
          <PiWarning aria-hidden="true" className="h-7 w-7" />
        </span>

        <div>
          <p className="text-section font-semibold text-mithila-text">Something went wrong</p>
          <p className="mt-1 max-w-xs text-body text-mithila-textSecondary">
            {import.meta.env.DEV && error?.message
              ? error.message
              : 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <button
          type="button"
          onClick={this.reset}
          className="press inline-flex items-center gap-2 rounded-xs border border-mithila-border bg-mithila-card px-4 py-2.5 text-button text-mithila-text shadow-sm hover:bg-mithila-pill"
        >
          <PiArrowClockwise aria-hidden="true" className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }
}
