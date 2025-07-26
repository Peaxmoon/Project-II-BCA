import express from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../controllers/paymentController.js';

const router = express.Router();

// Khalti only
router.post('/khalti/initiate', initiateKhaltiPayment);
router.post('/khalti/verify', verifyKhaltiPayment);

export default router;