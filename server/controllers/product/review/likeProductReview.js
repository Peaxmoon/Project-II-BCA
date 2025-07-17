import Product from '../../../models/Product.js';

// Like/unlike a review
const likeProductReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const userId = req.user._id.toString();

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const review = product.reviews.id(reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  if (!review.likes) review.likes = [];
  const alreadyLiked = review.likes.some(likeId => likeId.toString() === userId);

  if (alreadyLiked) {
    // Unlike (remove user's like)
    review.likes = review.likes.filter(likeId => likeId.toString() !== userId);
  } else {
    // Like (add user's like, only if not already liked)
    review.likes.push(userId);
  }

  await product.save();
  res.json({
    message: alreadyLiked ? "Review unliked" : "Review liked",
    likesCount: review.likes.length,
    isLikedByUser: !alreadyLiked
  });
};

export default likeProductReview;