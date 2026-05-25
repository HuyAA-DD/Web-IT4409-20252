const ADDRESS_ENDPOINTS = {
  list: "/api/addresses",
  create: "/api/addresses",
  byId: (id) => `/api/addresses/${id}`,
  byUser: (userId) => `/api/addresses/by-user/${userId}`,
  defaultByUser: (userId) => `/api/addresses/by-user/${userId}/default`,
  update: (id) => `/api/addresses/${id}`,
  delete: (id) => `/api/addresses/${id}`,
  deleteByUser: (userId) => `/api/addresses/by-user/${userId}`
}

export default ADDRESS_ENDPOINTS;
