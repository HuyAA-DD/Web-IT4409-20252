import AUTH_ENDPOINTS from "./authEndpoints"
import USER_ENDPOINTS from "./userEndpoints"
import CATEGORY_ENDPOINTS from "./categoryEndpoints"
import PRODUCT_ENDPOINTS from "./productEndpoints"
import CART_ENDPOINTS from "./cartEndpoints"
import ORDER_ENDPOINTS from "./orderEndpoints"
import PAYMENT_ENDPOINTS from "./paymentEndpoints"
import COUPON_ENDPOINTS from "./couponEndpoints"
import ADDRESS_ENDPOINTS from "./addressEndpoints"
import REVIEW_ENDPOINTS from "./reviewEndpoints"
import WISHLIST_ENDPOINTS from "./wishlistEndpoints"
import NOTIFICATION_ENDPOINTS from "./notificationEndpoints"
import ADMIN_ENDPOINTS from "./adminEndpoints"
import AUDIT_LOG_ENDPOINTS from "./auditLogEndpoints"
import WEBHOOK_ENDPOINTS from "./webhookEndpoints"
import UPLOAD_ENDPOINTS from "./uploadEndpoints"

const API_ENDPOINTS = {
  auth: AUTH_ENDPOINTS,
  users: USER_ENDPOINTS,
  categories: CATEGORY_ENDPOINTS,
  products: PRODUCT_ENDPOINTS,
  cart: CART_ENDPOINTS,
  orders: ORDER_ENDPOINTS,
  payments: PAYMENT_ENDPOINTS,
  coupons: COUPON_ENDPOINTS,
  addresses: ADDRESS_ENDPOINTS,
  reviews: REVIEW_ENDPOINTS,
  wishlists: WISHLIST_ENDPOINTS,
  notifications: NOTIFICATION_ENDPOINTS,
  admin: ADMIN_ENDPOINTS,
  auditLogs: AUDIT_LOG_ENDPOINTS,
  webhooks: WEBHOOK_ENDPOINTS,
  upload: UPLOAD_ENDPOINTS
}

export default API_ENDPOINTS;
