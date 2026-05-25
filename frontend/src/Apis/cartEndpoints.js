const CART_ENDPOINTS = {
  byUser: (userId) => `/api/v1/cart/${userId}`,
  items: (userId) => `/api/v1/cart/${userId}/items`,
  item: (userId, itemId) => `/api/v1/cart/${userId}/items/${itemId}`
}

export default CART_ENDPOINTS;
