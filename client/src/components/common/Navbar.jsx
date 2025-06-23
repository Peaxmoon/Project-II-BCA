// This file is no longer needed. Navigation is handled in Layout.jsx.
import { Link } from 'react-router-dom'

const Navbar = () => (
  <nav className="navbar">
    <Link to="/">Home</Link>
    <Link to="/products">Products</Link>
    <Link to="/cart">Cart</Link>
    <Link to="/wishlist">Wishlist</Link>
    <Link to="/orders">Orders</Link>
    <Link to="/profile">Profile</Link>
    <Link to="/login">Login</Link>
    {user?.isAdmin && <Link to="/admin">Admin</Link>}
  </nav>
)

export default Navbar
