import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Empty,
  Modal,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClearOutlined,
  DeleteOutlined,
  MoreOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

const { Title, Text, Paragraph } = Typography;

const SELLER_NOTIFICATION_TYPES = new Set(["SELLER_ORDER", "SALE_PAID"]);

const extractData = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

const getApiErrorMessage = (error, fallback = "Có lỗi xảy ra.") => {
  const responseData = error?.response?.data || error;

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.detail ||
    responseData?.data?.message ||
    error?.message ||
    fallback
  );
};

const isSellerNotification = (notification) => {
  return SELLER_NOTIFICATION_TYPES.has(String(notification?.type || "").toUpperCase());
};

const getNotificationVisual = (type) => {
  const normalizedType = String(type || "").toUpperCase();

  if (normalizedType === "SALE_PAID") {
    return {
      iconClassName: "bg-green-100 text-green-600",
      tagColor: "green",
      label: "Đã thanh toán",
    };
  }

  return {
    iconClassName: "bg-blue-100 text-blue-600",
    tagColor: "blue",
    label: "Đơn mới",
  };
};

const formatTime = (value) => {
  if (!value) return "Không xác định";

  try {
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Không xác định";
  }
};

export default function SellerNotificationPage() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const userId = authUser?.id;
  const notificationEndpoint =
    API_ENDPOINTS.notifications || API_ENDPOINTS.notification;

  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchSellerNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(notificationEndpoint.my);
      const data = extractData(response);

      setNotifications(Array.isArray(data) ? data.filter(isSellerNotification) : []);
    } catch (error) {
      console.error("Cannot load seller notifications", error);
      message.error(getApiErrorMessage(error, "Không thể tải thông báo bán hàng."));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [notificationEndpoint.my, userId]);

  useEffect(() => {
    fetchSellerNotifications();
  }, [fetchSellerNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    return notifications
      .filter((notification) => activeTab === "ALL" || !notification.isRead)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [activeTab, notifications]);

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) return;

    setMarkingId(notificationId);

    try {
      const response = await api.put(notificationEndpoint.markAsRead(notificationId));
      const updatedNotification = extractData(response);

      setNotifications((prev) =>
        prev.map((notification) => {
          if (String(notification.id) !== String(notificationId)) {
            return notification;
          }

          return updatedNotification?.id
            ? updatedNotification
            : {
                ...notification,
                isRead: true,
              };
        })
      );

      window.dispatchEvent(new Event("notifications-changed"));
      message.success("Đã đánh dấu thông báo là đã đọc.");
    } catch (error) {
      console.error("Cannot mark seller notification as read", error);
      message.error(
        getApiErrorMessage(error, "Không thể cập nhật trạng thái thông báo.")
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead
    );

    if (unreadNotifications.length === 0) {
      message.info("Không có thông báo chưa đọc.");
      return;
    }

    setBulkLoading(true);

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          api.put(notificationEndpoint.markAsRead(notification.id))
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      window.dispatchEvent(new Event("notifications-changed"));
      message.success("Đã đánh dấu tất cả là đã đọc.");
    } catch (error) {
      console.error("Cannot mark all seller notifications as read", error);
      message.error(
        getApiErrorMessage(error, "Không thể đánh dấu tất cả là đã đọc.")
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!notificationId) return;

    setDeletingId(notificationId);

    try {
      await api.delete(notificationEndpoint.deleteMy(notificationId));

      setNotifications((prev) =>
        prev.filter(
          (notification) => String(notification.id) !== String(notificationId)
        )
      );

      window.dispatchEvent(new Event("notifications-changed"));
      message.success("Đã xóa thông báo.");
    } catch (error) {
      console.error("Cannot delete seller notification", error);
      message.error(getApiErrorMessage(error, "Không thể xóa thông báo."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = () => {
    if (!userId || notifications.length === 0) return;

    Modal.confirm({
      title: "Xóa thông báo bán hàng",
      content: "Bạn có chắc chắn muốn xóa toàn bộ thông báo bán hàng không?",
      okText: "Xóa tất cả",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        setBulkLoading(true);

        try {
          await Promise.all(
            notifications.map((notification) =>
              api.delete(notificationEndpoint.deleteMy(notification.id))
            )
          );

          setNotifications([]);
          window.dispatchEvent(new Event("notifications-changed"));
          message.success("Đã xóa tất cả thông báo bán hàng.");
        } catch (error) {
          console.error("Cannot delete all seller notifications", error);
          message.error(
            getApiErrorMessage(error, "Không thể xóa tất cả thông báo.")
          );
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const buildMenuItems = (notification) => {
    const items = [];

    if (!notification.isRead) {
      items.push({
        key: "read",
        label: "Đánh dấu đã đọc",
        icon: <CheckOutlined />,
        onClick: () => handleMarkAsRead(notification.id),
      });
    }

    items.push({
      key: "delete",
      danger: true,
      label: "Xóa thông báo",
      icon: <DeleteOutlined />,
      onClick: () => handleDelete(notification.id),
    });

    return items;
  };

  if (!userId) {
    return (
      <div className="min-h-[70vh] px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <BellOutlined className="mb-4 text-5xl text-blue-500" />
          <Title level={2}>Bạn chưa đăng nhập</Title>
          <Paragraph className="text-gray-500">
            Vui lòng đăng nhập để xem thông báo bán hàng.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/auth/login-register")}
            className="!rounded-xl !bg-blue-600 hover:!bg-blue-700"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <Badge count={unreadCount} offset={[2, -2]}>
                  <BellOutlined className="text-3xl text-white" />
                </Badge>

                <Title level={2} className="!mb-0 !text-white">
                  Thông báo bán hàng
                </Title>
              </div>

              <Text className="!text-white/90">
                Cập nhật đơn hàng mới và số lượng sản phẩm đã thanh toán.
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={fetchSellerNotifications}
                className="!rounded-xl"
              >
                Làm mới
              </Button>

              <Button
                icon={<CheckCircleOutlined />}
                loading={bulkLoading}
                onClick={handleMarkAllAsRead}
                className="!rounded-xl"
              >
                Đánh dấu tất cả đã đọc
              </Button>

              <Button
                danger
                icon={<ClearOutlined />}
                loading={bulkLoading}
                disabled={notifications.length === 0}
                onClick={handleDeleteAll}
                className="!rounded-xl"
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl border-0 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 rounded-2xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
                  activeTab === "ALL"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                Tất cả
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("UNREAD")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition ${
                  activeTab === "UNREAD"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <Text type="secondary">
              Tổng cộng: <strong>{notifications.length}</strong> thông báo
            </Text>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <Spin size="large" tip="Đang tải thông báo bán hàng..." />
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <Empty description="Chưa có thông báo bán hàng nào." />

              <Button
                type="primary"
                onClick={() => navigate("/seller/dashboard")}
                className="mt-5 !rounded-xl !bg-blue-600 hover:!bg-blue-700"
              >
                Về dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedNotifications.map((notification) => {
                const isUnread = !notification.isRead;
                const visual = getNotificationVisual(notification.type);

                return (
                  <article
                    key={notification.id}
                    className={`relative rounded-3xl border p-4 transition hover:border-blue-300 hover:shadow-sm ${
                      isUnread
                        ? "border-blue-200 bg-blue-50/70"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    {isUnread && (
                      <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}

                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${visual.iconClassName}`}>
                        <ShoppingOutlined />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 pr-8">
                          <Title level={5} className="!mb-0">
                            {notification.title || "Thông báo bán hàng"}
                          </Title>

                          <Tag color={visual.tagColor}>{visual.label}</Tag>

                          {isUnread && <Tag color="orange">Chưa đọc</Tag>}
                        </div>

                        <Paragraph className="!mb-2 text-gray-600">
                          {notification.message || "Không có nội dung thông báo."}
                        </Paragraph>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <span>{formatTime(notification.createdAt)}</span>

                          {notification.relatedEntityType && (
                            <span>· Liên quan: {notification.relatedEntityType}</span>
                          )}
                        </div>
                      </div>

                      <Dropdown
                        trigger={["click"]}
                        menu={{
                          items: buildMenuItems(notification),
                        }}
                      >
                        <Button
                          shape="circle"
                          icon={<MoreOutlined />}
                          loading={
                            String(markingId) === String(notification.id) ||
                            String(deletingId) === String(notification.id)
                          }
                          onClick={(event) => event.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
