const ADDRESS_ENDPOINTS = {
  list: "/addresses",

  create: "/addresses",

  byId: (id) => `/addresses/${id}`,

  byUser: (userId) => `/addresses/by-user/${userId}`,

  defaultByUser: (userId) => `/addresses/by-user/${userId}/default`,

  update: (id) => `/addresses/${id}`,

  delete: (id) => `/addresses/${id}`,

  deleteByUser: (userId) => `/addresses/by-user/${userId}`,
};

export default ADDRESS_ENDPOINTS;