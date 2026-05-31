const CART_ENDPOINTS = {
  byUser: (userId) => `/ap1/v1/cart/${userId}`,
  items: (userId) => `/ap1/v1/cart/${userId}/items`,
  item: (userId, itemId) => `/api/v1/cart/${userId}/items/${itemId}`,
  clear: (userId) => `/api/v1/cart/${userId}/items`,
};

export default CART_ENDPOINTS;