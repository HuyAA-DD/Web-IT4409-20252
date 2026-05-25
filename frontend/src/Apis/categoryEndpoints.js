const CATEGORY_ENDPOINTS = {
  list: "/api/categories",
  byId: (id) => `/api/categories/${id}`,
  create: "/api/categories",
  update: (id) => `/api/categories/${id}`,
  delete: (id) => `/api/categories/${id}`
}

export default CATEGORY_ENDPOINTS;
