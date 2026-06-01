# E-Commerce Backend - Quick Reference Guide

## Project Overview
- **Name**: Web-IT4409-20252 (HUST Web Technologies Course)
- **Type**: Full-stack e-commerce platform
- **Backend**: Spring Boot 3.5.0, Java 17, MySQL
- **Frontend**: React 19.2.4, Vite, Tailwind CSS

---

## Architecture Layers

### 1. API Layer (REST Controllers)
- **20 Controllers** handling HTTP requests
- **93 REST endpoints** (GET, POST, PUT, DELETE)
- Base path: `/api/v1`
- Authentication: JWT Bearer token

### 2. Business Logic (Services)
- **20+ Services** with interface-implementation pattern
- Transaction management (@Transactional)
- Coupon validation, order creation, payment processing, etc.

### 3. Data Access (Repositories)
- **18 JPA Repositories** for database operations
- Custom query methods for complex searches
- Soft delete support for Product and ProductVariant

### 4. Data Models (Entities)
- **20+ JPA Entities** mapping to database tables
- Relationships: OneToMany, ManyToOne, ManyToMany
- Soft deletes for Product and ProductVariant

### 5. Data Transfer (DTOs)
- **48+ DTOs** for request/response
- Input validation with Jakarta annotations
- Mapped from/to entities via MapStruct

---

## Key Components

### Authentication & Security
| Component | Purpose |
|-----------|---------|
| **AuthController** | Register, login (returns JWT) |
| **JwtAuthenticationFilter** | Extract and validate JWT from every request |
| **JwtUtil** | Generate/validate tokens, extract claims |
| **SecurityConfig** | Spring Security configuration, CORS, authorization |
| **CustomAuthenticationEntryPoint** | Handle 401 Unauthorized |
| **CustomAccessDeniedHandler** | Handle 403 Forbidden |

### Product Management
| Component | Purpose |
|-----------|---------|
| **ProductController** | CRUD operations, search, filter |
| **ProductService** | Product creation, updates, soft deletes |
| **CategoryService** | Category management (hierarchical) |
| **ProductRepository** | Dynamic product queries |
| **ProductVariantRepository** | Variant management (soft delete) |

### Order Processing
| Component | Purpose |
|-----------|---------|
| **OrderController** | Create order, track status, cancel |
| **OrderService** | Order creation workflow, stock management |
| **CartService** | Shopping cart operations |
| **CouponService** | Coupon validation and discount calculation |
| **OrderRepository** | Order search by user, status, date |

### Payment Integration
| Component | Purpose |
|-----------|---------|
| **PaymentController** | Payment checkout, status queries |
| **PaymentService** | Payment record management |
| **SepayService** | SePay webhook verification and processing |
| **WebhookController** | Receive payment callbacks from SePay |
| **PaymentRepository** | Payment record queries by order, transaction ID |

### Dashboard & Analytics
| Component | Purpose |
|-----------|---------|
| **AdminController** | Dashboard, revenue, top products |
| **AdminService** | Analytics calculations (yearly, monthly, quarterly) |
| **SellerController** | Seller-specific orders and dashboard |
| **SellerService** | Seller metrics and product performance |

### File Management
| Component | Purpose |
|-----------|---------|
| **FileUploadController** | Upload image/video endpoints |
| **FileUploadService** | Cloudinary integration for CDN storage |
| **CloudinaryConfig** | Cloudinary client configuration |

---

## Database Schema (20+ Tables)

### User & Role
- `users` - User accounts (email, password, role, avatar)
- `roles` - Role definitions (USER, SELLER, ADMIN)

### Products
- `products` - Product catalog (soft delete enabled)
- `product_variants` - Product variants with SKU, price, stock
- `product_images` - Product images (Cloudinary URLs)
- `categories` - Product categories (hierarchical with parent_id)

### Orders & Payments
- `orders` - Customer orders (status, payment status)
- `order_items` - Line items per order (price snapshot)
- `payments` - Payment records (method, transaction ID, status)

### Shopping
- `carts` - Shopping carts (one per user)
- `cart_items` - Items in cart (product variant + quantity)

### Reviews & Wishlist
- `reviews` - Product reviews (rating, comment)
- `wishlists` - Wishlist items (user + product)

### Promotions
- `coupons` - Discount codes (percentage or fixed amount)
- `coupon_usage` - Coupon usage tracking

### Addresses & Location
- `addresses` - Delivery/billing addresses (user + details)

### Notifications
- `notifications` - User notifications (title, message, type)

### Audit & Logging
- `audit_logs` - System changes (user, action, entity, old/new value)

### Invoicing (Optional)
- `invoices` - Generated receipts
- `invoice_items` - Invoice line items

---

## API Endpoint Summary by Domain

### 🔐 Authentication (3 endpoints)
```
POST   /api/v1/auth/register       - Register new user
POST   /api/v1/auth/login          - Login (returns JWT)
GET    /api/v1/auth/me             - Get current user (authenticated)
```

### 👤 User Management (6 endpoints)
```
GET    /api/v1/users/me            - Get current user profile
PUT    /api/v1/users/me            - Update profile
POST   /api/v1/users/me/avatar     - Upload avatar
PUT    /api/v1/users/me/password   - Change password
GET    /api/v1/users              - List all users (ADMIN)
GET    /api/v1/users/{id}         - Get user by ID (ADMIN)
```

### 📦 Products (8 endpoints)
```
GET    /api/v1/products            - List all products
POST   /api/v1/products            - Create product (ADMIN, SELLER)
GET    /api/v1/products/search     - Search with filters
GET    /api/v1/products/filter     - Filter products
GET    /api/v1/products/{id}       - Get product details
PUT    /api/v1/products/{id}       - Update product
DELETE /api/v1/products/{id}       - Delete product (soft delete)
```

### 🏷️ Categories (5 endpoints)
```
GET    /api/v1/categories          - List categories
GET    /api/v1/categories/{id}     - Get category
POST   /api/v1/categories          - Create (ADMIN)
PUT    /api/v1/categories/{id}     - Update (ADMIN)
DELETE /api/v1/categories/{id}     - Delete (ADMIN)
```

### 🛒 Shopping Cart (5 endpoints)
```
GET    /api/v1/cart                - Get cart
POST   /api/v1/cart/items          - Add item
PUT    /api/v1/cart/items/{id}     - Update quantity
DELETE /api/v1/cart/items/{id}     - Remove item
DELETE /api/v1/cart/items          - Clear cart
```

### 📦 Orders (5 endpoints)
```
POST   /api/v1/orders              - Create order
GET    /api/v1/orders              - List user orders
GET    /api/v1/orders/{id}         - Get order details
PUT    /api/v1/orders/{id}/cancel  - Cancel order
GET    /api/v1/orders/{id}/tracking - Track order
```

### 💳 Payments (3 endpoints)
```
POST   /api/v1/payments/sepay/checkout      - Create SePay checkout
GET    /api/v1/payments/orders/{id}/status  - Get payment status
GET    /api/v1/payments/orders/{id}/transaction-status - Get transaction
```

### 📊 Admin Dashboard (5 endpoints)
```
GET    /api/v1/admin/dashboard    - Dashboard metrics (ADMIN)
GET    /api/v1/admin/revenue      - Revenue analytics (ADMIN)
GET    /api/v1/admin/top-products - Top selling products (ADMIN)
GET    /api/v1/admin/orders       - All orders (ADMIN)
PUT    /api/v1/admin/orders/{id}/status - Update order status (ADMIN)
```

### 🏪 Seller Dashboard (3 endpoints)
```
GET    /api/v1/seller/orders        - Seller's orders (SELLER)
GET    /api/v1/seller/orders/{id}   - Order details (SELLER)
GET    /api/v1/seller/dashboard     - Seller dashboard (SELLER)
```

### ⭐ Reviews (5 endpoints)
```
POST   /api/v1/reviews              - Create review
GET    /api/v1/reviews              - List all reviews
GET    /api/v1/reviews/{id}         - Get review
PUT    /api/v1/reviews/{id}         - Update review
DELETE /api/v1/reviews/{id}         - Delete review
```

### ❤️ Wishlist (4 endpoints)
```
POST   /api/v1/wishlists            - Add to wishlist
GET    /api/v1/wishlists            - List all wishlists (ADMIN)
GET    /api/v1/wishlists/my         - My wishlist
DELETE /api/v1/wishlists/{id}       - Remove from wishlist
```

### 🎟️ Coupons (5 endpoints)
```
POST   /api/v1/coupons              - Create (ADMIN)
GET    /api/v1/coupons              - List coupons
GET    /api/v1/coupons/{id}         - Get coupon
PUT    /api/v1/coupons/{id}         - Update (ADMIN)
DELETE /api/v1/coupons/{id}         - Delete (ADMIN)
```

### 📍 Addresses (6 endpoints)
```
POST   /api/v1/addresses            - Create address
GET    /api/v1/addresses            - List all (ADMIN)
GET    /api/v1/addresses/my         - My addresses
GET    /api/v1/addresses/{id}       - Get address
PUT    /api/v1/addresses/{id}       - Update address
DELETE /api/v1/addresses/{id}       - Delete address
```

### 📢 Notifications (6 endpoints)
```
POST   /api/v1/notifications        - Create (ADMIN)
GET    /api/v1/notifications        - List all (ADMIN)
GET    /api/v1/notifications/my     - My notifications
GET    /api/v1/notifications/{id}   - Get notification
PUT    /api/v1/notifications/{id}/read - Mark as read
DELETE /api/v1/notifications/{id}   - Delete notification
```

### 📋 Audit Logs (3 endpoints)
```
POST   /api/v1/audit-logs           - Create log (ADMIN)
GET    /api/v1/audit-logs           - List logs (ADMIN)
GET    /api/v1/audit-logs/{id}      - Get log (ADMIN)
```

### 📤 File Upload (2 endpoints)
```
POST   /api/v1/upload/image         - Upload image
POST   /api/v1/upload/video         - Upload video
```

### 🔗 Webhooks (1 endpoint)
```
POST   /api/v1/webhooks/sepay/callback - SePay payment webhook
```

### 🔍 Public Search (1 endpoint)
```
GET    /api/v1/search               - Global product search
```

### 💚 System Health (2 endpoints)
```
GET    /api/v1/health               - Health check
GET    /api/v1/status               - Server status
```

---

## Authentication & Authorization

### JWT Token
- **Algorithm**: HS256
- **Expiry**: 24 hours
- **Claims**: subject (user ID), role, issuedAt, expiration
- **Header**: `Authorization: Bearer <token>`

### Roles
- **USER** - Customer/shopper
- **SELLER** - Store owner
- **ADMIN** - Administrator

### Public Endpoints (No JWT Required)
- `/api/v1/auth/**` - Register, login
- `/api/v1/products/**` - View products
- `/api/v1/categories/**` - View categories
- `/api/v1/search/**` - Global search
- `/api/v1/health`, `/api/v1/status` - System health

### Protected Endpoints
- `/api/v1/cart/**` - Authenticated users only
- `/api/v1/orders/**` - Authenticated users only
- `/api/v1/admin/**` - ADMIN role only
- `/api/v1/seller/**` - SELLER role only

---

## Database Enums

### OrderStatus
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                   ↓
              CANCELLED
```

### PaymentStatus
```
PENDING → PAID
   ↓        ↓
FAILED  REFUNDED
   ↓
CANCELLED
```

### PaymentMethod
- COD (Cash on delivery)
- BANK_TRANSFER
- CREDIT_CARD
- DEBIT_CARD
- E_WALLET
- SEPAY

### ProductStatus
- ACTIVE (For sale)
- INACTIVE (Not available)

---

## External Integrations

### 🏦 SePay Payment Gateway
- **Purpose**: Vietnamese bank payment processing
- **Integration**: Webhook receives payment callbacks
- **Order Code Format**: "DH" + 8-digit timestamp code
- **Webhook**: POST `/api/v1/webhooks/sepay/callback`
- **Security**: HMAC-SHA256 signature verification

### 🖼️ Cloudinary CDN
- **Purpose**: Image and video hosting
- **Integration**: FileUploadService
- **Endpoints**: POST `/api/v1/upload/image`, `/api/v1/upload/video`
- **Features**: Auto-optimization, CDN delivery, asset deletion

### 🤖 Google Gemini AI (Planned)
- **Purpose**: AI chatbot with RAG and function calling
- **Status**: COMMENTED OUT (awaiting activation)
- **Features**: 
  - Order status queries
  - Product search
  - Recommendation engine
- **Activation**: Uncomment `AiConfig`, `AiFunctionConfig`, `ChatbotController`

---

## Data Validation

### Common Validations
```java
@NotEmpty/@NotNull     // Field required
@Email                 // Email format
@Min(1)/@Max(5)        // Range check
@Size(min=8)           // String length
@Unique (custom)       // Database uniqueness
```

### Entity Constraints
- User email: UNIQUE
- ProductVariant SKU: UNIQUE
- Coupon code: UNIQUE
- Order code: UNIQUE
- Address: Non-null fields for delivery

---

## Error Handling

### HTTP Status Codes
| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation failure |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected error |

### Response Format
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

## Soft Delete Strategy

### Product
```sql
-- Deletion
UPDATE products SET deleted = true WHERE id = ?

-- Queries automatically filter
@SQLRestriction("deleted = false")
```

### ProductVariant
```sql
-- Deletion with SKU uniqueness preservation
UPDATE product_variants 
SET deleted = true, sku = CONCAT(sku, '_del_', UUID()) 
WHERE id = ?
```

---

## Business Logic Highlights

### Order Creation Workflow
1. Validate delivery address (must belong to user)
2. Validate cart items (product exists, variant exists, stock available)
3. Create Order record (status: PENDING)
4. Create OrderItems (with price snapshot)
5. Decrement ProductVariant stock
6. Apply coupon if provided (validate, calculate discount)
7. Calculate totalAmount (subTotal - discount)
8. Clear user's cart
9. Return OrderResponse

### Coupon Validation
1. Check active flag
2. Check date range (startDate ≤ now ≤ endDate)
3. Check usage limit (currentUsage < usageLimit or unlimited)
4. Check minimum order value
5. Calculate discount (percentage or fixed amount)
6. Apply maximum discount cap
7. Return validation result

### Payment Processing (SePay)
1. User initiates checkout with order ID
2. Backend creates Payment record (status: PENDING)
3. Call SePay API to get checkout URL
4. User redirected to SePay portal
5. User completes bank transfer
6. SePay sends webhook: POST /api/v1/webhooks/sepay/callback
7. Backend verifies HMAC-SHA256 signature
8. Backend updates Order (status: CONFIRMED) and Payment (status: PAID)
9. System creates notification
10. User redirected to success page

---

## Performance Considerations

### Indexes
- User: email (unique), role
- Product: category_id, seller_id, status, created_at
- ProductVariant: product_id, sku (unique), price, stock
- Order: user_id, created_at, status
- OrderItem: order_id, product_id
- Review: product_id, user_id
- Coupon: code (unique), start_date, end_date

### Pagination
- Repositories support Spring Data Pageable
- Large result sets can be paginated via controllers

### Caching (Recommended)
- Category list (infrequently changes)
- Active coupons (for quick validation)
- Product rankings (for top products)

---

## Configuration Files

### pom.xml
- Spring Boot 3.5.0
- Spring Security + JWT (JJWT 0.12.6)
- JPA/Hibernate
- MySQL Connector
- MapStruct
- Cloudinary SDK
- Spring AI (for Gemini)

### application.properties
- Database connection
- JWT secret and expiration
- Cloudinary credentials
- SePay API key
- Google Gemini API key
- JPA/Hibernate settings
- Logging configuration

---

## Deployment Checklist

- [ ] Java 17+ installed
- [ ] MySQL 8.0+ running
- [ ] Database created and migrated
- [ ] Environment variables set:
  - `JWT_SECRET` (base64-256bit)
  - `JWT_EXPIRATION` (milliseconds)
  - `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`
  - `SEPAY_API_KEY`, `SEPAY_WEBHOOK_SECRET`
  - `GEMINI_API_KEY` (optional)
- [ ] CORS configured for frontend URL
- [ ] Build: `mvn clean package`
- [ ] Run: `java -jar target/ecommerce-api.jar`
- [ ] Test: `curl http://localhost:8080/api/v1/health`

---

## Development Commands

```bash
# Build
mvn clean package

# Run
mvn spring-boot:run

# Test
mvn test

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Docker build
docker build -t ecommerce-api .

# Docker run
docker run -p 8080:8080 ecommerce-api
```

---

## Common Issues & Solutions

### JWT Token Expired
- **Error**: "Invalid or expired JWT token" (401)
- **Solution**: User must login again to get new token

### Access Denied
- **Error**: "Access denied" (403)
- **Solution**: Check user role matches endpoint requirement

### Product Not Found
- **Error**: "Product not found" (404)
- **Solution**: Product may be deleted or ID incorrect

### Coupon Invalid
- **Error**: "Coupon code is invalid" (400)
- **Solution**: Check expiry date, usage limit, active status

### SePay Webhook Failed
- **Error**: Payment not updated
- **Solution**: Check webhook signature verification, check order code format

---

**Quick Reference End**

Last Updated: May 31, 2026
