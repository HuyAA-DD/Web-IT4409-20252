const CART_ENDPOINTS = {
  byUser: (userId) => "/api/v1/cart",
  items: (userId) => "/api/v1/cart/items",
  item: (userId, itemId) => `/api/v1/cart/items/${itemId}`,
  clear: (userId) => "/api/v1/cart/items",
};

export default CART_ENDPOINTS;