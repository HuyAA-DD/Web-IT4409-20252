import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import notificationApi from "../api/notificationApi";

function normalizeNotifications(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
}

function normalizeNotification(response) {
  if (!response) return null;

  if (response.id) {
    return response;
  }

  if (response.data?.id) {
    return response.data;
  }

  if (response.notification?.id) {
    return response.notification;
  }

  if (response.data?.notification?.id) {
    return response.data.notification;
  }

  return null;
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
}

function getTypeText(type) {
  const typeMap = {
    SYSTEM: "Hệ thống",
    ORDER: "Đơn hàng",
    PAYMENT: "Thanh toán",
    PROMOTION: "Khuyến mãi",
    REVIEW: "Đánh giá",
  };

  return typeMap[type] || type || "Thông báo";
}

function getTypeStyle(type) {
  if (type === "ORDER") {
    return {
      color: "#1d4ed8",
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
    };
  }

  if (type === "PAYMENT") {
    return {
      color: "#047857",
      background: "#ecfdf5",
      border: "1px solid #a7f3d0",
    };
  }

  if (type === "PROMOTION") {
    return {
      color: "#92400e",
      background: "#fffbeb",
      border: "1px solid #fde68a",
    };
  }

  return {
    color: "#374151",
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
  };
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((notification) => !notification.read);
    }

    if (filter === "READ") {
      return notifications.filter((notification) => notification.read);
    }

    return notifications;
  }, [notifications, filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await notificationApi.getMyNotifications();
      const list = normalizeNotifications(response);

      setNotifications(list);
    } catch (error) {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        setErrorMessage("Bạn cần đăng nhập để xem thông báo.");
      } else {
        setErrorMessage("Không tải được danh sách thông báo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setUpdatingId(notificationId);

      const response = await notificationApi.markAsRead(notificationId);
      const updatedNotification = normalizeNotification(response);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => {
          if (notification.id !== notificationId) {
            return notification;
          }

          if (updatedNotification) {
            return updatedNotification;
          }

          return {
            ...notification,
            read: true,
            readAt: new Date().toISOString(),
          };
        })
      );

      toast.success("Đã đánh dấu thông báo là đã đọc");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể đánh dấu đã đọc";

      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa thông báo này?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(notificationId);

      await notificationApi.deleteNotification(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );

      toast.success("Đã xóa thông báo");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể xóa thông báo";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Thông báo</h1>
        <p>Theo dõi các thông báo hệ thống, đơn hàng, thanh toán và khuyến mãi.</p>
      </div>

      <section className="notification-summary">
        <div>
          <strong>{notifications.length}</strong>
          <span>Tổng thông báo</span>
        </div>

        <div>
          <strong>{unreadCount}</strong>
          <span>Chưa đọc</span>
        </div>

        <div>
          <strong>{notifications.length - unreadCount}</strong>
          <span>Đã đọc</span>
        </div>
      </section>

      <section className="notification-toolbar">
        <button
          type="button"
          className={filter === "ALL" ? "btn btn-primary" : "btn btn-outline"}
          onClick={() => setFilter("ALL")}
        >
          Tất cả
        </button>

        <button
          type="button"
          className={filter === "UNREAD" ? "btn btn-primary" : "btn btn-outline"}
          onClick={() => setFilter("UNREAD")}
        >
          Chưa đọc
        </button>

        <button
          type="button"
          className={filter === "READ" ? "btn btn-primary" : "btn btn-outline"}
          onClick={() => setFilter("READ")}
        >
          Đã đọc
        </button>

        <button
          type="button"
          className="btn btn-outline"
          onClick={fetchNotifications}
        >
          Tải lại
        </button>
      </section>

      {isLoading && (
        <div className="placeholder-box">Đang tải danh sách thông báo...</div>
      )}

      {!isLoading && errorMessage && (
        <div
          className="placeholder-box"
          style={{
            color: "#92400e",
            background: "#fffbeb",
            borderColor: "#fbbf24",
          }}
        >
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && filteredNotifications.length === 0 && (
        <div className="info-card">
          <h2>Không có thông báo</h2>

          <p style={{ color: "#4b5563" }}>
            Hiện chưa có thông báo nào phù hợp với bộ lọc này.
          </p>

          <Link to="/products" className="btn btn-primary">
            Xem sản phẩm
          </Link>
        </div>
      )}

      {!isLoading && !errorMessage && filteredNotifications.length > 0 && (
        <section className="notification-list">
          {filteredNotifications.map((notification) => {
            const typeStyle = getTypeStyle(notification.type);

            return (
              <article
                key={notification.id}
                className={
                  notification.read
                    ? "notification-card"
                    : "notification-card unread"
                }
              >
                <div className="notification-main">
                  <div className="notification-card-header">
                    <span
                      className="notification-type-badge"
                      style={typeStyle}
                    >
                      {getTypeText(notification.type)}
                    </span>

                    {!notification.read && (
                      <span className="notification-unread-dot">Chưa đọc</span>
                    )}
                  </div>

                  <h2>{notification.title || "Thông báo"}</h2>

                  <p>{notification.message || "Không có nội dung thông báo."}</p>

                  <div className="notification-meta">
                    <span>Ngày tạo: {formatDateTime(notification.createdAt)}</span>

                    {notification.read && (
                      <span>Đã đọc: {formatDateTime(notification.readAt)}</span>
                    )}
                  </div>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={updatingId === notification.id}
                    >
                      {updatingId === notification.id
                        ? "Đang xử lý..."
                        : "Đánh dấu đã đọc"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteNotification(notification.id)}
                    disabled={deletingId === notification.id}
                  >
                    {deletingId === notification.id ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default NotificationsPage;