const ADDRESS_ENDPOINTS = {
  list: "/api/v1/addresses",
  create: "/api/v1/addresses",
  byId: (id) => `/api/v1/addresses/${id}`,
  byUser: (userId) => `/api/v1/addresses/by-user/${userId}`,
  defaultByUser: (userId) => `/api/v1/addresses/by-user/${userId}/default`,
  update: (id) => `/api/v1/addresses/${id}`,
  delete: (id) => `/api/v1/addresses/${id}`,
  deleteByUser: (userId) => `/api/v1/addresses/by-user/${userId}`
}

export default ADDRESS_ENDPOINTS;