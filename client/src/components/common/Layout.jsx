import DoubleNavbar from './DoubleNavbar';
import { Box } from '@mantine/core';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

export function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't render navbar and footer for admin routes
  if (isAdminRoute) {
    return <Box className="min-h-screen">{children}</Box>;
  }

  return (
    <>
      <DoubleNavbar />
      <Box className="min-h-[80vh]">{children}</Box>
      <Footer />
    </>
  );
}