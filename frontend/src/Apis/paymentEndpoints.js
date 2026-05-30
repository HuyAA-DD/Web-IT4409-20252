const PAYMENT_ENDPOINTS = {
  sepayCheckout: "/payments/sepay/checkout",

  orderStatus: (orderId) => `/payments/orders/${orderId}/status`,

  transactionStatus: (orderId) =>
    `/payments/orders/${orderId}/transaction-status`,
};

export default PAYMENT_ENDPOINTS;