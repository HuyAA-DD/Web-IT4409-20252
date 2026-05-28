const ADMIN_ENDPOINTS = {
  dashboard: "/api/v1/admin/dashboard",
  revenue: "/api/v1/admin/revenue",
  topProducts: "/api/v1/admin/top-products",
  orders: "/api/v1/admin/orders",
  updateOrderStatus: (id) => `/api/v1/admin/orders/${id}/status`,
  coupons: "/api/v1/admin/coupons",
  products: {
    list: "/api/v1/products",
    byId: (id) => `/api/v1/products/${id}`,
    create: "/api/v1/products",
    update: (id) => `/api/v1/products/${id}`,
    delete: (id) => `/api/v1/products/${id}`,
    uploadImage: (productId) => `/api/v1/products/${productId}/upload-image`,
    uploadImages: (productId) => `/api/v1/products/${productId}/upload-images`,
    deleteImage: (productId, imageId) => `/api/v1/products/${productId}/images/${imageId}`
  }
}

export default ADMIN_ENDPOINTS;
