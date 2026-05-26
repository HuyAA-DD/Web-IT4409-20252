const WISHLIST_ENDPOINTS = {
  list: "/wishlists",

  byId: (id) => `/wishlists/${id}`,

  byUser: (userId) => `/wishlists/by-user/${userId}`,

  byProduct: (productId) => `/wishlists/by-product/${productId}`,

  create: "/wishlists",

  delete: (id) => `/wishlists/${id}`,

  deleteByUser: (userId) => `/wishlists/by-user/${userId}`,

  deleteByUserProduct: (userId, productId) =>
    `/wishlists/by-user/${userId}/products/${productId}`,
};

export default WISHLIST_ENDPOINTS;