import express from "express";
import { createUser, deleteUser, loginUser, logoutUser, updateUser, userDetails, userLists, verifyEmailCode, resendVerificationCode, changePassword, changeUserName, updateUserRole } from "../controllers/userController.js";
import { createProduct } from "../controllers/productController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { refreshAccessToken } from "../utils/generateToken.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { loginValidation, newPasswordValidation, passwordResetValidation, productValidation, registerValidation, updateUserValidation, validate } from "../middleware/validationMiddleware.js";
import { requestPasswordReset, resetPassword } from "../controllers/userController.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.route('/')
  .get(userLists)
  .post(registerValidation, validate, createUser);

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

router.route('/:id')
  .get(userDetails)
  .put(updateUserValidation, validate, updateUser)
  .delete(verifyToken, requireRole('admin'), deleteUser);

router.post('/login', loginValidation, validate, loginUser);
router.post('/logout', logoutUser);
router.post('/token/refresh', refreshAccessToken);
router.post('/request-password-reset', passwordResetValidation, validate, requestPasswordReset);
router.post('/reset-password/:token', newPasswordValidation, validate, resetPassword);

// Only approved admins can create products
router.post('/admin/product', verifyToken, requireRole('admin'), upload.array("images"), productValidation, validate, createProduct);

router.post('/verify-code', verifyEmailCode);
router.post('/resend-code', resendVerificationCode);
router.post('/change-password', verifyToken, changePassword);
router.put('/change-username/:userId', verifyToken, updateUserValidation, validate, changeUserName);
router.put('/:id/role', verifyToken, requireRole('admin'), updateUserRole);

export default router;