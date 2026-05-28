const SELLER_ENDPOINTS = {
  orders: "/api/v1/seller/orders",
  orderById: (id) => `/api/v1/seller/orders/${id}`,
  dashboard: "/api/v1/seller/dashboard"
}

export default SELLER_ENDPOINTS;
