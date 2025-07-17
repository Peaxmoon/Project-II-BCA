import Product from '../../../models/Product.js';
import Order from "../../../models/Order.js";
import User from "../../../models/User.js";

// Add a review to a product
export const addProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Prevent duplicate review
  if (product.reviews.some(r => r.user.toString() === userId.toString())) {
    return res.status(400).json({ message: "You have already reviewed this product." });
  }

  // Check if user purchased this product
  const hasPurchased = await Order.exists({
    user: userId,
    'orderItems.product': product._id
  });

  // Fetch user from DB to get the latest name
  let reviewerName = "ElectroMart User"; // Default name if not found
  try {
    const userDoc = await User.findById(userId).select("name email");
    if (userDoc && userDoc.name && userDoc.name.trim() !== "") {
      reviewerName = userDoc.name;
    }
  } catch (err) {
    // fallback to default
  }

  const review = {
    user: userId,
    name: reviewerName,
    rating: Number(rating),
    comment,
    isVerifiedPurchaser: !!hasPurchased,
    likes: [], // <-- initialize likes array
    createdAt: new Date()
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added", review });
};

export default addProductReview;
