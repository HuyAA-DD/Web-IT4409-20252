import axiosClient from "./axiosClient";

const productApi = {
  getProducts: async (params = {}) => {
    return axiosClient.get("/products", { params });
  },

  getProductById: async (id) => {
    return axiosClient.get(`/products/${id}`);
  },
};

export default productApi;