const WISHLIST_ENDPOINTS = {
  list: "/api/wishlists",
  byId: (id) => `/api/wishlists/${id}`,
  byUser: (userId) => `/api/wishlists/by-user/${userId}`,
  byProduct: (productId) => `/api/wishlists/by-product/${productId}`,
  delete: (id) => `/api/wishlists/${id}`,
  deleteByUser: (userId) => `/api/wishlists/by-user/${userId}`,
  deleteByUserProduct: (userId, productId) => `/api/wishlists/by-user/${userId}/products/${productId}`
}

export default WISHLIST_ENDPOINTS;
