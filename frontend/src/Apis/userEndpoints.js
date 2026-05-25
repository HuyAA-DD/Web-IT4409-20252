const USER_ENDPOINTS = {
  profile: "/api/v1/users/me",
  updateProfile: "/api/v1/users/me",
  list: "/api/v1/users",
  byId: (id) => `/api/v1/users/${id}`
}

export default USER_ENDPOINTS;
