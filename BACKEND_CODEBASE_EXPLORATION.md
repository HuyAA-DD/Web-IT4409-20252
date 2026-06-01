# E-Commerce Backend Codebase - Comprehensive Technical Documentation

**Project**: Web-IT4409-20252 (HUST Web Technologies)  
**Date**: May 2026  
**Language**: Java 17  
**Framework**: Spring Boot 3.5.0  
**Database**: MySQL  
**Report Generated**: May 31, 2026  

---

## Executive Summary

This document provides a comprehensive technical inventory of the e-commerce platform's backend microservices architecture. The backend comprises **20 REST controllers**, **20+ services with interfaces**, **18 JPA repositories**, **20+ JPA entities**, and integration with external services (SePay, Cloudinary, Google Gemini AI). The system implements JWT-based authentication, role-based access control (RBAC), and follows Spring Boot best practices with clean layered architecture.

---

## Table of Contents

1. [Controllers & API Endpoints](#1-controllers--api-endpoints)
2. [Entity Models & Database Schema](#2-entity-models--database-schema)
3. [Services & Business Logic](#3-services--business-logic)
4. [Repositories & Data Access](#4-repositories--data-access)
5. [Configuration & Security](#5-configuration--security)
6. [External Integrations](#6-external-integrations)
7. [DTOs & Data Transfer Objects](#7-dtos--data-transfer-objects)
8. [Mappers & Type Conversion](#8-mappers--type-conversion)
9. [Exception Handling](#9-exception-handling)
10. [Enums & Constants](#10-enums--constants)

---

## 1. Controllers & API Endpoints

### Overview
- **Total Controllers**: 20
- **Base Path**: `/api/v1`
- **Response Format**: Wrapped in `ApiResponse<T>` generic wrapper
- **Authentication**: JWT Bearer token in Authorization header

### 1.1 Authentication & User Management

#### **AuthController** (`com.webtechnology.ecommerce.controller.AuthController`)
- **Base Path**: `/api/v1/auth`
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | POST | `/register` | Public | AuthRegisterRequest | ApiResponse<AuthResponse> | User registration |
  | POST | `/login` | Public | AuthLoginRequest | ApiResponse<AuthResponse> | User login, returns JWT |
  | GET | `/me` | Authenticated | - | ApiResponse<UserResponse> | Get current user info |

#### **UserController** (`com.webtechnology.ecommerce.controller.UserController`)
- **Base Path**: `/api/v1/users`
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | GET | `/me` | Authenticated | - | ApiResponse<UserResponse> | Get current user profile |
  | PUT | `/me` | ROLE_ADMIN, ROLE_USER | UserRequest | ApiResponse<UserResponse> | Update current user profile |
  | POST | `/me/avatar` | ROLE_ADMIN, ROLE_USER | file: MultipartFile | ApiResponse<UserResponse> | Upload user avatar (Cloudinary) |
  | PUT | `/me/password` | Authenticated | ChangePasswordRequest | ApiResponse<Void> | Change password |
  | GET | `` | ROLE_ADMIN | - | ApiResponse<List<UserResponse>> | Get all users |
  | GET | `/{id}` | ROLE_ADMIN | - | ApiResponse<UserResponse> | Get user by ID |

---

### 1.2 Product Management

#### **ProductController** (`com.webtechnology.ecommerce.controller.ProductController`)
- **Base Path**: `/api/v1/products`
- **Endpoints**:
  | Method | Endpoint | Auth | Query Params | Request | Response | Description |
  |--------|----------|------|-----|---------|----------|-------------|
  | POST | `` | ROLE_ADMIN, ROLE_SELLER | - | ProductRequest | ApiResponse<ProductResponse> | Create product (returns 201) |
  | GET | `` | Public | - | - | ApiResponse<List<ProductResponse>> | Get all products |
  | GET | `/search` | Public | keyword, categoryId, sellerId, minPrice, maxPrice, sortBy, sortDir | - | ApiResponse<List<ProductResponse>> | Search products with filters |
  | GET | `/filter` | Public | categoryId, status, sellerId, minPrice, maxPrice, sortBy, sortDir | - | ApiResponse<List<ProductResponse>> | Filter products |
  | GET | `/{id}` | Public | - | - | ApiResponse<ProductResponse> | Get product by ID |
  | PUT | `/{id}` | ROLE_ADMIN, ROLE_SELLER | - | ProductRequest | ApiResponse<ProductResponse> | Update product |
  | DELETE | `/{id}` | ROLE_ADMIN, ROLE_SELLER | - | - | ApiResponse<Void> | Delete product (soft delete) |

**Notes**:
- Seller can only manage own products; Admin can manage all
- Products support variants with stock tracking
- Images managed separately via ProductImage entity
- Soft delete implementation with @SQLRestriction
- Seller ID extracted from JWT claims for non-admin users

#### **CategoryController** (`com.webtechnology.ecommerce.controller.CategoryController`)
- **Base Path**: `/api/v1/categories`
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | GET | `` | Public | - | List<CategoryResponse> | Get all categories |
  | GET | `/{id}` | Public | - | CategoryResponse | Get category by ID |
  | POST | `` | ROLE_ADMIN | CategoryRequest | CategoryResponse (201) | Create category |
  | PUT | `/{id}` | ROLE_ADMIN | CategoryRequest | CategoryResponse | Update category |
  | DELETE | `/{id}` | ROLE_ADMIN | - | Void (204) | Delete category |

**Notes**:
- Hierarchical categories (parent-child self-reference)
- Direct response (not wrapped in ApiResponse for some)

---

### 1.3 Shopping & Cart Management

#### **CartController** (`com.webtechnology.ecommerce.controller.CartController`)
- **Base Path**: `/api/v1/cart`
- **Auth**: All endpoints require `@PreAuthorize("isAuthenticated()")`
- **Endpoints**:
  | Method | Endpoint | Request | Response | Description |
  |--------|----------|---------|----------|-------------|
  | GET | `` | - | ApiResponse<CartResponse> | Get user cart |
  | POST | `/items` | AddCartItemRequest | ApiResponse<CartResponse> | Add item to cart |
  | PUT | `/items/{itemId}` | UpdateCartItemRequest | ApiResponse<CartResponse> | Update cart item quantity |
  | DELETE | `/items/{itemId}` | - | ApiResponse<CartResponse> | Remove item from cart |
  | DELETE | `/items` | - | ApiResponse<CartResponse> | Clear entire cart |

**Notes**:
- User ID extracted from JWT (no body parameter needed)
- Each cart operation returns complete cart with all items
- Stock validation not performed at add-to-cart time (validated at order creation)

---

### 1.4 Order Management

#### **OrderController** (`com.webtechnology.ecommerce.controller.OrderController`)
- **Base Path**: `/api/v1/orders`
- **Auth**: All endpoints require authentication
- **Endpoints**:
  | Method | Endpoint | Request | Response | Description |
  |--------|----------|---------|----------|-------------|
  | POST | `` | OrderRequest | ApiResponse<OrderResponse> (201) | Create order from cart |
  | GET | `` | - | ApiResponse<List<OrderResponse>> | Get user's orders |
  | GET | `/{id}` | - | ApiResponse<OrderResponse> | Get order details (verify ownership) |
  | PUT | `/{id}/cancel` | - | ApiResponse<OrderResponse> | Cancel pending order |
  | GET | `/{id}/tracking` | - | ApiResponse<OrderResponse> | Get order tracking info |

**Order Creation Process**:
1. Validates cart items exist and have sufficient stock
2. Creates Order with initial status PENDING, paymentStatus PENDING
3. Creates OrderItems from cart variants
4. Decrements ProductVariant stock
5. Applies coupon if provided (validates code, usage limit, date range, min order value)
6. Generates order code: "DH" + 8-digit timestamp-based code
7. Clears user's cart after successful order creation

**Notes**:
- Order code auto-generated for SePay reference
- Stock decremented immediately (not reserved)
- Coupon applied at order creation, not at checkout

---

### 1.5 Payment Management

#### **PaymentController** (`com.webtechnology.ecommerce.controller.PaymentController`)
- **Base Path**: `/api/v1/payments`
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | POST | `/sepay/checkout` | Authenticated | SepayCheckoutRequest | ApiResponse<PaymentResponse> | Initiate SePay payment |
  | GET | `/orders/{orderId}/status` | Authenticated | - | ApiResponse<PaymentResponse> | Get payment status |
  | GET | `/orders/{orderId}/transaction-status` | Authenticated | - | ApiResponse<SepayTransactionStatusResponse> | Query SePay transaction |

**Integration Flow**:
1. Frontend calls checkout endpoint with order ID
2. Backend creates payment intent with SePay (Vietnamese payment gateway)
3. Returns checkout URL for user to complete payment
4. User redirected to SePay (external)
5. SePay calls webhook at `/api/v1/webhooks/sepay/callback`
6. Webhook updates order and payment status
7. User redirected back to frontend success page

---

### 1.6 Admin Dashboard

#### **AdminController** (`com.webtechnology.ecommerce.controller.AdminController`)
- **Base Path**: `/api/v1/admin`
- **Auth**: All endpoints require `@PreAuthorize("hasRole('ADMIN')")`
- **Endpoints**:
  | Method | Endpoint | Query Params | Response | Description |
  |--------|----------|-----|----------|-------------|
  | GET | `/dashboard` | year, month, quarter (optional) | ApiResponse<DashboardResponse> | Admin dashboard metrics |
  | GET | `/revenue` | year, month, quarter (optional) | ApiResponse<RevenueResponse> | Revenue analytics |
  | GET | `/top-products` | limit (def 10), year, month, quarter | ApiResponse<List<TopProductResponse>> | Top selling products |
  | GET | `/orders` | - | ApiResponse<List<AdminOrderResponse>> | All orders (admin view) |
  | PUT | `/orders/{id}/status` | - | UpdateOrderStatusRequest | ApiResponse<OrderResponse> | Update order status |

**Dashboard Metrics**:
- Total sales, revenue, order count, user count
- Time-based filtering: yearly, monthly, quarterly
- Revenue breakdown by period
- Top 10 products by sales volume
- All orders with admin-specific fields

---

### 1.7 Seller Dashboard

#### **SellerController** (`com.webtechnology.ecommerce.controller.SellerController`)
- **Base Path**: `/api/v1/seller`
- **Auth**: All endpoints require `@PreAuthorize("hasRole('SELLER')")`
- **Endpoints**:
  | Method | Endpoint | Response | Description |
  |--------|----------|----------|-------------|
  | GET | `/orders` | ApiResponse<List<OrderResponse>> | Get seller's product orders |
  | GET | `/orders/{id}` | ApiResponse<OrderResponse> | Get specific order details |
  | GET | `/dashboard` | ApiResponse<DashboardResponse> | Seller dashboard metrics |

**Notes**:
- Only returns orders containing seller's products
- Dashboard shows seller-specific metrics (revenue, product performance)
- Time-based filtering supported (year, month, quarter)

---

### 1.8 Reviews & Wishlists

#### **ReviewController** (`com.webtechnology.ecommerce.controller.ReviewController`)
- **Base Path**: `/api/v1/reviews`
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | POST | `` | Authenticated | ReviewRequest | ApiResponse<ReviewResponse> (201) | Create product review |
  | GET | `` | Public | - | ApiResponse<List<ReviewResponse>> | Get all reviews |
  | GET | `/{id}` | Public | - | ApiResponse<ReviewResponse> | Get review by ID |
  | PUT | `/{id}` | Authenticated | ReviewRequest | ApiResponse<ReviewResponse> | Update review |
  | DELETE | `/{id}` | Authenticated | - | ApiResponse<Void> | Delete review |

**Notes**:
- User ID extracted from JWT (not trusted from request body)
- Rating: Integer (typically 1-5)
- Reviews tied to both User and Product

#### **WishlistController** (`com.webtechnology.ecommerce.controller.WishlistController`)
- **Base Path**: `/api/v1/wishlists`
- **Auth**: All endpoints require authentication
- **Endpoints**:
  | Method | Endpoint | Request | Response | Description |
  |--------|----------|---------|----------|-------------|
  | POST | `` | WishlistRequest | ApiResponse<WishlistResponse> (201) | Add product to wishlist |
  | GET | `` | - | ApiResponse<List<WishlistResponse>> (ADMIN only) | Get all wishlists |
  | GET | `/my` | - | ApiResponse<List<WishlistResponse>> | Get user's wishlists |
  | DELETE | `/{id}` | - | ApiResponse<Void> | Remove from wishlist |

---

### 1.9 Coupons

#### **CouponController** (`com.webtechnology.ecommerce.controller.CouponController`)
- **Base Path**: `/api/v1/coupons`
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | POST | `` | ROLE_ADMIN | CouponRequest | ApiResponse<CouponResponse> (201) | Create coupon |
  | GET | `` | Public | - | ApiResponse<List<CouponResponse>> | Get all active coupons |
  | GET | `/{id}` | Public | - | ApiResponse<CouponResponse> | Get coupon by ID |
  | PUT | `/{id}` | ROLE_ADMIN | CouponRequest | ApiResponse<CouponResponse> | Update coupon |
  | DELETE | `/{id}` | ROLE_ADMIN | - | ApiResponse<Void> | Delete coupon |

**Coupon Validation**:
- Date range check (startDate ≤ now ≤ endDate)
- Usage limit check (currentUsage < usageLimit)
- Minimum order value requirement
- Active status flag
- Discount calculation: Percentage (%) or Fixed amount

---

### 1.10 Addresses

#### **AddressController** (`com.webtechnology.ecommerce.controller.AddressController`)
- **Base Path**: `/api/v1/addresses`
- **Auth**: All endpoints require authentication
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | POST | `` | Authenticated | AddressRequest | ApiResponse<AddressResponse> (201) | Create address |
  | GET | `` | ROLE_ADMIN | - | ApiResponse<List<AddressResponse>> | Get all addresses |
  | GET | `/my` | Authenticated | - | ApiResponse<List<AddressResponse>> | Get user's addresses |
  | GET | `/{id}` | Authenticated/ADMIN | - | ApiResponse<AddressResponse> | Get address by ID |
  | PUT | `/{id}` | Authenticated | AddressRequest | ApiResponse<AddressResponse> | Update address |
  | DELETE | `/{id}` | Authenticated | - | ApiResponse<Void> | Delete address |

**Address Fields**:
- recipientName, recipientPhone
- street, ward, district, province, postalCode, country
- isDefault, addressType (HOME, OFFICE, etc.)
- Timestamps: createdAt, updatedAt

---

### 1.11 Notifications

#### **NotificationController** (`com.webtechnology.ecommerce.controller.NotificationController`)
- **Base Path**: `/api/v1/notifications`
- **Endpoints**:
  | Method | Endpoint | Auth | Request | Response | Description |
  |--------|----------|------|---------|----------|-------------|
  | POST | `` | ROLE_ADMIN | NotificationRequest | ApiResponse<NotificationResponse> (201) | Create notification |
  | GET | `` | ROLE_ADMIN | - | ApiResponse<List<NotificationResponse>> | Get all notifications |
  | GET | `/my` | Authenticated | - | ApiResponse<List<NotificationResponse>> | Get user's notifications |
  | GET | `/{id}` | Authenticated/ADMIN | - | ApiResponse<NotificationResponse> | Get notification |
  | PUT | `/{id}/read` | Authenticated | - | ApiResponse<NotificationResponse> | Mark as read |
  | DELETE | `/{id}` | Authenticated/ADMIN | - | ApiResponse<Void> | Delete notification |

**Notification Types**: ORDER_CONFIRMED, PRODUCT_SHIPPED, PAYMENT_RECEIVED, etc.

---

### 1.12 Audit Logs

#### **AuditLogController** (`com.webtechnology.ecommerce.controller.AuditLogController`)
- **Base Path**: `/api/v1/audit-logs`
- **Auth**: All endpoints require ROLE_ADMIN
- **Endpoints**:
  | Method | Endpoint | Request | Response | Description |
  |--------|----------|---------|----------|-------------|
  | POST | `` | AuditLogRequest | ApiResponse<AuditLogResponse> (201) | Create audit log |
  | GET | `` | - | ApiResponse<List<AuditLogResponse>> | Get all audit logs |
  | GET | `/{id}` | - | ApiResponse<AuditLogResponse> | Get audit log by ID |

**Audit Log Tracking**:
- user (optional), action, entityType, entityId
- oldValue, newValue (for change tracking)
- ipAddress, timestamp

---

### 1.13 File Upload

#### **FileUploadController** (`com.webtechnology.ecommerce.controller.FileUploadController`)
- **Base Path**: `/api/v1/upload`
- **Auth**: ROLE_ADMIN, ROLE_USER, ROLE_SELLER (all authenticated)
- **Endpoints**:
  | Method | Endpoint | Request | Response | Description |
  |--------|----------|---------|----------|-------------|
  | POST | `/image` | file: MultipartFile | ApiResponse<FileUploadResponse> (201) | Upload image to Cloudinary |
  | POST | `/video` | file: MultipartFile | ApiResponse<FileUploadResponse> (201) | Upload video to Cloudinary |

**Implementation**:
- Uses Cloudinary SDK for cloud storage
- Returns: public URL, secure URL, asset ID
- Supported formats: JPEG, PNG, GIF, WebP (images); MP4, WebM (videos)

---

### 1.14 Webhooks

#### **WebhookController** (`com.webtechnology.ecommerce.controller.WebhookController`)
- **Base Path**: `/api/v1/webhooks`
- **Auth**: Public (signature verified)
- **Endpoints**:
  | Method | Endpoint | Auth | Headers | Request | Response | Description |
  |--------|----------|------|---------|---------|----------|-------------|
  | POST | `/sepay/callback` | Signature Verified | X-SePay-Signature, X-SePay-Timestamp | byte[] (raw body) | {success: true} | SePay payment webhook |

**SePay Webhook Processing**:
1. Verify HMAC-SHA256 signature from header
2. Parse webhook payload (SepayWebhookRequest)
3. Prevent duplicate processing (check sepayTransactionId)
4. Update Order status based on payment result
5. Update Payment record with transaction ID
6. Return 200 + {success: true} immediately
7. Handles: Transaction success, failure, refund
8. **Response**: Always 200 + {success: true} (SePay expects this within 30s)

---

### 1.15 Public Search

#### **PublicController** (`com.webtechnology.ecommerce.controller.PublicController`)
- **Base Path**: `/api/v1/search`
- **Endpoints**:
  | Method | Endpoint | Query Params | Response | Description |
  |--------|----------|-----|----------|-------------|
  | GET | `` | keyword, categoryId, minPrice, maxPrice | ApiResponse<List<ProductResponse>> | Global product search |

---

### 1.16 System Health

#### **SystemController** (`com.webtechnology.ecommerce.controller.SystemController`)
- **Base Path**: `/api/v1`
- **Auth**: Public
- **Endpoints**:
  | Method | Endpoint | Response | Description |
  |--------|----------|----------|-------------|
  | GET | `/health` | ApiResponse<Map> | Health check (status, timestamp) |
  | GET | `/status` | ApiResponse<Map> | Server status (app version, env, java version) |

---

### 1.17 AI Chatbot (Currently Commented Out)

#### **ChatbotController** (`com.webtechnology.ecommerce.controller.ChatbotController`)
- **Base Path**: `/api/v1/chatbot`
- **Auth**: Public
- **Planned Endpoints**:
  | Method | Endpoint | Query | Response | Description |
  |--------|----------|-------|----------|-------------|
  | GET | `/chat` | message | ApiResponse<String> | Chat with AI (RAG + Function Calling) |

**Status**: Implementation ready in `AiFunctionConfig`, awaiting activation

---

## 2. Entity Models & Database Schema

### Overview
- **Total Entities**: 20+
- **ORM**: JPA/Hibernate
- **Relationships**: OneToMany, ManyToOne, ManyToMany (partial)
- **Soft Deletes**: Product, ProductVariant

---

### 2.1 Core User & Role Entity

#### **User** (JPA Entity)
- **Table**: `users`
- **Primary Key**: `id` (UUID, generated)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK, Generated | User unique identifier |
  | email | String | NOT NULL, UNIQUE(150) | Unique email |
  | password | String | NOT NULL | Hashed password (stored) |
  | fullName | String | NOT NULL (150) | User display name |
  | role | Role (Enum) | NOT NULL | USER, SELLER, ADMIN |
  | avatarUrl | String | (500) | Cloudinary URL |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Account creation timestamp |
  
- **Relationships**:
  - OneToMany → Orders (user)
  - OneToMany → Addresses
  - OneToMany → Reviews (reviewer)
  - OneToMany → Wishlists
  - OneToMany → Notifications
  - OneToMany → Carts
  - OneToMany → CouponUsages
  - OneToMany → AuditLogs (actor)

- **Soft Delete**: None (hard delete)
- **Indexes**: email (unique), role
- **Validation**: Email format, password strength

---

#### **Role** (Enum Entity)
- **Values**: 
  - `USER` - Customer/shopper
  - `SELLER` - Store owner
  - `ADMIN` - System administrator

---

### 2.2 Product Entities

#### **Category** (JPA Entity)
- **Table**: `categories`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Category identifier |
  | name | String | NOT NULL (100) | Category name |
  | description | String | TEXT | Category description |
  | parentCategory | Category | FK (self-ref) | Parent category (hierarchical) |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Creation timestamp |

- **Relationships**:
  - OneToMany → Products (category)
  - ManyToOne → Category (parentCategory, self-reference)

- **Soft Delete**: None

---

#### **Product** (JPA Entity - Soft Deletable)
- **Table**: `products`
- **Primary Key**: `id` (UUID)
- **Soft Delete**: Yes (@SQLDelete, @SQLRestriction)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Product identifier |
  | name | String | NOT NULL (200) | Product name |
  | description | String | TEXT | Detailed description |
  | category | Category | FK, NOT NULL | Product category |
  | seller | User | FK, NOT NULL | Seller/vendor |
  | status | ProductStatus | NOT NULL | ACTIVE, INACTIVE |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Creation timestamp |
  | updatedAt | LocalDateTime | NOT NULL | Last modification timestamp |
  | deleted | Boolean | Default false | Soft delete flag |

- **Relationships**:
  - ManyToOne → Category (required)
  - ManyToOne → User (seller, required)
  - OneToMany → ProductVariants
  - OneToMany → ProductImages
  - OneToMany → OrderItems
  - OneToMany → Reviews
  - OneToMany → Wishlists

- **Soft Delete Strategy**:
  ```sql
  UPDATE products SET deleted = true WHERE id = ?
  -- Query: @SQLRestriction("deleted = false")
  ```

- **Indexes**: category_id, seller_id, status, created_at

---

#### **ProductVariant** (JPA Entity - Soft Deletable)
- **Table**: `product_variants`
- **Primary Key**: `id` (UUID)
- **Soft Delete**: Yes (with SKU uniqueness preservation)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Variant identifier |
  | product | Product | FK, NOT NULL | Parent product |
  | sku | String | UNIQUE (100) | Stock keeping unit |
  | price | BigDecimal | NOT NULL (15,2) | Variant price |
  | stock | Integer | NOT NULL | Available quantity |
  | attributes | Map<String,Object> | JSON | Size, color, etc. |
  | deleted | Boolean | Default false | Soft delete flag |

- **Relationships**:
  - ManyToOne → Product (required)
  - OneToMany → CartItems
  - OneToMany → OrderItems

- **Soft Delete Strategy**:
  ```sql
  UPDATE product_variants 
  SET deleted = true, sku = CONCAT(sku, '_del_', UUID()) 
  WHERE id = ?
  ```
  (Appends UUID to SKU to maintain uniqueness during soft delete)

- **Indexes**: product_id, sku, price, stock

---

#### **ProductImage** (JPA Entity)
- **Table**: `product_images`
- **Fields**:
  | Field | Type | Description |
  |-------|------|-------------|
  | id | UUID | PK |
  | product | Product | FK, NOT NULL |
  | imageUrl | String | Cloudinary URL |
  | imagePublicId | String | Cloudinary asset ID |
  | displayOrder | Integer | Sort order |
  | createdAt | LocalDateTime | Timestamp |

- **Relationships**:
  - ManyToOne → Product (required)

---

### 2.3 Order & Payment Entities

#### **Order** (JPA Entity)
- **Table**: `orders`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Order identifier |
  | user | User | FK, NOT NULL | Customer |
  | address | Address | FK, NOT NULL | Delivery address |
  | totalAmount | BigDecimal | NOT NULL (15,2) | Total with discount |
  | subTotal | BigDecimal | NOT NULL (15,2) | Sum before discount |
  | discountAmount | BigDecimal | (15,2) | Coupon/promo discount |
  | couponCode | String | (50) | Applied coupon code |
  | orderCode | String | UNIQUE (20) | "DH" + 8-digit code |
  | status | OrderStatus | NOT NULL | PENDING, CONFIRMED, etc. |
  | paymentStatus | PaymentStatus | NOT NULL | PENDING, PAID, FAILED, etc. |
  | paymentMethod | PaymentMethod | NOT NULL | COD, BANK_TRANSFER, SEPAY |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Order timestamp |

- **Relationships**:
  - ManyToOne → User (required)
  - ManyToOne → Address (required)
  - OneToMany → OrderItems
  - OneToMany → Payments

- **Timestamps**: Pre-populated on creation
- **Order Code Generation**: 
  ```java
  orderCode = "DH" + String.format("%08d", System.currentTimeMillis() % 100_000_000L)
  ```

- **Soft Delete**: None

---

#### **OrderItem** (JPA Entity)
- **Table**: `order_items`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Line item ID |
  | order | Order | FK, NOT NULL | Parent order |
  | product | Product | FK, NOT NULL | Ordered product |
  | productVariant | ProductVariant | FK, NOT NULL | Specific variant |
  | productName | String | NOT NULL (200) | Snapshot of product name |
  | sku | String | NOT NULL (100) | Variant SKU snapshot |
  | price | BigDecimal | NOT NULL (15,2) | Unit price at purchase |
  | quantity | Integer | NOT NULL | Ordered quantity |

- **Relationships**:
  - ManyToOne → Order (required)
  - ManyToOne → Product (required)
  - ManyToOne → ProductVariant (required)

---

#### **Payment** (JPA Entity)
- **Table**: `payments`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Payment record ID |
  | order | Order | FK, NOT NULL | Associated order |
  | method | PaymentMethod | NOT NULL | COD, SEPAY, etc. |
  | transactionId | String | (150) | SePay transaction ID |
  | amount | BigDecimal | NOT NULL (15,2) | Payment amount |
  | status | PaymentStatus | NOT NULL | PENDING, PAID, FAILED |
  | paidAt | LocalDateTime | - | Payment completion time |

- **Relationships**:
  - ManyToOne → Order (required)

---

### 2.4 Shopping Cart Entities

#### **Cart** (JPA Entity)
- **Table**: `carts`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Cart ID |
  | user | User | FK, NOT NULL | Cart owner |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Creation time |

- **Relationships**:
  - ManyToOne → User (required)
  - OneToMany → CartItems

- **Notes**: One cart per user (created on first add-to-cart)

---

#### **CartItem** (JPA Entity)
- **Table**: `cart_items`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Cart item ID |
  | cart | Cart | FK, NOT NULL | Parent cart |
  | productVariant | ProductVariant | FK, NOT NULL | Variant in cart |
  | quantity | Integer | NOT NULL | Item quantity |

- **Relationships**:
  - ManyToOne → Cart (required)
  - ManyToOne → ProductVariant (required)

---

### 2.5 Review Entity

#### **Review** (JPA Entity)
- **Table**: `reviews`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Review ID |
  | user | User | FK, NOT NULL | Reviewer |
  | product | Product | FK, NOT NULL | Reviewed product |
  | rating | Integer | NOT NULL | 1-5 stars |
  | comment | String | TEXT | Review text |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Review date |

- **Relationships**:
  - ManyToOne → User (reviewer)
  - ManyToOne → Product (reviewed)

- **Soft Delete**: None

---

### 2.6 Wishlist Entity

#### **Wishlist** (JPA Entity)
- **Table**: `wishlists`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Wishlist item ID |
  | user | User | FK, NOT NULL | Wishlist owner |
  | product | Product | FK, NOT NULL | Wishlisted product |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Added date |

- **Relationships**:
  - ManyToOne → User (required)
  - ManyToOne → Product (required)

---

### 2.7 Coupon Entities

#### **Coupon** (JPA Entity)
- **Table**: `coupons`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Coupon ID |
  | code | String | UNIQUE (50), NOT NULL | Coupon code |
  | discountType | String | NOT NULL (20) | "PERCENTAGE" or "FIXED" |
  | discountValue | BigDecimal | NOT NULL (10,2) | Discount amount/% |
  | minOrderValue | BigDecimal | (10,2) | Minimum order requirement |
  | maxDiscount | BigDecimal | (10,2) | Max discount cap |
  | startDate | LocalDateTime | - | Coupon valid from |
  | endDate | LocalDateTime | - | Coupon valid until |
  | usageLimit | Integer | - | Max uses (null = unlimited) |
  | currentUsage | Integer | Default 0 | Current usage count |
  | isActive | Boolean | NOT NULL, Default true | Active flag |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Creation date |
  | updatedAt | LocalDateTime | NOT NULL | Last update |

- **Relationships**:
  - OneToMany → CouponUsages

- **Validation**:
  - Date range: startDate ≤ now ≤ endDate
  - Usage: currentUsage < usageLimit (if usageLimit != null)
  - Order value: orderAmount ≥ minOrderValue
  - Discount cap: calculatedDiscount ≤ maxDiscount

---

#### **CouponUsage** (JPA Entity)
- **Table**: `coupon_usage`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Usage record ID |
  | coupon | Coupon | FK, NOT NULL | Used coupon |
  | user | User | FK, NOT NULL | User who used it |
  | order | Order | FK, NOT NULL | Associated order |
  | usedAt | LocalDateTime | NOT NULL | Usage timestamp |

- **Relationships**:
  - ManyToOne → Coupon (required)
  - ManyToOne → User (required)
  - ManyToOne → Order (required)

---

### 2.8 Address Entity

#### **Address** (JPA Entity)
- **Table**: `addresses`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Address ID |
  | user | User | FK, NOT NULL | Address owner |
  | recipientName | String | NOT NULL (100) | Recipient name |
  | recipientPhone | String | NOT NULL (20) | Phone number |
  | street | String | NOT NULL (255) | Street address |
  | ward | String | NOT NULL (100) | Ward/precinct |
  | district | String | NOT NULL (100) | District |
  | province | String | NOT NULL (100) | Province/state |
  | postalCode | String | (20) | Postal/zip code |
  | country | String | NOT NULL (100) | Country |
  | isDefault | Boolean | NOT NULL | Default address flag |
  | addressType | String | NOT NULL (50) | HOME, OFFICE, OTHER |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Creation date |
  | updatedAt | LocalDateTime | NOT NULL | Last update |

- **Relationships**:
  - ManyToOne → User (required)
  - OneToMany → Orders (deliveryAddress)

---

### 2.9 Notification Entity

#### **Notification** (JPA Entity)
- **Table**: `notifications`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Notification ID |
  | user | User | FK, NOT NULL | Recipient |
  | title | String | NOT NULL (200) | Notification title |
  | message | String | NOT NULL, TEXT | Message body |
  | type | String | NOT NULL (50) | ORDER, PAYMENT, PRODUCT |
  | relatedEntityType | String | (100) | Related entity type |
  | relatedEntityId | UUID | - | Related entity ID |
  | isRead | Boolean | NOT NULL, Default false | Read status |
  | isSent | Boolean | NOT NULL, Default false | Sent status |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Creation date |
  | updatedAt | LocalDateTime | NOT NULL | Last update |

- **Relationships**:
  - ManyToOne → User (required)

- **Types**: ORDER_CONFIRMED, PRODUCT_SHIPPED, PAYMENT_RECEIVED, etc.

---

### 2.10 Audit Log Entity

#### **AuditLog** (JPA Entity)
- **Table**: `audit_logs`
- **Primary Key**: `id` (UUID)
- **Fields**:
  | Field | Type | Constraints | Description |
  |-------|------|-------------|-------------|
  | id | UUID | PK | Log entry ID |
  | user | User | FK (optional) | Actor (system if null) |
  | action | String | NOT NULL (100) | CREATE, UPDATE, DELETE |
  | entityType | String | NOT NULL (100) | Entity class name |
  | entityId | UUID | - | Modified entity ID |
  | oldValue | String | TEXT | Previous value |
  | newValue | String | TEXT | New value |
  | ipAddress | String | (45) | Client IP address |
  | createdAt | LocalDateTime | NOT NULL, Read-only | Audit timestamp |

- **Relationships**:
  - ManyToOne → User (optional)

---

### 2.11 Invoice Entities

#### **Invoice** (JPA Entity)
- **Table**: `invoices`
- **Purpose**: Generate printable receipts/invoices

#### **InvoiceItem** (JPA Entity)
- **Table**: `invoice_items`
- **Purpose**: Line items for invoice

---

## 3. Services & Business Logic

### Overview
- **Total Services**: 20+ (interfaces + implementations)
- **Pattern**: Interface-based design with Impl classes
- **Location**: `service/` (interfaces), `service/impl/` (implementations)
- **Transactions**: @Transactional on service layer

---

### 3.1 Authentication & User Services

#### **AuthService** (Interface)
- **Impl**: `AuthServiceImpl`
- **Key Methods**:
  - `register(AuthRegisterRequest) → AuthResponse`
    - Email validation and uniqueness check
    - Password hashing (using Spring Security)
    - Create User with ROLE_USER by default
    - Generate JWT token
  - `login(AuthLoginRequest) → AuthResponse`
    - Email/password validation
    - Return JWT token + user info
  - `getCurrentUser(UUID userId) → UserResponse`
    - Get authenticated user details

---

#### **UserService** (Interface)
- **Impl**: `UserServiceImpl`
- **Key Methods**:
  - `getCurrentUser() → UserResponse`
    - From Security context
  - `updateCurrentUserProfile(UserRequest) → UserResponse`
    - Update fullName, email, etc.
  - `updateCurrentUserAvatar(MultipartFile) → UserResponse`
    - Upload to Cloudinary
  - `changePassword(ChangePasswordRequest) → void`
    - Validate old password
    - Hash new password
  - `getAllUsers() → List<UserResponse>` (ADMIN)
  - `getUserById(UUID) → UserResponse` (ADMIN)

---

### 3.2 Product Management Services

#### **ProductService** (Interface)
- **Impl**: `ProductServiceImpl`
- **Key Methods**:
  - `createProduct(ProductRequest, UUID sellerId) → ProductResponse`
    - Create product with initial ACTIVE status
    - Seller ID from JWT (or override if ADMIN)
  - `getAllProducts() → List<ProductResponse>`
    - Returns only non-deleted, ACTIVE products
  - `searchProducts(keyword, categoryId, sellerId, minPrice, maxPrice, sortBy, sortDir) → List<ProductResponse>`
    - Dynamic JPQL queries with filters
    - sortBy: name, price, createdAt
    - sortDir: asc, desc
  - `filterProducts(...) → List<ProductResponse>`
    - Filter by status, category, seller
    - Range: minPrice - maxPrice
  - `getProductById(UUID) → ProductResponse`
  - `updateProduct(UUID, ProductRequest, UUID sellerId) → ProductResponse`
    - Only seller or ADMIN can update
  - `deleteProduct(UUID, UUID callerId, boolean isAdmin) → void`
    - Soft delete (logical)
  - `uploadProductImage(UUID productId, MultipartFile) → FileUploadResponse`
    - Upload to Cloudinary
  - `uploadProductImages(UUID productId, List<MultipartFile>) → List<FileUploadResponse>`
    - Batch upload
  - `deleteProductImage(UUID productId, UUID imageId) → void`

---

#### **CategoryService** (Interface)
- **Impl**: `CategoryServiceImpl`
- **Key Methods**:
  - `createCategory(CategoryRequest) → CategoryResponse`
  - `getAllCategories() → List<CategoryResponse>`
  - `getCategoryById(UUID) → CategoryResponse`
  - `updateCategory(UUID, CategoryRequest) → CategoryResponse`
  - `deleteCategory(UUID) → void`
  - Supports hierarchical categories (parent-child)

---

### 3.3 Order & Cart Services

#### **OrderService** (Interface)
- **Impl**: `OrderServiceImpl`
- **Key Methods**:
  - `createOrder(UUID userId, OrderRequest) → OrderResponse`
    - Validates cart items, stock
    - Creates Order + OrderItems
    - Decrements ProductVariant stock
    - Applies coupon if provided
    - Generates order code
    - Clears cart
    - **Workflow**:
      1. Get user and delivery address
      2. Validate address belongs to user
      3. Create Order (status: PENDING, paymentStatus: PENDING)
      4. For each cart item:
         - Validate variant exists and has stock
         - Create OrderItem with price snapshot
         - Decrement stock
      5. Calculate subTotal
      6. Apply coupon (calculate discount)
      7. Calculate totalAmount
      8. Save order
      9. Clear user's cart
      10. Return OrderResponse
  - `getUserOrders(UUID userId) → List<OrderResponse>`
  - `getOrderById(UUID) → OrderResponse`
  - `getOrderByIdAndUserId(UUID orderId, UUID userId) → OrderResponse`
    - Security: verify ownership
  - `cancelOrder(UUID orderId, UUID userId) → OrderResponse`
    - Only cancel if PENDING or CONFIRMED
    - Restore stock
  - `updateOrderStatus(UUID orderId, OrderStatus newStatus) → OrderResponse`
    - ADMIN only
    - Trigger notifications
  - `getAllOrders() → List<OrderResponse>` (ADMIN)
  - `getOrderTracking(UUID orderId, UUID userId) → OrderResponse`
    - Return order with tracking info

---

#### **CartService** (Interface)
- **Impl**: `CartServiceImpl`
- **Key Methods**:
  - `getCartByUserId(UUID userId) → CartResponse`
    - Get or create cart
  - `addItemToCart(UUID userId, AddCartItemRequest) → CartResponse`
    - Validate product variant exists
    - Add or update quantity
  - `updateCartItem(UUID userId, UUID itemId, UpdateCartItemRequest) → CartResponse`
    - Update quantity
  - `removeCartItem(UUID userId, UUID itemId) → CartResponse`
    - Delete cart item
  - `clearCart(UUID userId) → CartResponse`
    - Remove all items

---

### 3.4 Payment & Webhook Services

#### **PaymentService** (Interface)
- **Impl**: `PaymentServiceImpl`
- **Key Methods**:
  - `createSepayCheckout(UUID userId, SepayCheckoutRequest) → PaymentResponse`
    - Validate order
    - Create Payment record (status: PENDING)
    - Call SePay API to initiate checkout
    - Return checkout URL
  - `getPaymentStatus(UUID userId, UUID orderId) → PaymentResponse`
    - Get payment record status
  - `queryTransactionStatus(UUID userId, UUID orderId) → SepayTransactionStatusResponse`
    - Query SePay API for transaction details

---

#### **SepayService** (Interface)
- **Impl**: Implementation details in service
- **Key Methods**:
  - `verifyWebhookSignature(String rawBody, String signature, long timestamp) → boolean`
    - HMAC-SHA256 verification
    - Format: sha256={hex_hash} from header X-SePay-Signature
    - Sign: {timestamp}.{raw_body}
  - `processWebhookCallback(SepayWebhookRequest) → SepayTransactionStatusResponse`
    - Parse webhook
    - Update Order status
    - Update Payment record
    - Prevent duplicates (check transactionId)
  - `getTransactionStatus(String sepayTransactionId) → SepayTransactionStatusResponse`
    - API call to SePay to get transaction details

**SePay Integration**:
- Payment gateway for Vietnamese banks
- Webhook endpoint: `/api/v1/webhooks/sepay/callback`
- Order code format: "DH" + 8-digit code (used as reference)
- Webhook expected to return within 30 seconds
- Always respond 200 + {success: true}

---

### 3.5 Review & Wishlist Services

#### **ReviewService** (Interface)
- **Impl**: `ReviewServiceImpl`
- **Key Methods**:
  - `createReview(ReviewRequest) → ReviewResponse`
    - User ID from JWT (security)
    - Create Review (rating, comment)
  - `getAllReviews() → List<ReviewResponse>`
  - `getReviewById(UUID) → ReviewResponse`
  - `updateReview(UUID, ReviewRequest) → ReviewResponse`
    - Only review owner or ADMIN
  - `deleteReview(UUID) → void`
    - Only review owner or ADMIN

---

#### **WishlistService** (Interface)
- **Impl**: `WishlistServiceImpl`
- **Key Methods**:
  - `addToWishlist(WishlistRequest) → WishlistResponse`
    - Create Wishlist entry
  - `getAllWishlists() → List<WishlistResponse>` (ADMIN only)
  - `getUserWishlists(UUID userId) → List<WishlistResponse>`
  - `removeFromWishlist(UUID id) → void`

---

### 3.6 Dashboard & Analytics Services

#### **AdminService** (Interface)
- **Impl**: `AdminServiceImpl`
- **Key Methods**:
  - `getDashboard(Integer year, Integer month, Integer quarter) → DashboardResponse`
    - Metrics: total orders, revenue, users, products
    - Time-based: yearly, monthly, quarterly
  - `getRevenue(Integer year, Integer month, Integer quarter) → RevenueResponse`
    - Revenue breakdown by period
  - `getTopProducts(int limit, Integer year, Integer month, Integer quarter) → List<TopProductResponse>`
    - Top selling products
    - Default limit: 10

---

#### **SellerService** (Interface)
- **Impl**: `SellerServiceImpl`
- **Key Methods**:
  - `getSellerOrders(UUID sellerId) → List<OrderResponse>`
    - Orders containing seller's products
  - `getSellerOrderById(UUID sellerId, UUID orderId) → OrderResponse`
  - `getSellerDashboard(UUID sellerId, Integer year, Integer month, Integer quarter) → DashboardResponse`
    - Seller-specific metrics
    - Revenue from products sold

---

### 3.7 Coupon & Discount Services

#### **CouponService** (Interface)
- **Impl**: `CouponServiceImpl`
- **Key Methods**:
  - `createCoupon(CouponRequest) → CouponResponse`
  - `getAllCoupons() → List<CouponResponse>`
  - `getCouponById(UUID) → CouponResponse`
  - `updateCoupon(UUID, CouponRequest) → CouponResponse`
  - `deleteCoupon(UUID) → void`
  - `calculateDiscount(String couponCode, BigDecimal orderAmount) → CouponCalculationResponse`
    - Validate coupon: date range, usage limit, active
    - Calculate discount based on type (PERCENTAGE or FIXED)
    - Apply max discount cap
    - Return: isValid, discountAmount, finalAmount
  - `applyCoupon(UUID orderId, String couponCode) → void`
    - Increment usage counter

---

### 3.8 Notification Services

#### **NotificationService** (Interface)
- **Impl**: `NotificationServiceImpl`
- **Key Methods**:
  - `createNotification(NotificationRequest) → NotificationResponse`
    - Create notification (by ADMIN)
  - `getAllNotifications() → List<NotificationResponse>` (ADMIN)
  - `getNotificationsForUser(UUID userId) → List<NotificationResponse>`
  - `getNotificationById(UUID) → NotificationResponse`
  - `markAsRead(UUID notificationId) → NotificationResponse`
  - `deleteNotification(UUID) → void`

---

### 3.9 Address Services

#### **AddressService** (Interface)
- **Impl**: `AddressServiceImpl`
- **Key Methods**:
  - `createAddress(AddressRequest) → AddressResponse`
  - `getAllAddresses() → List<AddressResponse>` (ADMIN)
  - `getAddressesForUser(UUID userId) → List<AddressResponse>`
  - `getAddressById(UUID) → AddressResponse`
  - `updateAddress(UUID, AddressRequest) → AddressResponse`
  - `deleteAddress(UUID) → void`

---

### 3.10 Audit Log Services

#### **AuditLogService** (Interface)
- **Impl**: `AuditLogServiceImpl`
- **Key Methods**:
  - `createAuditLog(AuditLogRequest) → AuditLogResponse`
  - `getAllAuditLogs() → List<AuditLogResponse>` (ADMIN)
  - `getAuditLogById(UUID) → AuditLogResponse` (ADMIN)
  - Automatic logging of entity changes (in interceptors/listeners)

---

### 3.11 File Upload Services

#### **FileUploadService** (Interface)
- **Impl**: `FileUploadServiceImpl`
- **Key Methods**:
  - `uploadImage(MultipartFile) → FileUploadResponse`
    - Upload to Cloudinary
    - Return: public URL, secure URL, asset ID
  - `uploadVideo(MultipartFile) → FileUploadResponse`
    - Upload to Cloudinary
  - `deleteFile(String publicId) → void`
    - Delete from Cloudinary using public ID

**Cloudinary Integration**:
- Cloud storage for all media
- Automatic transformations (resize, optimize)
- CDN delivery
- Asset IDs for future deletion

---

### 3.12 AI Services (Planned)

#### **ProductIngestionService** (Service)
- **Purpose**: Ingest product data into vector database for RAG
- **Status**: Implementation ready, awaiting vector DB setup
- **Methods**:
  - `ingestProduct(Product) → void`
    - Convert product to vector embeddings
    - Store in vector database
  - `searchSimilarProducts(String query, int limit) → List<Product>`
    - Query vector database for semantic similarity

---

## 4. Repositories & Data Access

### Overview
- **Type**: Spring Data JPA
- **Pagination**: Supported (PagingAndSortingRepository)
- **Custom Queries**: JPQL and native SQL
- **Total Repositories**: 18

---

### 4.1 Repository List

1. **OrderRepository**
   - Custom queries for order search by user, status, date range

2. **OrderItemRepository**
   - Find items by order

3. **ProductRepository**
   - Search by keyword, category, seller
   - Filter by price range, status
   - Dynamic sort (name, price, createdAt)

4. **ProductVariantRepository**
   - Find by product
   - Find by SKU (unique)
   - Stock queries

5. **ProductImageRepository**
   - Find by product
   - Delete by product

6. **UserRepository**
   - Find by email (unique)
   - Find by role

7. **CategoryRepository**
   - Find by name
   - Find by parent category

8. **CartRepository**
   - Find by user

9. **CartItemRepository**
   - Find by cart
   - Find by product variant

10. **ReviewRepository**
    - Find by product
    - Find by user
    - Average rating queries

11. **CouponRepository**
    - Find by code (unique)
    - Find active coupons
    - Find within date range

12. **CouponUsageRepository**
    - Find by coupon, user, order
    - Usage count queries

13. **PaymentRepository**
    - Find by order
    - Find by transaction ID
    - Find by status

14. **AddressRepository**
    - Find by user
    - Find default address

15. **NotificationRepository**
    - Find by user
    - Find unread notifications

16. **AuditLogRepository**
    - Find by user, entity type, entity ID
    - Date range queries

17. **WishlistRepository**
    - Find by user
    - Find by product
    - Delete by user+product

18. **InvoiceRepository**
    - Find by order

---

## 5. Configuration & Security

### 5.1 Security Configuration

#### **SecurityConfig** (`config/SecurityConfig.java`)
- **Type**: Spring Security Configuration
- **Features**:
  - CORS enabled (localhost:5173, localhost:3000)
  - CSRF disabled (stateless API)
  - Session: STATELESS
  - Method-level security: @PreAuthorize
  - JWT authentication filter

**CORS Configuration**:
```java
allowedOrigins: [
  "http://localhost:5173",   // Vite dev
  "http://localhost:3000",   // React dev
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
  // Add production URLs: "https://your-frontend.com"
]
allowedMethods: GET, POST, PUT, DELETE, PATCH, OPTIONS
allowedHeaders: * (all)
allowCredentials: true
maxAge: 3600s
```

**Public Endpoints** (no authentication required):
- `/api/v1/auth/**` - Register, login
- `/api/v1/search/**` - Global search
- `/api/v1/products/**` - View products (read-only)
- `/api/v1/categories/**` - View categories
- `/api/v1/chatbot/**` - Chatbot (public)
- `/api/v1/health` - Health check
- `/api/v1/webhooks/**` - Webhook (signature verified)

---

#### **JwtAuthenticationFilter** (`config/JwtAuthenticationFilter.java`)
- **Type**: OncePerRequestFilter
- **Functionality**:
  1. Extract JWT from `Authorization: Bearer <token>` header
  2. Extract subject (user ID) and role from token
  3. Validate token signature and expiration
  4. Set SecurityContext with Authentication
  5. Continue filter chain

**Token Structure**:
```java
Claims:
  - subject: UUID (user ID)
  - role: String (ROLE_USER, ROLE_SELLER, ROLE_ADMIN)
  - issuedAt: Date
  - expiration: Date
  - signature: HS256
```

---

#### **JwtUtil** (`util/JwtUtil.java`)
- **Library**: JJWT 0.12.6 (Java JWT)
- **Signing Algorithm**: HS256
- **Key Size**: 256-bit (from application properties)
- **Methods**:
  - `generateToken(String subject, Role role) → String`
  - `extractSubject(String token) → String`
  - `extractRole(String token) → String`
  - `isTokenValid(String token, String expectedSubject) → boolean`
  - `extractClaims(String token) → Claims`

**Configuration**:
```properties
app.jwt.secret = <base64-encoded-256-bit-key>
app.jwt.expiration = 86400000  # 24 hours (milliseconds)
```

---

### 5.2 Exception Handling

#### **GlobalExceptionHandler** (`exception/GlobalExceptionHandler.java`)
- **Type**: @RestControllerAdvice
- **Handlers**:

| Exception | HTTP Status | Response |
|-----------|-------------|----------|
| ResourceNotFoundException | 404 | ApiResponse{success:false, message} |
| BadRequestException | 400 | ApiResponse{success:false, message} |
| MethodArgumentNotValidException | 400 | ApiResponse{success:false, errors: Map} |
| ConstraintViolationException | 400 | ApiResponse{success:false, message} |
| JwtException | 401 | ApiResponse{success:false, message: "Invalid/expired JWT"} |
| Exception (generic) | 500 | ApiResponse{success:false, message: "Unexpected error"} |

**Response Format**:
```java
ApiResponse<Object> {
  success: false,
  message: "Error description",
  data: null or error map
}
```

---

#### **Custom Exception Classes**:

1. **ResourceNotFoundException**
   ```java
   throw new ResourceNotFoundException("Product not found");
   // Returns: 404 + ApiResponse
   ```

2. **BadRequestException**
   ```java
   throw new BadRequestException("Invalid coupon code");
   // Returns: 400 + ApiResponse
   ```

---

### 5.3 Authentication Entry Points

#### **CustomAuthenticationEntryPoint**
- Handles `AuthenticationException` (missing/invalid JWT)
- Returns: 401 Unauthorized + ApiResponse

#### **CustomAccessDeniedHandler**
- Handles `AccessDeniedException` (insufficient permissions)
- Returns: 403 Forbidden + ApiResponse

#### **SecurityUserDetailsService**
- Loads user by username (user ID) from database
- Returns: UserDetails with authorities

---

### 5.4 Cloudinary Configuration

#### **CloudinaryConfig** (`config/CloudinaryConfig.java`)
- **Bean**: Cloudinary client
- **Properties**:
  ```properties
  cloudinary.cloud-name = <your-cloud-name>
  cloudinary.api-key = <your-api-key>
  cloudinary.api-secret = <your-api-secret>
  ```
- **Usage**: Injected into FileUploadService
- **Features**: 
  - Image optimization and resizing
  - CDN delivery
  - Asset management

---

### 5.5 Application Configuration

#### **ApplicationConfig**
- General application-level configuration
- Spring Data configuration
- Transaction management

---

## 6. External Integrations

### 6.1 SePay Payment Gateway Integration

**Purpose**: Enable Vietnamese bank transfer payments

**Integration Points**:
1. **PaymentController** - Checkout initiation
2. **PaymentService** - Payment status queries
3. **SepayService** - Webhook processing, transaction verification
4. **WebhookController** - Receive payment callbacks

**Workflow**:
1. User initiates checkout with order ID
2. Backend creates Payment record (status: PENDING)
3. SePay API called to get checkout URL
4. User redirected to SePay (external)
5. User completes payment via bank transfer
6. SePay sends webhook: POST `/api/v1/webhooks/sepay/callback`
7. Backend verifies webhook signature (HMAC-SHA256)
8. Backend updates Order and Payment status
9. User redirected back to frontend success page

**Security**:
- Webhook signature verification: X-SePay-Signature header
- Prevents duplicate processing: Check transactionId in database
- Timestamp validation: X-SePay-Timestamp header

**Order Code Format**:
```java
orderCode = "DH" + String.format("%08d", System.currentTimeMillis() % 100_000_000L)
// Example: DH12345678
// Used as SePay reference for reconciliation
```

**Webhook Headers**:
```
X-SePay-Signature: sha256={hex_hash}
X-SePay-Timestamp: {unix_timestamp}
// Signature validates: {timestamp}.{raw_body}
```

---

### 6.2 Cloudinary Image CDN Integration

**Purpose**: Cloud storage and optimization for product images, avatars

**Integration Points**:
1. **FileUploadController** - Upload image/video
2. **FileUploadService** - Cloudinary SDK calls
3. **ProductController** - Product image management

**Endpoints**:
- POST `/api/v1/upload/image` - Upload product image
- POST `/api/v1/upload/video` - Upload product video

**Response**:
```java
FileUploadResponse {
  publicUrl: String,       // CDN URL
  secureUrl: String,       // HTTPS CDN URL
  assetId: String,         // Cloudinary public_id
  width: Integer,          // Image width
  height: Integer,         // Image height
  format: String,          // jpg, png, etc.
}
```

**Features**:
- Automatic image optimization
- Responsive image transformations
- CDN caching and delivery
- Asset deletion by public_id

---

### 6.3 Google Gemini AI Integration (Spring AI)

**Purpose**: AI chatbot with RAG (Retrieval-Augmented Generation) and Function Calling

**Status**: COMMENTED OUT (ready for activation)

**Implementation Details** (`config/AiConfig.java`, `config/AiFunctionConfig.java`):
- **VectorStore**: SimpleVectorStore with embedding model
- **EmbeddingModel**: Google Gemini embeddings
- **Language Model**: Spring AI ChatClient for Gemini
- **Functions** (for function calling):
  1. `getOrderStatus(orderId)` - Query order status
  2. `searchProducts(query)` - Search products
  3. `getMyRecentOrders()` - Get user's orders

**Activation Steps**:
1. Uncomment `AiConfig` and `AiFunctionConfig`
2. Uncomment `ChatbotController`
3. Add Google Gemini API key to application.properties
4. Ingest product data into vector store via `ProductIngestionService`
5. Enable in SecurityConfig: `/api/v1/chatbot/**`

**Workflow** (when activated):
1. User sends message to `/api/v1/chatbot/chat?message=...`
2. Spring AI sends query to Gemini with context
3. Gemini may invoke function calls (getOrderStatus, searchProducts, etc.)
4. Backend executes functions and returns results
5. Gemini generates response based on RAG + function results
6. Response returned to user

---

## 7. DTOs & Data Transfer Objects

### Overview
- **Total DTOs**: 48+
- **Purpose**: Request/response data transfer, input validation
- **Validation**: Jakarta validation annotations (@NotNull, @Email, etc.)
- **Mapping**: MapStruct for entity ↔ DTO conversion

---

### 7.1 Authentication DTOs

#### **AuthLoginRequest**
```java
{
  email: String,        // @NotEmpty, @Email
  password: String      // @NotEmpty, @Size(min=6)
}
```

#### **AuthRegisterRequest**
```java
{
  email: String,        // @NotEmpty, @Email, unique check
  password: String,     // @NotEmpty, @Size(min=8)
  fullName: String      // @NotEmpty
}
```

#### **AuthResponse**
```java
{
  accessToken: String,  // JWT token
  user: UserResponse
}
```

#### **UserResponse**
```java
{
  id: UUID,
  email: String,
  fullName: String,
  role: String,
  avatarUrl: String,
  createdAt: LocalDateTime
}
```

---

### 7.2 Product DTOs

#### **ProductRequest**
```java
{
  name: String,              // @NotEmpty, length ≤ 200
  description: String,
  categoryId: UUID,          // @NotNull
  status: ProductStatus,     // ACTIVE, INACTIVE
  sellerId: UUID             // Optional (ADMIN only)
}
```

#### **ProductResponse**
```java
{
  id: UUID,
  name: String,
  description: String,
  category: CategoryResponse,
  seller: UserResponse,
  status: String,
  images: List<ProductImageResponse>,
  variants: List<ProductVariantResponse>,
  avgRating: Double,
  reviewCount: Integer,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime
}
```

#### **ProductVariantResponse**
```java
{
  id: UUID,
  sku: String,
  price: BigDecimal,
  stock: Integer,
  attributes: Map<String, Object>  // Size, color, etc.
}
```

#### **FileUploadResponse**
```java
{
  publicUrl: String,
  secureUrl: String,
  assetId: String,
  width: Integer,
  height: Integer,
  format: String
}
```

---

### 7.3 Order DTOs

#### **OrderRequest**
```java
{
  addressId: UUID,                    // @NotNull
  items: List<OrderItemRequest>,      // @NotEmpty
  couponCode: String,                 // Optional
  paymentMethod: PaymentMethod        // @NotNull
}
```

#### **OrderItemRequest**
```java
{
  productVariantId: UUID,             // @NotNull
  quantity: Integer                   // @NotNull, @Min(1)
}
```

#### **OrderResponse**
```java
{
  id: UUID,
  orderCode: String,
  status: String,                     // PENDING, CONFIRMED, etc.
  paymentStatus: String,              // PENDING, PAID, FAILED
  items: List<OrderItemResponse>,
  totalAmount: BigDecimal,
  subTotal: BigDecimal,
  discountAmount: BigDecimal,
  couponCode: String,
  address: AddressResponse,
  createdAt: LocalDateTime
}
```

#### **OrderItemResponse**
```java
{
  id: UUID,
  productName: String,
  sku: String,
  price: BigDecimal,
  quantity: Integer,
  subtotal: BigDecimal
}
```

---

### 7.4 Cart DTOs

#### **AddCartItemRequest**
```java
{
  productVariantId: UUID,             // @NotNull
  quantity: Integer                   // @NotNull, @Min(1)
}
```

#### **UpdateCartItemRequest**
```java
{
  quantity: Integer                   // @NotNull, @Min(1)
}
```

#### **CartResponse**
```java
{
  id: UUID,
  items: List<CartItemResponse>,
  totalItems: Integer,
  totalPrice: BigDecimal,
  createdAt: LocalDateTime
}
```

#### **CartItemResponse**
```java
{
  id: UUID,
  variant: ProductVariantResponse,
  quantity: Integer,
  subtotal: BigDecimal
}
```

---

### 7.5 Payment DTOs

#### **SepayCheckoutRequest**
```java
{
  orderId: UUID                       // @NotNull
}
```

#### **PaymentResponse**
```java
{
  id: UUID,
  orderId: UUID,
  status: String,
  method: String,
  amount: BigDecimal,
  transactionId: String,
  paidAt: LocalDateTime
}
```

#### **SepayWebhookRequest**
```java
{
  // SePay callback payload fields
  transactionId: String,
  orderCode: String,
  amount: BigDecimal,
  status: String,
  timestamp: Long
}
```

#### **SepayTransactionStatusResponse**
```java
{
  transactionId: String,
  status: String,              // SUCCESS, FAILED, PENDING
  amount: BigDecimal,
  timestamp: LocalDateTime
}
```

---

### 7.6 Coupon DTOs

#### **CouponRequest**
```java
{
  code: String,                       // @NotEmpty, unique
  discountType: String,               // PERCENTAGE or FIXED
  discountValue: BigDecimal,          // @NotNull
  minOrderValue: BigDecimal,          // Optional
  maxDiscount: BigDecimal,            // Optional
  startDate: LocalDateTime,
  endDate: LocalDateTime,
  usageLimit: Integer,
  isActive: Boolean
}
```

#### **CouponResponse**
```java
{
  id: UUID,
  code: String,
  discountType: String,
  discountValue: BigDecimal,
  minOrderValue: BigDecimal,
  maxDiscount: BigDecimal,
  startDate: LocalDateTime,
  endDate: LocalDateTime,
  usageLimit: Integer,
  currentUsage: Integer,
  isActive: Boolean,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime
}
```

#### **CouponCalculationResponse**
```java
{
  isValid: Boolean,
  discountAmount: BigDecimal,
  finalAmount: BigDecimal,
  message: String                    // Validation error message
}
```

#### **ApplyCouponRequest**
```java
{
  couponCode: String                  // @NotEmpty
}
```

---

### 7.7 Review DTOs

#### **ReviewRequest**
```java
{
  productId: UUID,                    // @NotNull
  rating: Integer,                    // @NotNull, @Min(1), @Max(5)
  comment: String                     // Optional
}
```

#### **ReviewResponse**
```java
{
  id: UUID,
  product: ProductResponse,
  user: UserResponse,
  rating: Integer,
  comment: String,
  createdAt: LocalDateTime
}
```

---

### 7.8 Wishlist DTOs

#### **WishlistRequest**
```java
{
  productId: UUID,                    // @NotNull
  userId: UUID                        // Will be overridden from JWT
}
```

#### **WishlistResponse**
```java
{
  id: UUID,
  product: ProductResponse,
  user: UserResponse,
  createdAt: LocalDateTime
}
```

---

### 7.9 Address DTOs

#### **AddressRequest**
```java
{
  recipientName: String,              // @NotEmpty(100)
  recipientPhone: String,             // @NotEmpty(20)
  street: String,                     // @NotEmpty(255)
  ward: String,                       // @NotEmpty(100)
  district: String,                   // @NotEmpty(100)
  province: String,                   // @NotEmpty(100)
  postalCode: String,                 // Optional(20)
  country: String,                    // @NotEmpty(100)
  isDefault: Boolean,
  addressType: String,                // HOME, OFFICE, OTHER
  userId: UUID                        // Will be set from JWT
}
```

#### **AddressResponse**
```java
{
  id: UUID,
  recipientName: String,
  recipientPhone: String,
  street: String,
  ward: String,
  district: String,
  province: String,
  postalCode: String,
  country: String,
  isDefault: Boolean,
  addressType: String,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime
}
```

---

### 7.10 Notification DTOs

#### **NotificationRequest**
```java
{
  userId: UUID,                       // @NotNull
  title: String,                      // @NotEmpty(200)
  message: String,                    // @NotEmpty
  type: String,                       // ORDER, PAYMENT, PRODUCT
  relatedEntityType: String,
  relatedEntityId: UUID
}
```

#### **NotificationResponse**
```java
{
  id: UUID,
  user: UserResponse,
  title: String,
  message: String,
  type: String,
  relatedEntityType: String,
  relatedEntityId: UUID,
  isRead: Boolean,
  isSent: Boolean,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime
}
```

---

### 7.11 Category DTOs

#### **CategoryRequest**
```java
{
  name: String,                       // @NotEmpty(100)
  description: String,
  parentCategoryId: UUID              // Optional (self-reference)
}
```

#### **CategoryResponse**
```java
{
  id: UUID,
  name: String,
  description: String,
  parentCategory: CategoryResponse,   // Nested
  createdAt: LocalDateTime
}
```

---

### 7.12 Audit Log DTOs

#### **AuditLogRequest**
```java
{
  userId: UUID,                       // Optional
  action: String,                     // CREATE, UPDATE, DELETE
  entityType: String,                 // @NotEmpty(100)
  entityId: UUID,
  oldValue: String,
  newValue: String,
  ipAddress: String
}
```

#### **AuditLogResponse**
```java
{
  id: UUID,
  user: UserResponse,
  action: String,
  entityType: String,
  entityId: UUID,
  oldValue: String,
  newValue: String,
  ipAddress: String,
  createdAt: LocalDateTime
}
```

---

### 7.13 Dashboard DTOs

#### **DashboardResponse**
```java
{
  totalOrders: Long,
  totalRevenue: BigDecimal,
  totalUsers: Long,
  totalProducts: Long,
  ordersByStatus: Map<String, Long>,     // Status → count
  revenueByMonth: Map<String, BigDecimal> // Month → revenue
}
```

#### **RevenueResponse**
```java
{
  totalRevenue: BigDecimal,
  revenueByMonth: Map<String, BigDecimal>,
  revenueByYear: Map<String, BigDecimal>,
  period: String                         // YEARLY, MONTHLY, QUARTERLY
}
```

#### **TopProductResponse**
```java
{
  id: UUID,
  name: String,
  unitsSold: Long,
  revenue: BigDecimal,
  rating: Double
}
```

#### **AdminOrderResponse**
```java
{
  id: UUID,
  orderCode: String,
  user: UserResponse,
  status: String,
  totalAmount: BigDecimal,
  paymentStatus: String,
  createdAt: LocalDateTime
}
```

---

### 7.14 User & Password DTOs

#### **UserRequest**
```java
{
  email: String,                      // @Email
  fullName: String                    // @NotEmpty
}
```

#### **ChangePasswordRequest**
```java
{
  oldPassword: String,                // @NotEmpty
  newPassword: String,                // @NotEmpty, @Size(min=8)
  confirmPassword: String             // @NotEmpty
}
```

---

### 7.15 Common DTOs

#### **ApiResponse<T>** (Generic Wrapper)
```java
{
  success: Boolean,
  message: String,
  data: T                             // Generic type parameter
}
```

---

## 8. Mappers & Type Conversion

### Overview
- **Library**: MapStruct
- **Total Mappers**: 11
- **Pattern**: Interface-based mapping with generated implementations
- **Configuration**: Component-scoped beans

---

### 8.1 Mapper List

1. **ProductMapper**
   - Product ↔ ProductResponse
   - ProductVariant ↔ ProductVariantResponse
   - ProductImage ↔ FileUploadResponse

2. **UserMapper**
   - User ↔ UserResponse

3. **OrderMapper**
   - Order ↔ OrderResponse
   - OrderItem ↔ OrderItemResponse

4. **CategoryMapper**
   - Category ↔ CategoryResponse

5. **ReviewMapper**
   - Review ↔ ReviewResponse

6. **WishlistMapper**
   - Wishlist ↔ WishlistResponse

7. **CartMapper**
   - Cart ↔ CartResponse
   - CartItem ↔ CartItemResponse

8. **AddressMapper**
   - Address ↔ AddressResponse

9. **CouponMapper**
   - Coupon ↔ CouponResponse

10. **AuditLogMapper**
    - AuditLog ↔ AuditLogResponse

11. **NotificationMapper**
    - Notification ↔ NotificationResponse

---

### 8.2 Mapper Usage Pattern

```java
@Mapper(componentModel = "spring")
public interface ProductMapper {
  
  ProductResponse toResponse(Product entity);
  Product toEntity(ProductRequest request);
  List<ProductResponse> toResponseList(List<Product> entities);
  
  // Custom mappings with @Mapping
  @Mapping(target = "categoryName", source = "category.name")
  ProductResponse toResponseWithCategory(Product entity);
}
```

---

## 9. Exception Handling

### 9.1 Custom Exception Classes

#### **ResourceNotFoundException**
```java
public class ResourceNotFoundException extends RuntimeException {
  public ResourceNotFoundException(String message) {
    super(message);
  }
}
```
- **HTTP Status**: 404 Not Found
- **Usage**: Entity not found by ID
- **Example**: `throw new ResourceNotFoundException("Product not found")`

---

#### **BadRequestException**
```java
public class BadRequestException extends RuntimeException {
  public BadRequestException(String message) {
    super(message);
  }
}
```
- **HTTP Status**: 400 Bad Request
- **Usage**: Invalid input, validation failure
- **Example**: `throw new BadRequestException("Invalid coupon code")`

---

### 9.2 Exception Handler Mappings

| Exception | HTTP Status | Handler | Response |
|-----------|-------------|---------|----------|
| ResourceNotFoundException | 404 | GlobalExceptionHandler | ApiResponse{success:false, message} |
| BadRequestException | 400 | GlobalExceptionHandler | ApiResponse{success:false, message} |
| MethodArgumentNotValidException | 400 | GlobalExceptionHandler | ApiResponse{success:false, data: fieldErrors} |
| ConstraintViolationException | 400 | GlobalExceptionHandler | ApiResponse{success:false, message} |
| JwtException | 401 | GlobalExceptionHandler | ApiResponse{success:false, message: "Invalid/expired JWT"} |
| AccessDeniedException | 403 | CustomAccessDeniedHandler | ApiResponse{success:false, message: "Access denied"} |
| AuthenticationException | 401 | CustomAuthenticationEntryPoint | ApiResponse{success:false, message: "Unauthorized"} |
| Exception (generic) | 500 | GlobalExceptionHandler | ApiResponse{success:false, message: "Unexpected error"} |

---

### 9.3 Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email should be valid",
    "password": "Password must be at least 8 characters",
    "fullName": "Full name is required"
  }
}
```

---

## 10. Enums & Constants

### 10.1 Enums

#### **OrderStatus**
```java
public enum OrderStatus {
  PENDING,       // Initial state
  CONFIRMED,     // Payment confirmed
  PROCESSING,    // Being prepared
  SHIPPED,       // On the way
  DELIVERED,     // Completed
  CANCELLED      // Cancelled by user or system
}
```

**State Transitions**:
- PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- PENDING/CONFIRMED → CANCELLED (reversible until confirmed payment)

---

#### **PaymentStatus**
```java
public enum PaymentStatus {
  PENDING,       // Awaiting payment
  PAID,          // Payment received
  FAILED,        // Payment failed
  REFUNDED,      // Refund processed
  CANCELLED      // Payment cancelled
}
```

**Transitions**:
- PENDING → PAID (via SePay webhook)
- PENDING → FAILED (payment gateway error)
- PAID → REFUNDED (refund request)

---

#### **PaymentMethod**
```java
public enum PaymentMethod {
  COD,           // Cash on delivery
  BANK_TRANSFER, // Direct bank transfer
  CREDIT_CARD,   // Credit card
  DEBIT_CARD,    // Debit card
  E_WALLET,      // E-wallet (Zalopay, MoMo)
  SEPAY          // SePay payment gateway
}
```

---

#### **ProductStatus**
```java
public enum ProductStatus {
  ACTIVE,        // Product available for sale
  INACTIVE       // Product not available
}
```

---

#### **Role**
```java
public enum Role {
  USER,          // Customer
  SELLER,        // Seller/vendor
  ADMIN          // Administrator
}
```

---

### 10.2 Application Properties

```properties
# JWT Configuration
app.jwt.secret=<base64-256-bit-secret-key>
app.jwt.expiration=86400000  # 24 hours

# Cloudinary Configuration
cloudinary.cloud-name=<cloud-name>
cloudinary.api-key=<api-key>
cloudinary.api-secret=<api-secret>

# SePay Configuration
sepay.api-key=<api-key>
sepay.api-url=https://sandbox.sepay.vn  # or production URL
sepay.webhook-secret=<webhook-secret>

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db
spring.datasource.username=root
spring.datasource.password=<password>

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Logging
logging.level.com.webtechnology.ecommerce=DEBUG
logging.level.org.springframework.security=DEBUG

# Server
server.port=8080
```

---

## Summary Table: Component Inventory

| Component Type | Count | Examples |
|---|---|---|
| Controllers | 20 | AuthController, ProductController, OrderController, etc. |
| Service Interfaces | 20+ | OrderService, ProductService, UserService, etc. |
| Service Implementations | 20+ | OrderServiceImpl, ProductServiceImpl, etc. |
| Repositories | 18 | OrderRepository, ProductRepository, UserRepository, etc. |
| Entities | 20+ | User, Product, Order, Cart, Review, etc. |
| DTOs | 48+ | ProductRequest, OrderResponse, etc. |
| Mappers | 11 | ProductMapper, UserMapper, OrderMapper, etc. |
| Configurations | 9 | SecurityConfig, JwtAuthenticationFilter, CloudinaryConfig, etc. |
| Enums | 5 | OrderStatus, PaymentStatus, PaymentMethod, ProductStatus, Role |
| Exception Classes | 3 | ResourceNotFoundException, BadRequestException, GlobalExceptionHandler |
| Utilities | 1 | JwtUtil |
| **TOTAL** | **~200+** | |

---

## API Endpoint Summary

| Domain | Total Endpoints | Read | Create | Update | Delete |
|--------|---|---|---|---|---|
| Authentication | 3 | 1 | 2 | - | - |
| User Management | 6 | 4 | 1 | 1 | - |
| Products | 8 | 5 | 1 | 1 | 1 |
| Categories | 5 | 2 | 1 | 1 | 1 |
| Cart | 5 | 1 | 2 | 1 | 2 |
| Orders | 5 | 3 | 1 | 1 | - |
| Payments | 3 | 2 | 1 | - | - |
| Admin | 5 | 4 | - | 1 | - |
| Seller | 3 | 3 | - | - | - |
| Reviews | 5 | 2 | 1 | 1 | 1 |
| Wishlists | 4 | 2 | 1 | - | 1 |
| Coupons | 5 | 2 | 1 | 1 | 1 |
| Addresses | 6 | 3 | 1 | 1 | 1 |
| Notifications | 6 | 3 | 1 | 1 | 1 |
| Audit Logs | 3 | 3 | 1 | - | - |
| File Upload | 2 | - | 2 | - | - |
| Webhooks | 1 | - | 1 | - | - |
| Public Search | 1 | 1 | - | - | - |
| System Health | 2 | 2 | - | - | - |
| **TOTAL** | **~93** | ~50 | ~22 | ~10 | ~11 |

---

## Authentication & Authorization Matrix

| Endpoint | Public | ROLE_USER | ROLE_SELLER | ROLE_ADMIN | Notes |
|---|---|---|---|---|---|
| POST /auth/register | ✓ | - | - | - | Public registration |
| POST /auth/login | ✓ | - | - | - | Public login |
| GET /products | ✓ | ✓ | ✓ | ✓ | Public read |
| POST /products | - | - | ✓ | ✓ | Create own products (seller) or any (admin) |
| PUT /products/{id} | - | - | ✓ | ✓ | Seller: own only; Admin: any |
| DELETE /products/{id} | - | - | ✓ | ✓ | Seller: own only; Admin: any |
| POST /orders | - | ✓ | ✓ | ✓ | Authenticated users |
| GET /orders | - | ✓ | ✓ | ✓ | User: own; Admin: all |
| GET /admin/dashboard | - | - | - | ✓ | Admin only |
| GET /seller/dashboard | - | - | ✓ | - | Seller only |
| POST /webhooks/sepay/callback | ✓ | - | - | - | Signature verified |

---

## Data Flow & Integration Diagram

```
Frontend (React/Vite)
    ↓
    ↓ [HTTP REST API]
    ↓
┌─────────────────────────────────────┐
│    API Gateway / Security Layer     │
│  - CORS validation                  │
│  - JWT authentication               │
│  - Role-based authorization         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│     REST Controllers (20)           │
│  - Route HTTP requests              │
│  - Parse DTOs                       │
│  - Validate input                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│     Services (20+)                  │
│  - Business logic                   │
│  - Entity processing                │
│  - External integrations            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│     Repositories (18)               │
│  - Database queries                 │
│  - JPA persistence                  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│     Database (MySQL)                │
│  - 20+ tables                       │
│  - Soft deletes (Product, Variant)  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  External Integrations              │
│  - Cloudinary (CDN)                 │
│  - SePay (Payments)                 │
│  - Google Gemini (AI RAG)           │
└─────────────────────────────────────┘
```

---

## Key Architecture Decisions

1. **Layered Architecture**: Controllers → Services → Repositories → Database
2. **JWT Authentication**: Stateless, token-based auth with 24-hour expiry
3. **Soft Deletes**: Products and variants use logical deletion
4. **Entity Snapshots**: OrderItem stores product name and price at purchase time
5. **Role-Based Access**: @PreAuthorize for method-level security
6. **Generic API Response**: All endpoints wrap response in ApiResponse<T>
7. **Exception Handling**: Centralized @RestControllerAdvice
8. **DTO Mapping**: MapStruct for entity ↔ DTO conversion
9. **Transactional Services**: @Transactional on service methods
10. **Cloud Storage**: Cloudinary for images/videos (CDN)

---

## Deployment Considerations

1. **Database**: MySQL 8.0+
2. **Java**: 17+
3. **Spring Boot**: 3.5.0
4. **Environment Variables**:
   - Database credentials
   - JWT secret key (base64-encoded)
   - Cloudinary credentials
   - SePay API key and webhook secret
   - Google Gemini API key (for AI features)
5. **Docker**: Containerization ready (Dockerfile provided)
6. **CORS**: Configure production frontend URL in SecurityConfig

---

**End of Document**

Generated: May 31, 2026  
E-Commerce Platform Backend - Comprehensive Technical Inventory  
File: BACKEND_CODEBASE_EXPLORATION.md
