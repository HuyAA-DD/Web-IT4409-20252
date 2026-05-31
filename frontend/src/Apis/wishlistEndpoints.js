const WISHLIST_ENDPOINTS = {
  list: "/api/v1/wishlists",
  byId: (id) => `/api/v1/wishlists/${id}`,
  byUser: (userId) => `/api/v1/wishlists/by-user/${userId}`,
  byProduct: (productId) => `/api/v1/wishlists/by-product/${productId}`,
  delete: (id) => `/api/v1/wishlists/${id}`,
  deleteByUser: (userId) => `/api/v1/wishlists/by-user/${userId}`,
  deleteByUserProduct: (userId, productId) => `/api/v1/wishlists/by-user/${userId}/products/${productId}`
}

export default WISHLIST_ENDPOINTS;