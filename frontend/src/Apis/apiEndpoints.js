import AUTH_ENDPOINTS from "./authEndpoints";
import USER_ENDPOINTS from "./userEndpoints";
import PRODUCT_ENDPOINTS from "./productEndpoints";
import CATEGORY_ENDPOINTS from "./categoryEndpoints";
import CART_ENDPOINTS from "./cartEndpoints";
import ORDER_ENDPOINTS from "./orderEndpoints";
import COUPON_ENDPOINTS from "./couponEndpoints";
import PAYMENT_ENDPOINTS from "./paymentEndpoints";
import WISHLIST_ENDPOINTS from "./wishlistEndpoints";
import NOTIFICATION_ENDPOINTS from "./notificationEndpoints";
import REVIEW_ENDPOINTS from "./reviewEndpoints";
import ADDRESS_ENDPOINTS from "./addressEndpoints";
import ADMIN_ENDPOINTS from "./adminEndpoints";
import AUDIT_LOG_ENDPOINTS from "./auditLogEndpoints";
import UPLOAD_ENDPOINTS from "./uploadEndpoints";
import WEBHOOK_ENDPOINTS from "./webhookEndpoints";

const API_ENDPOINTS = {
  auth: AUTH_ENDPOINTS,

  user: USER_ENDPOINTS,
  users: USER_ENDPOINTS,

  product: PRODUCT_ENDPOINTS,
  products: PRODUCT_ENDPOINTS,

  category: CATEGORY_ENDPOINTS,
  categories: CATEGORY_ENDPOINTS,

  cart: CART_ENDPOINTS,

  order: ORDER_ENDPOINTS,
  orders: ORDER_ENDPOINTS,

  coupon: COUPON_ENDPOINTS,
  coupons: COUPON_ENDPOINTS,

  payment: PAYMENT_ENDPOINTS,
  payments: PAYMENT_ENDPOINTS,

  wishlist: WISHLIST_ENDPOINTS,
  wishlists: WISHLIST_ENDPOINTS,

  notification: NOTIFICATION_ENDPOINTS,
  notifications: NOTIFICATION_ENDPOINTS,

  review: REVIEW_ENDPOINTS,
  reviews: REVIEW_ENDPOINTS,

  address: ADDRESS_ENDPOINTS,
  addresses: ADDRESS_ENDPOINTS,

  admin: ADMIN_ENDPOINTS,
  auditLog: AUDIT_LOG_ENDPOINTS,
  upload: UPLOAD_ENDPOINTS,
  webhook: WEBHOOK_ENDPOINTS,
};

export default API_ENDPOINTS;