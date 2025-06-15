import Product from "../models/Product.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all products
export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// Get single product
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      imageUrl = result.secure_url; // Get the secure URL from Cloudinary response
    }
    const newProduct = new Product({
      ...req.body,
      images: imageUrl ? [{ url: imageUrl }] : []
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
  // res.status(201).json(savedProduct);
};

// Update product
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
};

// Delete product
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};
