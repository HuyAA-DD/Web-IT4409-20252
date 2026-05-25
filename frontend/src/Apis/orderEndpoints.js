const ORDER_ENDPOINTS = {
  list: "/api/v1/orders",
  byId: (id) => `/api/v1/orders/${id}`,
  cancel: (id) => `/api/v1/orders/${id}/cancel`,
  tracking: (id) => `/api/v1/orders/${id}/tracking`
}

export default ORDER_ENDPOINTS;
