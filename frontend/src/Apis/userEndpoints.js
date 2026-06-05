const USER_ENDPOINTS = {
  profile: "/api/v1/users/me",
  updateProfile: "/api/v1/users/me",
  updateAvatar: "/api/v1/users/me/avatar",
  changePassword: "/api/v1/users/me/password",
  list: "/api/v1/users",
  byId: (id) => `/api/v1/users/${id}`,
  update: (id) => `/api/v1/users/${id}`,
  updateRole: (id) => `/api/v1/users/${id}/role`,
  updateStatus: (id) => `/api/v1/users/${id}/status`,
  lock: (id) => `/api/v1/users/${id}/lock`,
  unlock: (id) => `/api/v1/users/${id}/unlock`
}

export default USER_ENDPOINTS;
