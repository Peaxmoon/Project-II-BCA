const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Khalti
router.post('/khalti/initiate', paymentController.initiateKhaltiPayment);
router.post('/khalti/verify', paymentController.verifyKhaltiPayment);

// eSewa
router.post('/esewa/initiate', paymentController.initiateEsewaPayment);
router.post('/esewa/verify', paymentController.verifyEsewaPayment);

module.exports = router;
