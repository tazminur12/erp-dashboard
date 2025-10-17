import React, { Suspense, Component } from 'react';

// Error Boundary Component
class LazyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Component Loading Error
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error loading this component. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom hook for lazy loading with error boundary
export const useLazyComponent = (importFunction) => {
  const LazyComponent = React.lazy(importFunction);
  
  return (props) => (
    <LazyErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );
};

// Preload function for components that might be needed soon
export const preloadComponent = (importFunction) => {
  return () => {
    importFunction().catch(error => {
      console.warn('Preload failed:', error);
    });
  };
};

export default useLazyComponent;
