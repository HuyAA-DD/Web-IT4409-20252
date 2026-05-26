const PRODUCT_ENDPOINTS = {
  list: "/api/v1/products",
  search: "/api/v1/products/search",
  filter: "/api/v1/products/filter",
  byId: (id) => `/api/v1/products/${id}`,
  create: "/api/v1/products",
  update: (id) => `/api/v1/products/${id}`,
  delete: (id) => `/api/v1/products/${id}`,
  uploadImage: (productId) => `/api/v1/products/${productId}/upload-image`,
  uploadImages: (productId) => `/api/v1/products/${productId}/upload-images`,
  deleteImage: (productId, imageId) => `/api/v1/products/${productId}/images/${imageId}`
}

export default PRODUCT_ENDPOINTS;
