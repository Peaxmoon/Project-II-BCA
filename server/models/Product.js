import mongoose from "mongoose";

const CATEGORY_OPTIONS = [
  "TV & Audio",
  "Mobile Phones",
  "Kitchen Appliances",
  "Laptops",
  "Refrigerators",
  "Washing Machines",
  "Air Conditioners",
  "Small Gadgets"
];


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
    required: true
  },
  category: {
    type: String,
    enum: CATEGORY_OPTIONS,
    required: true,
    index: true
  },
  subcategories: [{
    type: String
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
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

export const CATEGORY_OPTIONS_LIST = CATEGORY_OPTIONS;
export default mongoose.model("Product", productSchema);


