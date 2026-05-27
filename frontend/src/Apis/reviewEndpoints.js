const REVIEW_ENDPOINTS = {
  list: "/reviews",

  byId: (id) => `/reviews/${id}`,

  byProduct: (productId) => `/reviews/by-product/${productId}`,

  byUser: (userId) => `/reviews/by-user/${userId}`,

  create: "/reviews",

  update: (id) => `/reviews/${id}`,

  delete: (id) => `/reviews/${id}`,
};

export default REVIEW_ENDPOINTS;