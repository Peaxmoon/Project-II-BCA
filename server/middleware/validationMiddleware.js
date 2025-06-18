import { body, validationResult } from "express-validator";

// Registration Validation Rules 
export const registerValidation = [
    body("name").notEmpty().withMessage("Name is Required"),
    body("email")
    .isEmail().withMessage("Email is Required")
    .normalizeEmail(),
    body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

// Login validation rules
export const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is Required"),
];

// Product creation validation rules
export const productValidation = [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description").notEmpty().withMessage("Product description is required"),
    body("InitialPrice").notEmpty().withMessage("Initial Price must be a numbere"),
    body("brand").notEmpty().withMessage("Product brand is required"),
    body("category").notEmpty().withMessage("Product category is required"),
]

// Middleware to handle validation errors
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

