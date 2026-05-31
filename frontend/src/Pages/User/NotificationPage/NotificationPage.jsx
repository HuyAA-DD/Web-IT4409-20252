import React, { useEffect, useMemo, useState } from "react";
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
  GiftOutlined,
  MoreOutlined,
  NotificationOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  TagsOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

const { Title, Text, Paragraph } = Typography;

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

const normalizeType = (type) => {
  return String(type || "SYSTEM").toUpperCase();
};

const getNotificationVisual = (type) => {
  const normalizedType = normalizeType(type);

  switch (normalizedType) {
    case "ORDER":
      return {
        icon: <ShoppingOutlined />,
        color: "blue",
        className:
          "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Đơn hàng",
      };

    case "PAYMENT":
      return {
        icon: <WalletOutlined />,
        color: "green",
        className:
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        label: "Thanh toán",
      };

    case "PROMOTION":
    case "COUPON":
      return {
        icon: <GiftOutlined />,
        color: "orange",
        className:
          "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        label: "Khuyến mãi",
      };

    case "PRODUCT":
      return {
        icon: <TagsOutlined />,
        color: "purple",
        className:
          "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        label: "Sản phẩm",
      };

    default:
      return {
        icon: <NotificationOutlined />,
        color: "default",
        className:
          "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300",
        label: "Hệ thống",
      };
  }
};

const getTargetPath = (notification) => {
  const relatedType = normalizeType(notification?.relatedEntityType);
  const relatedId = notification?.relatedEntityId;

  if (!relatedId) return null;

  if (relatedType === "ORDER") {
    return `/orders/${relatedId}`;
  }

  if (relatedType === "PRODUCT") {
    return `/products/${relatedId}`;
  }

  if (relatedType === "COUPON" || relatedType === "PROMOTION") {
    return "/cart";
  }

  return null;
};

const NotificationPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const isDarkMode = Boolean(outletContext?.isDarkMode);

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

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        activeTab === "UNREAD"
          ? notificationEndpoint.myUnread
          : notificationEndpoint.my;

      const response = await api.get(endpoint);
      const data = extractData(response);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      message.error(getApiErrorMessage(error, "Không thể tải thông báo."));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeTab]);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [notifications]);

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

      message.success("Đã đánh dấu thông báo là đã đọc.");
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
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

      message.success("Đã đánh dấu tất cả là đã đọc.");
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
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

      message.success("Đã xóa thông báo.");
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
      message.error(getApiErrorMessage(error, "Không thể xóa thông báo."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = () => {
    if (!userId || notifications.length === 0) return;

    Modal.confirm({
      title: "Xóa tất cả thông báo",
      content: "Bạn có chắc chắn muốn xóa toàn bộ thông báo của mình không?",
      okText: "Xóa tất cả",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        setBulkLoading(true);

        try {
          await api.delete(notificationEndpoint.deleteMyAll);
          setNotifications([]);
          message.success("Đã xóa tất cả thông báo.");
        } catch (error) {
          console.error("Lỗi xóa tất cả thông báo:", error);
          message.error(
            getApiErrorMessage(error, "Không thể xóa tất cả thông báo.")
          );
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleOpenNotification = async (notification) => {
    if (!notification) return;

    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    const targetPath = getTargetPath(notification);

    if (targetPath) {
      navigate(targetPath);
      return;
    }

    message.info("Thông báo này chưa có trang chi tiết để mở.");
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

    const targetPath = getTargetPath(notification);

    if (targetPath) {
      items.push({
        key: "open",
        label: "Mở chi tiết",
        icon: <NotificationOutlined />,
        onClick: () => handleOpenNotification(notification),
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
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm dark:bg-slate-900">
          <BellOutlined className="mb-4 text-5xl text-orange-500" />

          <Title level={2}>Bạn chưa đăng nhập</Title>

          <Paragraph className="text-gray-500">
            Vui lòng đăng nhập để xem thông báo của bạn.
          </Paragraph>

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/auth/login-register")}
            className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-orange-50 via-white to-amber-50"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <Badge count={unreadCount} offset={[2, -2]}>
                  <BellOutlined className="text-3xl text-white" />
                </Badge>

                <Title level={2} className="!mb-0 !text-white">
                  Thông báo của bạn
                </Title>
              </div>

              <Text className="!text-white/90">
                Cập nhật đơn hàng, thanh toán, khuyến mãi và các thông báo hệ
                thống mới nhất.
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={fetchNotifications}
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

        <Card className="rounded-3xl border-0 shadow-sm dark:bg-slate-900">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 rounded-2xl bg-gray-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
                  activeTab === "ALL"
                    ? "bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400"
                    : "text-gray-500 hover:text-orange-600 dark:text-gray-400"
                }`}
              >
                Tất cả
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("UNREAD")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition ${
                  activeTab === "UNREAD"
                    ? "bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400"
                    : "text-gray-500 hover:text-orange-600 dark:text-gray-400"
                }`}
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
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
              <Spin size="large" tip="Đang tải thông báo..." />
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <Empty description="Bạn chưa có thông báo nào." />

              <Button
                type="primary"
                onClick={() => navigate("/supermarket")}
                className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedNotifications.map((notification) => {
                const visual = getNotificationVisual(notification.type);
                const targetPath = getTargetPath(notification);
                const isUnread = !notification.isRead;

                return (
                  <article
                    key={notification.id}
                    className={`relative rounded-3xl border p-4 transition hover:border-orange-300 hover:shadow-sm ${
                      isUnread
                        ? "border-orange-200 bg-orange-50/70 dark:border-orange-900/40 dark:bg-orange-950/20"
                        : "border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    {isUnread && (
                      <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-orange-500" />
                    )}

                    <div className="flex gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${visual.className}`}
                      >
                        {visual.icon}
                      </div>

                      <div
                        className={`min-w-0 flex-1 ${
                          targetPath ? "cursor-pointer" : ""
                        }`}
                        onClick={() => handleOpenNotification(notification)}
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2 pr-8">
                          <Title level={5} className="!mb-0">
                            {notification.title || "Thông báo"}
                          </Title>

                          <Tag color={visual.color}>{visual.label}</Tag>

                          {isUnread && <Tag color="orange">Chưa đọc</Tag>}
                        </div>

                        <Paragraph className="!mb-2 text-gray-600 dark:text-gray-300">
                          {notification.message || "Không có nội dung thông báo."}
                        </Paragraph>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <span>{formatTime(notification.createdAt)}</span>

                          {notification.relatedEntityType && (
                            <span>
                              · Liên quan: {notification.relatedEntityType}
                            </span>
                          )}

                          {targetPath && (
                            <span className="font-semibold text-orange-500">
                              · Bấm để xem chi tiết
                            </span>
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
};

export default NotificationPage;