import Product, { CATEGORY_OPTIONS_LIST } from "../models/Product.js";
import Order from "../models/Order.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/User.js";


// Get all products with filtering, searching, and pagination
export const getProducts = async (req, res) => {
  try {
    // Support filtering by multiple IDs for wishlist/guest
    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(id => id.trim());
      const products = await Product.find({ _id: { $in: ids } });
      return res.json({ products });
    }
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    // Filtering
    const filter = {};
    if (req.query.category) filter.category = decodeURIComponent(req.query.category);
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === "true";
    if (req.query.isDiscounted) filter.isDiscounted = req.query.isDiscounted === "true";
    if (req.query.minPrice) filter.InitialPrice = { ...filter.InitialPrice, $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) filter.InitialPrice = { ...filter.InitialPrice, $lte: Number(req.query.maxPrice) };

    // Searching
    let search = {};
    if (req.query.keyword) {
      // Use MongoDB text index for fast search if keyword is present
      search = { $text: { $search: req.query.keyword } };
    }

    // Combine filter and search
    const query = { ...filter, ...search };

    // Sorting
    let sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { InitialPrice: 1 };
          break;
        case 'price_desc':
          sort = { InitialPrice: -1 };
          break;
        case 'name_asc':
          sort = { name: 1 };
          break;
        case 'name_desc':
          sort = { name: -1 };
          break;
        case 'rating':
          sort = { rating: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

// Get filter options (categories, brands, price range)
export const getFilterOptions = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    
    // Get price range
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$InitialPrice' },
          maxPrice: { $max: '$InitialPrice' }
        }
      }
    ]);

    const priceRange = priceStats.length > 0 ? {
      min: priceStats[0].minPrice,
      max: priceStats[0].maxPrice
    } : { min: 0, max: 0 };

    res.json({
      categories: categories.filter(Boolean),
      brands: brands.filter(Boolean),
      priceRange
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching filter options" });
  }
};

export const getProductQuery = async (req, res) => {
  const queryData = await Product.find();//but find all the related data
  res.json(queryData)
}

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

// Create product (admin only, supports multiple images)
export const createProduct = async (req, res) => {
  // 1. Authentication & Authorization Check
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Only admin users can create products.',
      code: 'AUTH_ERROR'
    });
  }

  try {
    console.log('=== Product Creation Started ===');
    console.log('User:', req.user._id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 0);

    // 2. Validate Required Fields
    const requiredFields = ['name', 'description', 'brand', 'category', 'InitialPrice', 'stock'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        missingFields,
        details: missingFields.map(field => ({ field, message: `${field} is required` }))
      });
    }

    // 3. Validate Field Types and Values
    const validationErrors = [];
    
    // Price validation
    const price = Number(req.body.InitialPrice);
    if (isNaN(price) || price < 0) {
      validationErrors.push('InitialPrice must be a valid positive number');
    }
    
    // Stock validation
    const stock = Number(req.body.stock);
    if (isNaN(stock) || stock < 0) {
      validationErrors.push('Stock must be a valid non-negative number');
    }
    
    // Category validation
    if (!CATEGORY_OPTIONS_LIST.includes(req.body.category)) {
      validationErrors.push(`Category must be one of: ${CATEGORY_OPTIONS_LIST.join(', ')}`);
    }

    if (validationErrors.length > 0) {
      console.log('Field validation errors:', validationErrors);
      return res.status(400).json({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: validationErrors.map(msg => ({ message: msg })),
        details: validationErrors.map(msg => ({ message: msg }))
      });
    }

    // 4. Handle Image Uploads
    let images = [];
    let featuredImageUrl;
    if (req.files) {
      // Multer upload.fields: req.files is an object: { featuredImage: [file], images: [file, ...] }
      const galleryFiles = Array.isArray(req.files.images) ? req.files.images : [];
      const featuredFiles = Array.isArray(req.files.featuredImage) ? req.files.featuredImage : [];

      // Upload gallery images
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        try {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
          }
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            throw new Error(`File too large: ${file.size} bytes. Maximum size: ${maxSize} bytes`);
          }
          const result = await uploadOnCloudinary(file.path);
          images.push({ url: result.secure_url, alt: file.originalname || 'Product Image' });
        } catch (uploadError) {
          return res.status(500).json({
            message: `Image upload failed: ${uploadError.message}`,
            code: 'UPLOAD_ERROR',
            failedImage: file.originalname,
            error: uploadError.message,
          });
        }
      }
      // Upload featured image (if provided)
      if (featuredFiles.length > 0) {
        const file = featuredFiles[0];
        try {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
          }
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            throw new Error(`File too large: ${file.size} bytes. Maximum size: ${maxSize} bytes`);
          }
          const result = await uploadOnCloudinary(file.path);
          featuredImageUrl = result.secure_url;
        } catch (uploadError) {
          return res.status(500).json({
            message: `Featured image upload failed: ${uploadError.message}`,
            code: 'UPLOAD_ERROR',
            failedImage: file.originalname,
            error: uploadError.message,
          });
        }
      }
    } else {
      console.log('No images provided');
    }

    // 5. Prepare Product Data
    const productData = {
      ...req.body,
      InitialPrice: price,
      stock: stock,
      images: images,
      seller: req.user._id, // Set the seller to current admin
      featuredImage: featuredImageUrl || (images.length > 0 ? images[0].url : undefined)
    };

    // 6. Handle Boolean Fields
    if (req.body.isDiscounted !== undefined) {
      productData.isDiscounted = req.body.isDiscounted === 'true' || req.body.isDiscounted === true;
    }
    if (req.body.isFeatured !== undefined) {
      productData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }
    if (req.body.isBestseller !== undefined) {
      productData.isBestseller = req.body.isBestseller === 'true' || req.body.isBestseller === true;
    }

    // 7. Handle Arrays (tags, subcategories)
    if (req.body.tags) {
      productData.tags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    if (req.body.subcategories) {
      productData.subcategories = Array.isArray(req.body.subcategories)
        ? req.body.subcategories
        : req.body.subcategories.split(',').map(sub => sub.trim()).filter(sub => sub);
    }

    // 8. Handle Shipping Info
    if (req.body.shippingWeight || req.body.shippingLength || req.body.shippingWidth || req.body.shippingHeight) {
      productData.shippingInfo = {
        weight: req.body.shippingWeight ? Number(req.body.shippingWeight) : undefined,
        dimensions: {
          length: req.body.shippingLength ? Number(req.body.shippingLength) : undefined,
          width: req.body.shippingWidth ? Number(req.body.shippingWidth) : undefined,
          height: req.body.shippingHeight ? Number(req.body.shippingHeight) : undefined
        }
      };
    }

    // 9. Handle Specifications (flattened FormData)
    if (Object.keys(req.body).some(key => key.startsWith('specifications['))) {
      productData.specifications = {};
      Object.entries(req.body).forEach(([key, value]) => {
        const match = key.match(/^specifications\[(.+)\]$/);
        if (match && value) {
          productData.specifications[match[1]] = value;
        }
      });
    }
    // Ensure specifications is a Map for Mongoose
    if (productData.specifications && typeof productData.specifications === 'object' && !(productData.specifications instanceof Map)) {
      productData.specifications = new Map(Object.entries(productData.specifications));
    }

    console.log('Product data prepared:', {
      name: productData.name,
      brand: productData.brand,
      category: productData.category,
      price: productData.InitialPrice,
      stock: productData.stock,
      imagesCount: productData.images.length
    });

    // 10. Create and Save Product
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    
    console.log('Product created successfully:', savedProduct._id);
    console.log('=== Product Creation Completed ===');

    // 11. Return Success Response
    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct,
      imagesUploaded: images.length
    });

  } catch (error) {
    console.error('=== Product Creation Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Files:', req.files && Array.isArray(req.files) ? req.files.map(f => ({ name: f.originalname, size: f.size })) : req.files);
    console.error('=== End Error Log ===');

    // 12. Handle Different Types of Errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value
      }));
      
      return res.status(400).json({
        message: 'Product validation failed',
        code: 'VALIDATION_ERROR',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      // Duplicate key error (e.g., SKU already exists)
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        message: `${field} already exists`,
        code: 'DUPLICATE_ERROR',
        field: field,
        value: error.keyValue[field]
      });
    }

    // 13. Generic Error Response
    res.status(500).json({
      message: 'Internal server error while creating product',
      code: 'INTERNAL_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can update products' });
  }
  try {
    // Find the product first
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Parse fields from req.body (FormData may send arrays as strings)
    let updateData = { ...req.body };
    // Parse arrays if needed
    if (typeof updateData.tags === 'string') updateData.tags = [updateData.tags];
    if (typeof updateData.subcategories === 'string') updateData.subcategories = [updateData.subcategories];
    if (typeof updateData.images === 'string') updateData.images = [updateData.images];

    // Parse numbers
    if (updateData.InitialPrice) updateData.InitialPrice = Number(updateData.InitialPrice);
    if (updateData.afterDiscountPrice) updateData.afterDiscountPrice = Number(updateData.afterDiscountPrice);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.isDiscounted !== undefined) updateData.isDiscounted = updateData.isDiscounted === 'true' || updateData.isDiscounted === true;
    if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
    if (updateData.isBestseller !== undefined) updateData.isBestseller = updateData.isBestseller === 'true' || updateData.isBestseller === true;

    // Shipping info
    updateData.shippingInfo = {
      weight: updateData['shippingInfo[weight]'] ? Number(updateData['shippingInfo[weight]']) : product.shippingInfo?.weight,
      dimensions: {
        length: updateData['shippingInfo[dimensions][length]'] ? Number(updateData['shippingInfo[dimensions][length]']) : product.shippingInfo?.dimensions?.length,
        width: updateData['shippingInfo[dimensions][width]'] ? Number(updateData['shippingInfo[dimensions][width]']) : product.shippingInfo?.dimensions?.width,
        height: updateData['shippingInfo[dimensions][height]'] ? Number(updateData['shippingInfo[dimensions][height]']) : product.shippingInfo?.dimensions?.height,
      }
    };

    // Specifications (flattened in FormData)
    if (Object.keys(req.body).some(k => k.startsWith('specifications['))) {
      updateData.specifications = {};
      Object.entries(req.body).forEach(([k, v]) => {
        const match = k.match(/^specifications\[(.+)\]$/);
        if (match) updateData.specifications[match[1]] = v;
      });
    }
    if (updateData.specifications && typeof updateData.specifications === 'object' && !(updateData.specifications instanceof Map)) {
      updateData.specifications = new Map(Object.entries(updateData.specifications));
    }

    // Handle images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadOnCloudinary(file.path);
          newImages.push({ url: result.secure_url });
        } catch (err) {
          return res.status(500).json({ message: "Image upload failed", error: err.message });
        }
      }
    }
    // If new images uploaded, replace; else keep old
    if (newImages.length > 0) {
      updateData.images = newImages;
    } else if (product.images && product.images.length > 0) {
      updateData.images = product.images;
    }
    // Featured image: if provided, update; else keep old
    if (updateData.featuredImage) {
      // If it's a blob URL, try to use the first uploaded image
      if (updateData.featuredImage.startsWith('blob:') && newImages.length > 0) {
        updateData.featuredImage = newImages[0].url;
      }
    } else {
      updateData.featuredImage = product.featuredImage;
    }

    // Update the product
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ message: "Product not found after update" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can delete products' });
  }
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};

// Get allowed categories and units for admin UI
export const getCategoryOptions = async (req, res) => {
  // Units are hardcoded for now
  const units = ['piece', 'set', 'kg', 'litre', 'box', 'pack', 'meter', 'roll', 'other'];
  res.json({
    categories: CATEGORY_OPTIONS_LIST,
    units
  });
};

// Get reviews for a product (sorted by likes, then date, paginated)
export const getProductReviews = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 2, userOnly = false } = req.query;
  const userId = req.user?._id?.toString();

  const product = await Product.findById(id).select('reviews');
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
    return res.json(userReview ? [userReview] : []);
  }

  // Sort: user review first (if exists), then by likesCount desc, then by createdAt desc
  reviews.sort((a, b) => {
    if (a.isUserReview) return -1;
    if (b.isUserReview) return 1;
    if (b.likesCount !== a.likesCount) return b.likesCount - a.likesCount;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Always show user's review at the top if exists, then top liked reviews
  let resultReviews = [];
  const userReview = reviews.find(r => r.isUserReview);
  if (userReview) resultReviews.push(userReview);

  // Remove user review from the rest
  const rest = reviews.filter(r => !r.isUserReview);

  // If user has review, show their review + top (limit-1) others, else top limit reviews
  if (userReview) {
    resultReviews = resultReviews.concat(rest.slice(0, limit - 1));
  } else {
    resultReviews = rest.slice(0, limit);
  }

  res.json(resultReviews);
};

// Like/unlike a review
export const likeProductReview = async (req, res) => {
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

// Update a review for a product
export const updateProductReview = async (req, res) => {
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

// Fast search for navbar using MongoDB text index
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") return res.json([]);
    // Use text index for fast search
    const results = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" }, name: 1, description: 1, brand: 1, category: 1, featuredImage: 1 }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};