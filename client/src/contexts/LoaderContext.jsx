import React, { useState, useEffect } from 'react';
import LoaderContext from './LoaderContext';

export const LoaderProvider = ({ children }) => {
  // Detect if this is a hard reload or direct navigation
  const navType = window.performance?.getEntriesByType('navigation')[0]?.type;
  const [loading, setLoading] = useState(() => navType === 'reload' || navType === 'navigate');

  useEffect(() => {
    if (loading) {
      // Hide loader after 1s or when content is ready
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};
