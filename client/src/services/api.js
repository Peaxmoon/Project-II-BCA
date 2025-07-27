import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
})

// Always send token from localStorage for every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('electomart_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api

// Add review for a product
export const addProductReview = (productId, review) =>
  api.post(`/products/${productId}/reviews`, review);

// Get reviews for a product (if you want a separate endpoint)
export const getProductReviews = (productId) =>
  api.get(`/products/${productId}/reviews`);
