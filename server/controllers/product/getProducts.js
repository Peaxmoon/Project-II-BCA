import Product from '../../models/Product.js';

// Get all products with filtering, searching, and pagination
const getProducts = async (req, res) => {
  try {
    // Support filtering by multiple IDs for wishlist/guest
    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(id => id.trim());
      const products = await Product.find({ _id: { $in: ids } });
      return res.json({ products });
    }
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    // Filtering
    const filter = {};
    if (req.query.category) filter.category = decodeURIComponent(req.query.category);
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === "true";
    if (req.query.isDiscounted) filter.isDiscounted = req.query.isDiscounted === "true";
    if (req.query.minPrice) filter.InitialPrice = { ...filter.InitialPrice, $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) filter.InitialPrice = { ...filter.InitialPrice, $lte: Number(req.query.maxPrice) };

    // Searching
    let search = {};
    if (req.query.keyword) {
      // Use MongoDB text index for fast search if keyword is present
      search = { $text: { $search: req.query.keyword } };
    }

    // Combine filter and search
    const query = { ...filter, ...search };

    // Sorting
    let sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { InitialPrice: 1 };
          break;
        case 'price_desc':
          sort = { InitialPrice: -1 };
          break;
        case 'name_asc':
          sort = { name: 1 };
          break;
        case 'name_desc':
          sort = { name: -1 };
          break;
        case 'rating':
          sort = { rating: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export default getProducts;