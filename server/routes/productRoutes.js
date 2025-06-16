import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { authorizeAdmin } from "../controllers/userController.js";

const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(authorizeAdmin, upload.array("images"), createProduct);

router.route("/:id")
  .get(getProductById)
  .put(authorizeAdmin, upload.array("images"), updateProduct)
  .delete(authorizeAdmin, deleteProduct);

export default router;
