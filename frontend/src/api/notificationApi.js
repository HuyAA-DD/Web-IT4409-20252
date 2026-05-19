import axiosClient from "./axiosClient";

const notificationApi = {
  getMyNotifications: async () => {
    return axiosClient.get("/notifications");
  },

  getUnreadNotifications: async () => {
    return axiosClient.get("/notifications/unread");
  },

  getNotificationById: async (notificationId) => {
    return axiosClient.get(`/notifications/${notificationId}`);
  },

  markAsRead: async (notificationId) => {
    return axiosClient.put(`/notifications/${notificationId}/mark-as-read`);
  },

  deleteNotification: async (notificationId) => {
    return axiosClient.delete(`/notifications/${notificationId}`);
  },
};

export default notificationApi;