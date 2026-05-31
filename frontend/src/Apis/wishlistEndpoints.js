const WISHLIST_ENDPOINTS = {
  list: "/api/v1/wishlists",
  byId: (id) => `/api/v1/wishlists/${id}`,
  my: () => `/api/v1/wishlists/my`,
  byProduct: (productId) => `/api/v1/wishlists/by-product/${productId}`,
  create: "/api/v1/wishlists",
  delete: (id) => `/api/v1/wishlists/${id}`,
  deleteMy: () => `/api/v1/wishlists/my`,
  deleteByUserProduct: (productId) => `/api/v1/wishlists/my/products/${productId}`
}

export default WISHLIST_ENDPOINTS;