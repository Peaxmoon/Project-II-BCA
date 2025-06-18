import express from "express";
import { approveAdmin, authorizeAdmin, createUser, deleteUser, deleteUserDetails, loginUser, logoutUser, updateUser, userDetails, userLists } from "../controllers/userController.js";
import { createProduct } from "../controllers/productController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { refreshAccessToken } from "../utils/generateToken.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { loginValidation, registerValidation, validate } from "../middleware/validationMiddleware.js";
import { requestPasswordReset, resetPassword } from "../controllers/userController.js";


const router = express.Router();

// For only user routes, you can create a separate file like userRoutes.js
router.route('/', registerValidation, validate, createUser)
.get(userLists)
.post(registerValidation, validate, createUser)

router.route('/:id')
.get(userDetails)
.put(updateUser)
.delete(deleteUserDetails);
// .delete(deleteUser);

router.post('/login', loginValidation, validate, loginUser);
router.post('/logout', logoutUser);
router.post('/token/refresh', refreshAccessToken);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

// Approve another admin
router.put('/admin/approve/:id', approveAdmin);

// Only approved admins can create products
router.post('/admin/product', verifyToken, authorizeAdmin, upload.array("images"), createProduct);


export default router;