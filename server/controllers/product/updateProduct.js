import Product from '../../models/Product.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';

// Update product (admin only)
const updateProduct = async (req, res) => {
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

export default updateProduct;