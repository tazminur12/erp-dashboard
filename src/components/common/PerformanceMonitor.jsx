import React, { useEffect, useState } from 'react';

const PerformanceMonitor = ({ children }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Monitor performance metrics
    const startTime = performance.now();
    
    // Monitor memory usage if available
    const updateMemoryUsage = () => {
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    // Update memory usage periodically
    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    const endTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      loadTime: Math.round(endTime - startTime),
      renderTime: Math.round(endTime - startTime)
    }));

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="relative">
        {children}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
          <div>Load: {metrics.loadTime}ms</div>
          <div>Render: {metrics.renderTime}ms</div>
          <div>Memory: {metrics.memoryUsage}MB</div>
        </div>
      </div>
    );
  }

  return children;
};

export default PerformanceMonitor;
