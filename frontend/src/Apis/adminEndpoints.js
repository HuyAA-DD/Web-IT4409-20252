const ADMIN_ENDPOINTS = {
  dashboard: "/api/v1/admin/dashboard",
  revenue: "/api/v1/admin/revenue",
  topProducts: "/api/v1/admin/top-products",
  orders: "/api/v1/admin/orders",
  updateOrderStatus: (id) => `/api/v1/admin/orders/${id}/status`,
  coupons: "/api/v1/admin/coupons"
}

export default ADMIN_ENDPOINTS;
