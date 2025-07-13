import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterOptions,
  getCategoryOptions,
  getProductReviews,
  addProductReview,
  likeProductReview,
  updateProductReview, // <-- add this import
  searchProducts,
} from '../controllers/product/index.js';




import { uploadMiddleware, cleanupTempFiles } from "../middleware/multerMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { productValidation, productUpdateValidation, validate, reviewValidation } from "../middleware/validationMiddleware.js";

export const uploadWithCleanup = (fields = 'images', maxCount = 10) => {
  return [uploadMiddleware(fields, maxCount), cleanupTempFiles];
};

const router = express.Router();

router.route("/")
  .get(asyncHandler(getProducts))
  .post(
    verifyToken, 
    requireRole('admin'), 
    uploadWithCleanup([
      { name: 'featuredImage', maxCount: 1 },
      { name: 'images', maxCount: 10 }
    ]),
    productValidation,
    validate,
    asyncHandler(createProduct)
  );

router.get("/filters", asyncHandler(getFilterOptions));
router.get("/categories", asyncHandler(getCategoryOptions));
router.get('/search', searchProducts);

router.route("/:id")
  .get(asyncHandler(getProductById))
  .put(
    verifyToken, 
    requireRole('admin'), 
    uploadWithCleanup([
      { name: 'featuredImage', maxCount: 1 },
      { name: 'images', maxCount: 10 }
    ]),
    productUpdateValidation,
    validate,
    asyncHandler(updateProduct)
  )
  .delete(verifyToken, requireRole('admin'), asyncHandler(deleteProduct));

router.get("/:id/reviews", getProductReviews);
router.post(
  "/:id/reviews",
  verifyToken,
  reviewValidation,
  validate,
  addProductReview
);
router.put('/:id/reviews/:reviewId/like', verifyToken, likeProductReview);
router.put(
  '/:id/reviews/:reviewId',
  verifyToken,
  reviewValidation,
  validate,
  updateProductReview
);

export default router;
