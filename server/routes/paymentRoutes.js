import express from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment, reduceStockForOrder } from '../controllers/paymentController.js';

const router = express.Router();

// Khalti only
router.post('/khalti/initiate', initiateKhaltiPayment);
router.post('/khalti/verify', verifyKhaltiPayment);
router.post('/reduce-stock', reduceStockForOrder);

export default router;