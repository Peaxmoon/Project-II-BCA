import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/common/Loader';
import './App.css';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <>
      {loading && <Loader />}
      <Layout>
        <AppRoutes />
      </Layout>
    </>
  );
}

export default App;