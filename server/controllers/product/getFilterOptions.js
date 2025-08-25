import Product from '../../models/Product.js';

// Get filter options (categories, brands, price range)
const getFilterOptions = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    
    // Get custom categories (when category is "Others")
    const customCategories = await Product.distinct('customCategory', { category: 'Others' });
    
    // Get all subcategories including custom ones
    const subcategories = await Product.distinct('subcategories');
    const customSubcategories = await Product.distinct('customSubcategories');
    
    // Combine regular and custom subcategories
    const allSubcategories = [...new Set([...subcategories, ...customSubcategories])];
    
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
      customCategories: customCategories.filter(Boolean),
      brands: brands.filter(Boolean),
      subcategories: allSubcategories.filter(Boolean),
      priceRange
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching filter options" });
  }
};

export default getFilterOptions;