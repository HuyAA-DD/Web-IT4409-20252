import axiosClient from "./axiosClient";

const authApi = {
  login: async (payload) => {
    return axiosClient.post("/auth/login", payload);
  },

  register: async (payload) => {
    return axiosClient.post("/auth/register", payload);
  },

  getCurrentUser: async () => {
    return axiosClient.get("/users/me");
  },
};

export default authApi;