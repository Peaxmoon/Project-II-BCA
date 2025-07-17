import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    res.json(cart || { items: [], totalQuantity: 0, totalPrice: 0 });
  } catch (error) {
    console.error('cartController: Error fetching cart:', error);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        price: product.InitialPrice,
        quantity,
        image: product.featuredImage || (product.images[0] && product.images[0].url) || ""
      });
    }
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('cartController: Error adding to cart:', error);
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });
    item.quantity = quantity;
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('cartController: Error updating cart item:', error);
    res.status(500).json({ message: "Error updating cart item", error: error.message });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('cartController: Error removing cart item:', error);
    res.status(500).json({ message: "Error removing cart item", error: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('cartController: Error clearing cart:', error);
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};
