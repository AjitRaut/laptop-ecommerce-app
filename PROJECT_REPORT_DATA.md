# PROJECT REPORT DATA – LaptopWorld (Multi-Vendor Laptop E-Commerce System)

> **Source of truth:** every fact below was taken from the code in this repository (branch `reports-fixes`, last commit `fa6bce2`, plus the uncommitted working-copy changes present on 2026-10-25).
> When something is not present in the code it is marked **NOT FOUND IN CODE**.
> No secret values (passwords, keys, connection strings) are reproduced in this file.
>
> **Work in progress during this analysis:** a storefront UI redesign was being made in the working copy at the same time (`frontend/index.html`, `index.css`, `tailwind.config.js`, `components/Layout/Header.tsx`, `Footer.tsx`, `Layout.tsx`, `common/SearchBar.tsx`, `EmptyState.tsx`, `LazyImage.tsx` and the new folder `components/storefront/` with a theme shell, dark/light mode and animations). Statements about the storefront header, footer and look-and-feel – and line numbers inside those files – describe the last committed version. **Re-check those parts after the redesign is committed.** The backend, database, API, reports, admin and vendor pages are not affected.
>
> **Default local URLs used throughout this document**
> - Frontend (React/Vite dev server): `http://localhost:5173`
> - Backend API (Django dev server): `http://localhost:8000/api/`
> - Django Admin site: `http://localhost:8000/admin/`

---

## SECTION 1: PROJECT OVERVIEW

### 1.1 Project Name and Introduction

**Project name:** **LaptopWorld** (browser title "Laptop World" in `frontend/index.html`; `SHOP_NAME = "LaptopWorld"` and tagline "Premium Laptops & Accessories" in `server/reports/views.py`). The e-mail templates call the shop "Laptop Shop" (`server/orders/utils.py`), and the Render service is named `college-django-app` (`server/render.yaml`).

**Introduction:**
LaptopWorld is a web-based, multi-vendor e-commerce system for selling laptops and computer accessories online. It is built as a single-page application (React 18 + TypeScript + Redux Toolkit) that talks to a REST API (Django 5.2 + Django REST Framework) backed by a PostgreSQL database. Customers can browse and search the catalogue, filter by category, brand and price, keep a cart and a wishlist, place orders with a shipping address, pay by card through Stripe (or choose Cash on Delivery on the checkout screen), track their orders and download an order PDF. Third-party sellers (vendors) can register with their business name and GST number, wait for admin approval and then see their own products, update stock, process the order items that belong to them and see their commission earnings. The shop administrator approves or suspends vendors, monitors products, customers and orders, and generates eight types of business reports with PDF export. The shop details in the code (`SHOP_ADDRESS` in `server/reports/views.py`) place the business in Satara, Maharashtra, India; all prices are in Indian Rupees (INR).

### 1.2 Purpose of the System

The purpose of LaptopWorld is to move the sale of laptops and accessories from a manual, counter-based process to an online platform where customers can shop at any time, where multiple sellers can list their products under one storefront, and where the shop owner gets accurate, real-time information about stock, orders, payments, vendors and customers. The system automates price calculation (discount, 18 % tax, shipping), stock reduction, online card payment through Stripe, invoice generation (PDF), vendor commission calculation and management reporting, so that the business can serve more customers with fewer errors and less paperwork.

### 1.3 Actors / User Roles

Roles are stored in the field `user_type` of the `users` table with the enum values `admin`, `customer`, `vendor` (`server/users/models.py`).

| Actor | How identified in code | What the actor can do |
|---|---|---|
| **Guest (visitor, not logged in)** | No JWT token | View home page, featured products, product list, product detail; search, filter (category, brand, price) and sort; view 12 information pages (About, Careers, Press, Blog, Help, Contact, Shipping, Returns, Privacy, Terms, Cookies, Disclaimer); open the Contact form (opens e-mail client); register as a customer (`/register`) or vendor (`/vendor-register`); log in. Adding to cart/wishlist shows "Please login to add items to cart". |
| **Customer** | `user_type = 'customer'` | Everything a guest can do, plus: add/update/remove cart items, add to wishlist, view wishlist, checkout with shipping details, pay by card (Stripe) or choose Cash on Delivery, see payment success/failure page, view order history and order detail, download order PDF, edit profile, log out. Receives order/payment confirmation e-mail with PDF invoice. |
| **Vendor** | `user_type = 'vendor'`; can use vendor APIs only when `is_vendor_approved = True` (`IsVendorUser` in `server/vendor_panel/views.py`) | Register as vendor (status: waiting for approval). After approval: vendor dashboard (product counts, orders, sales, commission, recent orders, top products), "My Products" list with inline stock update, "My Orders" list showing only the vendor's own items in each order, change item status (pending → accepted → shipped). The API also allows vendor profile view/update and product create/update/delete, but **no UI screen exists for these** (buttons are commented out). |
| **Admin** | `user_type = 'admin'` (`IsAdminUser` in `server/admin_panel/views.py` and `server/reports/views.py`) | Admin dashboard (totals, revenue, pending orders, low stock, recent orders, top products), vendor management (approve / suspend), view products, customers and orders with search and filters, Reports & Analytics (8 reports, period/date filters, PDF export, report activity log). Through the **Django Admin site** (`/admin/`) the admin adds and edits categories, brands, products (with images and specifications) and users. |
| **Stripe (external system)** | `stripe` Python SDK, `@stripe/stripe-js`, `@stripe/react-stripe-js` | Creates PaymentIntents, collects card details securely in the browser (PaymentElement), returns payment status. |
| **E-mail server (external system)** | Django e-mail (`EMAIL_HOST = 'smtp.gmail.com'`), **but** `EMAIL_BACKEND` is set to the console backend (`server/config/settings.py` line 134) | Receives order-confirmation and payment-confirmation e-mails with PDF invoice. With the current setting, e-mails are only printed in the server console. |

### 1.4 Modules

| # | Module | Description |
|---|---|---|
| 1 | **User Authentication & Profile** (`server/users`, `Login.tsx`, `Register.tsx`, `Profile.tsx`, `authSlice.ts`) | Customer registration and e-mail/password login that return JWT access and refresh tokens. Keeps the user logged in after page refresh, redirects by role and lets users update their profile. |
| 2 | **Product Catalogue** (`server/products`, `Home.tsx`, `Products.tsx`, `ProductDetail.tsx`) | Categories, brands, products, product images and specifications with discount, stock and featured flags. Supports keyword search, category/brand/price filters, sorting, pagination (12 per page) and a featured-products section. |
| 3 | **Shopping Cart** (`server/orders` – `Cart`, `CartItem`; `Cart.tsx`) | One cart per user; add product with quantity, change quantity, remove item. Shows line totals, subtotal, 18 % tax, shipping and grand total. |
| 4 | **Wishlist** (`Wishlist`, `WishlistItem`; `Wishlist.tsx`) | One wishlist per user to save products for later. Prevents duplicate entries ("Product already in wishlist"). |
| 5 | **Order Management** (`create_order`, `Order`, `OrderItem`; `Checkout.tsx`, `Orders.tsx`, `OrderDetail.tsx`) | Converts the cart into an order inside a database transaction: calculates totals, stores a product snapshot per item, reduces stock and empties the cart. Customers can list orders, open details and download an order PDF. |
| 6 | **Payment (Stripe)** (`server/payments`, `StripePaymentForm.tsx`, `PaymentSuccess.tsx`, `PaymentFailure.tsx`) | Creates a Stripe PaymentIntent in INR (paise) for an order and collects the card through Stripe's PaymentElement. After success the backend re-checks the PaymentIntent with Stripe, marks the order paid/confirmed and stores a `Payment` record. |
| 7 | **Invoice & E-mail Notification** (`server/orders/utils.py`, `server/templates/emails/`) | Generates a PDF invoice with ReportLab (invoice no., bill-to, items, subtotal, tax, shipping, total). Attaches it to "Order Confirmed" and "Payment Confirmed" e-mails. |
| 8 | **Vendor Panel** (`server/vendor_panel`, `pages/vendor/*`, `VendorRegister.tsx`) | Vendor self-registration with business name and GST number; access only after admin approval. Dashboard with sales and commission, product list with stock update and order-item processing. |
| 9 | **Admin Panel** (`server/admin_panel`, `pages/admin/*`) | Dashboard statistics, vendor approval/suspension and read-only lists of products, customers and orders with client-side search and filters. API also provides order update, vendor detail update and sales analytics. |
| 10 | **Reports & Analytics** (`server/reports`, `pages/admin/reports/*`) | Eight reports (Product, Order, Vendor, Individual Vendor, User, Sales & Revenue, Customer, Category & Brand) with charts (Recharts) and 11 time-period presets or custom dates. Each report exports a branded PDF (ReportLab) and report generation is logged. |
| 11 | **Back-office Data Entry (Django Admin)** (`products/admin.py`, `users/admin.py`, `reports/admin.py`) | Django's built-in admin site used to create and edit categories, brands, products (with inline images and specifications), users and report logs. This is the only screen where products are created. |
| 12 | **Information & Support Pages** (`pages/info/*`, `SEO.tsx`, `Footer.tsx`) | Twelve static pages (About, Careers, Press, Blog, Help, Contact, Shipping, Returns, Privacy, Terms, Cookies, Disclaimer) with SEO meta tags. Contact form opens the visitor's e-mail program with a pre-filled message. |

### 1.5 Problems Solved Compared to a Manual / Offline Process

| Manual / offline problem | How LaptopWorld solves it (feature present in code) |
|---|---|
| Customers must visit the shop during business hours to see stock and prices. | Online catalogue with search, filters, sorting, product images, specifications, discount and stock badges, available 24×7. |
| Price, discount, tax and shipping are calculated by hand, causing mistakes. | `Product.discounted_price` property; order totals calculated by the server (18 % tax, shipping rule) in `create_order`. |
| Stock registers are updated manually and often go out of date. | Stock is reduced automatically when an order is placed; low-stock flags (`is_low_stock`, `min_stock_level`) and low-stock counts on dashboards and reports. |
| Cash/card handling and payment records are kept on paper. | Online card payment through Stripe; `payments` table stores amount, method, transaction id and status; order `payment_status` tracked. |
| Bills/invoices are hand-written. | Automatic PDF invoice (ReportLab) attached to confirmation e-mail; customer can download an order PDF anytime. |
| Selling products of other suppliers requires separate accounts and manual commission calculation. | Vendor registration with admin approval, vendor-wise order items, automatic commission (`vendor_commission_rate`, default 10 %) and admin share calculation. |
| Owner has no quick view of sales, best sellers, customers or vendor performance. | Admin dashboard and 8 reports with charts, period filters (today, this week, last 30 days, etc.) and printable PDF exports. |
| Customers cannot check order status without calling the shop. | Order history and order detail pages with order status and payment status badges. |
| Customer details are kept in notebooks. | Central `users` table with profile, address and order history; customer and user reports (top customers, locations, segments). |

### 1.6 Scope

**Included in the system (found in code):**
- Customer registration, login (JWT), profile management and role-based access (guest, customer, vendor, admin).
- Product catalogue with categories, brands, images, specifications, discounts, featured products, stock levels; search, filter, sort and pagination.
- Cart, wishlist, checkout with shipping address, order creation with tax and shipping, stock reduction.
- Stripe card payment (PaymentIntent + PaymentElement) and a "Cash on Delivery" option on the checkout screen.
- PDF invoice e-mail (server, ReportLab) and order PDF download (browser, jsPDF + html2canvas).
- Vendor registration with approval, vendor dashboard, vendor product stock update, vendor order-item status.
- Admin dashboard, vendor approve/suspend, product/customer/order lists.
- Eight analytical reports with charts, period/date filters, PDF export and a report activity log.
- Django Admin back-office for categories, brands, products, product images/specifications, users and report logs.
- Twelve static information pages with SEO tags; responsive layout.

**Clearly NOT included (NOT FOUND IN CODE or only placeholders):**
- Product reviews and ratings (the product page shows a fixed "4.0 out of 5 stars / 117 reviews" text – no data behind it).
- Forgot password / password reset (link is commented out in `Login.tsx`), e-mail verification / OTP (`is_verified` is never set by the code).
- Social login (Google/Facebook buttons on `Register.tsx` do nothing).
- Razorpay and PayPal payments (only enum values in `Payment.PAYMENT_METHOD_CHOICES` and two frontend endpoints that do not exist on the server); `razorpay` package is installed but unused.
- Order cancellation, returns and refund processing by customers (only static "Returns" information page).
- Coupon / promo codes (`discount_amount` on orders is always 0).
- Courier/shipment tracking integration.
- Product add/edit/delete screens in the React app for vendors or admin (done only through Django Admin or raw API).
- Admin screen for changing order status (API exists, no UI).
- Notifications (a `NotificationBell` component with dummy data exists but is not used anywhere).
- Newsletter subscription (no backend; in the committed footer the field has no action, and the in-progress redesign only opens a pre-filled e-mail).
- CSV / Excel export of reports.
- Automated tests, Docker setup, frontend deployment configuration.
- Mobile app (only responsive web).

---

## SECTION 2: OBJECTIVES AND REQUIREMENTS

### 2.1 Objectives

1. To develop an online store where customers can browse, search, filter and sort laptops and accessories by category, brand and price.
2. To provide secure user registration and login using JSON Web Tokens (JWT) with role-based access for customers, vendors and administrators.
3. To allow customers to manage a shopping cart and a wishlist and place orders with shipping details.
4. To calculate order totals automatically (discounted price, 18 % tax, shipping charges) and reduce product stock when an order is placed, inside a database transaction.
5. To integrate the Stripe payment gateway for online card payment in Indian Rupees and to record every successful payment.
6. To generate PDF invoices automatically and let customers download order PDFs.
7. To support a multi-vendor marketplace in which vendors register, are approved by the admin, manage their stock and process their order items, with automatic commission calculation.
8. To give the administrator a dashboard and vendor management tools for day-to-day control of the business.
9. To provide eight analytical reports (product, order, vendor, individual vendor, user, sales, customer, category & brand) with charts, time-period filters and printable PDF export.
10. To build a responsive, user-friendly interface using React, Tailwind CSS and toast notifications that works on desktop and mobile screens.

### 2.2 Gathered Requirements per Actor

**Guest**
- See featured products and shop-by-category links on the home page.
- Browse all products with pagination; search by keyword; filter by category, brand, price range; sort by price, name or newest.
- See full product details: images, price, discount, savings, stock status, specifications, warranty, SKU.
- Read shop information pages and send a message through the Contact page.
- Create a customer account or a vendor account; log in.

**Customer**
- Log in with e-mail and password and stay logged in after refreshing the page.
- Add products to cart with a quantity, change quantity, remove items, see totals.
- Save products to a wishlist and view it.
- Enter shipping name, phone, address, city, state, PIN code and optional notes at checkout.
- Pay online by card (Stripe) or choose Cash on Delivery.
- Receive order and payment confirmation e-mails with invoice.
- See order history, order details, status and payment status; download order PDF.
- Edit own profile (name, username, phone, address, city, state, PIN code).

**Vendor**
- Register with personal details, business name and GST number; wait for admin approval.
- After approval, log in and see dashboard: total/active/low-stock products, total/pending orders, commission earned, recent orders, top-selling products.
- See own products and update stock quantity.
- See only the order items that belong to own products, with customer shipping address; mark items as accepted and shipped.

**Admin**
- Log in and see dashboard: total products, customers, vendors (with pending badge), orders, revenue, pending orders, low-stock count, recent orders, top products.
- Approve or suspend vendors.
- View products (search by name, filter in-stock/out-of-stock), customers (search), orders (search, filter by status and payment status).
- Generate reports with period presets or custom dates and filters; export to PDF; view recent report activity.
- Add and maintain categories, brands, products, product images, specifications and users through Django Admin.

### 2.3 Functional Requirements

| ID | Module | Requirement |
|---|---|---|
| FR-1 | Authentication | The system shall let a guest register as a customer with first name, last name, username, e-mail, phone (optional), password and confirm password (`POST /api/users/register/`), and shall log the user in immediately by returning JWT access and refresh tokens. |
| FR-2 | Authentication | The system shall authenticate users by e-mail and password (`POST /api/users/login/`) and return the user profile and JWT tokens; disabled accounts are rejected ("Account is disabled"). |
| FR-3 | Authentication | After login the system shall redirect admins to `/admin/dashboard`, vendors to `/vendor/dashboard` and customers to the page they came from (or `/`). |
| FR-4 | Authentication | The system shall store the access token in browser local storage and restore the logged-in session after a page refresh by calling `GET /api/users/profile/`; an invalid/expired token logs the user out. |
| FR-5 | Authentication | The system shall let any logged-in user log out, which clears stored tokens. |
| FR-6 | Authentication | The system shall protect routes by role: admin pages only for `admin`, vendor pages only for `vendor`, cart/checkout/orders/profile/wishlist/payment pages only for logged-in users; admins and vendors are redirected away from the customer storefront. |
| FR-7 | Profile | The system shall allow a logged-in user to view and update first name, last name, username, phone, address, city, state and PIN code (`GET/PATCH /api/users/profile/`); e-mail, user type and verified flag are read-only. |
| FR-8 | Catalogue | The system shall list active products, 12 per page, newest first (`GET /api/products/`). |
| FR-9 | Catalogue | The system shall search products by keyword in name, description and short description (`?search=`). |
| FR-10 | Catalogue | The system shall filter products by category (id or name), brand (id or name), minimum and maximum price; the API also supports `product_type` and `is_featured`. |
| FR-11 | Catalogue | The system shall sort products by price, name or creation date in ascending or descending order (`?ordering=`). |
| FR-12 | Catalogue | The system shall show a product detail page with image gallery, discounted and original price, savings, discount/featured/stock badges, description, specifications, warranty months, SKU, category, brand and weight. |
| FR-13 | Catalogue | The system shall show up to 8 featured, active products on the home page (`GET /api/products/featured/`). |
| FR-14 | Catalogue | The system shall list active categories and brands for filters (`GET /api/products/categories/`, `/brands/`). |
| FR-15 | Catalogue | The system shall compute discounted price = price − (price × discount % / 100), "in stock" = stock > 0 and "low stock" = stock ≤ minimum stock level. |
| FR-16 | Catalogue | The system shall let a user share a product link (Web Share API or copy to clipboard). |
| FR-17 | Cart | The system shall let a logged-in user add an active product to the cart with a quantity (1–10 on the detail page, 1 from a product card); adding an existing product increases its quantity. |
| FR-18 | Cart | The system shall display cart items with image, brand, unit price, quantity, line total, subtotal, 18 % tax, shipping and grand total. |
| FR-19 | Cart | The system shall let the user increase/decrease item quantity (minimum 1 in the UI) and remove an item; only the owner's cart items can be changed. |
| FR-20 | Cart | The system shall show the number of cart items as a badge in the header. |
| FR-21 | Wishlist | The system shall let a logged-in user add a product to the wishlist without duplicates and view all wishlist items. |
| FR-22 | Orders | The system shall provide a checkout form for shipping name, phone, address, city, state (list of Indian states/UTs), PIN code and optional notes, and a choice of payment method (Card via Stripe or Cash on Delivery). |
| FR-23 | Orders | The system shall create an order from the cart in one database transaction: subtotal = sum of line totals, tax = 18 % of subtotal, shipping = ₹50 if subtotal < ₹500 else ₹0, final amount = subtotal + tax + shipping; it shall reject an empty cart ("Cart is empty"). |
| FR-24 | Orders | For each cart item the system shall store an order item with product name, unit price, image URL, quantity, line total and the product's vendor, reduce the product stock and then empty the cart. |
| FR-25 | Orders | The system shall give every order a unique UUID `order_id` and initial status `pending` / payment status `pending`. |
| FR-26 | Orders | The system shall list the logged-in customer's orders (newest first) and show an order detail page with status, payment status, shipping address, items and amount summary. |
| FR-27 | Orders | The system shall let customers download an order PDF from the order list or order detail page. |
| FR-28 | Payment | The system shall create a Stripe PaymentIntent for an order owned by the user in INR paise, rejecting amounts below ₹0.50 or above ₹9,99,999.99, and return the client secret (`POST /api/payments/create-payment-intent/`). |
| FR-29 | Payment | The system shall collect card details with Stripe's PaymentElement and confirm the payment in the browser. |
| FR-30 | Payment | The system shall verify the PaymentIntent status with Stripe (`POST /api/payments/confirm-payment/`) and, if `succeeded`, set the order to `paid` / `confirmed`, store the transaction id and create a `payments` record with method `stripe` and status `success`. |
| FR-31 | Payment | The system shall show a Payment Successful page (with order id and links) and a Payment Failed page (with Try Again / Back to Cart). |
| FR-32 | Invoice | The system shall generate a PDF invoice (invoice number `INV-<order_id>`, dates, statuses, bill-to address, items, subtotal, tax, shipping, total) and e-mail it after order creation and after payment confirmation. |
| FR-33 | Vendor | The system shall let a prospective vendor register with e-mail, username, password, name, phone, business name, GST number and optional address; the account is created with `is_vendor_approved = False`. |
| FR-34 | Vendor | The system shall allow vendor APIs only for vendors approved by the admin. |
| FR-35 | Vendor | The system shall show a vendor dashboard with total, active and low-stock (≤ 5) products, total and pending orders, total sales from paid orders, commission rate, vendor commission, admin revenue, recent orders and top 5 products. |
| FR-36 | Vendor | The system shall list the vendor's own products and allow a quick stock update (`PATCH /api/vendor/products/<id>/stock/`). |
| FR-37 | Vendor | The system shall list orders that contain the vendor's products, showing only that vendor's items, and allow item status changes pending → accepted → shipped (only these three values are accepted). |
| FR-38 | Vendor (API only) | The system shall provide vendor profile view/update, product create/update/delete and single-order view endpoints for approved vendors. |
| FR-39 | Admin | The system shall show an admin dashboard with total products, total customers, total vendors (pending count badge), total orders, total revenue (paid orders), pending orders, low-stock products (≤ 5), 5 recent orders and top 5 selling products. |
| FR-40 | Admin | The system shall list vendors and let the admin approve or suspend (reject) a vendor after a confirmation dialog. |
| FR-41 | Admin | The system shall list products with search by name and In-Stock / Out-of-Stock filter. |
| FR-42 | Admin | The system shall list customers with search by name, e-mail or username, showing contact, location and join date. |
| FR-43 | Admin | The system shall list orders with search (order id, e-mail, shipping name), order-status filter, payment-status filter and quick status buttons with counts. |
| FR-44 | Admin (API only) | The system shall allow the admin to update an order (e.g. status) via `PATCH /api/admin/orders/<order_id>/`, update vendor details (e.g. commission rate, active flag) and fetch 30-day sales analytics. |
| FR-45 | Back-office | The system shall provide Django Admin forms to create/edit/delete categories, brands, products (with inline images and specifications), users (with role, phone, address, verified flag) and to view report logs. |
| FR-46 | Reports | Product Report: totals (all, active, inactive, low stock, out of stock), inventory value, products by category (pie), by brand (bar), by vendor (table, including "LaptopWorld (in-house)"), stock details table; filters: period, date range, category, brand, vendor, low stock. |
| FR-47 | Reports | Order Report: total orders, revenue (paid), average order value, status distribution (pie), payment status (bar), daily sales trend (line), top 10 products; filters: period, date range, order status, payment status. |
| FR-48 | Reports | Vendor Report: total vendors, products, sales, commission; top 10 vendors chart; sales by vendor table (orders, items sold, sales, commission rate, vendor commission, admin revenue, in-house row); vendor performance table. |
| FR-49 | Reports | Individual Vendor Report: vendor information, product/order/sales/commission summary, product categories pie, order-item status bar, top 10 products, 20 recent order items; date filters. |
| FR-50 | Reports | User Report: total, active, inactive users, customers/vendors/admins, customers with orders, user-type pie, status bar, top 10 customers by spending. |
| FR-51 | Reports | Sales & Revenue Report (paid orders): total revenue, orders, average order value, tax, shipping, discounts, net revenue (revenue − tax − shipping), payment methods pie, monthly revenue bar, daily revenue line, top 15 revenue products. |
| FR-52 | Reports | Customer Report: total, active, verified customers, customers with orders, one-time (1 order), repeat (≥ 2) and loyal (≥ 5) buyers, top 10 locations, top 20 customers by spending. |
| FR-53 | Reports | Category & Brand Report: for every category and brand – total products, active products, stock (category), units sold and revenue from paid orders, sorted by revenue, with top-10 bar charts. |
| FR-54 | Reports | All reports shall support period presets (today, yesterday, this week, last week, this month, last month, this year, last year, last 7/30/90 days) calculated in the Asia/Kolkata time zone, or a custom from/to date where the end date is inclusive. |
| FR-55 | Reports | Each report shall be exportable as a PDF (logo, shop name/address/contact, title, generated date/time, summary table, detail table, authorised signature, page footer with page number) that opens in a new tab and starts printing. |
| FR-56 | Reports | The system shall log each generated report summary (type, admin, filters, time) and show the last 10 entries on the Reports overview page. |
| FR-57 | Information | The system shall provide 12 information pages with page title, description and keywords meta tags. |
| FR-58 | Information | The Contact page shall collect name, e-mail, subject and message and open the visitor's e-mail program with these details. |
| FR-59 | Common | The header search box shall send the visitor to the product list filtered by the search text. |
| FR-60 | Common | The system shall show toast messages for success/error, loading spinners, empty-state screens and an error boundary page for unexpected errors. |

### 2.4 Non-Functional Requirements

**Security (exactly what is implemented):**
- **Password hashing:** passwords are stored using Django's default password hasher (PBKDF2-SHA256), through `User.objects.create_user()` (customers) and `user.set_password()` (vendors). `PASSWORD_HASHERS` is not overridden.
- **Password rules:** client-side (`frontend/src/utils/validators.ts`) the customer password must be ≥ 8 characters with an upper-case letter, lower-case letter, digit and special character. Server-side, `validate_password` is called for customers, **but `AUTH_PASSWORD_VALIDATORS` is not configured in `settings.py`, so the server does not enforce any rule**. Vendor passwords: client minimum 6 characters, no server rule.
- **Authentication tokens:** `rest_framework_simplejwt.authentication.JWTAuthentication` is the only DRF authentication class. Access token lifetime 1 day, refresh token lifetime 30 days, `ROTATE_REFRESH_TOKENS = True`, `BLACKLIST_AFTER_ROTATION = True` (but the blacklist app is not installed and no refresh endpoint is exposed). Tokens are sent as `Authorization: Bearer <token>` and stored in browser `localStorage`.
- **Role checks:** custom DRF permissions `IsAdminUser` (user_type == 'admin') and `IsVendorUser` (user_type == 'vendor' and approved). Front-end route guards `AdminRoute`, `VendorRoute`, `CustomerRoute`, `ProtectedRoute` in `App.tsx`.
- **Ownership checks:** cart items are fetched with `cart__user=request.user`; orders with `user=request.user`; vendor products with `vendor=request.user`; vendor order items with `vendor=request.user`; PaymentIntent is created only for the requesting user's order.
- **Security headers / middleware:** `SecurityMiddleware`, `XFrameOptionsMiddleware` (clickjacking protection), `CsrfViewMiddleware`, `SessionMiddleware`, `AuthenticationMiddleware` are enabled. HSTS, `SECURE_SSL_REDIRECT`, secure cookies, Content-Security-Policy: **NOT FOUND IN CODE**.
- **Rate limiting / throttling:** **NOT FOUND IN CODE** (no `DEFAULT_THROTTLE_CLASSES`).
- **Input validation / sanitisation:** DRF serializers validate types, required fields, max lengths, unique e-mail/username/SKU and choice values; Django ORM uses parameterised queries (protection against SQL injection); React escapes output by default. Client-side validation with React Hook Form (required, patterns for e-mail, Indian mobile `^[6-9]\d{9}$`, PIN code `^[1-9][0-9]{5}$`, username `^[a-zA-Z0-9_]+$`).
- **CORS:** `django-cors-headers` with `CORS_ALLOW_ALL_ORIGINS = True` (this overrides the `CORS_ALLOWED_ORIGINS` list of localhost:3000/5173) and `CORS_ALLOW_CREDENTIALS = True`.
- **Card data:** card details are entered in Stripe's PaymentElement and go directly to Stripe; the application never receives or stores card numbers.
- **Secrets:** `SECRET_KEY`, database URL, Stripe keys and e-mail password are read from environment variables (`python-dotenv`); `.env` files are listed in `.gitignore`.

**Reliability:**
- Order creation runs inside `transaction.atomic()` – order, order items, stock reduction and cart clearing succeed or fail together.
- Payment confirmation is **not** wrapped in a transaction (see Section 11.3).
- Server code catches exceptions and returns JSON error responses; the React app has an `ErrorBoundary` and shows toast errors.
- Unique constraints prevent duplicate e-mails, usernames, SKUs, order ids, cart/wishlist duplicates and duplicate specifications per product.
- Order items keep a snapshot of product name, price and image so old orders stay correct if products change.

**Performance:**
- Server-side pagination (`PageNumberPagination`, `PAGE_SIZE = 12`).
- `select_related` used in admin and report queries; database aggregation (`Sum`, `Count`, `Avg`, `TruncDate`, `TruncMonth`) for reports.
- Persistent DB connections (`conn_max_age=600`).
- RTK Query caching and tag-based cache invalidation in the frontend; images use `loading="lazy"`.
- Static files compressed and cached by WhiteNoise (`CompressedManifestStaticFilesStorage`).
- PDF tables limited to 50 rows (40 for vendors) with a "Showing first N of M records" note.

**Scalability:**
- Stateless JWT authentication lets the API run on several Gunicorn workers/servers.
- Frontend (static SPA) and backend (REST API) are separate and can be scaled/hosted independently.
- Cloud PostgreSQL (Neon) through `DATABASE_URL`.
- Some report endpoints loop over vendors/categories/brands and run queries per item (N+1 pattern), which will slow down with very large data.

**Usability:**
- Clean Tailwind CSS design, animations (Framer Motion), toast notifications (react-hot-toast), loading spinners, empty states with call-to-action buttons, breadcrumb on product page, password show/hide toggles, confirmation dialogs for vendor approve/suspend.
- Filters are kept in the URL on the product page so results can be bookmarked/shared.
- Indian formats: currency `en-IN` INR, list of Indian states/UTs, Indian phone and PIN code validation, IST time zone for reports.

**Responsiveness:**
- Tailwind responsive classes (`sm:`, `md:`, `lg:`, `xl:`) on all pages; mobile navigation menu in all three headers; mobile filter drawer on the product page; tables wrapped in horizontal scroll containers; charts use Recharts `ResponsiveContainer`.

**Data privacy:**
- Passwords are write-only in serializers and never returned by the API.
- Customers can only see their own cart, wishlist and orders; vendors only see their own products and order items (plus the shipping address of those orders).
- Report and admin data are restricted to admins.
- Concerns: JWT in localStorage, CORS open to all origins, personal images and a local database file committed to Git (see Section 11.3).

### 2.5 Software Requirements

| Category | Item | Version / Detail (from code) |
|---|---|---|
| Operating System | Development | Windows (the committed virtual environment uses Windows layout `server/venv/Lib/site-packages`; developer machine runs Windows 11). Any OS that runs Python 3.10 and Node.js is suitable. |
| Operating System | Server (deployment) | Linux web service on Render (`server/render.yaml`, `runtime: python`) |
| Programming language (backend) | Python | 3.10.11 (`server/venv/pyvenv.cfg`) |
| Programming language (frontend) | TypeScript | `~5.8.3` (installed 5.8.3) |
| Runtime (frontend tooling) | Node.js / npm | Version NOT FOUND IN CODE (no `engines`/`.nvmrc`); Vite 5 requires Node.js 18 or newer. `package-lock.json` lockfileVersion 3 (npm 7+). |
| **Frontend framework & libraries** (`frontend/package.json` → installed version from `package-lock.json`) | react / react-dom | `^18.2.0` → 18.3.1 |
| | react-router-dom | `^6.20.1` → 6.30.1 |
| | @reduxjs/toolkit (Redux Toolkit + RTK Query) | `^2.0.1` → 2.8.2 |
| | react-redux | `^9.0.4` → 9.2.0 |
| | react-hook-form | `^7.48.2` → 7.62.0 |
| | @stripe/stripe-js | `^8.3.0` → 8.3.0 |
| | @stripe/react-stripe-js | `^5.3.0` → 5.3.0 |
| | recharts | `^3.4.1` → 3.4.1 |
| | framer-motion | `^10.16.16` → 10.18.0 |
| | @headlessui/react | `^1.7.17` → 1.7.19 |
| | @heroicons/react | `^2.0.18` → 2.2.0 |
| | react-hot-toast | `^2.4.1` → 2.5.2 |
| | react-helmet-async | `^2.0.5` → 2.0.5 |
| | jspdf | `^2.5.1` → 2.5.2 |
| | html2canvas | `^1.4.1` → 1.4.1 |
| | clsx | `^2.0.0` → 2.1.1 |
| | axios | `^1.6.2` → 1.11.0 (only in `utils/api.ts`, which is not imported anywhere) |
| | react-query | `^3.39.3` → 3.39.3 (installed, not imported) |
| | date-fns | `^2.30.0` → 2.30.0 (installed, not imported) |
| | three, @react-three/fiber, @react-three/drei | 0.169.0, 8.18.0, 9.122.0 (added in uncommitted working copy; not imported in `src` yet) |
| **Frontend build / dev tools** | vite | `^5.0.8` → 5.4.19 |
| | @vitejs/plugin-react | `^4.2.1` → 4.7.0 |
| | tailwindcss | `^3.4.0` → 3.4.0 (+ `@tailwindcss/forms` 0.5.10, `@tailwindcss/typography` 0.5.16, `@tailwindcss/aspect-ratio` 0.4.2 installed) |
| | postcss / autoprefixer | `^8.4.32` → 8.4.32 / `^10.4.16` → 10.4.16 |
| | eslint, @eslint/js, typescript-eslint | `^9.32.0` → 9.33.0, `^9.32.0` → 9.33.0, `^8.39.0` → 8.39.0 |
| | eslint-plugin-react-hooks / eslint-plugin-react-refresh / globals | 5.2.0 / 0.4.20 / 16.3.0 |
| | @types/react, @types/react-dom, @types/node, @types/three, ts-node | 18.3.23, 18.3.7, 24.2.1, 0.169.0, 10.9.2 |
| **Backend framework & libraries** (`server/requirements.txt`, exact pins) | Django | 5.2.8 |
| | djangorestframework | 3.15.2 |
| | djangorestframework-simplejwt | 5.3.1 |
| | django-cors-headers | 4.6.0 |
| | django-filter | 24.3 |
| | dj-database-url | 3.0.1 |
| | python-dotenv | 1.2.1 |
| | whitenoise | 6.11.0 |
| | gunicorn | 23.0.0 |
| | reportlab | 4.0.7 |
| | pillow | 12.0.0 |
| | stripe | 11.2.0 |
| | razorpay | 1.4.2 (installed, not used in code) |
| | asgiref 3.10.0, sqlparse 0.5.3, tzdata 2025.2, packaging 25.0, typing_extensions 4.15.0, charset-normalizer 3.4.4, setuptools (unpinned) | support packages |
| **Database** | PostgreSQL (cloud host Neon – from the host name in `DATABASE_URL`) | Driver `psycopg2-binary` 2.9.11; ORM: Django ORM; connection via `dj-database-url` |
| File storage | Local media folder | `MEDIA_ROOT = server/media` (Django `ImageField`, Pillow) |
| Payment gateway | Stripe | Python SDK `stripe` 11.2.0, PaymentIntents API, currency `inr` |
| E-mail | Django e-mail (SMTP Gmail settings present) | Active backend: `django.core.mail.backends.console.EmailBackend` |
| PDF generation | ReportLab (server), jsPDF + html2canvas (browser) | see above |
| Authentication | JWT | `djangorestframework-simplejwt` 5.3.1 |
| Version control | Git | Repository with 25 commits (first: 2025-11-10) |
| Deployment | Render (`render.yaml`), Procfile (Gunicorn), WhiteNoise | Docker: NOT FOUND IN CODE; frontend hosting config: NOT FOUND IN CODE |
| Editor | Visual Studio Code (project opened in VS Code) | — |

### 2.6 Suggested Hardware Requirements

*(Suggested values – not defined in code.)*

| Item | Client (customer / vendor / admin) | Server / Development machine |
|---|---|---|
| Processor | Dual-core 1.6 GHz or better | Quad-core 2.0 GHz (Intel i5 / Ryzen 5) or better |
| RAM | 4 GB | 8 GB (16 GB recommended when running Node, Django and a browser together) |
| Storage | 500 MB free (browser cache) | 10 GB free (Node modules, Python venv, media images, database) |
| Display | 1366×768 or higher (mobile phones also supported) | 1920×1080 recommended for development |
| Network | Broadband / 4G internet connection | Stable internet (Neon PostgreSQL and Stripe are cloud services) |
| Software | Modern browser: Chrome, Edge, Firefox or Safari (latest) | Windows 10/11, Linux or macOS; Python 3.10; Node.js 18+; Git |

---

## SECTION 3: SYSTEM ANALYSIS (DIAGRAM DATA)

### 3.1 Level-0 (Context) DFD

```mermaid
flowchart LR
    GUEST["Guest / Visitor"]
    CUST["Customer"]
    VEND["Vendor"]
    ADM["Admin"]
    STRIPE["Stripe Payment Gateway"]
    MAIL["E-mail Server"]
    SYS(("0.0 LaptopWorld E-Commerce System"))

    GUEST -- "search text, filters, registration details" --> SYS
    SYS -- "product catalogue, product details, info pages" --> GUEST
    CUST -- "login details, profile, cart and wishlist actions, shipping details, payment request" --> SYS
    SYS -- "JWT token, cart, wishlist, order confirmation, order history, order PDF" --> CUST
    VEND -- "vendor registration, login, stock updates, order item status" --> SYS
    SYS -- "approval status, dashboard, own products, own order items, commission" --> VEND
    ADM -- "login, vendor approve or suspend, report filters, catalogue data" --> SYS
    SYS -- "dashboard statistics, lists, on-screen reports, PDF reports" --> ADM
    SYS -- "create and retrieve PaymentIntent (amount, currency, order id)" --> STRIPE
    STRIPE -- "client secret, payment status" --> SYS
    SYS -- "confirmation e-mail with PDF invoice" --> MAIL
    MAIL -- "e-mail delivered" --> CUST
```

**Description of elements and flows**
- **Process 0.0 – LaptopWorld E-Commerce System:** the whole application (React SPA + Django REST API + PostgreSQL).
- **Guest → System:** search text, filter values, registration form data. **System → Guest:** product list, product details, information pages.
- **Customer → System:** e-mail/password, profile changes, add/update/remove cart items, wishlist additions, shipping details, request to pay. **System → Customer:** JWT tokens, cart and wishlist contents, order id and totals, order history and details, downloadable order PDF.
- **Vendor → System:** vendor registration data, login, new stock quantities, order-item status (accepted/shipped). **System → Vendor:** approval status (access allowed or 403), dashboard statistics, own product list, own order items with shipping address, commission figures.
- **Admin → System:** login, approve/suspend vendor commands, report type and filters, catalogue data (categories, brands, products, images, specifications entered in Django Admin). **System → Admin:** dashboard figures, product/customer/order/vendor lists, on-screen reports and PDF reports.
- **System ↔ Stripe:** the system sends a PaymentIntent request (amount in paise, currency `inr`, order id in metadata) and later retrieves the PaymentIntent; Stripe returns the client secret and the payment status. (Card details travel from the customer's browser straight to Stripe through the PaymentElement – they never pass through the system.)
- **System → E-mail Server → Customer:** order-confirmation and payment-confirmation e-mails with the PDF invoice attached (currently printed to the console because of the console e-mail backend).

### 3.2 Level-1 DFD

```mermaid
flowchart LR
    GUEST["Guest"]
    CUST["Customer"]
    VEND["Vendor"]
    ADM["Admin"]
    STRIPE["Stripe"]
    MAIL["E-mail Server"]

    P1(("1.0 Registration and Authentication"))
    P2(("2.0 Product Catalogue Management"))
    P3(("3.0 Cart and Wishlist Management"))
    P4(("4.0 Order Processing"))
    P5(("5.0 Payment Processing"))
    P6(("6.0 Vendor Management"))
    P7(("7.0 Admin Management"))
    P8(("8.0 Report Generation"))
    P9(("9.0 Invoice and E-mail"))

    D1[("D1 users")]
    D2[("D2 categories")]
    D3[("D3 brands")]
    D4[("D4 products")]
    D5[("D5 product_images")]
    D6[("D6 product_specifications")]
    D7[("D7 carts")]
    D8[("D8 cart_items")]
    D9[("D9 wishlists")]
    D10[("D10 wishlist_items")]
    D11[("D11 orders")]
    D12[("D12 order_items")]
    D13[("D13 payments")]
    D14[("D14 report_logs")]

    GUEST -- "registration data" --> P1
    CUST -- "e-mail and password" --> P1
    VEND -- "vendor registration, login" --> P1
    ADM -- "login" --> P1
    P1 -- "new user, profile update" --> D1
    D1 -- "user record" --> P1
    P1 -- "JWT tokens, profile" --> CUST

    GUEST -- "search, filters, sort" --> P2
    P2 -- "product list and details" --> GUEST
    ADM -- "category, brand, product, image, spec data" --> P2
    P2 -- "catalogue records" --> D2
    P2 -- "catalogue records" --> D3
    P2 -- "catalogue records" --> D4
    P2 -- "image records" --> D5
    P2 -- "spec records" --> D6
    D4 -- "products" --> P2
    D5 -- "images" --> P2
    D6 -- "specifications" --> P2

    CUST -- "add, update, remove item, add to wishlist" --> P3
    D4 -- "product price and status" --> P3
    P3 -- "cart" --> D7
    P3 -- "cart lines" --> D8
    P3 -- "wishlist" --> D9
    P3 -- "wishlist lines" --> D10
    P3 -- "cart and wishlist view" --> CUST

    CUST -- "shipping details" --> P4
    D8 -- "cart items" --> P4
    P4 -- "new order" --> D11
    P4 -- "order lines with vendor" --> D12
    P4 -- "reduced stock" --> D4
    P4 -- "clear cart lines" --> D8
    P4 -- "order id and amount" --> CUST
    P4 -- "order details" --> P9

    CUST -- "order id, pay request" --> P5
    P5 -- "PaymentIntent create and retrieve" --> STRIPE
    STRIPE -- "client secret, status" --> P5
    P5 -- "paid and confirmed status" --> D11
    P5 -- "payment record" --> D13
    P5 -- "paid order" --> P9
    D11 -- "order data" --> P9
    D12 -- "order lines" --> P9
    P9 -- "e-mail with invoice PDF" --> MAIL

    VEND -- "stock quantity, item status" --> P6
    D1 -- "vendor approval and rate" --> P6
    P6 -- "new stock" --> D4
    P6 -- "vendor_status" --> D12
    D11 -- "orders with vendor items" --> P6
    P6 -- "dashboard, products, order items, commission" --> VEND

    ADM -- "approve or suspend vendor" --> P7
    P7 -- "is_vendor_approved" --> D1
    D4 -- "products" --> P7
    D11 -- "orders" --> P7
    D12 -- "top products" --> P7
    P7 -- "dashboard and lists" --> ADM

    ADM -- "report type and filters" --> P8
    D1 -- "users, vendors, customers" --> P8
    D2 -- "categories" --> P8
    D3 -- "brands" --> P8
    D4 -- "products" --> P8
    D11 -- "orders" --> P8
    D12 -- "order items" --> P8
    P8 -- "report log entry" --> D14
    D14 -- "recent activity" --> P8
    P8 -- "on-screen report, PDF" --> ADM
```

**Processes**
| No. | Process | Main code |
|---|---|---|
| 1.0 | Registration and Authentication – register customers/vendors, login, issue JWT, read/update profile | `users/views.py`, `users/serializers.py`, `vendor_panel/views.py` (`VendorRegistrationView`) |
| 2.0 | Product Catalogue Management – list/search/filter/sort products, product detail, featured, categories, brands; admin data entry through Django Admin | `products/views.py`, `products/admin.py` |
| 3.0 | Cart and Wishlist Management – get/create cart, add/update/remove item, get/create wishlist, add item | `orders/views.py` (`CartView`, `add_to_cart`, `update_cart_item`, `remove_from_cart`, `WishlistView`, `add_to_wishlist`) |
| 4.0 | Order Processing – create order from cart, list orders, order detail | `orders/views.py` (`create_order`, `OrderListView`, `OrderDetailView`) |
| 5.0 | Payment Processing – create and confirm Stripe PaymentIntent, save payment | `payments/views.py` |
| 6.0 | Vendor Management – vendor dashboard, own products, stock update, own order items, status update | `vendor_panel/views.py` |
| 7.0 | Admin Management – admin dashboard, vendor approve/suspend, product/user/order lists, analytics | `admin_panel/views.py` |
| 8.0 | Report Generation – 8 report summaries, PDF export, report log | `reports/views.py` |
| 9.0 | Invoice and E-mail – create PDF invoice and send e-mail | `orders/utils.py` |

**Data stores** (names are the actual PostgreSQL table names from `db_table`): D1 `users`, D2 `categories`, D3 `brands`, D4 `products`, D5 `product_images`, D6 `product_specifications`, D7 `carts`, D8 `cart_items`, D9 `wishlists`, D10 `wishlist_items`, D11 `orders`, D12 `order_items`, D13 `payments`, D14 `report_logs`.

**Flows (summary):** user data flows between 1.0 and D1; catalogue data entered by the admin flows into D2–D6 and is read by 2.0 for guests; cart and wishlist actions update D7–D10 using product prices from D4; process 4.0 reads D8, writes D11 and D12, reduces stock in D4 and clears D8; process 5.0 exchanges PaymentIntent data with Stripe and updates D11 and D13; process 9.0 reads D11/D12 and sends e-mail; process 6.0 reads vendor approval from D1 and writes stock (D4) and item status (D12); process 7.0 writes vendor approval (D1) and reads D4/D11/D12; process 8.0 reads D1–D4, D11, D12 and writes D14.

### 3.3 Level-2 DFD – Process 4.0/5.0 "Checkout, Order and Payment"

```mermaid
flowchart TB
    CUST["Customer"]
    STRIPE["Stripe"]
    MAIL["E-mail Server"]

    P41(("4.1 Validate shipping details"))
    P42(("4.2 Read cart items"))
    P43(("4.3 Calculate subtotal, tax 18 percent, shipping, final amount"))
    P44(("4.4 Create order record"))
    P45(("4.5 Create order items with product snapshot and vendor"))
    P46(("4.6 Reduce product stock"))
    P47(("4.7 Clear cart"))
    P48(("4.8 Generate invoice PDF and send order e-mail"))
    P51(("5.1 Create Stripe PaymentIntent"))
    P52(("5.2 Collect card and confirm with Stripe"))
    P53(("5.3 Verify PaymentIntent status"))
    P54(("5.4 Mark order paid and save payment"))
    P55(("5.5 Send payment confirmation e-mail"))

    D4[("D4 products")]
    D5[("D5 product_images")]
    D7[("D7 carts")]
    D8[("D8 cart_items")]
    D11[("D11 orders")]
    D12[("D12 order_items")]
    D13[("D13 payments")]

    CUST -- "shipping name, phone, address, city, state, PIN, notes" --> P41
    P41 -- "valid shipping data" --> P42
    P41 -- "field errors" --> CUST
    D7 -- "user cart" --> P42
    D8 -- "cart items" --> P42
    P42 -- "Cart is empty error" --> CUST
    P42 -- "cart items" --> P43
    D4 -- "discounted price" --> P43
    P43 -- "totals" --> P44
    P44 -- "order row (pending, pending)" --> D11
    P44 -- "order" --> P45
    D5 -- "primary image URL" --> P45
    P45 -- "order item rows" --> D12
    P45 -- "quantities" --> P46
    P46 -- "new stock_quantity" --> D4
    P46 --> P47
    P47 -- "delete cart items" --> D8
    P47 --> P48
    P48 -- "order confirmation and invoice" --> MAIL
    P48 -- "order_id, final_amount, invoice_sent" --> CUST

    CUST -- "order_id (card payment chosen)" --> P51
    D11 -- "final_amount" --> P51
    P51 -- "amount in paise, inr, order_id" --> STRIPE
    STRIPE -- "client_secret" --> P51
    P51 -- "client_secret, amount" --> P52
    CUST -- "card details (via Stripe PaymentElement)" --> P52
    P52 -- "confirmPayment" --> STRIPE
    STRIPE -- "paymentIntent succeeded" --> P52
    P52 -- "payment_intent_id, order_id" --> P53
    P53 -- "retrieve PaymentIntent" --> STRIPE
    STRIPE -- "status" --> P53
    P53 -- "Payment not completed error" --> CUST
    P53 -- "succeeded" --> P54
    P54 -- "payment_status paid, status confirmed, transaction id" --> D11
    P54 -- "payment row (stripe, success)" --> D13
    P54 --> P55
    P55 -- "payment confirmation and invoice" --> MAIL
    P55 -- "Payment confirmed successfully" --> CUST
```

**Sub-process description** (code: `server/orders/views.py::create_order`, `server/payments/views.py`, `server/orders/utils.py`, `frontend/src/pages/Checkout.tsx`, `StripePaymentForm.tsx`)
- **4.1** `OrderCreateSerializer` checks the shipping fields (required, max lengths). Invalid data returns HTTP 400 with field errors.
- **4.2** Reads the user's `Cart` and its `cart_items`; if none, returns "Cart is empty" (400); if no cart, "Cart not found" (404). Steps 4.2–4.8 run inside `transaction.atomic()`.
- **4.3** `total_amount` = sum of (discounted price × quantity); `tax_amount` = 18 % of total; `shipping_charges` = 50 if total < 500 else 0; `final_amount` = total + tax + shipping.
- **4.4** Creates the `orders` row with a new UUID `order_id`, user, amounts and shipping fields (status `pending`, payment status `pending`).
- **4.5** For every cart item creates an `order_items` row with product, product name, unit (discounted) price, absolute URL of the primary (or first) image, quantity, line total and the product's vendor.
- **4.6** Subtracts the ordered quantity from `products.stock_quantity`.
- **4.7** Deletes the cart items.
- **4.8** `send_invoice_email(order, "order_confirmation")` builds the invoice PDF and e-mails it; returns `order_id`, `final_amount`, `invoice_sent` (HTTP 201).
- **5.1** For card payment the SPA calls `create-payment-intent`; the server converts `final_amount` to paise, checks the ₹0.50–₹9,99,999.99 range and calls `stripe.PaymentIntent.create(amount, currency='inr', metadata={'order_id'})`.
- **5.2** The SPA shows Stripe's PaymentElement; `stripe.confirmPayment(..., redirect: 'if_required')` sends the card directly to Stripe.
- **5.3** On success the SPA calls `confirm-payment`; the server calls `stripe.PaymentIntent.retrieve(id)` and checks `status == 'succeeded'`.
- **5.4** Sets `payment_status='paid'`, `status='confirmed'`, `payment_transaction_id`, and inserts a `payments` row (`payment_method='stripe'`, `status='success'`, amount = final amount).
- **5.5** Sends the "Payment Confirmed" e-mail with invoice; SPA navigates to `/payment/success`.
- **Cash on Delivery path:** after 4.8 the SPA directly shows `/payment/success`; the order stays `payment_status = 'pending'` (no backend COD handling).

### 3.4 Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar password
        datetime last_login
        bool is_superuser
        varchar username UK
        varchar first_name
        varchar last_name
        varchar email UK
        bool is_staff
        bool is_active
        datetime date_joined
        varchar user_type "admin customer vendor"
        varchar phone
        text address
        varchar city
        varchar state
        varchar pincode
        bool is_verified
        datetime created_at
        datetime updated_at
        varchar business_name
        varchar gst_number
        bool is_vendor_approved
        decimal vendor_commission_rate
    }
    CATEGORIES {
        bigint id PK
        varchar name UK
        text description
        varchar image
        bool is_active
        datetime created_at
        datetime updated_at
    }
    BRANDS {
        bigint id PK
        varchar name UK
        varchar logo
        bool is_active
        datetime created_at
    }
    PRODUCTS {
        bigint id PK
        varchar name
        text description
        varchar short_description
        bigint category_id FK
        bigint brand_id FK
        varchar product_type "laptop accessory"
        varchar sku UK
        decimal price
        decimal discount_percentage
        int stock_quantity
        int min_stock_level
        bool is_active
        bool is_featured
        decimal weight
        int warranty_months
        datetime created_at
        datetime updated_at
        bigint vendor_id FK "nullable"
    }
    PRODUCT_IMAGES {
        bigint id PK
        bigint product_id FK
        varchar image
        varchar alt_text
        bool is_primary
        datetime created_at
    }
    PRODUCT_SPECIFICATIONS {
        bigint id PK
        bigint product_id FK
        varchar spec_name
        varchar spec_value
        datetime created_at
    }
    CARTS {
        bigint id PK
        bigint user_id FK "unique one-to-one"
        datetime created_at
        datetime updated_at
    }
    CART_ITEMS {
        bigint id PK
        bigint cart_id FK
        bigint product_id FK
        int quantity
        datetime added_at
    }
    WISHLISTS {
        bigint id PK
        bigint user_id FK "unique one-to-one"
        datetime created_at
    }
    WISHLIST_ITEMS {
        bigint id PK
        bigint wishlist_id FK
        bigint product_id FK
        datetime added_at
    }
    ORDERS {
        bigint id PK
        varchar order_id UK "UUID"
        bigint user_id FK
        decimal total_amount
        decimal tax_amount
        decimal shipping_charges
        decimal discount_amount
        decimal final_amount
        varchar status
        varchar payment_status
        varchar payment_method
        varchar payment_transaction_id
        varchar shipping_name
        varchar shipping_phone
        text shipping_address
        varchar shipping_city
        varchar shipping_state
        varchar shipping_pincode
        text notes
        datetime created_at
        datetime updated_at
    }
    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar product_name
        decimal product_price
        varchar product_image
        int quantity
        decimal total_price
        bigint vendor_id FK "nullable"
        varchar vendor_status
    }
    PAYMENTS {
        bigint id PK
        varchar payment_id UK "UUID"
        bigint order_id FK "unique one-to-one"
        decimal amount
        varchar payment_method
        varchar transaction_id
        json gateway_response
        varchar status
        datetime created_at
        datetime updated_at
    }
    REPORT_LOGS {
        bigint id PK
        varchar report_type
        bigint generated_by_id FK
        json filters
        varchar file_path
        datetime created_at
    }

    USERS ||--o| CARTS : "owns"
    USERS ||--o| WISHLISTS : "owns"
    USERS ||--o{ ORDERS : "places"
    USERS |o--o{ PRODUCTS : "sells as vendor"
    USERS |o--o{ ORDER_ITEMS : "fulfils as vendor"
    USERS ||--o{ REPORT_LOGS : "generates"
    CATEGORIES ||--o{ PRODUCTS : "classifies"
    BRANDS ||--o{ PRODUCTS : "brands"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has"
    PRODUCTS ||--o{ PRODUCT_SPECIFICATIONS : "has"
    CARTS ||--o{ CART_ITEMS : "contains"
    PRODUCTS ||--o{ CART_ITEMS : "added as"
    WISHLISTS ||--o{ WISHLIST_ITEMS : "contains"
    PRODUCTS ||--o{ WISHLIST_ITEMS : "saved as"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered as"
    ORDERS ||--o| PAYMENTS : "paid by"
```

**Relationships and cardinality**
| Relationship | Type | Implemented by |
|---|---|---|
| User – Cart | 1 : 1 (a user has zero or one cart, created on first use) | `Cart.user` OneToOneField |
| User – Wishlist | 1 : 1 (zero or one) | `Wishlist.user` OneToOneField |
| User (customer) – Order | 1 : M | `Order.user` ForeignKey |
| User (vendor) – Product | 1 : M (optional; null = shop's own "in-house" product) | `Product.vendor` ForeignKey, `limit_choices_to={'user_type': 'vendor'}` |
| User (vendor) – OrderItem | 1 : M (optional) | `OrderItem.vendor` ForeignKey |
| User (admin) – ReportLog | 1 : M | `ReportLog.generated_by` ForeignKey |
| Category – Product | 1 : M | `Product.category` ForeignKey |
| Brand – Product | 1 : M | `Product.brand` ForeignKey |
| Product – ProductImage | 1 : M | `ProductImage.product` ForeignKey |
| Product – ProductSpecification | 1 : M (one spec name per product) | `ProductSpecification.product`, unique (product, spec_name) |
| Cart – CartItem | 1 : M | `CartItem.cart` ForeignKey |
| Order – OrderItem | 1 : M (at least one, because empty carts are rejected) | `OrderItem.order` ForeignKey |
| Order – Payment | 1 : 1 (zero or one) | `Payment.order` OneToOneField |
| **Cart – Product** | **M : M** through `cart_items` (with quantity) | unique (cart, product) |
| **Wishlist – Product** | **M : M** through `wishlist_items` | unique (wishlist, product) |
| **Order – Product** | **M : M** through `order_items` (with price snapshot) | — |
| User – auth Group / Permission (Django built-in) | M : M | `users_groups`, `users_user_permissions` |

All foreign keys use `on_delete=CASCADE` (deleting a parent deletes the children).

### 3.5 Use Case Diagram

```mermaid
flowchart LR
    G["Guest"]
    C["Customer"]
    V["Vendor"]
    A["Admin"]
    ST["Stripe - external"]
    EM["E-mail Server - external"]

    subgraph SYS["LaptopWorld System"]
        UC1(["Browse home and featured products"])
        UC2(["Search, filter and sort products"])
        UC3(["View product details"])
        UC4(["Read information pages"])
        UC5(["Send contact message"])
        UC6(["Register as customer"])
        UC7(["Register as vendor"])
        UC8(["Login and logout"])
        UC9(["Manage cart"])
        UC10(["Manage wishlist"])
        UC11(["Checkout and place order"])
        UC12(["Pay by card"])
        UC13(["Choose Cash on Delivery"])
        UC14(["View order history and details"])
        UC15(["Download order PDF"])
        UC16(["Update profile"])
        UC17(["View vendor dashboard"])
        UC18(["View own products and update stock"])
        UC19(["View own order items and update status"])
        UC20(["View admin dashboard"])
        UC21(["Approve or suspend vendor"])
        UC22(["View products, customers, orders"])
        UC23(["Generate reports with filters"])
        UC24(["Export report PDF"])
        UC25(["View report activity"])
        UC26(["Manage catalogue and users in Django Admin"])
        UC27(["Receive invoice e-mail"])
    end

    G --- UC1
    G --- UC2
    G --- UC3
    G --- UC4
    G --- UC5
    G --- UC6
    G --- UC7
    G --- UC8
    C -. "inherits all guest use cases" .-> G
    C --- UC9
    C --- UC10
    C --- UC11
    C --- UC12
    C --- UC13
    C --- UC14
    C --- UC15
    C --- UC16
    C --- UC27
    V --- UC8
    V --- UC17
    V --- UC18
    V --- UC19
    A --- UC8
    A --- UC20
    A --- UC21
    A --- UC22
    A --- UC23
    A --- UC24
    A --- UC25
    A --- UC26
    UC12 --- ST
    UC11 --- EM
    UC12 --- EM
    UC24 -. "extends" .-> UC23
    UC12 -. "extends" .-> UC11
    UC13 -. "extends" .-> UC11
```

**Actors and their use cases**
- **Guest:** Browse home and featured products; Search, filter and sort products; View product details; Read information pages; Send contact message; Register as customer; Register as vendor; Login.
- **Customer** (inherits Guest): Manage cart (add, change quantity, remove); Manage wishlist (add, view); Checkout and place order; Pay by card (Stripe) or Choose Cash on Delivery (both extend Checkout); View order history and details; Download order PDF; Update profile; Receive invoice e-mail; Logout.
- **Vendor:** Login/logout; View vendor dashboard; View own products and update stock; View own order items and update status (accept, ship). (Vendor registration is done as a Guest.)
- **Admin:** Login/logout; View admin dashboard; Approve or suspend vendor; View products, customers, orders; Generate reports with filters; Export report PDF (extends Generate reports); View report activity; Manage catalogue and users in Django Admin.
- **External systems:** Stripe (participates in Pay by card); E-mail server (participates in Checkout and Pay by card – invoice e-mails).

### 3.6 Activity Diagram – Customer Purchase Flow

```mermaid
flowchart TD
    S(("Start")) --> A1["Open home page"]
    A1 --> A2["Browse or search products, apply filters"]
    A2 --> A3["Open product detail"]
    A3 --> D1{"Logged in?"}
    D1 -- "No" --> A4["Login or register"]
    A4 --> A3
    D1 -- "Yes" --> A5["Select quantity and Add to Cart"]
    A5 --> D2{"Continue shopping?"}
    D2 -- "Yes" --> A2
    D2 -- "No" --> A6["Open cart, change quantity or remove items"]
    A6 --> A7["Proceed to Checkout"]
    A7 --> A8["Enter shipping details and choose payment method"]
    A8 --> D3{"Form valid?"}
    D3 -- "No" --> A9["Show field error messages"]
    A9 --> A8
    D3 -- "Yes" --> A10["POST create order"]
    A10 --> D4{"Cart empty or server error?"}
    D4 -- "Yes" --> A11["Show error toast"]
    A11 --> E(("End"))
    D4 -- "No" --> A12["Order saved, stock reduced, cart cleared, invoice e-mail sent"]
    A12 --> D5{"Payment method?"}
    D5 -- "Cash on Delivery" --> A13["Show Payment Successful page - payment pending"]
    D5 -- "Card (Stripe)" --> A14["Create PaymentIntent and show Stripe card form"]
    A14 --> A15["Enter card details and click Pay Now"]
    A15 --> D6{"Stripe payment succeeded?"}
    D6 -- "No" --> A16["Show Stripe error, retry or Cancel"]
    A16 --> A15
    D6 -- "Yes" --> A17["POST confirm payment - order paid and confirmed, payment saved, e-mail sent"]
    A17 --> D7{"Server confirmation OK?"}
    D7 -- "No" --> A18["Show Payment verification failed"]
    A18 --> E
    D7 -- "Yes" --> A19["Show Payment Successful page with Order ID"]
    A13 --> A20["View order details and download PDF"]
    A19 --> A20
    A20 --> E
```

**Description:** The customer starts at the home page, browses or searches, opens a product and (if not logged in) is asked to log in. After adding products to the cart the customer can continue shopping or open the cart, adjust quantities and proceed to checkout. The shipping form is validated in the browser; on success the order is created on the server (stock reduced, cart cleared, invoice e-mail). For Cash on Delivery the success page is shown directly (payment remains pending). For card payment a Stripe PaymentIntent is created, the customer pays in the Stripe form, and the server confirms the payment with Stripe before the success page appears. Finally the customer can open the order and download a PDF. Decision points: logged in?, continue shopping?, form valid?, cart empty/error?, payment method?, Stripe success?, server confirmation OK?

### 3.7 Sequence Diagram – Place Order and Pay by Card

```mermaid
sequenceDiagram
    autonumber
    actor CU as Customer
    participant UI as React SPA (Checkout.tsx, StripePaymentForm.tsx)
    participant API as Django REST API
    participant DB as PostgreSQL
    participant ST as Stripe
    participant EM as E-mail Server

    CU->>UI: Fill shipping form, choose Card, click Continue to Payment
    UI->>API: POST /api/orders/orders/create/ (Bearer JWT, shipping data)
    API->>DB: BEGIN, SELECT carts and cart_items for user
    alt Cart empty
        API-->>UI: 400 Cart is empty
        UI-->>CU: Error toast
    else Cart has items
        API->>API: Calculate subtotal, tax 18 percent, shipping, final amount
        API->>DB: INSERT orders, INSERT order_items, UPDATE products stock, DELETE cart_items
        API->>EM: Send Order Confirmed e-mail with invoice PDF
        API->>DB: COMMIT
        API-->>UI: 201 order_id, final_amount, invoice_sent
        UI->>API: POST /api/payments/create-payment-intent/ (order_id)
        API->>DB: SELECT orders WHERE order_id and user
        API->>ST: PaymentIntent.create(amount in paise, currency inr, metadata order_id)
        ST-->>API: PaymentIntent with client_secret
        API-->>UI: 200 client_secret, amount
        UI-->>CU: Show Stripe PaymentElement and amount
        CU->>UI: Enter card details, click Pay Now
        UI->>ST: stripe.confirmPayment(elements, redirect if_required)
        alt Card declined or error
            ST-->>UI: error
            UI-->>CU: Error toast, can retry
        else Payment succeeded
            ST-->>UI: paymentIntent status succeeded
            UI->>API: POST /api/payments/confirm-payment/ (payment_intent_id, order_id)
            API->>ST: PaymentIntent.retrieve(payment_intent_id)
            ST-->>API: status succeeded
            API->>DB: UPDATE orders SET payment_status paid, status confirmed, payment_transaction_id
            API->>DB: INSERT payments (stripe, success, amount)
            API->>EM: Send Payment Confirmed e-mail with invoice PDF
            API-->>UI: 200 Payment confirmed successfully
            UI-->>CU: Navigate to /payment/success with Order ID
        end
    end
```

**Description:** the diagram follows the real calls in `Checkout.tsx` → `ordersApi.createOrder` (`POST orders/create/`) → `paymentsApi.createPaymentIntent` (`POST create-payment-intent/`) → `StripePaymentForm.tsx` (`stripe.confirmPayment`) → `paymentsApi.confirmPayment` (`POST confirm-payment/`) and the server functions `create_order`, `create_payment_intent`, `confirm_payment` and `send_invoice_email`.

---

## SECTION 4: DATABASE DESIGN

### 4.1 Database Overview

| Item | Detail |
|---|---|
| Database type | Relational – **PostgreSQL** (hosted on **Neon**, identified from the host name of `DATABASE_URL` in `server/.env`) |
| Connection method | `dj_database_url.config(default=DATABASE_URL, conn_max_age=600, ssl_require=(RENDER == "true"))` in `server/config/settings.py`; the URL comes from the `DATABASE_URL` environment variable |
| Driver | `psycopg2-binary` 2.9.11 |
| ORM | Django ORM (Django 5.2.8); schema created by Django migrations (`users/migrations/0001_initial.py`, `products/migrations/0001_initial.py`, `orders/migrations/0001_initial.py`, `reports/migrations/0001_initial.py`, `reports/migrations/0002_alter_reportlog_report_type.py`) |
| Primary keys | `BigAutoField` named `id` on every table (`DEFAULT_AUTO_FIELD`) |
| Project tables (models) | **14**: `users`, `categories`, `brands`, `products`, `product_images`, `product_specifications`, `carts`, `cart_items`, `wishlists`, `wishlist_items`, `orders`, `order_items`, `payments`, `report_logs` |
| Django built-in tables | `auth_group`, `auth_permission`, `auth_group_permissions`, `users_groups`, `users_user_permissions`, `django_admin_log`, `django_content_type`, `django_migrations`, `django_session` |
| Other files | `server/db.sqlite3` exists in the repository but is **not referenced** by `settings.py` (legacy file). Comments in `vendor_panel/views.py` mention a MySQL fix, showing MySQL was used earlier; the current configuration is PostgreSQL. |
| Time zone | `TIME_ZONE = 'Asia/Kolkata'`, `USE_TZ = True` (stored in UTC, reports calculated in IST) |
| Media files | Images stored on disk under `server/media/` (`categories/`, `brands/`, `products/`); only the relative path is stored in the database |

### 4.2 Design Summary

- **References vs embedded data:** the design is fully relational. All relationships use foreign keys (`ForeignKey`, `OneToOneField`). Nothing is embedded except two JSON columns: `payments.gateway_response` (JSONField, not filled by current code) and `report_logs.filters` (JSONField, stores the query-string filters used for a report).
- **Deliberate denormalisation (snapshots):** `order_items` copies `product_name`, `product_price` and `product_image` at the time of purchase; `orders` copies the shipping address (`shipping_*` fields) so past orders are not affected by later product or profile changes.
- **Derived (not stored) values:** `Product.discounted_price`, `Product.is_in_stock`, `Product.is_low_stock`, `CartItem.total_price` are Python properties; cart `total_items` and `total_amount` are computed in `CartSerializer`.
- **Unique indexes:** `users.email`, `users.username`, `categories.name`, `brands.name`, `products.sku`, `orders.order_id`, `payments.payment_id`; one-to-one unique columns `carts.user_id`, `wishlists.user_id`, `payments.order_id`.
- **Compound (composite) unique indexes (`unique_together`):** `cart_items (cart_id, product_id)`, `wishlist_items (wishlist_id, product_id)`, `product_specifications (product_id, spec_name)`.
- **Foreign-key indexes:** Django automatically creates an index on every ForeignKey column (`products.category_id`, `products.brand_id`, `products.vendor_id`, `product_images.product_id`, `product_specifications.product_id`, `cart_items.cart_id`, `cart_items.product_id`, `wishlist_items.wishlist_id`, `wishlist_items.product_id`, `orders.user_id`, `order_items.order_id`, `order_items.product_id`, `order_items.vendor_id`, `report_logs.generated_by_id`).
- **Explicit `Meta.indexes`:** NOT FOUND IN CODE.
- **Text / full-text indexes:** NOT FOUND IN CODE (search uses DRF `SearchFilter`, i.e. case-insensitive `icontains`).
- **Default ordering:** `products` and `orders` by `-created_at`; `report_logs` by `-created_at`.
- **Delete rule:** every foreign key uses `CASCADE`.

### 4.3 Table Structures

#### Table 1: `users` — model `User` (extends Django `AbstractUser`) — `server/users/models.py`
Login field: `USERNAME_FIELD = 'email'`; `REQUIRED_FIELDS = ['username']`. Custom `save()`: if `user_type == 'admin'` → `is_staff = True` and `is_superuser = True`; otherwise, if not a superuser → `is_staff = False`.

| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField (bigint) | Primary key, auto increment | Unique user number |
| password | CharField(128) | Required | Hashed password (PBKDF2) |
| last_login | DateTimeField | Null, blank | Last login time (Django) |
| is_superuser | BooleanField | Default False | Full Django permissions; set automatically for admins |
| username | CharField(150) | Required, unique, Unicode username validator (letters, digits, @ . + - _) | Display/user name |
| first_name | CharField(150) | Blank allowed | First name |
| last_name | CharField(150) | Blank allowed | Last name |
| email | EmailField(254) | Required, **unique** | Login e-mail |
| is_staff | BooleanField | Default False | Can log in to Django Admin (admins only) |
| is_active | BooleanField | Default True | Disabled accounts cannot log in |
| date_joined | DateTimeField | Default `timezone.now` | Django join date |
| user_type | CharField(20) | Choices: `admin`, `customer`, `vendor`; default `customer` | Role of the user |
| phone | CharField(15) | Null, blank | Mobile number |
| address | TextField | Null, blank | Address |
| city | CharField(100) | Null, blank | City |
| state | CharField(100) | Null, blank | State |
| pincode | CharField(10) | Null, blank | PIN code |
| is_verified | BooleanField | Default False | Verified flag (only editable in Django Admin) |
| created_at | DateTimeField | `auto_now_add` | Record created time (used in reports) |
| updated_at | DateTimeField | `auto_now` | Last update time |
| business_name | CharField(200) | Null, blank | Vendor's business name |
| gst_number | CharField(50) | Null, blank | Vendor's GST number |
| is_vendor_approved | BooleanField | Default False | Admin approval for vendors |
| vendor_commission_rate | DecimalField(5,2) | Default 10.00 | Vendor commission percentage |
| groups | ManyToManyField → `auth.Group` | Blank (table `users_groups`) | Django permission groups |
| user_permissions | ManyToManyField → `auth.Permission` | Blank (table `users_user_permissions`) | Django individual permissions |

#### Table 2: `categories` — model `Category` — `server/products/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Category number |
| name | CharField(100) | Required, **unique** | Category name (e.g. Gaming Laptops) |
| description | TextField | Null, blank | Description |
| image | ImageField | Null, blank, `upload_to='categories/'` | Category image path |
| is_active | BooleanField | Default True | Only active categories are listed by the API |
| created_at | DateTimeField | `auto_now_add` | Created time |
| updated_at | DateTimeField | `auto_now` | Updated time |

#### Table 3: `brands` — model `Brand` — `server/products/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Brand number |
| name | CharField(100) | Required, **unique** | Brand name (e.g. Dell) |
| logo | ImageField | Null, blank, `upload_to='brands/'` | Brand logo path |
| is_active | BooleanField | Default True | Only active brands are listed |
| created_at | DateTimeField | `auto_now_add` | Created time |

#### Table 4: `products` — model `Product` — `server/products/models.py`
Default ordering `-created_at`. Computed properties: `discounted_price`, `is_in_stock` (stock > 0), `is_low_stock` (stock ≤ min_stock_level).

| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Product number |
| name | CharField(200) | Required | Product name |
| description | TextField | Required | Full description |
| short_description | CharField(500) | Null, blank | One-line summary |
| category_id | ForeignKey → `categories` | Required, CASCADE, related_name `products` | Category |
| brand_id | ForeignKey → `brands` | Required, CASCADE, related_name `products` | Brand |
| product_type | CharField(20) | Choices: `laptop`, `accessory`; default `laptop` | Type of product |
| sku | CharField(100) | Required, **unique** | Stock keeping unit code |
| price | DecimalField(10,2) | Required | MRP / list price (₹) |
| discount_percentage | DecimalField(5,2) | Default 0 | Discount % |
| stock_quantity | PositiveIntegerField | Default 0, must be ≥ 0 | Units in stock |
| min_stock_level | PositiveIntegerField | Default 5 | Low-stock threshold |
| is_active | BooleanField | Default True | Visible in shop |
| is_featured | BooleanField | Default False | Shown on home page |
| weight | DecimalField(6,2) | Null, blank | Weight in kg |
| warranty_months | PositiveIntegerField | Default 12 | Warranty period |
| created_at | DateTimeField | `auto_now_add` | Created time |
| updated_at | DateTimeField | `auto_now` | Updated time |
| vendor_id | ForeignKey → `users` | Null, blank, CASCADE, `limit_choices_to={'user_type': 'vendor'}`, related_name `vendor_products` | Selling vendor; NULL = shop's own (in-house) product |

#### Table 5: `product_images` — model `ProductImage` — `server/products/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Image number |
| product_id | ForeignKey → `products` | Required, CASCADE, related_name `images` | Product |
| image | ImageField | Required, `upload_to='products/'` | Image file path |
| alt_text | CharField(200) | Null, blank | Alternative text |
| is_primary | BooleanField | Default False | Main image shown in lists |
| created_at | DateTimeField | `auto_now_add` | Uploaded time |

#### Table 6: `product_specifications` — model `ProductSpecification` — `server/products/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Specification number |
| product_id | ForeignKey → `products` | Required, CASCADE, related_name `specifications`; **unique together with spec_name** | Product |
| spec_name | CharField(100) | Required | Specification name (e.g. Processor) |
| spec_value | CharField(200) | Required | Value (e.g. Intel i7 1360P) |
| created_at | DateTimeField | `auto_now_add` | Created time |

#### Table 7: `carts` — model `Cart` — `server/orders/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Cart number |
| user_id | OneToOneField → `users` | Required, **unique**, CASCADE, related_name `cart` | Owner |
| created_at | DateTimeField | `auto_now_add` | Created time |
| updated_at | DateTimeField | `auto_now` | Updated time |

#### Table 8: `cart_items` — model `CartItem` — `server/orders/models.py`
Computed property `total_price` = product discounted price × quantity.

| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Line number |
| cart_id | ForeignKey → `carts` | Required, CASCADE, related_name `items`; **unique together with product** | Cart |
| product_id | ForeignKey → `products` | Required, CASCADE | Product |
| quantity | PositiveIntegerField | Default 1 | Quantity |
| added_at | DateTimeField | `auto_now_add` | Added time |

#### Table 9: `wishlists` — model `Wishlist` — `server/orders/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Wishlist number |
| user_id | OneToOneField → `users` | Required, **unique**, CASCADE, related_name `wishlist` | Owner |
| created_at | DateTimeField | `auto_now_add` | Created time |

#### Table 10: `wishlist_items` — model `WishlistItem` — `server/orders/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Line number |
| wishlist_id | ForeignKey → `wishlists` | Required, CASCADE, related_name `items`; **unique together with product** | Wishlist |
| product_id | ForeignKey → `products` | Required, CASCADE | Product |
| added_at | DateTimeField | `auto_now_add` | Added time |

#### Table 11: `orders` — model `Order` — `server/orders/models.py`
Default ordering `-created_at`. `save()` converts a UUID object to string.

| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Internal order number |
| order_id | CharField(36) | **Unique**, default `uuid.uuid4`, not editable | Public order ID (UUID) |
| user_id | ForeignKey → `users` | Required, CASCADE, related_name `orders` | Customer |
| total_amount | DecimalField(10,2) | Required | Subtotal (sum of item totals) |
| tax_amount | DecimalField(10,2) | Default 0 | 18 % tax |
| shipping_charges | DecimalField(10,2) | Default 0 | ₹50 if subtotal < ₹500 else 0 |
| discount_amount | DecimalField(10,2) | Default 0 | Order discount (always 0 in current code) |
| final_amount | DecimalField(10,2) | Required | Amount payable |
| status | CharField(20) | Choices: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`; default `pending` | Order status |
| payment_status | CharField(20) | Choices: `pending`, `paid`, `failed`, `refunded`; default `pending` | Payment status |
| payment_method | CharField(50) | Null, blank | Payment method (not set by current code) |
| payment_transaction_id | CharField(200) | Null, blank | Stripe PaymentIntent id |
| shipping_name | CharField(200) | Required | Receiver name |
| shipping_phone | CharField(15) | Required | Receiver phone |
| shipping_address | TextField | Required | Address |
| shipping_city | CharField(100) | Required | City |
| shipping_state | CharField(100) | Required | State |
| shipping_pincode | CharField(10) | Required | PIN code |
| notes | TextField | Null, blank | Delivery notes |
| created_at | DateTimeField | `auto_now_add` | Order date/time |
| updated_at | DateTimeField | `auto_now` | Last update |

#### Table 12: `order_items` — model `OrderItem` — `server/orders/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Line number |
| order_id | ForeignKey → `orders` | Required, CASCADE, related_name `items` | Order |
| product_id | ForeignKey → `products` | Required, CASCADE | Product |
| product_name | CharField(200) | Required | Product name at time of order |
| product_price | DecimalField(10,2) | Required | Unit (discounted) price at time of order |
| product_image | URLField(500) | Null, blank | Absolute URL of primary image |
| quantity | PositiveIntegerField | Required | Quantity |
| total_price | DecimalField(10,2) | Required | Line total |
| vendor_id | ForeignKey → `users` | Null, blank, CASCADE, related_name `vendor_order_items` | Vendor of the product (NULL = in-house) |
| vendor_status | CharField(20) | Default `pending` (API accepts `pending`, `accepted`, `shipped`) | Vendor processing status |

#### Table 13: `payments` — model `Payment` — `server/orders/models.py`
| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Internal number |
| payment_id | CharField(36) | **Unique**, default `uuid.uuid4`, not editable | Public payment ID |
| order_id | OneToOneField → `orders` | Required, **unique**, CASCADE, related_name `payment` | Paid order |
| amount | DecimalField(10,2) | Required | Amount paid |
| payment_method | CharField(20) | Required; choices `stripe`, `razorpay`, `paypal`, `cod` | Method (code only writes `stripe`) |
| transaction_id | CharField(200) | Null, blank | Gateway transaction id |
| gateway_response | JSONField | Null, blank | Raw gateway response (not filled) |
| status | CharField(20) | Choices `pending`, `success`, `failed`, `refunded`; default `pending` | Payment result |
| created_at | DateTimeField | `auto_now_add` | Created time |
| updated_at | DateTimeField | `auto_now` | Updated time |

#### Table 14: `report_logs` — model `ReportLog` — `server/reports/models.py`
Default ordering `-created_at`.

| Field | Data Type | Constraints | Description |
|---|---|---|---|
| id | BigAutoField | Primary key | Log number |
| report_type | CharField(20) | Required; choices `product`, `order`, `vendor`, `user`, `sales`, `customer`, `analytics` | Report generated |
| generated_by_id | ForeignKey → `users` | Required, CASCADE | Admin who generated it |
| filters | JSONField | Null, blank | Filters used (query parameters) |
| file_path | CharField(500) | Null, blank | File path (not filled by current code) |
| created_at | DateTimeField | `auto_now_add` | Generated time |

---

## SECTION 5: INPUT DESIGN

General notes:
- Client-side validation uses **React Hook Form** rules (`required`, `minLength`, `pattern`, `validate`) – Zod/Yup schemas: **NOT FOUND IN CODE**.
- Server-side validation uses **Django REST Framework serializers** and model constraints. DRF's default messages are used unless a custom message is written in code (e.g. "This field is required.", "user with this email already exists.").
- Errors are shown as red text under a field (`Input` component, `text-red-600`) and/or as **toast** pop-ups (react-hot-toast, top-right, 4 seconds).

### 5.1 Login Form
- **Route:** `/login` — **Used by:** all roles (customer, vendor, admin) — **File:** `frontend/src/components/Auth/Login.tsx` — **API:** `POST /api/users/login/`

| Label | Type | Required | Client-side validation | Server-side validation (`UserLoginSerializer`) |
|---|---|---|---|---|
| Email address | email | Yes | required → "Email is required"; pattern `^[^\s@]+@[^\s@]+\.[^\s@]+$` → "Invalid email address" | `EmailField`; missing → "Email and password required" |
| Password | password (eye icon show/hide) | Yes | required → "Password is required"; minLength 6 → "Password must be at least 6 characters" | `authenticate()`; wrong → "Invalid credentials"; inactive → "Account is disabled" |
| Remember me | checkbox | No | none (value not used by code) | — |

- **Messages shown:** success toast "Welcome back!" and redirect by role; failure toast "Login failed" (the server's text is not displayed because the page reads `error.data.message`, while DRF returns `non_field_errors`).
- **Sample values for screenshot:** Email `rahul.sharma@example.com`, Password `Rahul@1234` (register this customer first). For admin: the e-mail/password you set in `DJANGO_SUPERUSER_EMAIL` / `DJANGO_SUPERUSER_PASSWORD`.

### 5.2 Customer Registration Form
- **Route:** `/register` — **Used by:** Guest — **File:** `frontend/src/components/Auth/Register.tsx` — **API:** `POST /api/users/register/`

| Label | Type | Required | Client-side validation | Server-side validation (`UserRegistrationSerializer` / `User` model) |
|---|---|---|---|---|
| First name | text | Yes | required → "First name is required"; minLength 2 → "First name must be at least 2 characters" | max 150 chars (blank allowed on server) |
| Last name | text | Yes | required → "Last name is required"; minLength 2 → "Last name must be at least 2 characters" | max 150 chars |
| Username | text | Yes | required → "Username is required"; minLength 3 → "Username must be at least 3 characters"; pattern `^[a-zA-Z0-9_]+$` → "Username can only contain letters, numbers, and underscores" | required, unique ("A user with that username already exists."), max 150, Unicode username validator |
| Email address | email | Yes | required → "Email is required"; pattern → "Invalid email address" | required, valid e-mail, unique ("user with this email already exists.") |
| Phone number | tel | No | pattern `^[6-9]\d{9}$` → "Invalid phone number" | max 15 chars |
| Password | password (show/hide) | Yes | required → "Password is required"; minLength 8 → "Password must be at least 8 characters"; on submit `validatePassword()` shows toasts: "Password must be at least 8 characters long", "Password must contain at least one uppercase letter", "Password must contain at least one lowercase letter", "Password must contain at least one number", "Password must contain at least one special character" | write-only; `validate_password` (no validators configured, so no rule is applied) |
| Confirm password | password (show/hide) | Yes | required → "Please confirm your password"; must equal Password → "Passwords do not match" | must match → "Passwords don't match" |
| I agree to the Terms of Service and Privacy Policy | checkbox | Yes (HTML `required`) | browser message "Please tick this box…" | — |

- Address, city, state and PIN code are accepted by the API but are not on this form (they are filled later in Profile).
- **Messages shown:** success toast "Account created successfully!" → home page (user is logged in). Failure → toast "Registration failed" (server field errors are not mapped because the page expects `error.data.errors`).
- **Sample values:** First name `Rahul`, Last name `Sharma`, Username `rahul_sharma`, Email `rahul.sharma@example.com`, Phone `9876543210`, Password `Rahul@1234`, Confirm `Rahul@1234`, tick the terms box.
- **Error screenshot tip:** click "Create account" with all fields empty to show the red messages.

### 5.3 Vendor Registration Form
- **Route:** `/vendor-register` (no link to this page exists in the UI – type the URL) — **Used by:** prospective vendor (Guest) — **File:** `frontend/src/components/Auth/VendorRegister.tsx` — **API:** `POST /api/vendor/register/` (called with `fetch`)

| Section | Label | Type | Required | Client-side validation | Server-side validation (`VendorRegistrationSerializer`) |
|---|---|---|---|---|---|
| Account Information | Email | email | Yes | required → "Email is required" (plus browser e-mail check) | required, valid, unique |
| | Username | text | Yes | required → "Username is required" | required, unique, max 150 |
| | Password | password (show/hide) | Yes | required → "Password is required"; minLength 6 → "Min 6 characters" | write-only; **no strength validation** |
| | Confirm Password | password | Yes | required → "Please confirm password"; → "Passwords do not match" | must match → "Passwords don't match" |
| Personal Information | First Name | text | Yes | required → "First name is required" | max 150 |
| | Last Name | text | Yes | required → "Last name is required" | max 150 |
| | Phone | tel | Yes | required → "Phone is required" | max 15 |
| Business Information | Business Name | text | Yes | required → "Business name is required" | max 200 |
| | GST Number | text | Yes | required → "GST number is required" (format not checked) | max 50 (format not checked) |
| Address (Optional) | Address, City, State, Pincode | text | No | none | address text; city/state max 100; pincode max 10 |

- Server creates the user with `user_type='vendor'`, `is_vendor_approved=False`.
- **Messages shown:** success toast "Registration successful! Awaiting admin approval." and redirect to `/login`; failure toast "Registration failed".
- **Sample values:** Email `techzone.vendor@example.com`, Username `techzone`, Password `Vendor@123`, Confirm `Vendor@123`, First Name `Amit`, Last Name `Patil`, Phone `9123456780`, Business Name `TechZone Computers`, GST Number `27ABCDE1234F1Z5`, Address `Shop 12, Rajwada Chowk`, City `Satara`, State `Maharashtra`, Pincode `415002`.

### 5.4 Checkout Form (Shipping Details and Payment Method)
- **Route:** `/checkout` — **Used by:** Customer (logged in, cart not empty) — **File:** `frontend/src/pages/Checkout.tsx` — **API:** `POST /api/orders/orders/create/`, then for card `POST /api/payments/create-payment-intent/`

| Label | Type | Required | Client-side validation | Server-side validation (`OrderCreateSerializer` / `Order` model) |
|---|---|---|---|---|
| Full Name | text | Yes | required → "Full name is required" | required, max 200 |
| Phone Number | tel | Yes | required → "Phone number is required"; pattern `^[6-9]\d{9}$` → "Invalid phone number" | required, max 15 |
| Address | textarea (3 rows) | Yes | required → "Address is required" | required |
| City | text | Yes | required → "City is required" | required, max 100 |
| State | select (36 Indian states and UTs) | Yes | required → "State is required" | required, max 100 |
| PIN Code | text | Yes | required → "PIN code is required"; pattern `^[1-9][0-9]{5}$` → "Invalid PIN code" | required, max 10 |
| Order Notes (Optional) | textarea (2 rows) | No | none | optional |
| Payment Method | radio: "Credit/Debit Card (Stripe)" (default) / "Cash on Delivery (₹50 handling charges apply)" | Yes | — | not sent to the server |

- **Server-side errors:** DRF "This field is required." (400), "Cart is empty" (400), "Cart not found" (404), "Unexpected error: …" (500).
- **Messages shown:** card → toast "Order created! Complete your payment below." and the Stripe form appears; COD → toast "Order placed successfully!" and `/payment/success`; failure → toast "Failed to place order".
- **Sample values:** Full Name `Rahul Sharma`, Phone `9876543210`, Address `Flat 203, Shivneri Apartments, Powai Naka`, City `Satara`, State `Maharashtra`, PIN Code `415001`, Notes `Please call before delivery.`, Payment Method `Credit/Debit Card (Stripe)`.

### 5.5 Stripe Card Payment Form
- **Route:** `/checkout` (second step, shown after the order is created) — **Used by:** Customer — **File:** `frontend/src/pages/StripePaymentForm.tsx` — **APIs:** Stripe.js `confirmPayment`, then `POST /api/payments/confirm-payment/`
- Shows "Complete Payment", Order ID and "Amount to pay".

| Label | Type | Required | Validation |
|---|---|---|---|
| Card number, Expiry date, CVC, Country (rendered by Stripe PaymentElement, "tabs" layout) | Stripe-hosted fields | Yes | Validated by Stripe (e.g. "Your card number is incomplete.", "Your card was declined.") – shown as toast |
| Pay Now (button) | submit | — | disabled until Stripe is loaded / while processing |
| Cancel / Back to checkout | button | — | returns to the shipping form (order already exists) |

- **Server-side:** `confirm_payment` returns "Payment not completed" (400) if the PaymentIntent is not `succeeded`, or the error text.
- **Messages shown:** "Payment successful!" → `/payment/success`; errors: Stripe message, or "Payment verification failed".
- **Sample values (only with Stripe test-mode keys):** Card `4242 4242 4242 4242`, Expiry `12/34`, CVC `123`, Country `India`. For a decline screenshot: `4000 0000 0000 0002`.

### 5.6 Profile Form
- **Route:** `/profile` — **Used by:** Customer — **File:** `frontend/src/pages/Profile.tsx` — **API:** `GET` / `PATCH /api/users/profile/`
- Header card shows name, e-mail and a "Verified" / "Unverified" badge (read-only).

| Label | Type | Required | Client-side validation | Server-side validation (`UserProfileSerializer`) |
|---|---|---|---|---|
| First Name | text | Yes | required → "First name is required" | max 150 |
| Last Name | text | Yes | required → "Last name is required" | max 150 |
| Username | text | Yes | required → "Username is required" | unique, max 150 |
| Phone Number | tel | No | pattern → "Invalid phone number" | max 15 |
| Address | textarea | No | none | text |
| City | text | No | none | max 100 |
| State | select (Indian states) | No | none | max 100 |
| PIN Code | text | No | pattern → "Invalid PIN code" | max 10 |

- `id`, `email`, `user_type`, `is_verified`, `created_at` are read-only on the server.
- **Messages shown:** "Profile updated successfully!" / "Failed to update profile".
- **Sample values:** `Rahul`, `Sharma`, `rahul_sharma`, `9876543210`, `Flat 203, Shivneri Apartments, Powai Naka`, `Satara`, `Maharashtra`, `415001`.

### 5.7 Contact Form
- **Route:** `/contact` — **Used by:** Guest / Customer — **File:** `frontend/src/pages/info/Contact.tsx` — **API:** none (opens the visitor's e-mail program with a `mailto:` link to the shop e-mail)

| Label | Type | Required | Validation |
|---|---|---|---|
| Your Name | text | No | none |
| Email Address | email | No | none |
| Subject | select: Select a topic / Product Inquiry / Order Issue / Return / Refund / Vendor Partnership / Other | No | none |
| Message | textarea (5 rows) | No | none |

- After "Send Message" the panel changes to "Message Sent! Your email client should have opened…".
- **Sample values:** `Rahul Sharma`, `rahul.sharma@example.com`, `Product Inquiry`, `Is the Dell Latitude 5540 available with 32 GB RAM?`

### 5.8 Header Search Bar
- **Where:** header of every storefront page (`Header.tsx` → `SearchBar.tsx`) — **Used by:** Guest / Customer
- **Field:** text, placeholder "Search laptops, accessories...". On Enter (if not blank) → `/products?search=<text>`. Server: DRF `SearchFilter` on `name`, `description`, `short_description`.
- **Sample value:** `Dell`

### 5.9 Product Filter and Sort Panel
- **Route:** `/products` — **File:** `frontend/src/pages/Products.tsx` — **API:** `GET /api/products/?page=&search=&category=&brand=&min_price=&max_price=&ordering=`

| Control | Type | Notes |
|---|---|---|
| Price Range – Min Price, Max Price | number inputs | no validation; server filters `price >= min`, `price <= max` |
| Quick price buttons | "Under ₹10,000 / ₹25,000 / ₹50,000 / ₹75,000 / ₹1,00,000" | sets Max Price |
| Category | radio list (from `/api/products/categories/`) | category id |
| Brand | radio list (from `/api/products/brands/`) | brand id |
| Sort | menu: Most Popular, Price: Low to High, Price: High to Low, Newest First, Name: A to Z, Name: Z to A | `ordering` = `''`, `price`, `-price`, `-created_at`, `name`, `-name` |
| Clear All Filters | button | resets all |
| Pagination | page buttons | 12 items per page |

- **Messages:** "No products found – Try adjusting your filters or search criteria…", "Error loading products" with Retry.
- **Sample values:** Category `Gaming Laptops`, Max Price `150000`, Sort `Price: Low to High`.

### 5.10 Add to Cart / Wishlist Controls (Product Detail)
- **Route:** `/products/:id` — **File:** `ProductDetail.tsx` (also quick buttons on `ProductCard.tsx`) — **APIs:** `POST /api/orders/cart/add/`, `POST /api/orders/wishlist/add/`

| Control | Type | Validation / behaviour |
|---|---|---|
| Quantity | select 1–10 | — |
| Add to Cart | button (disabled and labelled "Out of Stock" when stock = 0) | server: product must exist and be active → else "Product not found" (404) |
| Wishlist | button | duplicates return "Product already in wishlist" (HTTP 200) |
| Share this product | button | Web Share API or clipboard |

- **Messages:** "Please login to add items to cart", "Added to cart!", "Failed to add to cart", "Please login to add items to wishlist", "Added to wishlist!", "Failed to add to wishlist", "Product link copied to clipboard".
- **Sample values:** Quantity `2`, then Add to Cart.

### 5.11 Cart Quantity Controls
- **Route:** `/cart` — **File:** `Cart.tsx` — **APIs:** `PUT /api/orders/cart/update/<item_id>/`, `DELETE /api/orders/cart/remove/<item_id>/`
- Controls: "−" (disabled at quantity 1), "+", trash icon (remove), "Proceed to Checkout", "← Continue Shopping".
- **Messages:** "Cart updated", "Failed to update cart", "Item removed from cart", "Failed to remove item"; empty cart → "Your cart is empty".

### 5.12 Report Filters Panel
- **Routes:** all `/admin/dashboard/reports/*` pages — **Used by:** Admin — **File:** `frontend/src/components/reports/ReportFilters.tsx`

| Control | Type | Shown on | Values |
|---|---|---|---|
| Time Period | select | all reports | All Time, Today, Yesterday, This Week, Last Week, This Month, Last Month, This Year, Last Year, Last 7 Days, Last 30 Days, Last 90 Days |
| From Date / To Date | date | all reports (hidden while a period is selected) | any date; server parses `YYYY-MM-DD`, invalid dates ignored, end date inclusive |
| Category | select | Product report | categories |
| Brand | select | Product report | brands |
| Vendor | select | Product report | vendors (business name or e-mail) |
| Stock Status | select | Product report | All Products / Low Stock Only |
| Order Status | select | Order report | Pending, Confirmed, Processing, Shipped, Delivered, Cancelled |
| Payment Status | select | Order report | Paid, Pending, Failed |

- Active filters are shown as removable chips; "Clear All" resets. Tip text when a period is active: "Period filter is active. Custom date range is disabled. Select "All Time" to use custom dates."
- **Sample values:** Time Period `This Month`; or From `2026-10-01` To `2026-10-25`; Order Status `Confirmed`, Payment Status `Paid`.

### 5.13 Vendor Stock Update (inline)
- **Route:** `/vendor/products` — **Used by:** approved Vendor — **File:** `VendorProducts.tsx` — **API:** `PATCH /api/vendor/products/<product_id>/stock/`
- Number input per product; a "Save" button appears when the value is changed.
- **Server validation:** "stock_quantity required" (400), "Product not found" (404 – product must belong to the vendor); value converted with `int()`.
- **Messages:** "Stock updated" / "Failed to update stock". **Sample:** change `25` to `30`.

### 5.14 Vendor Order-Item Status Buttons
- **Route:** `/vendor/orders` (click "View" on an order) — **File:** `VendorOrders.tsx` — **API:** `PATCH /api/vendor/order-items/<item_id>/status/`
- "Accept" (pending → accepted) and "Mark Shipped" (accepted → shipped).
- **Server validation:** value must be `pending`, `accepted` or `shipped` → else "Invalid status"; item must belong to the vendor → else "Order item not found".
- **Messages:** "Status updated!" / "Failed to update status".

### 5.15 Admin List Controls and Vendor Approval
| Route | Controls | Behaviour / messages |
|---|---|---|
| `/admin/vendors` | Approve / Suspend buttons | browser confirm "Approve vendor "<username>"?" / "Reject vendor "<username>"?"; toasts "Vendor approved!", "Failed to approve", "Vendor rejected!", "Failed to reject" |
| `/admin/products` | search "Search by name..."; buttons All / Active / Inactive (Active = in stock) | client-side filter |
| `/admin/users` | search "Search by name, email or username..." | client-side filter |
| `/admin/orders` | search "Search by order ID, customer..."; Status select; Payment select; quick status buttons with counts | client-side filter |

### 5.16 Footer Newsletter
- E-mail input "Enter your email" + "Subscribe" button on every storefront page (`Footer.tsx`). In the committed version **no action is attached** (non-functional). In the in-progress redesign it checks the e-mail format ("Please enter a valid email address.") and opens the visitor's e-mail program with a pre-filled "Newsletter subscription" message – there is still no backend or database table for subscribers.

### 5.17 Django Admin Forms (back-office data entry)
- **URL:** `http://localhost:8000/admin/` — **Used by:** Admin (user with `is_staff = True`) — **Files:** `server/products/admin.py`, `server/users/admin.py`, `server/reports/admin.py`
- Validation messages are Django defaults ("This field is required.", "Product with this Sku already exists.", "Ensure this value is greater than or equal to 0.", "Upload a valid image…").

| Form | URL | Fields (* = required) | Sample values |
|---|---|---|---|
| Add/Change Product (with inlines) | `/admin/products/product/add/` | Name*, Description*, Short description, Category*, Brand*, Product type (Laptop/Accessory), SKU* (unique), Price* (max 10 digits, 2 decimals), Discount percentage, Stock quantity (≥ 0), Min stock level, Is active, Is featured, Weight, Warranty months, Vendor (only vendor users); read-only Created/Updated. **Inline "Product images":** Image*, Alt text, Is primary. **Inline "Product specifications":** Spec name*, Spec value* (unique per product). | `Dell Latitude 5540`; `Professional laptop built for productivity and reliability.`; `Ideal for business professionals`; Business Laptops; Dell; Laptop; `DELL-5540`; `90000`; `8`; `18`; `5`; ✓ active; ✓ featured; `1.60`; `12`; Vendor TechZone (or blank). Image: upload a laptop photo, Is primary ✓. Specs: Processor = Intel i7 1360P; RAM = 16GB DDR4; Storage = 512GB SSD |
| Add Category | `/admin/products/category/add/` | Name* (unique), Description, Image, Is active | `Gaming Laptops`, `High-performance gaming laptops with latest GPUs` |
| Add Brand | `/admin/products/brand/add/` | Name* (unique), Logo, Is active | `Asus` |
| Add/Change User | `/admin/users/user/add/` | Add: Username*, Password*, Password confirmation*, Email, User type, Phone. Change: standard Django fields + "Additional Info" (User type, Phone, Address, City, State, Pincode, Is verified). Vendor fields (business name, GST, approval, commission) are **not** in this form. | Username `priya_k`, Email `priya.k@example.com`, User type Customer, Phone `9988776655` |
| Report logs | `/admin/reports/reportlog/` | list/view: report type, generated by, created at; filter by type/date; search by e-mail/username | — |

---

## SECTION 6: OUTPUT DESIGN

### 6.1 Pages / Screens

Frontend base URL: `http://localhost:5173`.

| # | Page name | Route / URL | Who sees it | What it shows |
|---|---|---|---|---|
| 1 | Home | `/` | Guest, Customer | Hero "Find Your Perfect Laptop" with Shop Now / Gaming Laptops buttons; "Why Choose Us" (Free Shipping, Extended Warranty, 24/7 Support, Easy Returns); "Shop by Category" (Gaming Laptops, Business Laptops, Ultrabooks, Accessories); Featured Products (up to 8); call-to-action banner; footer |
| 2 | Products (catalogue) | `/products` | Guest, Customer | Filter panel (price, category, brand), sort menu, "Showing X of Y products", product cards (image, Featured/discount/Out of Stock badges, name, brand, price, hover Add to Cart / Wishlist / View), pagination, mobile filter drawer |
| 3 | Product Detail | `/products/:id` | Guest, Customer | Breadcrumb, image gallery, badges, name, fixed rating text, discounted/original price, "You save", description, specifications grid, shipping/warranty/returns points, quantity select, Add to Cart, Wishlist, Share, SKU, category, brand, weight; empty "Related Products" heading |
| 4 | Login | `/login` | All roles | Login form ("Welcome back"), link to register |
| 5 | Customer Registration | `/register` | Guest | Registration form ("Create account"), terms checkbox, (non-functional) Google/Facebook buttons, link to login |
| 6 | Vendor Registration | `/vendor-register` | Guest (prospective vendor) | "Become a Vendor" form with Account, Personal, Business and Address sections |
| 7 | Shopping Cart | `/cart` | Customer | Item list (image, name, brand, unit price, quantity −/+, line total, remove), Order Summary (subtotal, tax 18 %, shipping, free-shipping hint, total), Proceed to Checkout, security badges; empty state |
| 8 | Checkout | `/checkout` | Customer | Shipping Information form, Payment Method (Card / COD), Order Summary with items, subtotal, tax, shipping, COD charge, total, "Continue to Payment" / "Place Order" |
| 9 | Stripe Payment (checkout step 2) | `/checkout` | Customer | "Complete Payment", Order ID, Amount to pay, Stripe card form, Pay Now, Cancel, "Payments are secure and encrypted" |
| 10 | Payment Successful | `/payment/success` | Customer | Green tick, "Payment Successful!", Order ID, buttons View Order Details / View All Orders / Continue Shopping |
| 11 | Payment Failed | `/payment/failure` | Customer | Red cross, "Payment Failed", Try Again / Back to Cart / Continue Shopping (no code navigates here automatically; open by URL) |
| 12 | My Orders | `/orders` | Customer | Order cards: Order #id, placed date/time, status and payment badges, first 3 items (image, name, qty, price), "and N more items", total, Download (PDF), View Details; empty state |
| 13 | Order Detail | `/orders/:order_id` | Customer | Back link, Order #id, date, Download PDF, Order Status badges, Shipping Address, Order Items (image, name, price, qty, total), Order Summary (subtotal, tax, shipping, discount, total) |
| 14 | Wishlist | `/wishlist` | Customer | "My Wishlist", item count, product cards with filled heart; empty state |
| 15 | My Profile | `/profile` | Customer | Gradient header (name, e-mail, Verified/Unverified), editable profile form, Save Changes |
| 16 | About Us | `/about` | Guest, Customer | Our Story, What We Stand For, The People Behind LaptopWorld, Have Questions? |
| 17 | Careers | `/careers` | Guest, Customer | Why Join Us?, Open Positions, Don't See the Right Role? |
| 18 | Press | `/press` | Guest, Customer | Press Releases, About LaptopWorld |
| 19 | Blog | `/blog` | Guest, Customer | Blog article cards, "Stay in the Loop" |
| 20 | Help Center | `/help` | Guest, Customer | Help topics / FAQs, "Still Need Help?" |
| 21 | Contact Us | `/contact` | Guest, Customer | E-mail, phone and address cards, "Send Us a Message" form, Business Hours |
| 22 | Shipping Info | `/shipping` | Guest, Customer | How Your Order Gets to You, Delivery Timelines by Zone, Questions About Your Shipment? |
| 23 | Returns & Refunds | `/returns` | Guest, Customer | How Returns Work, Return Eligibility, Need Help With a Return? |
| 24 | Privacy Policy | `/privacy` | Guest, Customer | Privacy policy text |
| 25 | Terms of Service | `/terms` | Guest, Customer | Terms text |
| 26 | Cookie Policy | `/cookies` | Guest, Customer | What Are Cookies?, Types of Cookies We Use, How to Control Cookies |
| 27 | Disclaimer | `/disclaimer` | Guest, Customer | Disclaimer text |
| 28 | Vendor Dashboard | `/vendor/dashboard` | Approved Vendor | Cards: Total Products, Active Products, Total Orders, "Your Commission (rate %)"; recent orders table (Order ID, Customer, Amount, Status, Date); Top Selling Products |
| 29 | Vendor – My Products | `/vendor/products` | Approved Vendor | Product count; table: Product (image, name, category), Price, Stock (editable + Save), Status (Active/Inactive) |
| 30 | Vendor – My Orders | `/vendor/orders` | Approved Vendor | Order cards (Order ID, Customer, Date, Amount, Status, View/Hide); expanded: vendor's items (image, name, qty × price, total, status badge, Accept / Mark Shipped) and Shipping Address |
| 31 | Admin Dashboard | `/admin/dashboard` | Admin | Cards: Total Products, Total Users, Vendors (red pending badge), Total Orders, Total Revenue, Reports; Pending Orders, Low Stock; Recent Orders table (Order ID, Customer, Amount, Status, Date); Top Selling Products |
| 32 | Vendor Management | `/admin/vendors` | Admin | "N total vendors • N pending approval"; table: Vendor (business name/e-mail), Username, Phone, Joined, Actions (View, Approve or Suspend) |
| 33 | Products Management | `/admin/products` | Admin | Counts; search + All/Active/Inactive; table: Product (image, name, short description), Category, Brand, Price, Discount, Stock (In/Out of Stock), Status (Featured/Normal) |
| 34 | Users Management | `/admin/users` | Admin | Counts (total, active, verified); search; table: User (name, @username), Contact (e-mail, phone), Location, Joined (customers only) |
| 35 | Orders Management | `/admin/orders` | Admin | Counts; search, status and payment selects, quick status buttons; table: Order ID (+ payment method), Customer (shipping name, e-mail), Amount (+ item count), Payment badge, Status badge, Date/time |
| 36 | Reports & Analytics (overview) | `/admin/dashboard/reports` | Admin | 8 report cards (7 clickable + Individual Vendor note), 4 feature tiles, Available Time Periods, Recent Report Activity (last 10: type, period, generated by, date/time) |
| 37 | Product Reports | `/admin/dashboard/reports/products` | Admin | See Section 7.1 |
| 38 | Order Reports | `/admin/dashboard/reports/orders` | Admin | See Section 7.2 |
| 39 | Vendor Reports | `/admin/dashboard/reports/vendors` | Admin | See Section 7.3 |
| 40 | User Reports | `/admin/dashboard/reports/users` | Admin | See Section 7.5 |
| 41 | Sales & Revenue Reports | `/admin/dashboard/reports/sales` | Admin | See Section 7.6 |
| 42 | Customer Reports | `/admin/dashboard/reports/customers` | Admin | See Section 7.7 |
| 43 | Category & Brand Analytics | `/admin/dashboard/reports/category-brand` | Admin | See Section 7.8 |
| 44 | Individual Vendor Report | `/admin/dashboard/reports/vendor/:vendorId` | Admin (open by URL) | See Section 7.4 |
| 45 | PDF report (new browser tab) | blob URL opened by Export button | Admin | Printable PDF – Section 7 |
| 46 | Order PDF (download) | file `order-<order_id>.pdf` | Customer | Section 7.10 |
| 47 | Django Admin site | `http://localhost:8000/admin/` | Admin (staff) | Login, model lists and add/change forms for Users, Categories, Brands, Products (+images, specs), Report logs |
| — | Session loading / error screens | any | All | Spinner while a saved login is restored; `ErrorBoundary` page for unexpected errors; empty states |

Layout (committed version – being redesigned, see note at top): customer pages use `Header` (logo, Products, Laptops, search, cart badge, wishlist, user menu: Profile, Orders, Logout / Login, Register) and `Footer` (Company, Support, Legal links, newsletter, "We accept: VISA MC UPI"); admin pages use `AdminHeader` (Dashboard, Vendors, Products, Users, Orders); vendor pages use `VendorHeader` (Dashboard, My Products, Orders). Admin and vendor pages have no footer.

### 6.2 Screenshot Checklist

**Prepare data first (so screens are not empty):**
1. Start backend (`python manage.py runserver`) and frontend (`npm run dev`) – Section 9.2.
2. In Django Admin create 4 categories (Gaming Laptops, Business Laptops, Ultrabooks, Accessories), 6–8 brands and 8+ products **with images**, discounts and specifications (or run `python manage.py shell < seed_data.py` and then upload real images, because the seed script points to image files that are not in `media/`). Tick **Is featured** on at least 4 products (seed data does not set featured, so the home page section would be empty). Give one product stock `3` (below min level 5) to show low-stock alerts.
3. Register 3 customers at `/register`; fill city/state in `/profile` (used by the Customer report "Top Locations").
4. Register 2 vendors at `/vendor-register`; approve one in `/admin/vendors`, leave one pending (shows the red badge). In Django Admin set the **Vendor** field of 2–3 products to the approved vendor.
5. As customers, place 5–6 orders: some paid with the Stripe test card, some with Cash on Delivery.
6. As the vendor, accept and ship some items.
7. Open each report once (this fills "Recent Report Activity").

| No. | Screen | Exact URL | What should be visible |
|---|---|---|---|
| **Customer / Guest** | | | |
| 1 | Home – top | `http://localhost:5173/` | Hero banner, header with logo, search and Login/Register |
| 2 | Home – categories and featured | `http://localhost:5173/` (scroll) | 4 category cards and at least 4 featured product cards with images and prices |
| 3 | Product list | `http://localhost:5173/products` | Filter panel, product grid, "Showing 8 of 8 products" |
| 4 | Product list – filtered and sorted | `http://localhost:5173/products?category=1&ordering=price` | Category radio selected, results sorted by price |
| 5 | Search result | `http://localhost:5173/products?search=Dell` | Only Dell products |
| 6 | Product detail | `http://localhost:5173/products/<id>` | Product with several images, discount badge, "You save", specifications |
| 7 | Customer registration | `http://localhost:5173/register` | Form filled with sample values (Section 5.2) |
| 8 | Registration validation | `http://localhost:5173/register` | Red error messages after submitting an empty form |
| 9 | Login | `http://localhost:5173/login` | Form filled with customer e-mail and password |
| 10 | Cart | `http://localhost:5173/cart` | 2–3 items, quantity controls, order summary with tax, shipping, total |
| 11 | Wishlist | `http://localhost:5173/wishlist` | 2–3 saved products |
| 12 | Checkout | `http://localhost:5173/checkout` | Shipping form filled (Section 5.4), payment method, order summary |
| 13 | Stripe payment step | `http://localhost:5173/checkout` (after Continue to Payment) | Order ID, amount, card form filled with test card |
| 14 | Payment successful | `http://localhost:5173/payment/success` | Success message and Order ID |
| 15 | My Orders | `http://localhost:5173/orders` | Several orders with Paid and Pending badges |
| 16 | Order detail | `http://localhost:5173/orders/<order_id>` | Status badges, shipping address, items, summary |
| 17 | Order PDF | click "Download PDF" on page 16 | Open `order-<order_id>.pdf` – LaptopWorld header, items table, totals |
| 18 | Invoice e-mail | server terminal | Console output of "Order Confirmed - Invoice #…" / "Payment Confirmed - Invoice #…" (or the real inbox if SMTP is enabled) |
| 19 | Profile | `http://localhost:5173/profile` | Profile header and filled form |
| 20 | Contact | `http://localhost:5173/contact` | Contact cards and filled message form |
| 21 | Information page | `http://localhost:5173/about` (or `/shipping`) | Static content with header/footer |
| 22 | Mobile view | `http://localhost:5173/products` in browser DevTools device mode | Responsive layout and Filters button |
| 23 | Payment failed (optional) | `http://localhost:5173/payment/failure` | Failure message and buttons |
| **Vendor** | | | |
| 24 | Vendor registration | `http://localhost:5173/vendor-register` | Form filled with sample values (Section 5.3) |
| 25 | Vendor dashboard | `http://localhost:5173/vendor/dashboard` | 4 stat cards incl. "Your Commission (10%)", recent orders, top products |
| 26 | Vendor products | `http://localhost:5173/vendor/products` | Own products; one stock value changed so the Save button shows |
| 27 | Vendor orders | `http://localhost:5173/vendor/orders` | One order expanded with Accept / Mark Shipped buttons and shipping address |
| **Admin** | | | |
| 28 | Admin dashboard | `http://localhost:5173/admin/dashboard` | 6 cards with real numbers, pending badge on Vendors, recent orders, top products |
| 29 | Vendor management | `http://localhost:5173/admin/vendors` | One vendor with Suspend, one with Approve |
| 30 | Products management | `http://localhost:5173/admin/products` | Product table with search box |
| 31 | Users management | `http://localhost:5173/admin/users` | Customer table |
| 32 | Orders management | `http://localhost:5173/admin/orders` | Orders with status/payment filters |
| 33 | Reports overview | `http://localhost:5173/admin/dashboard/reports` | 8 report cards and Recent Report Activity list |
| 34 | Product report | `http://localhost:5173/admin/dashboard/reports/products` | Cards, category pie, brand bar, vendor table, stock table |
| 35 | Order report | `http://localhost:5173/admin/dashboard/reports/orders` | Period "This Month"; pie, bar, line chart, top products |
| 36 | Vendor report | `http://localhost:5173/admin/dashboard/reports/vendors` | Totals, top vendors chart, sales-by-vendor and performance tables |
| 37 | Individual vendor report | `http://localhost:5173/admin/dashboard/reports/vendor/<vendor_id>` | Vendor info, cards, pie, bar, top products, recent orders (find the id in the Django Admin user URL) |
| 38 | User report | `http://localhost:5173/admin/dashboard/reports/users` | Cards, user-type pie, status bar, top customers |
| 39 | Sales & revenue report | `http://localhost:5173/admin/dashboard/reports/sales` | Revenue cards, payment-method pie, monthly bar, daily line, top products |
| 40 | Customer report | `http://localhost:5173/admin/dashboard/reports/customers` | Cards, segmentation pie, top locations, top customers |
| 41 | Category & brand report | `http://localhost:5173/admin/dashboard/reports/category-brand` | Category and brand bar charts and tables |
| 42–49 | PDF exports (8) | click the Export button on screens 34–41 | PDF opens in a new tab with print dialog – cancel printing and capture the PDF (header with logo, summary, table, signature, footer) |
| 50 | Django Admin home | `http://localhost:8000/admin/` | Users, Categories, Brands, Products, Report logs |
| 51 | Django Admin – add product | `http://localhost:8000/admin/products/product/add/` | Product form with inline images and specifications filled (Section 5.17) |
| 52 | Django Admin – vendor users | `http://localhost:8000/admin/users/user/?user_type__exact=vendor` | Users filtered by user type |

---

## SECTION 7: REPORTS

**Common facts for reports 7.1–7.8**
- **Where:** React pages under `/admin/dashboard/reports/…` (Admin only); backend `server/reports/views.py`.
- **On-screen library:** Recharts 3.4.1 (charts) + Tailwind tables; **PDF library:** ReportLab 4.0.7 (`SimpleDocTemplate`, A4).
- **PDF layout (all 8):** shop logo (`server/assets/laptopWorld_Logo.png`) with "LaptopWorld", tagline, address, e-mail and phone; separator line; report title and subtitle; "Generated on: <Month DD, YYYY at hh:mm AM/PM>"; "Summary Statistics" table; detail table(s) (amounts shown as "Rs"); "Authorized Signature" with signature image (`server/assets/Shop_Signature.png`); footer on every page with shop name, e-mail, phone, address and "Page N". Long tables show "Showing first N of M records. Use filters to narrow the list."
- **PDF delivery:** `ExportButton.tsx` fetches the PDF as a Blob, opens it in a new browser tab and calls `print()`; the server sends `Content-Disposition: inline; filename="<name>_<YYYYMMDD>.pdf"`.
- **Filters:** all summary and PDF endpoints accept `period` (11 presets) or `date_from`/`date_to`; filters on screen are passed to the PDF export.
- **CSV / Excel export:** NOT FOUND IN CODE (`ExportButton` has a `fileType: 'csv'` prop, but no CSV generation exists).

**General steps to generate any report for a screenshot:** log in as admin → open `http://localhost:5173/admin/dashboard/reports` → click the report card → choose a Time Period (e.g. "This Month") or From/To dates and other filters → wait for "Updating report..." to disappear → take the on-screen screenshot → click the Export button → in the new tab cancel the print dialog → take the PDF screenshot.

### 7.1 Product Inventory Report
- **Route:** `/admin/dashboard/reports/products` — **APIs:** `GET /api/reports/products/summary/`, `GET /api/reports/products/stock/`, `GET /api/reports/products/export/pdf/` — **Functions:** `product_report_summary`, `product_stock_report`, `export_product_report_pdf` — **Log type:** `product`
- **Filters:** Time Period / From–To (on product `created_at`), Category, Brand, Vendor, Stock Status (Low Stock Only).
- **On-screen summary values:** Total Products, Active Products, Inactive Products, Low Stock Alert (active products with stock ≤ min level), Inventory Value (Σ price × stock of active products). API also returns Out-of-Stock count.
- **Charts/tables:** "Products by Category" (pie: count), "Products by Brand" (bar: Products), "Products by Vendor" table (Vendor, Products, Total Stock; products without vendor shown as "LaptopWorld (in-house)"), "Stock Details" table (Product, SKU, Category, Stock, Min Level, Status Low Stock/In Stock, Value).
- **PDF:** title "Product Inventory Report", subtitle "Comprehensive product analysis". Summary: Total Products, Active Products, Low Stock Products, Total Inventory Value. Table "Product Details": SKU, Name, Category, Brand, Stock, Price, Value (first 50). File `product_report_YYYYMMDD.pdf`. Export button label "Export PDF".

### 7.2 Order Sales Report
- **Route:** `/admin/dashboard/reports/orders` — **APIs:** `GET /api/reports/orders/summary/`, `GET /api/reports/orders/export/pdf/` — **Functions:** `order_report_summary`, `export_order_report_pdf` — **Log type:** `order`
- **Filters:** Time Period / From–To (order `created_at`), Order Status, Payment Status.
- **On-screen summary values:** Total Orders, Total Revenue (paid orders), Average Order Value (all filtered orders).
- **Charts/tables:** "Order Status Distribution" (pie by status), "Payment Status" (bar: Orders count and Revenue per payment status), "Daily Sales Trend" (line: orders and revenue per day, paid orders), "Top Selling Products" (Rank, Product, Quantity Sold, Revenue – top 10).
- **PDF:** title "Order Sales Report", subtitle "Detailed order and revenue analysis". Summary: Total Orders, Total Revenue, Average Order Value, Paid Orders, Pending Orders. Table "Order Details": Order ID (first 10 chars), Customer (e-mail), Amount, Status, Payment, Date (first 50). File `order_report_YYYYMMDD.pdf`. Button "Export Orders".

### 7.3 Vendor Performance Report
- **Route:** `/admin/dashboard/reports/vendors` — **APIs:** `GET /api/reports/vendors/performance/`, `GET /api/reports/orders/by-vendor/`, `GET /api/reports/vendors/export/pdf/` — **Functions:** `vendor_performance_report`, `sales_by_vendor_report`, `export_vendor_report_pdf` — **Log:** not logged
- **Filters:** Time Period / From–To (on order date).
- **On-screen summary values:** Total Vendors (approved), Total Products, Total Sales, Total Commission.
- **Charts/tables:** "Top Vendors by Sales" (bar: Sales and Commission, top 10); "Sales by Vendor" (Vendor, Email, Orders, Items Sold, Total Sales, Commission Rate, Vendor Commission, Admin Revenue – paid orders, includes "LaptopWorld (in-house)" row with 0 % commission); "Vendor Performance" (Vendor + e-mail, Total Products, Active Products, Total Orders, Pending Orders, Total Sales, Joined Date).
- **Calculation:** vendor commission = total sales × commission rate / 100 (rate default 10 %); admin revenue = total sales − vendor commission.
- **PDF:** title "Vendor Performance Report", subtitle "Vendor sales and commission analysis". Summary: Total Vendors, Total Products, Active Vendors. Table: Vendor, Email, Products, Orders, Sales, Commission (first 40). File `vendor_report_YYYYMMDD.pdf`. Button "Export Vendors".

### 7.4 Individual Vendor Report
- **Route:** `/admin/dashboard/reports/vendor/<vendorId>` (no link in the UI – type the URL with the vendor's user id) — **APIs:** `GET /api/reports/vendors/<vendor_id>/`, `GET /api/reports/vendors/<vendor_id>/export/pdf/` — **Functions:** `individual_vendor_report`, `export_individual_vendor_pdf` — **Log type:** `vendor`
- **Filters:** Time Period / From–To (order date).
- **On-screen:** header with business name; "Vendor Information" (Email, Phone, Joined Date, Commission Rate); cards Total Products, Total Orders, Total Sales (paid), Vendor Commission; "Product Categories" (pie); "Order Status Distribution" (bar by vendor item status); "Top Selling Products" (Rank, Product, SKU, Qty Sold, Revenue – top 10); "Recent Orders" (Order ID, Product, Quantity, Price, Total, Status, Date – last 20 items). API also returns active/low-stock product counts, items sold and admin share.
- **PDF:** title "Vendor Report: <business name or e-mail>", subtitle "Detailed performance and sales analysis". "Vendor Information" table (Business Name, Email, Phone, Commission Rate, Joined Date, Status). Summary: Total Products, Active Products, Total Orders, Total Sales, Vendor Commission, Admin Share. "Top Selling Products" table: Product Name, SKU, Qty Sold, Revenue. File `vendor_<id>_report_YYYYMMDD.pdf`. Button "Export Report".

### 7.5 User Report
- **Route:** `/admin/dashboard/reports/users` — **APIs:** `GET /api/reports/users/summary/`, `GET /api/reports/users/export/pdf/` — **Functions:** `user_report_summary`, `export_user_report_pdf` — **Log type:** `user`
- **Filters:** Time Period / From–To (user `created_at`). API also accepts `user_type` and `is_active` (no UI control).
- **On-screen summary values:** Total Users, Active Users, Total Customers, Customers with Orders.
- **Charts/tables:** "User Type Distribution" (pie: Customers, Vendors, Admins), "User Status" (bar: Active, Inactive), "Top Customers by Spending" (Rank, Customer, Email, Orders, Total Spent – top 10, paid orders).
- **PDF:** title "User Report", subtitle "User registration and activity analysis". Summary: Total Users, Active Users, Customers, Vendors, Admins. Table "User Details": Name, Email, Type, Status, Joined Date (first 50). File `user_report_YYYYMMDD.pdf`. Button "Export Users".

### 7.6 Sales & Revenue Report
- **Route:** `/admin/dashboard/reports/sales` — **APIs:** `GET /api/reports/sales/summary/`, `GET /api/reports/sales/export/pdf/` — **Functions:** `sales_report_summary`, `export_sales_report_pdf` — **Log type:** `sales`
- **Data:** paid orders only. **Filters:** Time Period / From–To.
- **On-screen summary values:** Total Revenue, Total Orders, Average Order Value, Tax Collected, Shipping Revenue, Discounts Given, Net Revenue (= revenue − tax − shipping).
- **Charts/tables:** "Payment Methods" (pie by revenue – currently one slice because `payment_method` is never saved), "Monthly Revenue Trend" (bar, "Oct 2026" style labels), "Daily Revenue Trend" (line: orders and revenue), "Top Revenue Products" (Rank, Product, SKU, Quantity, Revenue – top 15).
- **PDF:** title "Sales & Revenue Report", subtitle "Comprehensive revenue and sales analysis". Summary: Total Revenue, Total Orders, Average Order Value, Tax Collected, Discounts Given, Shipping Collected, Net Revenue. Table "Top Revenue Products": Product, SKU, Qty, Revenue (top 20). File `sales_report_YYYYMMDD.pdf`. Button "Export Sales".

### 7.7 Customer Analysis Report
- **Route:** `/admin/dashboard/reports/customers` — **APIs:** `GET /api/reports/customers/summary/`, `GET /api/reports/customers/export/pdf/` — **Functions:** `customer_report_summary`, `export_customer_report_pdf` — **Log type:** `customer`
- **Filters:** Time Period / From–To (customer join date and order date).
- **On-screen summary values:** Total Customers, Verified Customers, Customers with Orders, Loyal Customers (API also: active customers, one-time buyers, repeat customers).
- **Charts/tables:** "Customer Segmentation" (pie: One-time Buyers = 1 order, Repeat Customers ≥ 2, Loyal Customers ≥ 5 – loyal customers are also counted as repeat), "Customer Status" (bar: Active, Total), "Top Locations" (Rank, City, State, Customers – top 10), "Top Customers by Spending" (Rank, Customer, Email, Orders, Total Spent, Avg Order – top 20, paid orders).
- **PDF:** title "Customer Analysis Report", subtitle "Customer behavior and purchase patterns". Summary: Total Customers, Active Customers, Verified Customers. Table "Top Customers by Spending": Customer, Email, Orders, Total Spent (top 20). File `customer_report_YYYYMMDD.pdf`. Button "Export Customers".

### 7.8 Category & Brand Performance Report
- **Route:** `/admin/dashboard/reports/category-brand` — **APIs:** `GET /api/reports/analytics/category-brand/`, `GET /api/reports/analytics/category-brand/export/pdf/` — **Functions:** `get_category_brand_data`, `category_brand_report`, `export_category_brand_pdf` — **Log type:** `analytics`
- **Data:** all categories and brands; sales figures from paid orders in the selected period. **Filters:** Time Period / From–To.
- **Charts/tables:** "Top Categories by Revenue" (bar: Revenue and Units Sold, top 10), "Category Performance Details" (Category, Total Products, Active, Total Stock, Units Sold, Revenue), "Top Brands by Revenue" (bar), "Brand Performance Details" (Rank, Brand, Total Products, Active, Units Sold, Revenue). Sorted by revenue.
- **PDF:** title "Category & Brand Performance", subtitle "Product analytics by category and brand". Tables "Category Performance" (Category, Products, Active, Units Sold, Revenue) and "Brand Performance" (Brand, Products, Active, Units Sold, Revenue). No summary table. File `category_brand_report_YYYYMMDD.pdf`. Button "Export Report".

### 7.9 Report Activity Log (on-screen)
- **Route:** `/admin/dashboard/reports` ("Recent Report Activity") — **API:** `GET /api/reports/logs/` (`ReportLogListView`, last 50) — **Library:** React only.
- **Columns:** report type ("product Report", etc.) with icon, period label chip (e.g. "This Month"), "Generated by <admin name>", date and time. Shows last 10.
- **Steps:** open any report summary page (creates a log), then open the overview page.

### 7.10 Customer Order PDF (browser-generated)
- **Where:** "Download" on `/orders` and "Download PDF" on `/orders/:order_id` — **File:** `frontend/src/utils/pdfGenerator.ts` (`generateOrderPDF`) — **Libraries:** jsPDF 2.5.2 + html2canvas 1.4.1 (HTML rendered to an image, placed on A4 pages).
- **Content:** "LaptopWorld – Premium Laptops & Accessories"; Order Details (Order ID, Date, Status, Payment Status); Shipping Address (name, address, city, state, PIN, phone); Order Items table (Product, Price, Quantity, Total); Subtotal, Tax (18%), Shipping, Discount (if > 0), Final Total; "Thank you for shopping with LaptopWorld!", "support@laptopworld.com". File `order-<order_id>.pdf`.
- **Steps:** log in as customer → `/orders` → click "Download" (or open an order and click "Download PDF").

### 7.11 Invoice PDF (server-generated, e-mailed)
- **Where:** automatically after `POST /api/orders/orders/create/` ("Order Confirmed - Invoice #<order_id>") and after `POST /api/payments/confirm-payment/` ("Payment Confirmed - Invoice #<order_id>") — **File:** `server/orders/utils.py` (`generate_invoice_pdf`, `send_invoice_email`) — **Library:** ReportLab 4.0.7.
- **Content:** "INVOICE"; Invoice Number `INV-<order_id>`, Order Date, Payment Status, Order Status; "Bill To" (name, address, city, state – PIN, phone); table Product, Quantity, Unit Price, Total; Subtotal, Tax (18%), Shipping, Total. Attachment name `Invoice-<order_id>.pdf`. (The invoice uses the "₹" symbol, which the standard ReportLab Helvetica font may not display – the report PDFs use "Rs" instead.)
- **Steps:** place an order; with the current console e-mail backend the e-mail (with the attached PDF encoded) is printed in the Django server terminal. To receive it in an inbox, switch `EMAIL_BACKEND` to SMTP and set `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` (Section 9.3).

### 7.12 Dashboards (on-screen summaries, not exportable)
- **Admin Dashboard** (`/admin/dashboard`, `GET /api/admin/dashboard/`): total products, customers, orders, revenue (paid), orders today, orders in last 30 days, low-stock products (≤ 5), pending orders, 10 recent orders (5 shown), top 5 products by quantity.
- **Vendor Dashboard** (`/vendor/dashboard`, `GET /api/vendor/dashboard/`): total/active/low-stock products, total/pending orders, total sales (paid), commission rate, vendor commission, admin revenue, recent orders, top 5 products.
- **Admin Analytics API** (`GET /api/admin/analytics/`): daily sales for the last 30 days and category-wise sales – **no screen uses it**.

---

## SECTION 8: API REFERENCE

Base URL: `http://localhost:8000`. "Auth" = JWT access token in header `Authorization: Bearer <token>`. DRF default pagination: `?page=N`, 12 results per page, response `{count, next, previous, results}` for list views.

**Important:** `REST_FRAMEWORK` has no `DEFAULT_PERMISSION_CLASSES`, so any view without `permission_classes` is **open to everyone (AllowAny)**.

| # | Method | Endpoint | Purpose | Auth required | Role required | Controller function |
|---|---|---|---|---|---|---|
| 1 | GET | `/api/users/` | API root message "Users API Root" | No | — | `users.urls.users_home` |
| 2 | POST | `/api/users/register/` | Register customer, return user + JWT | No | — | `users.views.UserRegistrationView.create` |
| 3 | POST | `/api/users/login/` | Login with e-mail/password, return user + JWT | No | — | `users.views.UserLoginView.post` |
| 4 | GET | `/api/users/profile/` | Get logged-in user's profile | Yes | Any logged-in user | `users.views.UserProfileView` (retrieve) |
| 5 | PUT | `/api/users/profile/` | Replace profile fields | Yes | Any logged-in user | `UserProfileView` (update) |
| 6 | PATCH | `/api/users/profile/` | Update profile fields | Yes | Any logged-in user | `UserProfileView` (partial_update) |
| 7 | GET | `/api/products/categories/` | List active categories (paginated) | No | — | `products.views.CategoryListCreateView` (list) |
| 8 | POST | `/api/products/categories/` | Create category | **No (open – security issue)** | none | `CategoryListCreateView` (create) |
| 9 | GET | `/api/products/brands/` | List active brands (paginated) | No | — | `products.views.BrandListCreateView` (list) |
| 10 | POST | `/api/products/brands/` | Create brand | **No (open – security issue)** | none | `BrandListCreateView` (create) |
| 11 | GET | `/api/products/` | List active products; `search`, `category`, `brand`, `min_price`, `max_price`, `product_type`, `is_featured`, `ordering` (`price`, `created_at`, `name`), `page` | No | — | `products.views.ProductListView` (`get_queryset`) |
| 12 | GET | `/api/products/<int:pk>/` | Product detail with category, brand, images, specifications | No | — | `products.views.ProductDetailView` |
| 13 | POST | `/api/products/create/` | Create product | **No (open – security issue)** | none | `products.views.ProductCreateView` |
| 14 | GET | `/api/products/<int:pk>/update/` | Get product (incl. inactive) | No | none | `products.views.ProductUpdateView` (retrieve) |
| 15 | PUT | `/api/products/<int:pk>/update/` | Replace product | **No (open – security issue)** | none | `ProductUpdateView` (update) |
| 16 | PATCH | `/api/products/<int:pk>/update/` | Update product | **No (open – security issue)** | none | `ProductUpdateView` (partial_update) |
| 17 | DELETE | `/api/products/<int:pk>/update/` | Delete product | **No (open – security issue)** | none | `ProductUpdateView` (destroy) |
| 18 | GET | `/api/products/featured/` | Up to 8 featured active products | No | — | `products.views.featured_products` |
| 19 | GET | `/api/orders/cart/` | Get (or create) user's cart with items and totals | Yes | Any logged-in user | `orders.views.CartView.get_object` |
| 20 | POST | `/api/orders/cart/add/` | Add product (`product_id`, `quantity`) | Yes | Any logged-in user | `orders.views.add_to_cart` |
| 21 | PUT | `/api/orders/cart/update/<int:item_id>/` | Set cart item quantity | Yes | Owner of cart | `orders.views.update_cart_item` |
| 22 | DELETE | `/api/orders/cart/remove/<int:item_id>/` | Remove cart item | Yes | Owner of cart | `orders.views.remove_from_cart` |
| 23 | GET | `/api/orders/wishlist/` | Get (or create) wishlist with items | Yes | Any logged-in user | `orders.views.WishlistView.get_object` |
| 24 | POST | `/api/orders/wishlist/add/` | Add product to wishlist (`product_id`) | Yes | Any logged-in user | `orders.views.add_to_wishlist` |
| 25 | GET | `/api/orders/orders/` | List own orders (paginated) | Yes | Any logged-in user | `orders.views.OrderListView.get_queryset` |
| 26 | POST | `/api/orders/orders/create/` | Create order from cart (shipping fields, notes) | Yes | Any logged-in user | `orders.views.create_order` |
| 27 | GET | `/api/orders/orders/<str:pk>/` | Own order detail by `order_id` (UUID with/without hyphens) | Yes | Owner | `orders.views.OrderDetailView.get_object` |
| 28 | POST | `/api/payments/create-payment-intent/` | Create Stripe PaymentIntent for own order (`order_id`) | Yes | Owner of order | `payments.views.create_payment_intent` |
| 29 | POST | `/api/payments/confirm-payment/` | Verify PaymentIntent, mark order paid, save payment (`payment_intent_id`, `order_id`) | Yes | Owner of order | `payments.views.confirm_payment` |
| 30 | POST | `/api/vendor/register/` | Register vendor (pending approval) | No | — | `vendor_panel.views.VendorRegistrationView.create` |
| 31 | GET | `/api/vendor/profile/` | Vendor profile | Yes | Approved vendor | `vendor_panel.views.VendorProfileView` (retrieve) |
| 32 | PUT | `/api/vendor/profile/` | Replace vendor profile | Yes | Approved vendor | `VendorProfileView` (update) |
| 33 | PATCH | `/api/vendor/profile/` | Update vendor profile | Yes | Approved vendor | `VendorProfileView` (partial_update) |
| 34 | GET | `/api/vendor/dashboard/` | Vendor statistics, recent orders, top products | Yes | Approved vendor | `vendor_panel.views.VendorDashboardView.get` |
| 35 | GET | `/api/vendor/products/` | Own products (paginated) | Yes | Approved vendor | `vendor_panel.views.VendorProductListView` |
| 36 | POST | `/api/vendor/products/create/` | Create own product | Yes | Approved vendor | `vendor_panel.views.VendorProductCreateView.perform_create` |
| 37 | GET | `/api/vendor/products/<int:pk>/` | Own product detail | Yes | Approved vendor | `vendor_panel.views.VendorProductDetailView` (retrieve) |
| 38 | PUT | `/api/vendor/products/<int:pk>/` | Replace own product | Yes | Approved vendor | `VendorProductDetailView` (update) |
| 39 | PATCH | `/api/vendor/products/<int:pk>/` | Update own product | Yes | Approved vendor | `VendorProductDetailView` (partial_update) |
| 40 | DELETE | `/api/vendor/products/<int:pk>/` | Delete own product | Yes | Approved vendor | `VendorProductDetailView` (destroy) |
| 41 | PATCH | `/api/vendor/products/<int:product_id>/stock/` | Quick stock update (`stock_quantity`) | Yes | Approved vendor | `vendor_panel.views.update_product_stock` |
| 42 | GET | `/api/vendor/orders/` | Orders containing vendor's items (only vendor's items listed) | Yes | Approved vendor | `vendor_panel.views.VendorOrderListView` |
| 43 | GET | `/api/vendor/orders/<str:order_id>/` | One such order | Yes | Approved vendor | `vendor_panel.views.VendorOrderDetailView` |
| 44 | PATCH | `/api/vendor/order-items/<int:item_id>/status/` | Set `vendor_status` (pending/accepted/shipped) | Yes | Approved vendor (own item) | `vendor_panel.views.update_order_item_status` |
| 45 | GET | `/api/admin/dashboard/` | Admin statistics, recent orders, top products | Yes | Admin | `admin_panel.views.AdminDashboardView.get` |
| 46 | GET | `/api/admin/products/` | All products (paginated) | Yes | Admin | `admin_panel.views.AdminProductListView` |
| 47 | GET | `/api/admin/orders/` | All orders with customer details (paginated) | Yes | Admin | `admin_panel.views.AdminOrderListView` |
| 48 | GET | `/api/admin/orders/<str:order_id>/` | One order | Yes | Admin | `admin_panel.views.AdminOrderDetailView` (retrieve) |
| 49 | PUT | `/api/admin/orders/<str:order_id>/` | Replace order fields | Yes | Admin | `AdminOrderDetailView` (update) |
| 50 | PATCH | `/api/admin/orders/<str:order_id>/` | Update order (e.g. `status`) | Yes | Admin | `AdminOrderDetailView` (partial_update) |
| 51 | GET | `/api/admin/users/` | All customers (paginated) | Yes | Admin | `admin_panel.views.AdminUserListView` |
| 52 | GET | `/api/admin/analytics/` | Daily sales (30 days) and category sales | Yes | Admin | `admin_panel.views.AdminAnalyticsView.get` |
| 53 | GET | `/api/admin/vendors/` | All vendors (paginated) | Yes | Admin | `admin_panel.views.AdminVendorListView` |
| 54 | GET | `/api/admin/vendors/<int:pk>/` | Vendor detail | Yes | Admin | `admin_panel.views.AdminVendorDetailView` (retrieve) |
| 55 | PUT | `/api/admin/vendors/<int:pk>/` | Replace vendor fields | Yes | Admin | `AdminVendorDetailView` (update) |
| 56 | PATCH | `/api/admin/vendors/<int:pk>/` | Update vendor (commission rate, approval, active, etc.) | Yes | Admin | `AdminVendorDetailView` (partial_update) |
| 57 | POST | `/api/admin/vendors/<int:vendor_id>/approve/` | Approve vendor | Yes | Admin | `admin_panel.views.approve_vendor` |
| 58 | POST | `/api/admin/vendors/<int:vendor_id>/reject/` | Reject / suspend vendor | Yes | Admin | `admin_panel.views.reject_vendor` |
| 59 | GET | `/api/admin/vendors/pending/` | Vendors waiting for approval (count + list) | Yes | Admin | `admin_panel.views.pending_vendors` |
| 60 | GET | `/api/reports/products/summary/` | Product report summary | Yes | Admin | `reports.views.product_report_summary` |
| 61 | GET | `/api/reports/products/stock/` | Product stock details | Yes | Admin | `reports.views.product_stock_report` |
| 62 | GET | `/api/reports/products/export/pdf/` | Product report PDF | Yes | Admin | `reports.views.export_product_report_pdf` |
| 63 | GET | `/api/reports/orders/summary/` | Order report summary | Yes | Admin | `reports.views.order_report_summary` |
| 64 | GET | `/api/reports/orders/by-vendor/` | Sales by vendor with commission | Yes | Admin | `reports.views.sales_by_vendor_report` |
| 65 | GET | `/api/reports/orders/export/pdf/` | Order report PDF | Yes | Admin | `reports.views.export_order_report_pdf` |
| 66 | GET | `/api/reports/vendors/performance/` | Vendor performance list | Yes | Admin | `reports.views.vendor_performance_report` |
| 67 | GET | `/api/reports/vendors/export/pdf/` | Vendor report PDF | Yes | Admin | `reports.views.export_vendor_report_pdf` |
| 68 | GET | `/api/reports/vendors/<int:vendor_id>/` | Individual vendor report | Yes | Admin | `reports.views.individual_vendor_report` |
| 69 | GET | `/api/reports/vendors/<int:vendor_id>/export/pdf/` | Individual vendor PDF | Yes | Admin | `reports.views.export_individual_vendor_pdf` |
| 70 | GET | `/api/reports/users/summary/` | User report summary | Yes | Admin | `reports.views.user_report_summary` |
| 71 | GET | `/api/reports/users/export/pdf/` | User report PDF | Yes | Admin | `reports.views.export_user_report_pdf` |
| 72 | GET | `/api/reports/sales/summary/` | Sales & revenue summary | Yes | Admin | `reports.views.sales_report_summary` |
| 73 | GET | `/api/reports/sales/export/pdf/` | Sales report PDF | Yes | Admin | `reports.views.export_sales_report_pdf` |
| 74 | GET | `/api/reports/customers/summary/` | Customer report summary | Yes | Admin | `reports.views.customer_report_summary` |
| 75 | GET | `/api/reports/customers/export/pdf/` | Customer report PDF | Yes | Admin | `reports.views.export_customer_report_pdf` |
| 76 | GET | `/api/reports/analytics/category-brand/` | Category & brand performance | Yes | Admin | `reports.views.category_brand_report` |
| 77 | GET | `/api/reports/analytics/category-brand/export/pdf/` | Category & brand PDF | Yes | Admin | `reports.views.export_category_brand_pdf` |
| 78 | GET | `/api/reports/logs/` | Last 50 report log entries | Yes | Admin | `reports.views.ReportLogListView` |
| 79 | GET/POST | `/admin/…` | Django Admin site (session login) | Yes (session) | Staff user | `django.contrib.admin.site.urls` |
| 80 | GET | `/media/<path>` | Serve uploaded images (only when `DEBUG` is True) | No | — | `django.conf.urls.static.static` |

**Common query parameters for report endpoints 60–77:** `period` (`today`, `yesterday`, `this_week`, `last_week`, `this_month`, `last_month`, `this_year`, `last_year`, `last_7_days`, `last_30_days`, `last_90_days`), `date_from`, `date_to` (YYYY-MM-DD); products: `category`, `brand`, `vendor`, `is_low_stock=true`; orders: `status`, `payment_status`; users: `user_type`, `is_active`.

**Frontend calls with no matching backend route:** `POST /api/payments/razorpay/create/` and `POST /api/payments/razorpay/verify/` (defined in `frontend/src/store/api/paymentsApi.ts`, never used by a page) – would return 404.

**Totals:** 62 URL patterns under `/api/` (users 4, products 7, orders 9, payments 2, vendor 10, admin 11, reports 19) = **78 method + endpoint combinations**, plus the Django Admin site and media serving. Note: `vendor_panel.urls` is included twice in `server/config/urls.py` (lines 13 and 15) – the second include is a duplicate.

---

## SECTION 9: IMPLEMENTATION

### 9.1 Project Folder Structure (max 3 levels; `node_modules`, `dist`, `venv` contents, `__pycache__` and media files skipped)

```
College-Project/
├── PROJECT_REPORT_DATA.md
├── frontend/                         React + TypeScript + Vite single-page app
│   ├── index.html                    page shell, title "Laptop World"
│   ├── package.json / package-lock.json
│   ├── vite.config.ts                React plugin, "@" alias → src
│   ├── tailwind.config.js / postcss.config.js / eslint.config.js
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── .env                          (not committed) VITE_API_BASE_URL, VITE_STRIPE_PUBLISHABLE_KEY
│   ├── public/                       laptopWorld_Logo.png, vite.svg
│   └── src/
│       ├── main.tsx                  Redux Provider, BrowserRouter, HelmetProvider
│       ├── App.tsx                   all routes + AdminRoute / VendorRoute / CustomerRoute guards
│       ├── index.css, App.css
│       ├── components/               Auth/ (Login, Register, VendorRegister, ProtectedRoute)
│       │                             Layout/ (Layout, Header, AdminHeader, VendorHeader, Footer)
│       │                             common/ (Button, Input, Badge, ProductCard, Pagination, SEO, …)
│       │                             reports/ (ReportFilters, ReportCard, ExportButton)
│       │                             storefront/ (StorefrontShell, theme, SfButton, GlassPanel, … – new, untracked, redesign in progress)
│       ├── config/                   apiConfig.ts (reads VITE_API_BASE_URL)
│       ├── hooks/                    useAuth, useCart, useTypedSelector, useDebounce, …
│       ├── pages/                    Home, Products, ProductDetail, Cart, Checkout, StripePaymentForm,
│       │                             Orders, OrderDetail, Profile, Wishlist, PaymentSuccess, PaymentFailure
│       │                             admin/ (VendorDetail = admin dashboard, VendorManagement,
│       │                                     AdminProducts, AdminUsers, AdminOrders, reports/ – 9 pages)
│       │                             vendor/ (VendorDashboard, VendorProducts, VendorOrders)
│       │                             info/ (12 static pages)
│       ├── store/                    store.ts; api/ (authApi, productsApi, ordersApi, paymentsApi,
│       │                             adminApi, vendorApi, reportsApi, baseApi); slices/ (auth, cart, ui)
│       ├── types/                    index.ts, api.ts, form.ts
│       └── utils/                    formatters, validators, constants, pdfGenerator, errorHandler, …
└── server/                           Django 5.2 + Django REST Framework API
    ├── manage.py
    ├── requirements.txt              (UTF-16 encoded)
    ├── Procfile, render.yaml         deployment
    ├── create_admin.py               creates first admin from environment variables
    ├── seed_data.py                  sample brands, categories, products, specifications
    ├── db.sqlite3                    old SQLite file (not used by settings)
    ├── .env                          (not committed) secrets
    ├── config/                       settings.py, urls.py, wsgi.py
    ├── users/                        custom User model, register/login/profile API, admin
    ├── products/                     Category, Brand, Product, ProductImage, ProductSpecification;
    │                                 management/commands/populate_sample_data.py
    ├── orders/                       Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, Payment;
    │                                 utils.py (invoice PDF + e-mail)
    ├── payments/                     Stripe PaymentIntent create/confirm
    ├── vendor_panel/                 vendor registration, dashboard, products, orders
    ├── admin_panel/                  admin dashboard, vendor approval, lists, analytics
    ├── reports/                      ReportLog model, 8 reports + PDF export
    ├── templates/emails/             order_confirmation.html, payment_confirmation.htm, invoice_text.txt
    ├── assets/                       laptopWorld_Logo.png, Shop_Signature.png (used in PDFs)
    ├── media/                        uploaded images: brands/, categories/, products/
    └── venv/                         Python virtual environment (committed by mistake)
```

### 9.2 Installation Steps (from scratch)

**Prerequisites**
- Git
- Python **3.10** (the project's virtual environment uses 3.10.11)
- Node.js **18 or newer** with npm (required by Vite 5)
- A PostgreSQL database (local PostgreSQL or a free cloud database such as Neon) and its connection URL
- A Stripe account – test-mode keys (`sk_test_…`, `pk_test_…`)
- (Optional) A Gmail account with an App Password if real e-mails are needed

**Step 1 – Get the code**
```bash
git clone <repository-url>
cd College-Project
```

**Step 2 – Backend setup**
```bash
cd server
python -m venv venv            # create a fresh virtual environment (the committed one is Windows-specific)
venv\Scripts\activate          # Windows   (Linux/macOS: source venv/bin/activate)
pip install -r requirements.txt
```
Create `server/.env` with the variables listed in Section 9.3, then:
```bash
python manage.py migrate
```

**Step 3 – Create the first admin** – see Section 9.4.

**Step 4 – (Optional) Load sample catalogue data**
```bash
python manage.py shell < seed_data.py                    # Command Prompt / bash
Get-Content seed_data.py | python manage.py shell        # Windows PowerShell
```
(Creates 8 brands, 4 categories, 8 products and specifications. Upload real product images afterwards in Django Admin.)

**Step 5 – Run the backend**
```bash
python manage.py runserver
```
- API: `http://localhost:8000/api/` — Django Admin: `http://localhost:8000/admin/` — default port **8000**.

**Step 6 – Frontend setup** (new terminal)
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
VITE_STRIPE_PUBLISHABLE_KEY=<your Stripe publishable test key>
```
(The URL must end with `/api/` including the last slash, because the code appends `users/`, `products/`, etc.)

**Step 7 – Run the frontend**
```bash
npm run dev
```
- Open `http://localhost:5173` — default Vite port **5173** (the backend CORS list also mentions port 3000).

**Other npm scripts:** `npm run build` (TypeScript build + Vite production build into `frontend/dist`), `npm run preview` (serve the build), `npm run lint` (ESLint).

### 9.3 Environment Variables (names only)

`.env.example` file: **NOT FOUND IN CODE** (create the files manually).

**Backend – `server/.env`**
| Group | Variable | Read in | Purpose | Required? |
|---|---|---|---|---|
| Django core | `SECRET_KEY` | `config/settings.py` line 11 | Django cryptographic secret | Required |
| Django core | `DEBUG` | `config/settings.py` line 15 | "True"/"False" | Optional (currently overridden to True at line 110) |
| Database | `DATABASE_URL` | `config/settings.py` line 20 | PostgreSQL URL, e.g. `postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require` | Required |
| Deployment | `RENDER` | `config/settings.py` lines 27, 160 | Set to `true` on Render to require SSL for the DB | Optional |
| E-mail | `EMAIL_HOST_USER` | `config/settings.py` line 141 | Sender Gmail address | Optional (a default address is hard-coded) |
| E-mail | `EMAIL_HOST_PASSWORD` | `config/settings.py` line 142 | Gmail App Password | Optional (needed only when the SMTP backend is enabled) |
| Payments | `STRIPE_SECRET_KEY` | `config/settings.py` line 156 → `payments/views.py` line 12 | Stripe secret key | Required for card payments |
| Payments | `STRIPE_PUBLISHABLE_KEY` | `config/settings.py` line 155 | Read but not used by any backend code | Optional |
| First admin | `DJANGO_SUPERUSER_EMAIL` | `create_admin.py` line 16 | Admin e-mail | Optional (default `admin@example.com`) |
| First admin | `DJANGO_SUPERUSER_PASSWORD` | `create_admin.py` line 17 | Admin password | Required when running `create_admin.py` |
| First admin | `DJANGO_SUPERUSER_USERNAME` | `create_admin.py` line 18 | Admin username | Optional (default `admin`) |
| Not used | `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | present in `server/.env` only | not read anywhere in code | Not needed |

**Frontend – `frontend/.env`**
| Variable | Read in | Purpose | Required? |
|---|---|---|---|
| `VITE_API_BASE_URL` | `src/config/apiConfig.ts` (used by all RTK Query APIs and `VendorRegister.tsx`) | Backend API base URL ending in `/api/` | Required |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `src/pages/Checkout.tsx` line 20 | Stripe publishable key for Stripe.js | Required for card payment |
| `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID` | declared in `src/env.d.ts` | not used by active code | Not needed |

### 9.4 How to Create the First Admin User

The React admin panel and all admin APIs check **`user_type == 'admin'`** (not only `is_superuser`), so the admin account must have this user type.

**Method A – recommended (`create_admin.py`, also used by `render.yaml`)**
1. Add `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_USERNAME` and `DJANGO_SUPERUSER_PASSWORD` to `server/.env`.
2. From the `server` folder run `python manage.py shell < create_admin.py` (PowerShell: `Get-Content create_admin.py | python manage.py shell`) – or simply `python create_admin.py`.
3. The script creates a superuser with `user_type='admin'` (the custom `save()` also sets `is_staff` and `is_superuser`). If a user with that username or e-mail already exists it does nothing.
4. Log in at `http://localhost:5173/login` → you are sent to `/admin/dashboard`. The same account works at `http://localhost:8000/admin/`.

**Method B – Django command**
1. `python manage.py createsuperuser` (asks for e-mail, username, password).
2. This user gets `user_type='customer'` by default, so log in to `http://localhost:8000/admin/`, open **Users → your user**, set **User type = Admin** in "Additional Info" and save.

**Present in code but should be removed before submission:**
- `server/users/admin.py` (lines 19–42) automatically creates a default admin with a **hard-coded e-mail and password** every time Django loads the admin module.
- `server/products/management/commands/populate_sample_data.py` (lines 13–21) creates another admin with a hard-coded password.

### 9.5 Deployment Setup Found in Code

| Item | Detail |
|---|---|
| Backend host | **Render** – `server/render.yaml`: `type: web`, `name: college-django-app`, `runtime: python`; `buildCommand: pip install -r server/requirements.txt && python server/manage.py collectstatic --noinput`; `startCommand: python manage.py migrate && python manage.py shell < create_admin.py && gunicorn server.config.wsgi`; env vars `DEBUG="False"`, `SECRET_KEY` (generated by Render). Other variables (`DATABASE_URL`, `STRIPE_SECRET_KEY`, `DJANGO_SUPERUSER_*`, `RENDER=true`) must be added in the Render dashboard. |
| Process file | `server/Procfile`: `web: gunicorn server.config.wsgi` (Heroku-style) |
| Application server | Gunicorn 23.0.0 (WSGI app `config/wsgi.py`) |
| Static files | WhiteNoise middleware + `CompressedManifestStaticFilesStorage`, `STATIC_ROOT = server/staticfiles` |
| Database | Neon cloud PostgreSQL via `DATABASE_URL`; SSL required when `RENDER=true` |
| Allowed hosts | `ALLOWED_HOSTS = ["*", "your-app-name.onrender.com"]` (placeholder host) |
| Media files in production | Served by Django only when `DEBUG` is True; cloud storage (S3/Cloudinary): NOT FOUND IN CODE |
| Frontend hosting | NOT FOUND IN CODE (no `vercel.json` / `netlify.toml`). `npm run build` produces a static `dist/` folder that can be hosted on any static host after setting `VITE_API_BASE_URL` to the deployed API. |
| Docker / docker-compose | NOT FOUND IN CODE |
| CI/CD pipeline | NOT FOUND IN CODE |
| Note | The paths in `render.yaml` and `Procfile` are inconsistent (see Section 11.3, item 22). |

### 9.6 User Guidelines (step by step)

**A. Customer**
1. Open `http://localhost:5173`. Browse the home page or click **Products**.
2. Use the search box, the filter panel (price, category, brand) and **Sort** to find a laptop. Click a product to see details.
3. Click **Sign up** / go to `/register`, fill the form and tick the terms box → **Create account** (you are logged in automatically). Existing users use **Login**.
4. On a product page choose the quantity and click **Add to Cart**; click **Wishlist** to save it for later.
5. Open the cart icon (`/cart`), change quantities with − / +, remove items if needed, then click **Proceed to Checkout**.
6. Fill the shipping details, choose **Credit/Debit Card (Stripe)** or **Cash on Delivery**, and click **Continue to Payment** / **Place Order**.
7. For card payment enter the card details in the Stripe form and click **Pay Now**. On success you see **Payment Successful!** with the Order ID.
8. Open **Orders** from the user menu to see all orders, their status and payment status; click **View Details** or **Download** to get the order PDF.
9. Open **Profile** to update your name, phone and address; click **Save Changes**.
10. Use **Logout** from the user menu when finished.

**B. Vendor**
1. Open `http://localhost:5173/vendor-register`, fill account, personal and business details (business name, GST number) and click **Register as Vendor**.
2. Wait until the admin approves the account (until then the vendor pages cannot load data).
3. Log in at `/login` → you are taken to the **Vendor Dashboard** (products, orders, commission, top products).
4. Ask the admin to add your products (products are created in Django Admin with you selected as **Vendor**).
5. Open **My Products** to see your products; change a stock number and click **Save** to update stock.
6. Open **Orders**, click **View** on an order to see your items and the customer's shipping address; click **Accept**, and after dispatch click **Mark Shipped**.
7. Log out from the user menu.

**C. Admin**
1. Create the admin account (Section 9.4) and log in at `/login` → **Admin Dashboard**.
2. Add catalogue data in Django Admin (`http://localhost:8000/admin/`): Categories → Brands → Products (fill details, upload images with one marked **Is primary**, add specifications, tick **Is featured** for home-page products, choose a **Vendor** for vendor products).
3. Open **Vendors** to approve new vendors (**Approve**) or suspend existing ones (**Suspend**).
4. Use **Products**, **Users** and **Orders** to monitor the shop; use the search boxes and filters.
5. Click **Reports** on the dashboard (`/admin/dashboard/reports`), choose a report, select a time period or date range and filters, study the charts and tables, and click the **Export** button to open/print the PDF.
6. Check **Recent Report Activity** on the Reports page to see which reports were generated.
7. Log out from the user menu.

---

## SECTION 10: SOURCE CODE FOR ANNEXURE

The five functions below show the core logic. Code is copied exactly from the repository. (Functions with hard-coded credentials, such as `create_default_admin` in `users/admin.py`, were deliberately not chosen.)

### 10.1 User Login and JWT Token Generation
**Files:** `server/users/serializers.py` (lines 26–43) and `server/users/views.py` (lines 30–46)

```python
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('Account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email and password required')
        return attrs
```

```python
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
```

### 10.2 Authentication Configuration and Role-Based Permission Classes
**Files:** `server/config/settings.py` (lines 82–101), `server/admin_panel/views.py` (lines 35–37), `server/vendor_panel/views.py` (lines 21–26)

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12
}


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

```python
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'
```

```python
class IsVendorUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user and
                request.user.is_authenticated and
                request.user.user_type == 'vendor' and
                request.user.is_vendor_approved)
```

### 10.3 Add Product to Cart
**File:** `server/orders/views.py` (lines 29–51)

```python
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))

    try:
        product = Product.objects.get(id=product_id, is_active=True)
        cart, created = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({'message': 'Product added to cart'}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 10.4 Create Order from Cart (transaction, totals, stock update, invoice)
**File:** `server/orders/views.py` (lines 136–208)

```python
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_order(request):
    serializer = OrderCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            cart = Cart.objects.get(user=request.user)
            cart_items = cart.items.all()

            if not cart_items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            total_amount = sum(item.total_price for item in cart_items)
            tax_amount = total_amount * Decimal('0.18')
            shipping_charges = 50 if total_amount < 500 else 0
            final_amount = total_amount + tax_amount + shipping_charges

            order_uuid = str(uuid.uuid4())
            order = Order.objects.create(
                order_id=order_uuid,
                user=request.user,
                total_amount=total_amount,
                tax_amount=tax_amount,
                shipping_charges=shipping_charges,
                final_amount=final_amount,
                **serializer.validated_data
            )

            # 🆕 UPDATED: Assign vendor to order items
            for cart_item in cart_items:
                primary_img = cart_item.product.images.filter(is_primary=True).first()
                if not primary_img:
                    primary_img = cart_item.product.images.first()

                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    product_price=cart_item.product.discounted_price,
                    product_image=request.build_absolute_uri(primary_img.image.url) if primary_img else None,
                    quantity=cart_item.quantity,
                    total_price=cart_item.total_price,
                    vendor=cart_item.product.vendor  # 🆕 ADD THIS LINE
                )

                product = cart_item.product
                product.stock_quantity -= cart_item.quantity
                product.save()

            cart_items.delete()

            invoice_sent = False
            try:
                send_invoice_email(order, "order_confirmation")
                invoice_sent = True
            except Exception as e:
                print(f"[Invoice Email Error] {str(e)}")

            return Response({
                'message': 'Order created successfully',
                'order_id': order.order_id,
                'final_amount': final_amount,
                'invoice_sent': invoice_sent
            }, status=status.HTTP_201_CREATED)

    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```
*(Before printing, you may remove the two "🆕" comments and replace `print` with `logger.error`.)*

### 10.5 Stripe Payment – Create PaymentIntent and Verify Payment
**File:** `server/payments/views.py` (lines 15–97)

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Create a Stripe Payment Intent for a given order.
    """
    try:
        order_id = request.data.get('order_id')
        order = Order.objects.get(order_id=order_id, user=request.user)

        # Convert to Decimal for precise calculation
        amount_in_rupees = Decimal(str(order.final_amount))

        # Convert INR to paise (multiply by 100)
        amount_in_paise = int(amount_in_rupees * 100)

        # Stripe limit check (99,99,999 paise = 9,99,999.99 rupees)
        max_amount_paise = 99999999  # ₹9,99,999.99

        if amount_in_paise > max_amount_paise:
            return Response({
                'error': f'Amount exceeds Stripe limit. Maximum allowed: ₹9,99,999.99'
            }, status=status.HTTP_400_BAD_REQUEST)

        if amount_in_paise < 50:  # Minimum 50 paise
            return Response({
                'error': 'Amount too small. Minimum amount is ₹0.50'
            }, status=status.HTTP_400_BAD_REQUEST)

        intent = stripe.PaymentIntent.create(
            amount=amount_in_paise,  # Amount in paise
            currency='inr',
            metadata={'order_id': str(order.order_id)}
        )

        return Response({
            'client_secret': intent.client_secret,
            'amount': float(order.final_amount)
        }, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """
    Confirm a Stripe payment after success on frontend.
    """
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        order_id = request.data.get('order_id')

        intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if intent.status == 'succeeded':
            order = Order.objects.get(order_id=order_id, user=request.user)
            order.payment_status = 'paid'
            order.payment_transaction_id = payment_intent_id
            order.status = 'confirmed'
            order.save()

            # Record payment in DB
            Payment.objects.create(
                order=order,
                amount=order.final_amount,
                payment_method='stripe',
                transaction_id=payment_intent_id,
                status='success'
            )

            # Optional email confirmation
            send_invoice_email(order, "payment_confirmation")

            return Response({'message': 'Payment confirmed successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Payment not completed'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```
*(`confirm_payment` should also check that the PaymentIntent's `metadata['order_id']` and `amount` match the order – see Section 11.3, item 4. Apply that fix before printing this annexure.)*

---

## SECTION 11: CONCLUSION, LIMITATIONS, FUTURE SCOPE

### 11.1 Conclusion

- LaptopWorld successfully provides a complete online shopping flow for laptops and accessories – catalogue with search, filters and sorting, cart, wishlist, checkout and order history – using a React + TypeScript frontend and a Django REST Framework backend on PostgreSQL.
- Secure JWT-based login with three roles (customer, vendor, admin) and role-based route guards and API permissions keeps each user to their own data and functions.
- Order creation is reliable: totals (18 % tax, shipping) are calculated on the server and the order, its items, the stock reduction and the cart clearing are saved in a single database transaction.
- Online card payment is integrated with Stripe PaymentIntents in Indian Rupees, and every successful payment is verified with Stripe and recorded; invoices are generated as PDF automatically.
- The multi-vendor features (vendor registration with approval, vendor dashboard, stock update, item-level order processing and automatic commission calculation) turn a single shop into a marketplace.
- Eight analytical reports with charts, IST-based period filters and branded PDF export, plus admin and vendor dashboards, give the business owner accurate, real-time information that is not possible with manual registers.

### 11.2 Limitations (honest)

- **No automated tests:** no unit, integration or end-to-end tests exist in the backend or frontend (NOT FOUND IN CODE).
- **Missing features:** product reviews/ratings (rating shown on the product page is fixed text), forgot/reset password, e-mail verification/OTP, social login (buttons do nothing), order cancellation, returns/refunds, coupon codes, shipment tracking, newsletter, notifications, product comparison, related products (section is empty).
- **Incomplete integrations:** Razorpay/PayPal only exist as enum values and unused frontend endpoints; Cash on Delivery has no backend handling (payment method is not saved and COD orders stay "pending"); the ₹50 COD charge is shown but never charged; Stripe webhooks and refunds are not implemented; e-mail uses the console backend, so customers do not actually receive e-mails.
- **No product management UI:** vendors cannot add or edit products from the React app (buttons are commented out) and cannot use Django Admin (vendors are not staff), so the admin must create vendor products in Django Admin.
- **No order-status management UI:** the admin cannot change order status from the React app (the API exists but is unused); customers therefore only see `pending` or `confirmed`.
- **Price mismatch:** the cart/checkout pages show shipping ₹100 below ₹10,000, while the server charges ₹50 below ₹500, so the displayed total can differ from the charged total.
- **Stock handling:** no check that enough stock exists when adding to cart or placing an order; stock is reduced even if a card payment is never completed, and is never restored.
- **No way to retry payment** for an unpaid order from the Orders page; `/payment/failure` is never shown automatically.
- **Validation gaps:** server does not enforce password strength (no `AUTH_PASSWORD_VALIDATORS`), GST number and phone formats are not validated on the server, quantities are not validated, and server error messages are not displayed on the login/registration pages.
- **Pagination gaps:** admin lists (products, users, orders, vendors) show only the first 12 records with no page controls, and the counts on those pages are calculated from that first page only.
- **Navigation gaps:** `/vendor-register` and the Individual Vendor Report are not linked anywhere; the "View" button on Vendor Management goes to a route that does not exist; the "Accessories" category link on the home page (`?product_type=accessory`) is ignored by the product page.
- **Unused code:** `baseApi.ts`, `utils/api.ts` (axios), several hooks/components (Modal, QuantitySelector, ProductGrid, Toast, NotificationBell, useDebounce, etc.), packages `react-query`, `date-fns`, `razorpay`, and new 3D packages (`three`, `@react-three/*`) are installed but not used.
- **Report performance:** some reports run one database query per vendor/category/brand, which will be slow with large data.

### 11.3 Security and Code Issues to Fix Before Submission

| # | Severity | File : line | Issue | Suggested fix |
|---|---|---|---|---|
| 1 | Critical | `server/users/admin.py` : 19–42 (credentials at 21–26, printed at 28, called at 42) | A default admin account with a **hard-coded e-mail and password** is created (or re-enabled) automatically whenever Django loads the admin module, and the password is printed to the console. | Delete `create_default_admin()` and its call; use `create_admin.py` with environment variables. Change the password of any account already created this way. |
| 2 | Critical | `server/products/views.py` : 10–16 and 61–67; `server/config/settings.py` : 82–93 | `CategoryListCreateView`, `BrandListCreateView`, `ProductCreateView` and `ProductUpdateView` have no `permission_classes`, and there is no `DEFAULT_PERMISSION_CLASSES`, so **anyone without logging in** can create categories/brands and create, edit or delete any product. | Add `permission_classes = [IsAdminUser]` to the write views (or `IsAuthenticatedOrReadOnly` + admin check), and set `'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated']`. |
| 3 | High | `server/config/settings.py` : 110 | `DEBUG = True` is hard-coded and overrides the environment value read at line 15 (also makes Django serve media and show debug pages in production). | Remove line 110 and rely on the `DEBUG` environment variable. |
| 4 | High | `server/payments/views.py` : 61–97 (retrieve at 71, update at 74–78, insert at 81–87) | `confirm_payment` does not check that the PaymentIntent's `metadata['order_id']` matches `order_id` or that `intent.amount` equals the order amount, so one successful payment could be used to mark a different (more expensive) order of the same user as paid. It is not idempotent: `Payment.order` is one-to-one (`server/orders/models.py` : 140), so a second call fails with an IntegrityError after the order was already saved; there is no `transaction.atomic()`. | Compare `intent.metadata.get('order_id')` and `intent.amount` with the order; skip if the order is already paid; wrap the update and `Payment` insert in `transaction.atomic()`; ideally use a Stripe webhook. |
| 5 | Medium | `server/config/settings.py` : 80 (and 103–108) | `CORS_ALLOW_ALL_ORIGINS = True` overrides the allowed-origins list, so any website can call the API from a browser. | Remove line 80 and keep `CORS_ALLOWED_ORIGINS` (add the deployed frontend URL). |
| 6 | Medium | `server/config/settings.py` : 16 | `ALLOWED_HOSTS = ["*", "your-app-name.onrender.com"]` – wildcard plus placeholder host. | Read allowed hosts from an environment variable and list only real hosts. |
| 7 | Medium | `server/config/settings.py` (no `AUTH_PASSWORD_VALIDATORS`); `server/users/serializers.py` : 8; `server/vendor_panel/serializers.py` : 10 | `validate_password` runs with no validators configured, so the server accepts any password; vendor registration does not call it at all. | Add Django's standard `AUTH_PASSWORD_VALIDATORS` and use `validators=[validate_password]` in the vendor serializer too. |
| 8 | Medium | `server/config/settings.py` : 82–93 | No rate limiting/throttling – login and registration can be brute-forced or spammed. | Add `DEFAULT_THROTTLE_CLASSES` / `DEFAULT_THROTTLE_RATES` (e.g. `AnonRateThrottle`, `UserRateThrottle`) and a stricter scope for login. |
| 9 | Medium | `server/orders/views.py` : 152–187 (stock at 185–187), 207–208 | `create_order` does not check stock before subtracting and does not lock rows (`select_for_update`); overselling is possible, and a negative stock makes the DB raise an error that is returned as "Unexpected error: …" with raw text. Inactive products in the cart are still ordered. | Lock products with `select_for_update()`, reject items where `quantity > stock_quantity` or product inactive, and return a clean message. |
| 10 | Medium | `frontend/src/pages/Checkout.tsx` : 46, 292, 354–358, 365, 67; `frontend/src/pages/Cart.tsx` : 44; `server/orders/views.py` : 154 | Frontend shipping rule (₹100 below ₹10,000) differs from the server (₹50 below ₹500); the ₹50 COD charge is displayed but never charged; the chosen payment method is not sent, so `orders.payment_method` stays empty (the Sales report payment-method chart is meaningless). | Use one rule (preferably return totals from the server), send `payment_method` with the order and save it, and handle COD on the server. |
| 11 | Low | `server/config/settings.py` : 96–101, 32–50; `server/users/urls.py` | `BLACKLIST_AFTER_ROTATION = True` but `rest_framework_simplejwt.token_blacklist` is not installed and no token refresh/blacklist endpoint exists, so tokens cannot be refreshed or revoked (access token valid 1 day). | Add `TokenRefreshView`/`TokenBlacklistView` routes and the blacklist app, or remove the unused settings. |
| 12 | Low | `frontend/src/store/slices/authSlice.ts` : 12, 25–26 | JWT access and refresh tokens are stored in `localStorage` (readable by any injected script). | Prefer httpOnly secure cookies, or at least keep a strict CSP and short token lifetime. |
| 13 | Low | `frontend/src/pages/Checkout.tsx` : 55–61, 73–74; `frontend/src/pages/StripePaymentForm.tsx` : 28; `server/orders/views.py` : 196; `server/orders/utils.py` : 198 | Debug `console.log`/`print` statements left in code; Checkout logs the Stripe **client secret** to the browser console. | Remove the debug logs (use `logger` on the server). |
| 14 | Low | `server/payments/views.py` : 57–58, 96–97; `server/orders/views.py` : 207–208 | Raw exception text is returned to the client (`str(e)`), which can leak internal details. | Log the exception and return a generic message. |
| 15 | Low | `server/orders/views.py` : 33, 57; `server/vendor_panel/views.py` : 214 | `int(request.data.get('quantity'))` / `int(stock_quantity)` without validation: non-numeric input causes HTTP 500; zero or negative values are not rejected; no maximum or stock check. | Validate with a serializer (`IntegerField(min_value=1)`, `min_value=0` for stock). |
| 16 | Low | `server/config/settings.py` : 141 | A personal Gmail address is hard-coded as the default `EMAIL_HOST_USER`. | Remove the default value; read only from the environment. |
| 17 | Low | `server/admin_panel/views.py` : 84–88; `server/vendor_panel/serializers.py` : 58–61 | Admin order PATCH accepts every order field (amounts, user data) through `OrderSerializer` (`fields='__all__'`); vendors can set `is_featured`/`is_active` and any product field. | Use dedicated serializers with only the editable fields (e.g. `status` for admin; exclude `is_featured` for vendors). |
| 18 | Low | `server/users/serializers.py` : 30–43; `server/vendor_panel/views.py` : 21–26 | Vendors who are not yet approved can log in and are sent to the vendor dashboard, which then fails with 403 and shows empty data. | Return a clear "awaiting approval" message at login or show a pending screen. |
| 19 | Low | `server/config/settings.py` : 134; `server/orders/utils.py` : 126; `server/templates/emails/payment_confirmation.htm`; `server/templates/emails/order_confirmation.html` : 1, 47; `payment_confirmation.htm` : 1, 59; `invoice_text.txt` : 1, 30 | Console e-mail backend (no real e-mails); code asks for `emails/payment_confirmation.html` but the file is named `.htm`, so a fallback text is used; all three templates start and end with a literal `"""`, which appears in the e-mails. | Switch to the SMTP backend via environment variable, rename the file to `.html`, remove the `"""` lines. |
| 20 | Low | `frontend/src/utils/pdfGenerator.ts` : 16–80 | Order PDF HTML is built with `innerHTML` from order fields (shipping name/address), allowing HTML injection into the user's own page. | Escape values before inserting, or build the PDF with jsPDF text APIs. |
| 21 | Low (privacy / hygiene) | Git repository; `server/.gitignore` : 5, 16, 18–19 | `server/venv/` (9,592 files), `server/db.sqlite3`, `__pycache__/*.pyc` and `server/media/` (22 files, including personal-looking images such as `media/brands/girl-profile.png`, `media/brands/Cet-Scorcard.png` and WhatsApp images) are committed even though `.gitignore` lists them. | `git rm -r --cached server/venv server/db.sqlite3 server/media` (and the `.pyc` files), commit, and keep only sample images you own. |
| 22 | Low (deployment) | `server/render.yaml` : 5–6; `server/Procfile` : 1; `server/config/wsgi.py` : 4 | Build command uses repo-root paths (`server/requirements.txt`, `python server/manage.py`) while the start command uses `server`-folder paths (`python manage.py`, `create_admin.py`); `gunicorn server.config.wsgi` does not match the settings module `config.settings`. | Set `rootDir: server` (or consistent paths) and start with `gunicorn config.wsgi`. |
| 23 | Low | `server/config/urls.py` : 13, 15 | `vendor_panel.urls` is included twice. | Remove line 15. |
| 24 | Low | `server/products/serializers.py` : 29, 61, 70; `frontend/src/store/api/baseApi.ts` : 7 | Hard-coded `http://localhost:8000` fallbacks / base URL. | Use the request or an environment variable; delete unused `baseApi.ts`. |
| 25 | Low (accuracy) | `frontend/src/pages/ProductDetail.tsx` : 215–228; `frontend/src/components/Auth/Register.tsx` : 271–299; `frontend/src/components/Layout/Footer.tsx` (committed version, lines 130–136); `frontend/src/components/common/NotificationBell.tsx` : 16–33 | Fake "4.0 out of 5 stars / 117 reviews", non-functional Google/Facebook buttons, newsletter without a backend, dummy notifications. Examiners may treat these as claimed features. | Remove them or label them clearly as future features. |
| 26 | Low (UX) | `frontend/src/pages/admin/VendorManagement.tsx` : 123; `frontend/src/pages/Home.tsx` : 61; `frontend/src/components/Auth/Login.tsx` : 63; `frontend/src/components/Auth/Register.tsx` : 55–64; `frontend/src/components/Auth/VendorRegister.tsx` : 48 | Vendor "View" button links to `/admin/vendors/:id` (no such route); "Accessories" link uses an ignored parameter; server error messages are not shown on login/registration (always "Login failed" / "Registration failed"). | Link "View" to `/admin/dashboard/reports/vendor/:id`; use `?category=Accessories`; read `error.data.non_field_errors` and field errors. |
| 27 | Low | `frontend/src/pages/admin/AdminProducts.tsx` : 11; `AdminUsers.tsx` : 8; `AdminOrders.tsx` : 11; `VendorManagement.tsx` : 11; `frontend/src/pages/admin/reports/ProductReports.tsx` : 48 | Only the first page (12 records) of each admin list is loaded; counts and the vendor filter list are incomplete with more data. | Add pagination controls (use `next`/`page`) or a larger page size for admin endpoints. |
| 28 | Low | `server/orders/views.py` : 132; `server/orders/serializers.py` : 33, 52; `server/reports/views.py` : 187, 221 | Bare `except:` blocks hide real errors. | Catch specific exceptions and log them. |

### 11.4 Future Enhancements

1. **Reviews and ratings:** let customers who bought a product rate and review it, and show the real average rating on the product page.
2. **Account security features:** forgot/reset password by e-mail link, e-mail/mobile OTP verification (use the existing `is_verified` field), login rate limiting and token refresh with blacklist.
3. **Complete management screens:** vendor product add/edit with image upload, admin order-status update with automatic e-mail/SMS notification to the customer, and real-time notifications in the header.
4. **More payment options:** Razorpay/UPI and wallets (package already installed), proper Cash-on-Delivery workflow, Stripe webhooks, refunds and a "Pay now" button for unpaid orders.
5. **Order lifecycle:** order cancellation, return/refund requests and shipment tracking through a courier API, with automatic stock restore.
6. **Smart shopping features:** related products and recommendations, product comparison, recently viewed items, EMI calculator, coupons and loyalty points.
7. **Advanced reporting:** Excel/CSV export, scheduled e-mailed reports, GST invoice format with GSTIN, and charts on the main admin dashboard (the analytics API is already available).
8. **Quality and deployment:** automated unit and integration tests, CI/CD pipeline, Docker setup, cloud storage for product images (S3/Cloudinary), HTTPS security settings, and a Progressive Web App / mobile app with Hindi and Marathi language support.

---

## SECTION 12: REFERENCES

**Backend**
1. Python 3.10 Documentation – https://docs.python.org/3.10/
2. Django 5.2 Documentation – https://docs.djangoproject.com/en/5.2/
3. Django REST Framework – https://www.django-rest-framework.org/
4. Simple JWT (djangorestframework-simplejwt) – https://django-rest-framework-simplejwt.readthedocs.io/
5. django-cors-headers – https://github.com/adamchainz/django-cors-headers
6. django-filter – https://django-filter.readthedocs.io/
7. dj-database-url – https://github.com/jazzband/dj-database-url
8. python-dotenv – https://github.com/theskumar/python-dotenv
9. WhiteNoise – https://whitenoise.readthedocs.io/
10. Gunicorn – https://docs.gunicorn.org/
11. Psycopg 2 (PostgreSQL adapter) – https://www.psycopg.org/docs/
12. ReportLab User Guide – https://docs.reportlab.com/
13. Pillow – https://pillow.readthedocs.io/

**Database and cloud**
14. PostgreSQL Documentation – https://www.postgresql.org/docs/
15. Neon Serverless Postgres – https://neon.tech/docs
16. Render Documentation – https://render.com/docs (Blueprint `render.yaml` spec: https://render.com/docs/blueprint-spec)

**Payments**
17. Stripe Payment Intents API – https://docs.stripe.com/payments/payment-intents
18. Stripe API Reference (Python) – https://docs.stripe.com/api
19. Stripe.js and React Stripe.js (PaymentElement) – https://docs.stripe.com/sdks/stripejs-react
20. Stripe test cards – https://docs.stripe.com/testing

**Frontend**
21. React – https://react.dev/
22. TypeScript Handbook – https://www.typescriptlang.org/docs/
23. Vite – https://vite.dev/guide/
24. Redux Toolkit and RTK Query – https://redux-toolkit.js.org/
25. React Redux – https://react-redux.js.org/
26. React Router – https://reactrouter.com/
27. React Hook Form – https://react-hook-form.com/
28. Tailwind CSS v3 – https://v3.tailwindcss.com/docs
29. Headless UI – https://headlessui.com/
30. Heroicons – https://heroicons.com/
31. Framer Motion (Motion for React) – https://motion.dev/docs/react
32. Recharts – https://recharts.org/
33. React Hot Toast – https://react-hot-toast.com/
34. react-helmet-async – https://github.com/staylor/react-helmet-async
35. jsPDF – https://github.com/parallax/jsPDF
36. html2canvas – https://html2canvas.hertzen.com/
37. clsx – https://github.com/lukeed/clsx

**Tools**
38. Node.js – https://nodejs.org/docs/latest/api/ and npm – https://docs.npmjs.com/
39. ESLint – https://eslint.org/docs/latest/
40. PostCSS – https://postcss.org/ and Autoprefixer – https://github.com/postcss/autoprefixer
41. Git – https://git-scm.com/doc
42. Visual Studio Code – https://code.visualstudio.com/docs

---

## SECTION 13: QUESTIONNAIRE DRAFT

*Target respondents: students, working professionals and local shop customers who buy laptops/accessories, plus shop staff/vendors for Q6. Record the number of responses for each option.*

**Q1. How often do you buy laptops or computer accessories online?**
| Option | Responses |
|---|---|
| a) Never (I always buy from a physical shop) | ___ |
| b) Once a year | ___ |
| c) 2–3 times a year | ___ |
| d) Every month or more | ___ |

**Q2. What is the most important factor for you when choosing an online laptop store?**
| Option | Responses |
|---|---|
| a) Price and discounts | ___ |
| b) Detailed specifications and product images | ___ |
| c) Secure payment and trust in the seller | ___ |
| d) Fast delivery | ___ |
| e) Warranty and after-sales support | ___ |

**Q3. Which payment method do you prefer for buying a laptop online?**
| Option | Responses |
|---|---|
| a) Credit / Debit card | ___ |
| b) UPI | ___ |
| c) Net banking | ___ |
| d) Cash on Delivery | ___ |
| e) EMI / Pay later | ___ |

**Q4. How easy was it to find the right laptop using search, category/brand/price filters and sorting on LaptopWorld?**
| Option | Responses |
|---|---|
| a) Very easy | ___ |
| b) Easy | ___ |
| c) Neutral | ___ |
| d) Difficult | ___ |
| e) Very difficult | ___ |

**Q5. How satisfied are you with the cart, checkout and payment process (shipping form, card payment through Stripe, order confirmation and PDF)?**
| Option | Responses |
|---|---|
| a) Very satisfied | ___ |
| b) Satisfied | ___ |
| c) Neutral | ___ |
| d) Dissatisfied | ___ |
| e) Very dissatisfied | ___ |

**Q6. (Shop owner / staff / vendors) Compared with maintaining paper registers, how useful are the dashboards and reports (stock, sales, commission, customer reports with PDF export)?**
| Option | Responses |
|---|---|
| a) Very useful | ___ |
| b) Useful | ___ |
| c) Somewhat useful | ___ |
| d) Not useful | ___ |
