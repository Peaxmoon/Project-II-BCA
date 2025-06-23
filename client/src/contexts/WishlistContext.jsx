import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

const LOCAL_KEY = 'electomart_wishlist';

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]); // Array of product objects (if logged in) or IDs (if guest)
  const [loading, setLoading] = useState(false);

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
    if (user) {
      // Logged in: fetch from API
      try {
        const res = await api.get('/wishlist');
        setWishlist(res.data);
      } catch {
        setWishlist([]);
      }
    } else {
      // Guest: from localStorage
      setWishlist(getLocalWishlist());
    }
    setLoading(false);
  }, [user]);

  // Add to wishlist
  const addToWishlist = async (product) => {
    if (user) {
      await api.post(`/wishlist/${product._id || product}`);
      fetchWishlist();
    } else {
      // product can be object or ID
      const id = product._id || product;
      const ids = getLocalWishlist();
      if (!ids.includes(id)) {
        const newIds = [...ids, id];
        setLocalWishlist(newIds);
        setWishlist(newIds);
      }
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (product) => {
    if (user) {
      await api.delete(`/wishlist/${product._id || product}`);
      fetchWishlist();
    } else {
      const id = product._id || product;
      const ids = getLocalWishlist().filter(pid => pid !== id);
      setLocalWishlist(ids);
      setWishlist(ids);
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
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
} 