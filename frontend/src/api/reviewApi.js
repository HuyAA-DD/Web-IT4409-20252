import axiosClient from "./axiosClient";

const reviewApi = {
  getReviewsByProduct: async (productId) => {
    return axiosClient.get(`/products/${productId}/reviews`);
  },

  createReview: async (payload) => {
    return axiosClient.post("/reviews", payload);
  },

  updateReview: async (reviewId, payload) => {
    return axiosClient.put(`/reviews/${reviewId}`, payload);
  },

  deleteReview: async (reviewId) => {
    return axiosClient.delete(`/reviews/${reviewId}`);
  },
};

export default reviewApi;