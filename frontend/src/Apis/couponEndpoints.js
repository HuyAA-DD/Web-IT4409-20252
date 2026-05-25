const COUPON_ENDPOINTS = {
  list: "/api/coupons",
  byId: (id) => `/api/coupons/${id}`,
  byCode: (code) => `/api/coupons/by-code/${code}`,
  create: "/api/coupons",
  apply: "/api/coupons/apply",
  update: (id) => `/api/coupons/${id}`,
  delete: (id) => `/api/coupons/${id}`
}

export default COUPON_ENDPOINTS;
