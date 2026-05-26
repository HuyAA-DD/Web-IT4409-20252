const USER_ENDPOINTS = {
  profile: "/users/me",
  updateProfile: "/users/me",
  uploadAvatar: "/users/me/avatar",
  list: "/users",
  byId: (id) => `/users/${id}`,
};

export default USER_ENDPOINTS;