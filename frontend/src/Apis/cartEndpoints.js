const CART_ENDPOINTS = {
  byUser: (userId) => `/cart/${userId}`,
  items: (userId) => `/cart/${userId}/items`,
  item: (userId, itemId) => `/cart/${userId}/items/${itemId}`,
  clear: (userId) => `/cart/${userId}/items`,
};

export default CART_ENDPOINTS;