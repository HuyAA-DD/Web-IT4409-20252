import axiosClient from "./axiosClient";

const couponApi = {
  getAllCoupons: async () => {
    return axiosClient.get("/coupons");
  },

  getCouponById: async (couponId) => {
    return axiosClient.get(`/coupons/${couponId}`);
  },

  getCouponByCode: async (code) => {
    return axiosClient.get(`/coupons/by-code/${code}`);
  },

  applyCoupon: async (payload) => {
    return axiosClient.post("/coupons/apply", payload);
  },
};

export default couponApi;