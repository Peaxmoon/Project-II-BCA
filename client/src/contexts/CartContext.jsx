import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], totalQuantity: 0, totalPrice: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch cart from backend on mount
  useEffect(() => {
    // Reset loading and error state when user changes
    setLoading(false)
    setError(null)
    
    if (!user) {
      // If user is not logged in, show login prompt and stop loading
      setCart({ items: [], totalQuantity: 0, totalPrice: 0 })
      setError('Please log in to access your cart')
      return
    }
    
    if (!user.token) {
      setError('Please log in to access your cart')
      return
    }
    
    const fetchCart = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/cart')
        setCart(data || { items: [], totalQuantity: 0, totalPrice: 0 })
      } catch (err) {
        if (err.response?.status === 401) {
          // Optionally: logoutUser();
          setError('Please log in to access your cart')
          return // Don't retry or show error to user
        }
        setError(err.response?.data?.message || err.message)
        console.error('CartContext: Error fetching cart:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [user])

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      setError('Please log in to add items to cart')
      throw new Error('Please log in to add items to cart')
    }
    
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/cart', { productId, quantity })
      setCart(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart')
      console.error('CartContext: Error adding to cart:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update item quantity
  const updateCartItem = async (productId, quantity) => {
    if (!user) {
      setError('Please log in to update cart')
      throw new Error('Please log in to update cart')
    }
    
    setLoading(true)
    setError(null)
    try {
      const res = await api.put(`/cart/${productId}`, { quantity })
      setCart(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart')
      console.error('CartContext: Error updating cart:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Remove item from cart
  const removeCartItem = async (productId) => {
    if (!user) {
      setError('Please log in to remove items from cart')
      throw new Error('Please log in to remove items from cart')
    }
    
    setLoading(true)
    setError(null)
    try {
      const res = await api.delete(`/cart/${productId}`)
      setCart(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from cart')
      console.error('CartContext: Error removing from cart:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (!user) {
      setError('Please log in to clear cart')
      throw new Error('Please log in to clear cart')
    }
    
    setLoading(true)
    setError(null)
    try {
      const res = await api.delete('/cart')
      setCart(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart')
      console.error('CartContext: Error clearing cart:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
      cartItems: cart.items
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
