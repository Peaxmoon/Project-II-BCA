import User from '../models/User.js';
import Product from '../models/Product.js';

// Get current user's wishlist (populated)
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist || []);
};

// Add a product to wishlist
export const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }
  const updated = await User.findById(req.user._id).populate('wishlist');
  res.json(updated.wishlist);
};

// Remove a product from wishlist
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();
  const updated = await User.findById(req.user._id).populate('wishlist');
  res.json(updated.wishlist);
}; 