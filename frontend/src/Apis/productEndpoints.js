const PRODUCT_ENDPOINTS = {
  list: "/api/products",
  search: "/api/products/search",
  filter: "/api/products/filter",
  byId: (id) => `/api/products/${id}`,
  create: "/api/products",
  update: (id) => `/api/products/${id}`,
  delete: (id) => `/api/products/${id}`,
  uploadImage: (productId) => `/api/products/${productId}/upload-image`,
  uploadImages: (productId) => `/api/products/${productId}/upload-images`,
  deleteImage: (productId, imageId) => `/api/products/${productId}/images/${imageId}`
}

export default PRODUCT_ENDPOINTS;
