import React, { useContext } from 'react';
import { Layout } from './components/common/Layout';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/common/Loader';
import LoaderContext from './contexts/LoaderContext.js';
import './App.css';

function App() {
  const { loading } = useContext(LoaderContext);

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