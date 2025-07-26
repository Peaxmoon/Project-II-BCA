import { createContext } from 'react';

const LoaderContext = createContext({
  loading: false,
  setLoading: () => {},
});

export default LoaderContext;
