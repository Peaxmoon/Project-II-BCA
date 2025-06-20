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





Used ES Module



Tasks To complete ✅/❌
Backend:
✅ Initialize the project folder and run npm init
✅ Install necessary packages (express, mongoose, dotenv, cors, nodemon)
✅ Create folder structure (controllers, models, routes, config)
✅ Setup .gitignore and .env file
✅ Setup ES module in package.json
✅ Configure nodemon and add dev script in package.json
✅ Write MongoDB connection logic (config/db.js)
✅ Frist Succesful connection with database
✅ First Succesful CRUD in database
✅ Setup Express app in server.js
✅ Setup middleware: express.json(), cors, dotenv
✅ Create first schema/model (e.g. Product model)
✅ Create controller functions for CRUD operations
 While deleting or updating product delete unwanted and not useful image from cloudinary overall handle image uploads
❌ Create route file and connect routes to controller
❌ Connect routes to server.js
❌ Test GET, POST, PUT, DELETE routes in Postman
❌ Handle errors and invalid routes
❌ Add environment variables for MongoDB URI and port
❌ Add logging or console messages for success/fail
❌ Implement status codes and JSON responses properly
❌ Prepare sample seed data for testing (optional)
❌ Refactor code to keep it clean and modular
❌ Push code to GitHub (optional)
❌ Document API endpoints in README.md
 Implement product Listing, Filtering, and pagination
 User authentication and authorization jwt and bcrypt
 order and cart functionality


Frontend:
 Frontend Integration
 Validation and Error Handling


Additional:
how to delete image in cloudinary also if i delete in the products list
It is crucial to check the email if it is duplicate or not for uniqueness in data

No Duplicate Email Check:
The code does not check if the email already exists before creating a user.
This can cause MongoDB errors due to the unique constraint, but a user-friendly error should be returned.
No Input Validation:
There is no explicit validation of the request body before creating the user (e.g., checking email format, password strength).
No Authentication Token Generation:
After registration, most apps return a JWT token for immediate login. Your code does not do this yet.
No Error Details:
The error response is generic. It’s better to send specific error messages (e.g., "Email already exists").
No Email Verification:
There is a field for isEmailVerified, but no logic for sending verification emails.
const { name, email, password, phone } = req.body;

# Whitelist the fields manually
Consider excluding the password even if it’s hashed, and sensitive info like reset tokens.
const newUser = new User({
  name,
  email: email.toLowerCase(),
  password,
  phone,
});
✅Logout & Refresh Token Invalidation:
✅Refresh Token Rotation:
Blacklist/Revocation:
1. Input Validation
Use a library like express-validator or Joi to validate user input for registration, login, product creation, etc.
Prevent invalid data from reaching your controllers.
2. Centralized Error Handling
Create an error-handling middleware (e.g., errorMiddleware.js) to catch and format all errors in one place.
This will make your API responses consistent and debugging easier.
3. Email Verification
Implement email verification for new users.
# Not a robot authorization if possible
Send a verification email with a token and verify the user when they click the link.
4. Logout & Refresh Token Invalidation
Add a logout endpoint that clears the refresh token cookie.
Optionally, implement refresh token blacklisting for extra security.
5. Password Reset
Allow users to request a pasword reset link via email.
Implement endpoints to handle password reset requests and updates.
6. Role-Based Access Control
Expand admin/user roles for more granular permissions (e.g., moderators, sellers).
Protect sensitive endpoints accordingly.
7. Product Features
Add product filtering, searching, and pagination.
Allow multiple images per product (gallery).
Implement product reviews and ratings.
8. Order & Cart Functionality
Implement cart endpoints (add, remove, update items).
Implement order creation, listing, and status updates.
9. API Documentation
Use Swagger/OpenAPI or a detailed README to document your endpoints for frontend and future developers.
10. Testing
Write unit and integration tests for your controllers and routes using Jest or Mocha.