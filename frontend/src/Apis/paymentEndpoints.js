const PAYMENT_ENDPOINTS = {
  sepayCheckout: "/api/v1/payments/sepay/checkout",

  orderStatus: (orderId) => `/api/v1/payments/orders/${orderId}/status`,

  transactionStatus: (orderId) =>
    `/api/v1/payments/orders/${orderId}/transaction-status`,
};

export default PAYMENT_ENDPOINTS;