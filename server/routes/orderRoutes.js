import express from "express";
import { createOrder, listOrders, updateOrderStatus, getOrderById } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { orderValidation, validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, orderValidation, validate, createOrder);
router.get("/", verifyToken, listOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", verifyToken, requireRole("admin"), updateOrderStatus);

export default router;
