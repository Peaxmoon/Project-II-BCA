import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

export const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

const LOCAL_KEY = 'electomart_wishlist';

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]); // Array of product objects (if logged in) or IDs (if guest)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: get localStorage wishlist (array of product IDs)
  const getLocalWishlist = () => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    } catch {
      return [];
    }
  };

  // Helper: set localStorage wishlist
  const setLocalWishlist = (ids) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  };

  // Fetch wishlist from API or localStorage
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (!user) {
      // User not logged in - show empty wishlist with message
      setWishlist([]);
      setError('Please log in to view your wishlist');
      setLoading(false);
      return;
    }
    
    try {
      // Logged in: fetch from API
      const res = await api.get('/wishlist');
      setWishlist(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view your wishlist');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch wishlist');
      }
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add to wishlist
  const addToWishlist = async (product) => {
    if (!user) {
      setError('Please log in to add items to wishlist');
      throw new Error('Please log in to add items to wishlist');
    }
    
    try {
      await api.post(`/wishlist/${product._id || product}`);
      fetchWishlist();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to wishlist');
      throw err;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (product) => {
    if (!user) {
      setError('Please log in to remove items from wishlist');
      throw new Error('Please log in to remove items from wishlist');
    }
    
    try {
      await api.delete(`/wishlist/${product._id || product}`);
      fetchWishlist();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from wishlist');
      throw err;
    }
  };

  // Merge localStorage wishlist with server on login
  useEffect(() => {
    if (user) {
      const localIds = getLocalWishlist();
      if (localIds.length > 0) {
        // Add all local wishlist items to server
        Promise.all(localIds.map(id => api.post(`/wishlist/${id}`))).then(() => {
          setLocalWishlist([]);
          fetchWishlist();
        });
      } else {
        fetchWishlist();
      }
    } else {
      fetchWishlist();
    }
    // eslint-disable-next-line
  }, [user]);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, loading, error }}>
      {children}
    </WishlistContext.Provider>
  );
}

// Only export once, as named exports
// export { WishlistContext, WishlistProvider, useWishlist }