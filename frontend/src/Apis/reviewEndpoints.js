const REVIEW_ENDPOINTS = {
  list: "/api/v1/reviews",
  byId: (id) => `/api/v1/reviews/${id}`,
  byProduct: (productId) => `/api/v1/reviews/by-product/${productId}`,
  byUser: (userId) => `/api/v1/reviews/by-user/${userId}`,
  create: "/api/v1/reviews",
  update: (id) => `/api/v1/reviews/${id}`,
  delete: (id) => `/api/v1/reviews/${id}`
}

export default REVIEW_ENDPOINTS;
