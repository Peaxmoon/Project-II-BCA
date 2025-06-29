# Electomart E-commerce Backend

## Overview
This is the backend server for the Electomart e-commerce platform. The system is now completely dynamic, with all product data stored in and retrieved from the MongoDB database.

## Features
- **Dynamic Product Management**: All products are stored in the database
- **User Authentication**: JWT-based authentication with email verification
- **Cart Management**: Persistent shopping cart for users
- **Wishlist**: User wishlist functionality
- **Order Management**: Complete order processing system
- **Admin Panel**: Full admin interface for product and user management
- **File Upload**: Cloudinary integration for product images
- **Email Integration**: SendGrid for email notifications

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for image uploads)
- SendGrid account (for emails)

### Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Client URL
CLIENT_URL=http://localhost:5173

# Server Port
PORT=5000
```

### Installation
```bash
npm install
```

### Running the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products with filtering and pagination
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/filters` - Get filter options (categories, brands, price range)
- `GET /api/products/categories` - Get category options for admin

### Users
- `POST /api/users` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/me` - Get current user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/verify-email/:token` - Verify email
- `POST /api/users/request-password-reset` - Request password reset
- `POST /api/users/reset-password/:token` - Reset password

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders (or all orders for admin)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/:productId` - Add product to wishlist
- `DELETE /api/wishlist/:productId` - Remove product from wishlist

## Adding Products

Since the system is now completely dynamic, you can add products through:

1. **Admin Panel**: Use the web interface at `/admin` to add products
2. **API**: Use the POST `/api/products` endpoint
3. **Database**: Directly insert into MongoDB

### Example Product Structure
```json
{
  "name": "Product Name",
  "description": "Product description",
  "brand": "Brand Name",
  "category": "TV & Audio",
  "InitialPrice": 1000,
  "isDiscounted": false,
  "afterDiscountPrice": 0,
  "stock": 10,
  "sku": "PROD-001",
  "isFeatured": false,
  "featuredImage": "https://example.com/image.jpg",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "alt": "Product Image 1"
    }
  ],
  "tags": ["tag1", "tag2"],
  "rating": 0,
  "numReviews": 0,
  "status": "active"
}
```

## Available Categories
- TV & Audio
- Mobile Phones
- Kitchen Appliances
- Laptops
- Refrigerators
- Washing Machines
- Air Conditioners
- Small Gadgets
- Lights & Accessories
- Power Tools
- Safety & Welding Equipment
- Hand Tools
- Office Essentials
- Gardening Tools
- Agriculture Tools
- Bathroom Hardware
- General Hardware
- Home Appliances
- Machinery
- Automotive Accessories

## Database Models

### Product Schema
- Basic info (name, description, brand, category)
- Pricing (initial price, discount price)
- Inventory (stock, SKU)
- Media (featured image, images array)
- Metadata (tags, rating, reviews)
- Status and flags (featured, bestseller, active)

### User Schema
- Authentication (email, password)
- Profile (name, avatar, phone)
- Addresses (shipping addresses)
- Verification (email verification, social login)
- Roles (customer, admin)

### Cart Schema
- User reference
- Items array with product details
- Totals (quantity, price)

### Order Schema
- User reference
- Order items
- Shipping address
- Payment information
- Status tracking

## Security Features
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control
- Email verification
- Password reset functionality
- CORS configuration
- Input validation and sanitization

## Error Handling
- Centralized error middleware
- Proper HTTP status codes
- Detailed error messages for development
- Graceful error handling for production

## File Upload
- Multer middleware for file handling
- Cloudinary integration for cloud storage
- Support for multiple image uploads
- Automatic cleanup of temporary files

## Email Integration
- SendGrid for transactional emails
- Email verification
- Password reset emails
- Order confirmation emails

## Development Notes
- The system is now completely dynamic
- No hardcoded sample products
- All data comes from the database
- Empty states are handled gracefully
- Responsive design for all screen sizes
- Real-time updates for cart and wishlist 

## Next Steps

### Run the seedProducts.js script
```bash
cd server
node seedProducts.js
```

This will clear your existing products and insert the 20 new ones.

### Verify your backend API route for products
If you want to see these products in your frontend, make sure your frontend fetches products from your backend API (e.g., `/api/products`).

### Update your frontend
If you have any hardcoded product data in your frontend, let me know the file name(s) and I'll help you remove and replace it with a dynamic API call.

**Would you like help with:**
- Verifying your backend API route for products?
- Updating your frontend to fetch and display these products?
- Anything else? 