import { body, validationResult } from "express-validator";

// Registration Validation Rules 
export const registerValidation = [
    body("name").notEmpty().withMessage("Name is Required"),
    body("email")
    .isEmail().withMessage("Email is Required")
    .normalizeEmail(),
    body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

// Login validation rules
export const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is Required"),
];

// Enhanced Product creation validation rules
export const productValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Product name is required")
        .isLength({ min: 2, max: 200 }).withMessage("Product name must be between 2 and 200 characters"),
    
    body("description")
        .trim()
        .notEmpty().withMessage("Product description is required")
        .isLength({ min: 10, max: 2000 }).withMessage("Description must be between 10 and 2000 characters"),
    
    body("brand")
        .trim()
        .notEmpty().withMessage("Product brand is required")
        .isLength({ min: 1, max: 100 }).withMessage("Brand must be between 1 and 100 characters"),
    
    body("category")
        .trim()
        .notEmpty().withMessage("Product category is required")
        .isIn([
            "Kitchen Appliances",
            "Large Appliances", 
            "Small Home Appliances",
            "Mobile & Accessories",
            "Computers & Accessories",
            "Entertainment & Smart Devices",
            "Wearables & Personal Gadgets",
            "Others"
        ]).withMessage("Invalid category selected"),
    
    // Custom category validation
    body("customCategory")
        .optional()
        .custom((value, { req }) => {
            if (req.body.category === 'Others' && (!value || value.trim().length === 0)) {
                throw new Error("Custom category is required when 'Others' is selected");
            }
            if (value && value.trim().length > 100) {
                throw new Error("Custom category must be less than 100 characters");
            }
            return true;
        }),
    
    body("InitialPrice")
        .notEmpty().withMessage("Product price is required")
        .isFloat({ min: 0 }).withMessage("Price must be a valid positive number"),
    
    body("stock")
        .notEmpty().withMessage("Product stock is required")
        .isInt({ min: 0 }).withMessage("Stock must be a valid non-negative integer"),
    
    body("sku")
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage("SKU must be between 3 and 50 characters"),
    
    body("unit")
        .optional()
        .isIn(['piece', 'set', 'kg', 'litre', 'box', 'pack', 'meter', 'roll', 'other'])
        .withMessage("Invalid unit selected"),
    
    body("warranty")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Warranty description must be less than 200 characters"),
    
    body("isDiscounted")
        .optional()
        .custom((value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            if (value === undefined || value === '') return true;
            throw new Error("isDiscounted must be a boolean value");
        }),
    
    body("afterDiscountPrice")
        .optional()
        .isFloat({ min: 0 }).withMessage("Discount price must be a valid positive number")
        .custom((value, { req }) => {
            const isDiscounted = req.body.isDiscounted === 'true' || req.body.isDiscounted === true;
            if (isDiscounted && (!value || Number(value) >= Number(req.body.InitialPrice))) {
                throw new Error("Discount price must be less than original price when discount is enabled");
            }
            return true;
        }),
    
    body("isFeatured")
        .optional()
        .custom((value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            if (value === undefined || value === '') return true;
            throw new Error("isFeatured must be a boolean value");
        }),
    
    body("isBestseller")
        .optional()
        .custom((value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            if (value === undefined || value === '') return true;
            throw new Error("isBestseller must be a boolean value");
        }),
    
    body("status")
        .optional()
        .isIn(['active', 'inactive', 'archived']).withMessage("Invalid status selected"),
    
    // Shipping info validation
    body("shippingWeight")
        .optional()
        .isFloat({ min: 0 }).withMessage("Shipping weight must be a valid positive number"),
    
    body("shippingLength")
        .optional()
        .isFloat({ min: 0 }).withMessage("Shipping length must be a valid positive number"),
    
    body("shippingWidth")
        .optional()
        .isFloat({ min: 0 }).withMessage("Shipping width must be a valid positive number"),
    
    body("shippingHeight")
        .optional()
        .isFloat({ min: 0 }).withMessage("Shipping height must be a valid positive number"),
    
    // Tags validation
    body("tags")
        .optional()
        .custom((value) => {
            // Handle both array and FormData format
            let tags = value;
            if (typeof value === 'string') {
                tags = [value];
            } else if (Array.isArray(value)) {
                tags = value;
            } else {
                // For FormData, tags might be individual fields like tags[0], tags[1], etc.
                return true; // Skip validation for individual array fields
            }
            
            if (tags.length > 20) {
                throw new Error("Maximum 20 tags allowed");
            }
            for (let tag of tags) {
                if (typeof tag !== 'string' || tag.length > 50) {
                    throw new Error("Each tag must be a string with maximum 50 characters");
                }
            }
            return true;
        }),
    
    // Subcategories validation
    body("subcategories")
        .optional()
        .custom((value) => {
            // Handle both array and FormData format
            let subcategories = value;
            if (typeof value === 'string') {
                subcategories = [value];
            } else if (Array.isArray(value)) {
                subcategories = value;
            } else {
                // For FormData, subcategories might be individual fields like subcategories[0], subcategories[1], etc.
                return true; // Skip validation for individual array fields
            }
            
            if (subcategories.length > 10) {
                throw new Error("Maximum 10 subcategories allowed");
            }
            for (let sub of subcategories) {
                if (typeof sub !== 'string' || sub.length > 100) {
                    throw new Error("Each subcategory must be a string with maximum 100 characters");
                }
            }
            return true;
        })
];

// Order creation validation rules
export const orderValidation = [
  // Accept both 'items' and 'orderItems' for compatibility
  body(["items", "orderItems"])
    .custom((value, { req }) => {
      // Accept either 'items' or 'orderItems' as array
      const items = req.body.items || req.body.orderItems;
      if (!Array.isArray(items) || items.length < 1) {
        throw new Error("Order must have at least one item");
      }
      return true;
    }),
  body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
];

// Cart update validation rules
export const cartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

// Middleware to handle validation errors
export const validate = (req, res, next) => {
  console.log('=== Validation Debug ===');
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Request body:', req.body);
  if (Array.isArray(req.files)) {
    console.log('Files:', req.files.map(f => ({ name: f.originalname, size: f.size })));
  } else if (req.files && typeof req.files === 'object') {
    const fileSummary = {};
    for (const key in req.files) {
      if (Array.isArray(req.files[key])) {
        fileSummary[key] = req.files[key].map(f => ({ name: f.originalname, size: f.size }));
      }
    }
    console.log('Files:', fileSummary);
  } else {
    console.log('Files: No files');
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      message: "Validation failed",
      code: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  console.log('Validation passed');
  console.log('=== End Validation Debug ===');
  next();
};

export const passwordResetValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const newPasswordValidation = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const updateUserValidation = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  // ...other fields
];

// Enhanced product update validation (less strict than creation)
export const productUpdateValidation = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 }).withMessage("Product name must be between 2 and 200 characters"),
    
    body("description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage("Description must be between 10 and 2000 characters"),
    
    body("brand")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage("Brand must be between 1 and 100 characters"),
    
    body("category")
        .optional()
        .trim()
        .isIn([
            "TV & Audio", "Mobile Phones", "Kitchen Appliances", "Laptops", 
            "Refrigerators", "Washing Machines", "Air Conditioners", "Small Gadgets",
            "Lights & Accessories", "Power Tools", "Safety & Welding Equipment", 
            "Hand Tools", "Office Essentials", "Gardening Tools", "Agriculture Tools",
            "Bathroom Hardware", "General Hardware", "Home Appliances", "Machinery",
            "Automotive Accessories", "Fans", "Monitors", "Smart Devices"
        ]).withMessage("Invalid category selected"),
    
    body("InitialPrice")
        .optional()
        .isFloat({ min: 0 }).withMessage("Price must be a valid positive number"),
    
    body("stock")
        .optional()
        .isInt({ min: 0 }).withMessage("Stock must be a valid non-negative integer"),
    
    body("isDiscounted")
        .optional()
        .custom((value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            if (value === undefined || value === '') return true;
            throw new Error("isDiscounted must be a boolean value");
        }),
    
    body("afterDiscountPrice")
        .optional()
        .isFloat({ min: 0 }).withMessage("Discount price must be a valid positive number"),
    
    body("isFeatured")
        .optional()
        .custom((value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            if (value === undefined || value === '') return true;
            throw new Error("isFeatured must be a boolean value");
        }),
    
    body("isBestseller")
        .optional()
        .custom((value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return true;
            if (value === undefined || value === '') return true;
            throw new Error("isBestseller must be a boolean value");
        }),
    
    body("status")
        .optional()
        .isIn(['active', 'inactive', 'archived']).withMessage("Invalid status selected")
];

// Review validation rules
export const reviewValidation = [
  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment")
    .notEmpty().withMessage("Comment is required")
    .isLength({ min: 2, max: 2000 }).withMessage("Comment must be at least 2 characters"),
];