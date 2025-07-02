# Electomart Frontend (MERN Stack)

Electomart is a single-vendor e-commerce platform for home appliances & gadgets. This is the frontend (React + Vite) for the project, featuring a clean, professional, and fully responsive UI with dark/light theming and seamless backend integration.

---

## Features

- Modern, responsive UI for home appliances & gadgets
- Product listing, search, filtering, and detail pages
- User authentication (register, login, logout)
- Shopping cart with backend sync
- Checkout and order management
- User profile and order history
- Admin dashboard for product/order management
- Role-based UI (admin/user)
- Dark/light mode toggle (theme colors configurable in one place)
- Error handling, loading states, and notifications

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Mantine UI, Axios, React Router
- **State Management:** React Context API (Auth, Cart)
- **Theming:** Tailwind CSS with dark mode and color palette in `tailwind.config.js`
- **API Integration:** Axios service layer (`src/services/api.js`)
- **Backend:** Node.js, Express, MongoDB (see `/server`)

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- Backend server running (see `/server`)

### Installation

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Project Structure

| Area                | Main Files/Components                                      |
|---------------------|------------------------------------------------------------|
| Layout & Routing    | `src/components/common/Layout.jsx`, `src/routes/AppRoutes.jsx` |
| Theming             | `tailwind.config.js`, `src/index.css`                      |
| Pages               | `src/pages/Home.jsx`, `src/pages/Shop/Products.jsx`, etc.  |
| State Management    | `src/contexts/AuthContext.jsx`, `src/contexts/CartContext.jsx` |
| API Service         | `src/services/api.js`                                      |
| Reusable Components | `src/components/common/Footer.jsx`, `src/components/common/Layout.jsx` |

---

## Theming & Customization

- All theme colors are defined in `tailwind.config.js` for easy updates.
- Dark mode is enabled via Tailwind (`darkMode: 'class'`).
- UI uses Tailwind and Mantine for consistent, professional styling.

---

## API Integration

- All backend endpoints are accessed via functions in `src/services/api.js` using Axios.
- Auth, cart, products, orders, and user profile are fully integrated with backend APIs.
- JWT is stored in localStorage and sent with each request.

---

## Development Guidelines

- Use React functional components and hooks.
- Use context for global state (auth, cart).
- Keep UI clean and accessible; use Tailwind utility classes.
- Add error handling and loading states to all async operations.
- For new features, update the API service layer and relevant context/providers.

---

## Backend

See [`/server/README.md`](../server/README.md) for backend setup and API documentation.

---

## License

MIT

---

**Relevant Files:**
- `src/contexts/AuthContext.jsx` (User authentication context)
- `src/contexts/CartContext.jsx` (Cart state context)

**Codebase Details:**
- Context providers wrap the app in `main.jsx` to provide global state for authentication and cart.

---

### 6. Integrate Theming and Dark Mode

**Relevant Files:**
- `src/components/common/Layout.jsx` (Uses Mantine's `useMantineColorScheme` for dark/light mode toggle)
- `tailwind.config.js` (Dark mode enabled via `darkMode: 'class'`)

**Codebase Details:**
- Users can toggle between light and dark mode.
- All components use Tailwind's dark mode classes for consistent theming.

---

### 7. Ensure Reusability and Clean Code

**Relevant Files:**
- `src/components/common/Footer.jsx` (Reusable footer)
- `src/components/common/Layout.jsx` (Reusable layout)
- Use of context and hooks for state management

---

### 8. Connect to Backend and Handle API Calls

**Relevant Files:**
- `src/services/api.js` (Axios instance for API calls)

**Codebase Details:**
- API integration is set up for future backend connectivity.

---

### 9. Add Error Handling and Validation (Planned)

**Relevant Files:**
- Not fully implemented yet, but should be added to forms and API calls.

---

### 10. Polish UI/UX and Test Responsiveness

**Relevant Files:**
- All page and component files (use of Tailwind for responsive design)

---

**Summary Table of Steps and Codebase Files:**

| Step                                   | Main Files/Components                                      |
|-----------------------------------------|------------------------------------------------------------|
| 1. Homepage & Navbar                    | Home.jsx, Layout.jsx, Navbar.jsx                           |
| 2. Theme & Color System                 | tailwind.config.js, index.css, variable.css                |
| 3. Layout & Routing                     | Layout.jsx, AppRoutes.jsx, router.js                       |
| 4. Feature-Rich Pages                   | Products.jsx, ProductDetail.jsx, Cart.jsx, Checkout.jsx, etc. |
| 5. State Management & Context           | AuthContext.jsx, CartContext.jsx                           |
| 6. Theming & Dark Mode                  | Layout.jsx, tailwind.config.js                             |
| 7. Reusability & Clean Code             | Footer.jsx, Layout.jsx, context files                      |
| 8. Backend Integration                  | api.js                                                    |
| 9. Error Handling & Validation (Planned)| (To be implemented)                                       |
| 10. UI/UX Polish & Responsiveness       | All page/component files                                   |

---

If you want to see the code for any specific step or component, let me know which file or function you want to review in detail.Here’s a step-by-step plan to create a good, feature-rich frontend for your Electomart e-commerce project, based on your codebase and requirements:

---

### 1. Design the Homepage and Navbar

- Sketch the homepage layout (hero section, featured products, banners, etc.).
- Design a responsive, accessible navbar with links to Home, Products, Cart, Orders, Profile, Login/Logout, and Admin (if user is admin).
- Implement dark/light theme toggle and cart item count badge.

---

### 2. Set Up Routing and Layout

- Use a main `Layout` component for consistent header, navbar, and footer.
- Configure all routes (Home, Products, Product Detail, Cart, Checkout, Orders, Profile, Login, Register, Admin, NotFound).

---

### 3. Build Authentication Pages

- Create Register and Login forms with validation and error handling.
- Integrate with backend for registration, login, and logout.
- Show/hide navbar links based on authentication state.

---

### 4. Implement Product Listing and Detail Pages

- Fetch products from backend with filtering, searching, and pagination.
- Display product cards with images, names, prices, and "Add to Cart" buttons.
- Create a Product Detail page with full info and add-to-cart functionality.

---

### 5. Shopping Cart Functionality

- Show cart items, quantities, prices, and total.
- Allow updating/removing items.
- Link to Checkout page.

---

### 6. Checkout and Order Management

- Build a checkout form (address, payment method).
- Submit orders to backend.
- Show order confirmation and order history (Orders page).

---

### 7. User Profile and Admin Panel

- Allow users to view and update their profile.
- Admin panel for managing products and orders.

---

### 8. Polish UI/UX

- Use consistent color themes (configurable via Tailwind/Mantine).
- Add loading states, error messages, and notifications.
- Ensure mobile responsiveness and accessibility.

---

### 9. Integrate Advanced Features

- Wishlist, product reviews/ratings, email verification prompts, etc.
- Role-based UI (admin, user).

---

### 10. Testing and Optimization

- Test all flows (guest, user, admin).
- Optimize for performance and accessibility.

---
