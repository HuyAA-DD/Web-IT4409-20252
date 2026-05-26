const PRODUCT_ENDPOINTS = {
  list: "/products",
  search: "/products/search",
  filter: "/products/filter",

  byId: (id) => `/products/${id}`,

  create: "/products",
  update: (id) => `/products/${id}`,
  delete: (id) => `/products/${id}`,

  uploadImage: (productId) => `/products/${productId}/upload-image`,
  uploadImages: (productId) => `/products/${productId}/upload-images`,
  deleteImage: (productId, imageId) =>
    `/products/${productId}/images/${imageId}`,
};

export default PRODUCT_ENDPOINTS;