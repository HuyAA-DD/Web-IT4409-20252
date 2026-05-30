const ORDER_ENDPOINTS = {
  list: "/orders",

  create: "/orders",

  byId: (id) => `/orders/${id}`,

  cancel: (id) => `/orders/${id}/cancel`,

  tracking: (id) => `/orders/${id}/tracking`,

  invoice: (id) => `/orders/${id}/invoice`,
};

export default ORDER_ENDPOINTS;