import axiosClient from "./axiosClient";

const orderApi = {
  createOrder: async (payload) => {
    return axiosClient.post("/orders", payload);
  },

  getMyOrders: async () => {
    return axiosClient.get("/orders");
  },

  getOrderById: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}`);
  },

  cancelOrder: async (orderId) => {
    return axiosClient.put(`/orders/${orderId}/cancel`);
  },
};

export default orderApi;