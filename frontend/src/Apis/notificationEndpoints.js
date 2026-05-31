const NOTIFICATION_ENDPOINTS = {
  list: "/api/v1/notifications",
  byId: (id) => `/api/v1/notifications/${id}`,
  my: "/api/v1/notifications/my",
  myUnread: "/api/v1/notifications/my/unread",
  byUser: (userId) => `/api/v1/notifications/by-user/${userId}`,
  unreadByUser: (userId) => `/api/v1/notifications/by-user/${userId}/unread`,
  markAsRead: (id) => `/api/v1/notifications/${id}/mark-as-read`,
  markAsSent: (id) => `/api/v1/notifications/${id}/mark-as-sent`,
  delete: (id) => `/api/v1/notifications/${id}`,
  deleteMy: (id) => `/api/v1/notifications/my/${id}`,
  deleteMyAll: "/api/v1/notifications/my",
  deleteByUser: (userId) => `/api/v1/notifications/by-user/${userId}`
}

export default NOTIFICATION_ENDPOINTS;