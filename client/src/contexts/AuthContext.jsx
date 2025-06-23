import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem('electomart_token') || null;
  const setToken = (token) => {
    if (token) localStorage.setItem('electomart_token', token);
    else localStorage.removeItem('electomart_token');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (token) {
          // Set token in axios headers for all requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        const { data } = await api.get('/users/me')
        setUser({
          name: data.name,
          email: data.email,
          isAdmin: data.role === 'admin',
          id: data.id,
          role: data.role,
          isEmailVerified: data.isEmailVerified,
          token: token, // <-- store token in user object
        })
      } catch (error) {
        console.log('User not authenticated:', error.message)
        setUser(null)
        setToken(null)
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const login = async (email, password) => {
    try {
      // Login and get token from response
      const res = await api.post('/users/login', { email, password })
      const token = res.data?.token;
      if (token) {
        setToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      // After login, fetch user info
      const { data } = await api.get('/users/me')
      setUser({
        name: data.name,
        email: data.email,
        isAdmin: data.role === 'admin',
        id: data.id,
        role: data.role,
        isEmailVerified: data.isEmailVerified,
        token: token,
      })
      return { success: true }
    } catch (error) {
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/users/logout')
    } catch (error) {
      console.log('Logout error:', error.message)
    } finally {
      setUser(null)
      setToken(null)
      delete api.defaults.headers.common['Authorization'];
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
