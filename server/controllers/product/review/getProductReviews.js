import Product from '../../../models/Product.js';


// Get reviews for a product (sorted by likes, then date, paginated)
const getProductReviews = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 2, userOnly = false } = req.query;
  const userId = req.user?._id?.toString();

  const product = await Product.findById(id).select('reviews numReviews');
  if (!product) return res.status(404).json({ message: "Product not found" });

  let reviews = product.reviews.map(r => ({
    ...r.toObject(),
    likesCount: r.likes ? r.likes.length : 0,
    isLikedByUser: userId ? (r.likes || []).some(likeId => likeId.toString() === userId) : false,
    isUserReview: userId ? r.user.toString() === userId : false,
  }));

  // If userOnly, return only the user's review (if any)
  if (userOnly && userId) {
    const userReview = reviews.find(r => r.isUserReview);
    return res.json({
      reviews: userReview ? [userReview] : [],
      total: product.numReviews || reviews.length
    });
  }

  // Sort: user review first (if exists), then by likesCount desc, then by createdAt desc
  reviews.sort((a, b) => {
    if (a.isUserReview) return -1;
    if (b.isUserReview) return 1;
    if (b.likesCount !== a.likesCount) return b.likesCount - a.likesCount;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedReviews = reviews.slice(skip, skip + Number(limit));

  res.json({
    reviews: paginatedReviews,
    total: product.numReviews || reviews.length
  });
};

export default getProductReviews;