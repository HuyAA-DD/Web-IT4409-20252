const AUDIT_LOG_ENDPOINTS = {
  list: "/api/v1/audit-logs",
  byId: (id) => `/api/v1/audit-logs/${id}`,
  byUser: (userId) => `/api/v1/audit-logs/by-user/${userId}`,
  byEntity: (entity) => `/api/v1/audit-logs/by-entity?entity=${entity}`,
  delete: (id) => `/api/v1/audit-logs/${id}`
}

export default AUDIT_LOG_ENDPOINTS;
