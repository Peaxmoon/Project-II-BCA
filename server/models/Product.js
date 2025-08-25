import mongoose from "mongoose";

const CATEGORY_OPTIONS = [
  "Kitchen Appliances",
  "Large Appliances", 
  "Small Home Appliances",
  "Mobile & Accessories",
  "Computers & Accessories",
  "Entertainment & Smart Devices",
  "Wearables & Personal Gadgets",
  "Others"
];

const SUBCATEGORIES_MAP = {
  "Kitchen Appliances": [
    "Rice Cookers",
    "Mixer Grinders & Blenders",
    "Induction / Gas Stoves",
    "Electric Kettles / Coffee Makers",
    "Toasters / Sandwich Makers",
    "Microwave Ovens",
    "Air Fryers",
    "Water Purifiers / Dispensers",
    "Others"
  ],
  "Large Appliances": [
    "Refrigerators & Freezers",
    "Washing Machines & Dryers",
    "Dishwashers",
    "Ovens",
    "Others"
  ],
  "Small Home Appliances": [
    "Irons & Steamers",
    "Vacuum Cleaners",
    "Sewing Machines",
    "Fans",
    "Heaters / Room Heaters",
    "Air Coolers & Humidifiers",
    "Inverters / UPS / Solar Backup",
    "Others"
  ],
  "Mobile & Accessories": [
    "Smartphones",
    "Smart Feature Phones",
    "Earphones & Headphones",
    "Smartwatches / Fitness Bands",
    "Power Banks",
    "Chargers & Cables",
    "Mobile Covers / Screen Protectors",
    "Others"
  ],
  "Computers & Accessories": [
    "Laptops & Desktops",
    "Tablets",
    "Keyboards / Mouse",
    "Printers & Scanners",
    "External Hard Drives / SSDs",
    "USB Flash Drives",
    "Networking Devices",
    "Others"
  ],
  "Entertainment & Smart Devices": [
    "Smart TVs",
    "Projectors",
    "Bluetooth Speakers / Home Theatres",
    "VR Headsets",
    "Streaming Devices",
    "Others"
  ],
  "Wearables & Personal Gadgets": [
    "Smart Glasses",
    "Digital Cameras / Action Cameras",
    "Drones",
    "Others"
  ],
  "Others": [
    "Others"
  ]
};


// Also dimension needed of product for authentication and shipping
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerifiedPurchaser: { type: Boolean, default: false }, // NEW
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  brand: {
    type: String,
    required: true,
    trim: true  // Remove enum validation to allow any brand
  },
  category: {
    type: String,
    enum: CATEGORY_OPTIONS,
    required: true,
    index: true
  },
  customCategory: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        // customCategory is required only when category is "Others"
        if (this.category === 'Others' && !value) {
          return false;
        }
        return true;
      },
      message: 'Custom category is required when "Others" is selected'
    }
  },
  subcategories: {
    type: [String],
    validate: {
      validator: function(values) {
        // Allow empty subcategories
        if (!values || values.length === 0) return true;
        
        // Only allow one subcategory
        if (values.length > 1) return false;
        
        // For 'Others' category, allow any subcategory
        if (this.category === 'Others') return true;
        
        // For other categories, validate against predefined subcategories
        const validSubs = SUBCATEGORIES_MAP[this.category] || [];
        return values.every(val => validSubs.includes(val));
      },
      message: 'Please select exactly one valid subcategory'
    }
  },
  customSubcategories: [{
    type: String,
    trim: true
  }],
  InitialPrice: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  isDiscounted: {
    type: Boolean,
    default: false
  },
  afterDiscountPrice: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  isFeatured: {//display this product in a "Featured Products" section, homepage carousel, or for promotional/advertising purposes. 
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: 'ProductImage' }
  }],
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  unit: {
    type: String,
    default: 'piece',
    enum: ['piece', 'set', 'kg', 'litre', 'box', 'pack', 'meter', 'roll', 'other']
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  warranty: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  shippingInfo: {
    weight: { type: Number }, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
}, {
  timestamps: true,
});

// Add text index for fast search (if not already present)
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  category: 'text' 
});

// Export constants and model (combine all exports at the end)
export const CATEGORY_OPTIONS_LIST = CATEGORY_OPTIONS;
export const SUBCATEGORIES_BY_CATEGORY = SUBCATEGORIES_MAP;

// Create and export model as default
const Product = mongoose.model("Product", productSchema);
export default Product;

