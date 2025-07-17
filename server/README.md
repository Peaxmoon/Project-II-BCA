# Electomart E-commerce Backend

## Overview
Backend server for Electomart, a single-vendor e-commerce platform for home appliances & gadgets, built with Node.js, Express, and MongoDB.

## Features
- Dynamic product management (CRUD, filtering, pagination)
- User authentication (JWT, email verification)
- Cart and order management
- Admin panel endpoints
- File upload (Cloudinary)
- Email integration (SendGrid)
- Centralized error handling
- Role-based access control

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB database
- Cloudinary account
- SendGrid account

### Environment Variables
Create a `.env` file in the server directory:
```env
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENDGRID_API_KEY=your_sendgrid_api_key
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Installation & Running
```bash
npm install
npm run dev   # for development
npm start     # for production
```

## API Endpoints

### Products
- `GET /api/products` - List products (filtering, pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Users
- `POST /api/users` - Register
- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/verify-email/:token` - Verify email
- `POST /api/users/request-password-reset` - Request password reset
- `POST /api/users/reset-password/:token` - Reset password

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (user/admin)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (admin)

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/:productId` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

## Database Models

### Product Schema
- name, description, brand, category
- initial price, discount price
- stock, SKU
- featured image, images array
- tags, rating, reviews
- status flags (featured, bestseller, active)

### User Schema
- email, password (hashed)
- name, avatar, phone
- addresses
- email verification
- roles (customer, admin)

### Cart Schema
- user reference
- items array (product, quantity, price)
- total quantity, total price

### Order Schema
- user reference
- order items
- shipping address
- payment info
- status tracking

## Security & Error Handling
- JWT authentication, refresh tokens
- Password hashing (bcrypt)
- Role-based access
- Email verification & password reset
- CORS, input validation
- Centralized error middleware

## File Upload & Email
- Multer + Cloudinary for images
- SendGrid for transactional emails

---

**For frontend integration and general project info, see the root and client README files.**