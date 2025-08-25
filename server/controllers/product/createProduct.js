import Product, { CATEGORY_OPTIONS_LIST, SUBCATEGORIES_BY_CATEGORY } from "../../models/Product.js";
import { uploadOnCloudinary } from '../../utils/cloudinary.js';


// Create product (admin only, supports multiple images)
const createProduct = async (req, res) => {
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
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Files details:', req.files);

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

    // Custom category validation
    if (req.body.category === 'Others') {
      if (!req.body.customCategory || req.body.customCategory.trim() === '') {
        validationErrors.push('Custom category is required when "Others" is selected');
      } else if (req.body.customCategory.trim().length > 100) {
        validationErrors.push('Custom category must be less than 100 characters');
      }
    }

    // Subcategory validation
    if (req.body.category && req.body.category !== 'Others') {
      // Handle both array and string formats from FormData
      let subcategory = req.body.subcategories;
      if (Array.isArray(subcategory)) {
        subcategory = subcategory[0];
      }

      if (!subcategory) {
        validationErrors.push('Subcategory is required for selected category');
      } else {
        const validSubs = SUBCATEGORIES_BY_CATEGORY[req.body.category] || [];
        if (!validSubs.includes(subcategory)) {
          validationErrors.push(`Invalid subcategory '${subcategory}' for category '${req.body.category}'. Valid options: ${validSubs.join(', ')}`);
        }
      }
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
      console.log('Processing files:', req.files);
      // Multer upload.fields: req.files is an object: { featuredImage: [file], images: [file, ...] }
      const galleryFiles = req.files.images ? (Array.isArray(req.files.images) ? req.files.images : [req.files.images]) : [];
      const featuredFiles = req.files.featuredImage ? (Array.isArray(req.files.featuredImage) ? req.files.featuredImage : [req.files.featuredImage]) : [];

      // Upload gallery images
      console.log('Gallery files to upload:', galleryFiles.length);
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        console.log(`Uploading gallery file ${i + 1}:`, file.originalname);
        try {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
          }
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            throw new Error(`File too large: ${file.size} bytes. Maximum size: ${maxSize} bytes`);
          }
          console.log(`Uploading to cloudinary: ${file.path}`);
          const result = await uploadOnCloudinary(file.path);
          console.log('Upload successful:', result.secure_url);
          images.push({ url: result.secure_url, alt: file.originalname || 'Product Image' });
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
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

    // Handle custom category
    if (req.body.category === 'Others' && req.body.customCategory) {
      productData.customCategory = req.body.customCategory.trim();
    }

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
      // Handle FormData format where subcategories might be a single string
      if (Array.isArray(req.body.subcategories)) {
        productData.subcategories = req.body.subcategories;
      } else {
        // If it's a string, create an array with that single value
        productData.subcategories = [req.body.subcategories];
      }
    }

    // Handle custom subcategories
    if (req.body.customSubcategories) {
      productData.customSubcategories = Array.isArray(req.body.customSubcategories)
        ? req.body.customSubcategories
        : req.body.customSubcategories.split(',').map(sub => sub.trim()).filter(sub => sub);
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

export default createProduct;
