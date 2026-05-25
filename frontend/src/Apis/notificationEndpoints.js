const NOTIFICATION_ENDPOINTS = {
  list: "/api/notifications",
  byId: (id) => `/api/notifications/${id}`,
  byUser: (userId) => `/api/notifications/by-user/${userId}`,
  unreadByUser: (userId) => `/api/notifications/by-user/${userId}/unread`,
  markAsRead: (id) => `/api/notifications/${id}/mark-as-read`,
  markAsSent: (id) => `/api/notifications/${id}/mark-as-sent`,
  delete: (id) => `/api/notifications/${id}`,
  deleteByUser: (userId) => `/api/notifications/by-user/${userId}`
}

export default NOTIFICATION_ENDPOINTS;
