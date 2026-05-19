import axiosClient from "./axiosClient";

const wishlistApi = {
  getWishlist: async () => {
    return axiosClient.get("/wishlist");
  },

  addToWishlist: async (productId) => {
    return axiosClient.post("/wishlist", {
      productId: Number(productId),
    });
  },

  removeFromWishlist: async (productId) => {
    return axiosClient.delete(`/wishlist/${productId}`);
  },
};

export default wishlistApi;