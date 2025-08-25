import Product, { CATEGORY_OPTIONS_LIST, SUBCATEGORIES_BY_CATEGORY }  from "../../models/Product.js";

// newHere
export const getProductQuery = async (req, res) => {
  const queryData = await Product.find();//but find all the related data
  res.json(queryData)
}
// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

// newHere
// Get allowed categories and units for admin UI
export const getCategoryOptions = async (req, res) => {
  // Units are hardcoded for now
  const units = ['piece', 'set', 'kg', 'litre', 'box', 'pack', 'meter', 'roll', 'other'];
  res.json({
    categories: CATEGORY_OPTIONS_LIST,
    subcategories: SUBCATEGORIES_BY_CATEGORY,
    units
  });
};


// newHere
// Fast search for navbar using MongoDB text index
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") return res.json([]);
    // Use text index for fast search
    const results = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" }, name: 1, description: 1, brand: 1, category: 1, featuredImage: 1 }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};
