import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import orderApi from "../api/orderApi";
import paymentApi from "../api/paymentApi";
import { formatCurrency } from "../utils/formatCurrency";

function normalizeOrders(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.orders)) {
    return response.orders;
  }

  if (Array.isArray(response?.data?.orders)) {
    return response.data.orders;
  }

  return [];
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
}

function getStatusText(status) {
  const statusMap = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
  };

  return statusMap[status] || status || "Chưa cập nhật";
}

function getPaymentBadgeStyle(paymentStatus) {
  if (paymentStatus === "PAID") {
    return {
      color: "#047857",
      background: "#d1fae5",
      padding: "4px 10px",
      borderRadius: "999px",
      fontWeight: 700,
    };
  }

  if (paymentStatus === "FAILED") {
    return {
      color: "#b91c1c",
      background: "#fee2e2",
      padding: "4px 10px",
      borderRadius: "999px",
      fontWeight: 700,
    };
  }

  return {
    color: "#92400e",
    background: "#fffbeb",
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: 700,
  };
}

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await orderApi.getMyOrders();
      const orderList = normalizeOrders(response);

      setOrders(orderList);
    } catch (error) {
      setErrorMessage(
        "Không tải được lịch sử đơn hàng. Hãy kiểm tra đăng nhập hoặc backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      await orderApi.cancelOrder(orderId);

      toast.success("Đã hủy đơn hàng");

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              orderStatus: "CANCELLED",
            };
          }

          return order;
        })
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Hủy đơn hàng thất bại";

      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMockPaymentSuccess = async (orderId) => {
    try {
      setPayingOrderId(orderId);

      await paymentApi.mockSuccess(orderId);

      toast.success("Thanh toán thành công");

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              paymentStatus: "PAID",
              orderStatus: "CONFIRMED",
            };
          }

          return order;
        })
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Thanh toán thất bại";

      toast.error(message);
    } finally {
      setPayingOrderId(null);
    }
  };

  const handleMockPaymentFailed = async (orderId) => {
    try {
      setPayingOrderId(orderId);

      await paymentApi.mockFailed(orderId);

      toast.error("Đã giả lập thanh toán thất bại");

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              paymentStatus: "FAILED",
            };
          }

          return order;
        })
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Giả lập thanh toán thất bại không thành công";

      toast.error(message);
    } finally {
      setPayingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container page">
        <div className="placeholder-box">Đang tải lịch sử đơn hàng...</div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Lịch sử đơn hàng</h1>
        <p>
          Theo dõi các đơn hàng đã tạo, hủy đơn đang chờ xử lý và giả lập thanh
          toán.
        </p>
      </div>

      {errorMessage && (
        <div
          className="placeholder-box"
          style={{
            marginBottom: "24px",
            color: "#92400e",
            background: "#fffbeb",
            borderColor: "#fbbf24",
          }}
        >
          {errorMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="info-card">
          <h2>Chưa có đơn hàng</h2>

          <p style={{ color: "#4b5563" }}>
            Bạn chưa tạo đơn hàng nào. Hãy mua sản phẩm để tạo đơn hàng đầu
            tiên.
          </p>

          <Link to="/products" className="btn btn-primary">
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          {orders.map((order) => {
            const canCancel = order.orderStatus === "PENDING";
            const canPay =
              order.orderStatus !== "CANCELLED" &&
              order.paymentStatus !== "PAID";

            return (
              <article key={order.id} className="info-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2 style={{ marginTop: 0 }}>
                      {order.orderCode || `Đơn hàng #${order.id}`}
                    </h2>

                    <p style={{ color: "#4b5563", marginBottom: 0 }}>
                      Ngày tạo: {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0 }}>
                      <strong>Trạng thái đơn:</strong>{" "}
                      <span style={{ color: "#2563eb", fontWeight: 700 }}>
                        {getStatusText(order.orderStatus)}
                      </span>
                    </p>

                    <p style={{ margin: "10px 0 0" }}>
                      <strong>Thanh toán:</strong>{" "}
                      <span style={getPaymentBadgeStyle(order.paymentStatus)}>
                        {getStatusText(order.paymentStatus || "UNPAID")}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    display: "grid",
                    gap: "10px",
                    color: "#374151",
                  }}
                >
                  <div>
                    <strong>Người nhận:</strong> {order.receiverName}
                  </div>

                  <div>
                    <strong>Số điện thoại:</strong> {order.receiverPhone}
                  </div>

                  <div>
                    <strong>Địa chỉ:</strong> {order.shippingAddress}
                  </div>

                  {order.couponCode && (
                    <div>
                      <strong>Mã giảm giá:</strong> {order.couponCode}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "16px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <span>
                        {item.productName} x {item.quantity}
                      </span>

                      <strong>{formatCurrency(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, color: "#4b5563" }}>
                      Giảm giá: {formatCurrency(order.discountAmount || 0)}
                    </p>

                    <h3 style={{ margin: "8px 0 0", color: "#2563eb" }}>
                      Tổng tiền: {formatCurrency(order.totalAmount)}
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {canPay && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleMockPaymentSuccess(order.id)}
                          disabled={payingOrderId === order.id}
                        >
                          {payingOrderId === order.id
                            ? "Đang xử lý..."
                            : "Thanh toán thành công"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleMockPaymentFailed(order.id)}
                          disabled={payingOrderId === order.id}
                        >
                          Giả lập thất bại
                        </button>
                      </>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id
                          ? "Đang hủy..."
                          : "Hủy đơn"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;