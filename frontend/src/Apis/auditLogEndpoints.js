const AUDIT_LOG_ENDPOINTS = {
  list: "/api/audit-logs",
  byId: (id) => `/api/audit-logs/${id}`,
  byUser: (userId) => `/api/audit-logs/by-user/${userId}`,
  byEntity: (entity) => `/api/audit-logs/by-entity?entity=${entity}`,
  delete: (id) => `/api/audit-logs/${id}`
}

export default AUDIT_LOG_ENDPOINTS;
