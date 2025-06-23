import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalQuantity: 0, totalPrice: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch cart from backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/cart')
        setCart(data || { items: [], totalQuantity: 0, totalPrice: 0 })
      } catch (err) {
        setError(err.response?.data?.message || err.message)
        console.error('CartContext: Error fetching cart:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
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
