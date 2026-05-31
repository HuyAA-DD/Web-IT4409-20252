const ORDER_ENDPOINTS = {
  list: "/api/v1/orders",

  create: "/api/v1/orders",

  byId: (id) => `/api/v1/orders/${id}`,

  cancel: (id) => `/api/v1/orders/${id}/cancel`,

  tracking: (id) => `/api/v1/orders/${id}/tracking`,

  invoice: (id) => `/api/v1/orders/${id}/invoice`,
};

export default ORDER_ENDPOINTS;