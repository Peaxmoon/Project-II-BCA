import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Products from '../pages/Shop/Products'
import ProductDetail from '../pages/Shop/ProductDetail'
import Cart from '../pages/Shop/Cart'
import Checkout from '../pages/Shop/Checkout'
import Orders from '../pages/User/Orders'
import Profile from '../pages/User/Profile'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import Admin from '../pages/Admin'
import NotFound from '../pages/NotFound'
import Features from '../pages/Features'
import TrackOrder from '../pages/TrackOrder'
import OrderConfirmation from '../pages/Shop/OrderConfirmation';
import Wishlist from '../pages/Wishlist'
import ProductReviews from '../pages/Shop/ProductReviews'
import { useAuth } from '../contexts/AuthContext'

// AdminRoute wrapper
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <NotFound />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/admin/*" element={
      <AdminRoute>
        <Admin />
      </AdminRoute>
    } />
    <Route path="/features" element={<Features />} />
    <Route path="/track-order" element={<TrackOrder />} />
    <Route path="/order-confirmation" element={<OrderConfirmation />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/products/:id/reviews" element={<ProductReviews />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default AppRoutes
