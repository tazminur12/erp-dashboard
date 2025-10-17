# Lazy Loading Implementation Guide

## Overview
This project has been optimized with React lazy loading to improve performance and reduce initial bundle size. Components are now loaded on-demand, which significantly improves the initial page load time.

## What Was Implemented

### 1. React.lazy() Components
All page components are now lazy-loaded using `React.lazy()`:

```javascript
// Before (Direct Import)
import CustomerList from './pages/Customers/CustomerList';

// After (Lazy Loading)
const CustomerList = React.lazy(() => import('./pages/Customers/CustomerList'));
```

### 2. Suspense Boundaries
All lazy components are wrapped with `Suspense` to handle loading states:

```javascript
<Suspense fallback={<LoadingSpinner />}>
  <CustomerList />
</Suspense>
```

### 3. Bundle Splitting
The Vite configuration has been optimized with manual chunk splitting:

- **Vendor chunks**: React, React Router, TanStack Query
- **Feature chunks**: Customers, Transactions, Vendors, Hajj & Umrah, etc.
- **UI chunks**: Headless UI, Heroicons

### 4. Performance Monitoring
Added performance monitoring component for development mode to track:
- Load time
- Render time
- Memory usage

## Performance Benefits

### Before Lazy Loading
- Large initial bundle (all components loaded at once)
- Slower initial page load
- Higher memory usage
- Poor user experience on slow connections

### After Lazy Loading
- Smaller initial bundle (only essential components)
- Faster initial page load
- Components load on-demand
- Better user experience
- Improved caching (vendor chunks rarely change)

## Loading Spinner
A consistent loading spinner is shown while components are being loaded:

```javascript
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);
```

## Error Handling
Added error boundaries to handle lazy loading failures gracefully.

## Usage Examples

### Adding New Lazy Components
```javascript
// 1. Create lazy component
const NewComponent = React.lazy(() => import('./path/to/NewComponent'));

// 2. Wrap with Suspense in routes
{
  path: "new-route",
  element: (
    <Suspense fallback={<LoadingSpinner />}>
      <NewComponent />
    </Suspense>
  )
}
```

### Using the Custom Hook
```javascript
import { useLazyComponent } from './hooks/useLazyComponent';

const LazyComponent = useLazyComponent(() => import('./SomeComponent'));

// Use in JSX
<LazyComponent prop1="value" />
```

## Build Optimization
The Vite configuration includes:
- Manual chunk splitting for better caching
- Asset optimization
- Source maps for debugging
- Compression for server responses

## Monitoring Performance
In development mode, you'll see performance metrics in the bottom-right corner:
- Load time in milliseconds
- Render time in milliseconds
- Memory usage in MB

## Best Practices

1. **Group Related Components**: Keep related components in the same chunk
2. **Preload Critical Routes**: Use preloading for routes users are likely to visit
3. **Monitor Bundle Size**: Keep chunks under 1MB for optimal loading
4. **Error Handling**: Always wrap lazy components with error boundaries
5. **Loading States**: Provide meaningful loading indicators

## File Structure
```
src/
├── main.jsx (Updated with lazy loading)
├── vite.config.js (Optimized build configuration)
├── components/
│   └── common/
│       └── PerformanceMonitor.jsx (New)
└── hooks/
    └── useLazyComponent.js (New utility)
```

## Testing
To test the lazy loading implementation:

1. Open browser DevTools
2. Go to Network tab
3. Navigate between different routes
4. Observe that components load on-demand
5. Check the chunk splitting in the build output

## Future Improvements
- Implement route-based preloading
- Add service worker for offline support
- Optimize images with lazy loading
- Implement virtual scrolling for large lists
