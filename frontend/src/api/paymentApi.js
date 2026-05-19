import axiosClient from "./axiosClient";

const paymentApi = {
  mockSuccess: async (orderId) => {
    return axiosClient.post(`/payments/mock-success/${orderId}`);
  },

  mockFailed: async (orderId) => {
    return axiosClient.post(`/payments/mock-failed/${orderId}`);
  },

  getPaymentByOrder: async (orderId) => {
    return axiosClient.get(`/payments/order/${orderId}`);
  },
};

export default paymentApi;