const REVIEW_ENDPOINTS = {
  list: "/api/reviews",
  byId: (id) => `/api/reviews/${id}`,
  byProduct: (productId) => `/api/reviews/by-product/${productId}`,
  byUser: (userId) => `/api/reviews/by-user/${userId}`,
  create: "/api/reviews",
  update: (id) => `/api/reviews/${id}`,
  delete: (id) => `/api/reviews/${id}`
}

export default REVIEW_ENDPOINTS;
