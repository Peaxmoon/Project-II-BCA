import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import DashboardOverview from './admin/DashboardOverview';
import OrdersManagement from './admin/OrdersManagement';
import UsersManagement from './admin/UsersManagement';
import OrderDetails from './admin/OrderDetails';

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardOverview />} />
      <Route path="/products" element={<AdminDashboard />} />
      <Route path="/orders" element={<OrdersManagement />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route path="/users" element={<UsersManagement />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default Admin;
