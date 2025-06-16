import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     price: { type: Number, required: true },
//     image: { type: String },
//     description: { type: String },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Product", productSchema);


// const mongoose = require('mongoose');

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
  // currency: { 
  //   type: String, 
  //   default: 'NPR' 
  // },
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
  
  isFeatured: {//you can display this product in a “Featured Products” section, homepage carousel, or for promotional/advertising purposes. 
    type: Boolean,
    default: false
  },
  featuredImage: {//This should store the URL of the main image for the product (the primary image you want to show first).
    type: String
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

export default mongoose.model("Product", productSchema);


