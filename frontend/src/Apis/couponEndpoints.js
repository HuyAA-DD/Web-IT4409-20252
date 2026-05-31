const COUPON_ENDPOINTS = {
  list: "/api/v1/coupons",
  byId: (id) => `/api/v1/coupons/${id}`,
  byCode: (code) => `/api/v1/coupons/by-code/${code}`,
  create: "/api/v1/coupons",
  apply: "/api/v1/coupons/apply",
  update: (id) => `/api/v1/coupons/${id}`,
  delete: (id) => `/api/v1/coupons/${id}`
}

export default COUPON_ENDPOINTS;