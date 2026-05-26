const CATEGORY_ENDPOINTS = {
  list: "/categories",

  byId: (id) => `/categories/${id}`,

  create: "/categories",
  update: (id) => `/categories/${id}`,
  delete: (id) => `/categories/${id}`,
};

export default CATEGORY_ENDPOINTS;