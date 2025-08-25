import Product, { CATEGORY_OPTIONS_LIST, SUBCATEGORIES_BY_CATEGORY } from '../../models/Product.js';
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
    if (typeof updateData.customSubcategories === 'string') updateData.customSubcategories = [updateData.customSubcategories];
    if (typeof updateData.images === 'string') updateData.images = [updateData.images];

    // Handle subcategories properly for FormData
    if (updateData.subcategories && !Array.isArray(updateData.subcategories)) {
      updateData.subcategories = [updateData.subcategories];
    }

    // Parse numbers
    if (updateData.InitialPrice) updateData.InitialPrice = Number(updateData.InitialPrice);
    if (updateData.afterDiscountPrice) updateData.afterDiscountPrice = Number(updateData.afterDiscountPrice);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.isDiscounted !== undefined) updateData.isDiscounted = updateData.isDiscounted === 'true' || updateData.isDiscounted === true;
    if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
    if (updateData.isBestseller !== undefined) updateData.isBestseller = updateData.isBestseller === 'true' || updateData.isBestseller === true;

    // Category validation
    if (updateData.category && !CATEGORY_OPTIONS_LIST.includes(updateData.category)) {
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${CATEGORY_OPTIONS_LIST.join(', ')}` 
      });
    }

    // Subcategory validation
    if (updateData.category && updateData.category !== 'Others') {
      let subcategory = updateData.subcategories;
      if (Array.isArray(subcategory)) {
        subcategory = subcategory[0];
      }

      if (!subcategory) {
        return res.status(400).json({ 
          message: 'Subcategory is required for selected category' 
        });
      } else {
        const validSubs = SUBCATEGORIES_BY_CATEGORY[updateData.category] || [];
        if (!validSubs.includes(subcategory)) {
          return res.status(400).json({ 
            message: `Invalid subcategory '${subcategory}' for category '${updateData.category}'. Valid options: ${validSubs.join(', ')}` 
          });
        }
      }
    }

    // Validate custom category when "Others" is selected
    if (updateData.category === 'Others') {
      if (!updateData.customCategory || updateData.customCategory.trim() === '') {
        return res.status(400).json({ 
          message: 'Custom category is required when "Others" is selected' 
        });
      } else if (updateData.customCategory.trim().length > 100) {
        return res.status(400).json({ 
          message: 'Custom category must be less than 100 characters' 
        });
      }
    }

    // Handle custom category
    if (updateData.category === 'Others' && updateData.customCategory) {
      updateData.customCategory = updateData.customCategory.trim();
    }

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
    // Get existing images from form (URLs)
    let existingImages = [];
    if (req.body['existingImages[]']) {
      if (Array.isArray(req.body['existingImages[]'])) {
        existingImages = req.body['existingImages[]'].map(url => ({ url }));
      } else if (typeof req.body['existingImages[]'] === 'string') {
        existingImages = [{ url: req.body['existingImages[]'] }];
      }
    }
    // Merge new and existing images correctly
    if (newImages.length > 0 || existingImages.length > 0) {
      updateData.images = [...existingImages, ...newImages];
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