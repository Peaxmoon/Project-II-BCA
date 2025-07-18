# Project-II-BCA
## Electomart : Home Appliances & Gadgets
MERN Stack Home Appliances & Gadgets
1. Project Discovery & Requirement Gathering
Goal :- To create a beautiful UI/UX for e-commerce Website
using mern stack. It is a singleVendor website where users select, add to cart and purchase appliances.

    Functional Requirements
    1. User Management
    2. Product Management
    3. Shopping cart
    4. Wishlist
    5. Checkout and Payment 
    6. Order Management
    7. Notifications
    8. Admin Panel
    9. Product Reviews & Ratings

    Non-Functional Requirements
    1. Performance
    2. Scalability
    3. Aviability
    4. Security
    5. Usability
    6. Maintainability
    7. Localization
    8. Backup and Recovery
    9. Compliance with GDPR- General Data Protection Regulation/CCPA- California Consumer Privacy Act

Market Research & inspiration :- 
https://hardwarepasal.com/category/home-appliances

2. Project Proposal & Documentation
Goal:-
Introduction
Problem Statement:
Objectives: 
Methodology:
	a. Requirement Identification
		i. Study of existing system
		ii. Requirement Collection
	b. Feasiblility Study
		i. Technical
		ii. Operational
		iii. Economic

	c. High Level Design of System (system flow chart/methodology of the proposed system/working mechanism
of proposed system).
Gantt Chart:
Expected Outcomes
Refrences


3. Use Case Analysis & User Stories
4. System Design & Architectural Planning
5. UI/UX Design (Wireframing & Prototyping)
Figma, Low Fidelity then high fidelity Wireframes
6. Tech Stack Finalization & Dev Tools Setup
Goal: Make Use of online tools with MERN Stack
Frontend: React + Tailwind + Vite + vercel
Backend: Node + Express + JWT (Render, Railway, Cyclic any free)
Database: Mongodb Atlas (mongodb Cloud also environment Variable for local running for no internet purpose)
DevOps: Git + GitHub + Postman + VS Code
.env: environment Variables
7. Task Breakdown & Project Planning -GitHub projects
Assign priorities and Timelines jira or Trello 
8. Security & Data Protection Planning: JWT, Bcrypt, Khalti,
Https, CORS, validation, input sanitization
9. Testing Strategy Definition: Agile Methodology Unit, 
integration, UI with tools Jest, React Testing Library, 
Postman for debugging
10. Initial Environment Setup :
Frontend: Install React, Tailwind with vite
Backend: Setup Express, MongoDB, Nodemon
Database: Create MonogoDB Atlas Cluster, setup .env
Create reusable component folder
setup GitHub repo with good Readme.md, .gitignore
Setup VS Code with extensions prettier, ESLint etc.



## Backend Tasks To Complete ✅/❌
### Core Setup & CRUD
✅ Initialize the project folder and run npm init  
✅ Install necessary packages (express, mongoose, dotenv, cors, nodemon)  
✅ Create folder structure (controllers, models, routes, config)  
✅ Setup .gitignore and .env file  
✅ Setup ES module in package.json  
✅ Configure nodemon and add dev script in package.json  
✅ Write MongoDB connection logic (config/db.js)  
✅ First successful connection with database  
✅ First successful CRUD in database  
✅ Setup Express app in server.js  
✅ Setup middleware: express.json(), cors, dotenv  
✅ Create first schema/model (e.g. Product model)  
✅ Create controller functions for CRUD operations  
✅ While deleting or updating product, delete unwanted images from Cloudinary  
✅ Create route file and connect routes to controller  
✅ Connect routes to server.js  
✅ Test GET, POST, PUT, DELETE routes in Postman  
✅ Handle errors and invalid routes  
✅ Add environment variables for MongoDB URI and port  
❌ Add logging or console messages for success/fail  
✅ Implement status codes and JSON responses properly  
❌ Refactor code to keep it clean and modular  
❌ Push code to GitHub  
❌ Document API endpoints in README.md  

### Authentication & User Management
✅ User authentication and authorization (JWT and bcrypt)  
✅ Logout & refresh token invalidation  
✅ Refresh token rotation  
✅ Email verification for new users (send verification email, verify token)  
✅ Check for duplicate email before user creation (return user-friendly error)  
✅ Input validation for all endpoints (use express-validator or Joi)  
✅ Centralized error handling middleware  
✅ JWT token generation after registration (if not already)  
✅ Password reset (request/reset endpoints, validation)  
❌ Role-based access control (expand roles, protect endpoints, e.g., admin/moderator/seller)  

### Product Features
✅ Product listing, filtering, and pagination  
✅ Product search (by name, brand, etc.)  
✅ Multiple images per product (gallery)  
✅ Product reviews and ratings  
❌ Product categories and tags management  

### Cart & Order Functionality
✅ Cart and Order models  
✅ Order controller and routes  
✅ Cart controller and routes  
✅ Cart endpoints (add, remove, update items, clear cart)  
✅ Order endpoints (create, list, update status, get order by id)  
✅ Cart/order validation for all fields  
❌ Order history, order cancellation, detailed status tracking  
❌ Admin endpoints for listing/filtering all orders  

### Wishlist & Notifications
✅ Wishlist functionality (add/remove/move to cart)  
❌ Notifications (order status, promotions, etc.)  

### Admin Panel Features
❌ Advanced admin panel endpoints (user management, analytics, etc.)  
❌ Fine-grained permissions for admin/moderator roles  

### API Documentation & Testing
❌ API documentation (Swagger/OpenAPI or detailed README)  
❌ Unit and integration tests for all controllers/routes (Jest/Mocha)  
✅ User test file exists (expand to product/order/cart)  

### Security & Best Practices
✅ Use environment variables for sensitive config  
✅ Exclude sensitive fields (like password, reset tokens) from API responses  
✅ Protect all sensitive endpoints with authentication and role-based authorization  
✅ CORS and input sanitization  
❌ Implement image deletion in Cloudinary when products are deleted/updated (double-check)  
❌ Rate limiting, brute-force protection (optional for production)  

---

**Legend:**  
✅ = Complete  
❌ = Not complete or needs improvement





Additional:
Change the current Address / update or add address. 

No Error Details:
The error response is generic. It’s better to send specific error messages (e.g., "Email already exists").

# Whitelist the fields manually
Consider excluding the password even if it’s hashed, and sensitive info like reset tokens.
const newUser = new User({
  name,
  email: email.toLowerCase(),
  password,
  phone,
});
✅ Logout & Refresh Token Invalidation:
✅ Refresh Token Rotation:
Blacklist/Revocation:
# Not a robot authorization if possible from https://www.google.com/recaptcha/admin/create


## 1. **Polish and Finalize Core User Flows**
- **Registration, Login, Logout, Email Verification:**  
  Make sure all flows work smoothly, including error handling and UI feedback.  
  - Files:  
    - Profile.jsx  
    - AuthContext.jsx  
    - userController.js  
    - User.js

- **Profile Management:**  
  Allow users to update their name, password, and addresses.  
  - Files:  
    - Profile.jsx  
    - userController.js

---

## 2. **Complete Shopping Experience**
- **Product Listing, Filtering, and Search:**  
  Ensure advanced filtering, category/brand navigation, and search are smooth and fast.  
  - Files:  
    - Products.jsx  
    - DoubleNavbar.jsx  

- **Product Detail Page:**  
  Show all product info, reviews, wishlist, and add-to-cart.  
  - Files:  
    - ProductDetail.jsx

- **Cart and Checkout:**  
  Cart updates, address selection, and order placement.  
  - Files:  
    - Cart.jsx  
    - Checkout.jsx

---

## 3. **Order Management**
- **Order History and Tracking:**  
  Users can view their orders and track status.  
  - Files:  
    - Orders.jsx  
    - TrackOrder.jsx

---

## 4. **Wishlist and Reviews**
- **Wishlist:**  
  Add/remove products, move to cart, and persist for logged-in and guest users.  
  - Files:  
    - Wishlist.jsx  
    - WishlistContext.jsx

- **Product Reviews:**  
  Allow users to add/edit reviews and ratings.  
  - Files:  
    - ProductDetail.jsx

---

## 5. **Admin Panel (if not done)**
- **Product and Order Management:**  
  Admins can add/edit/delete products and manage orders.  
  - Files:  
    - Admin.jsx  

---

## 6. **UI/UX Polish and Theming**
- **Consistent Theme and Color System:**  
  Make sure colors, fonts, and spacing are consistent and easily changeable.  
  - Files:  
    - Layout.jsx  
    - `tailwind.config.js` or Mantine theme config

- **Responsiveness and Accessibility:**  
  Test on mobile and desktop, add alt text, ARIA labels, and keyboard navigation.

---

## 7. **Testing and Error Handling**
- **Add Error Boundaries and Loading States:**  
  Show loaders and error messages for all async operations.
- **Test All Flows:**  
  Try as guest, user, and admin.

---

**Tip:**  
Check your README.md for a step-by-step checklist and file mapping.

---

**What to do next?**  
Pick the area above that is least complete in your app. If you want a specific implementation or code for any of these steps, let me know which feature or file you want to work on next!





remove featured image from everything just isFeatured to know if product should be added in is featured list. 

even if i have just added review without purchase it says verified purchaser in review but when i refresh the page it dissapears only say verified purchaser if 
purchase is done and received by the customer.

Custom Loading screen while loading main page related to ecommerce watch youtube for proper video
