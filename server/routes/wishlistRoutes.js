import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getWishlist);
router.post('/:productId', verifyToken, addToWishlist);
router.delete('/:productId', verifyToken, removeFromWishlist);

export default router; 