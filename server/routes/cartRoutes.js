import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getCart);
router.post("/", verifyToken, addToCart);
router.put("/:productId", verifyToken, updateCartItem);
router.delete("/:productId", verifyToken, removeCartItem);
router.delete("/", verifyToken, clearCart);

export default router;
