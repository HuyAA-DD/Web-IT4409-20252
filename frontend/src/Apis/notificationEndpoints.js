const NOTIFICATION_ENDPOINTS = {
  list: "/notifications",

  byId: (id) => `/notifications/${id}`,

  byUser: (userId) => `/notifications/by-user/${userId}`,

  unreadByUser: (userId) => `/notifications/by-user/${userId}/unread`,

  markAsRead: (id) => `/notifications/${id}/mark-as-read`,

  markAsSent: (id) => `/notifications/${id}/mark-as-sent`,

  delete: (id) => `/notifications/${id}`,

  deleteByUser: (userId) => `/notifications/by-user/${userId}`,
};

export default NOTIFICATION_ENDPOINTS;