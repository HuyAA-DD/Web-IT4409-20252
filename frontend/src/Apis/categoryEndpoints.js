const CATEGORY_ENDPOINTS = {
  list: "/api/v1/categories",
  byId: (id) => `/api/v1/categories/${id}`,
  create: "/api/v1/categories",
  update: (id) => `/api/v1/categories/${id}`,
  delete: (id) => `/api/v1/categories/${id}`
}

export default CATEGORY_ENDPOINTS;