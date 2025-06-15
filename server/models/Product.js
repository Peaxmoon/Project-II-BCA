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
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  discountPrice: {
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
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: 'ProductImage' }
  }],
  featuredImage: {
    type: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
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


