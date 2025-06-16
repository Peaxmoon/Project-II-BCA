// filepath: d:\E-commerce\server\routes\userRoutes.js
import express from "express";
import { approveAdmin, authorizeAdmin, createUser, deleteUser, updateUser, userDetails, userLists } from "../controllers/userController.js";
import { createProduct } from "../controllers/productController.js";
import { upload } from "../middleware/multerMiddleware.js";


const router = express.Router();

// For only user routes, you can create a separate file like userRoutes.js
router.route('/')
.get(userLists)
.post(createUser)

router.route('/id:')
.get(userDetails)
.put(updateUser)
.delete(deleteUser);


// Approve another admin
router.put('/admin/approve/:id', approveAdmin);

// Only approved admins can create products
router.post('/admin/product', authorizeAdmin, upload.array("images"), createProduct);



export default router;