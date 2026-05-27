const COUPON_ENDPOINTS = {
  list: "/coupons",

  byId: (id) => `/coupons/${id}`,

  byCode: (code) => `/coupons/by-code/${code}`,

  create: "/coupons",

  apply: "/coupons/apply",

  update: (id) => `/coupons/${id}`,

  delete: (id) => `/coupons/${id}`,
};

export default COUPON_ENDPOINTS;