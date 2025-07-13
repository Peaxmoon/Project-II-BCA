import Product from '../../../models/Product.js';

// Update a review for a product
const updateProductReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const review = product.reviews.id(reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  // Only allow the user who wrote the review to update it
  if (review.user.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only update your own review." });
  }

  review.rating = Number(rating);
  review.comment = comment;

  // Recalculate product rating
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.json({ message: "Review updated", review });
};

export default updateProductReview;