import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import orderApi from "../api/orderApi";
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

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
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
        <p>Theo dõi các đơn hàng bạn đã tạo.</p>
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
                      <strong>Trạng thái:</strong>{" "}
                      <span style={{ color: "#2563eb", fontWeight: 700 }}>
                        {order.orderStatus}
                      </span>
                    </p>

                    <p style={{ margin: "8px 0 0" }}>
                      <strong>Thanh toán:</strong>{" "}
                      {order.paymentStatus || "UNPAID"}
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
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;