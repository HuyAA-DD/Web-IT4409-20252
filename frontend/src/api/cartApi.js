import axiosClient from "./axiosClient";

const cartApi = {
  getCart: async () => {
    return axiosClient.get("/cart");
  },

  addToCart: async (payload) => {
    return axiosClient.post("/cart/items", payload);
  },

  updateCartItem: async (itemId, payload) => {
    return axiosClient.put(`/cart/items/${itemId}`, payload);
  },

  removeCartItem: async (itemId) => {
    return axiosClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async () => {
    return axiosClient.delete("/cart");
  },
};

export default cartApi;