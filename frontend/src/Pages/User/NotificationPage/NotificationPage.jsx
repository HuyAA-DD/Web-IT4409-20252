import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
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
  BellTwoTone
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

const getNotificationVisual = (type, isDarkMode) => {
  const normalizedType = normalizeType(type);
  switch (normalizedType) {
    case "ORDER":
      return {
        icon: <ShoppingOutlined />,
        color: "blue",
        className: isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600",
        label: "Đơn hàng",
      };
    case "PAYMENT":
      return {
        icon: <WalletOutlined />,
        color: "green",
        className: isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600",
        label: "Thanh toán",
      };
    case "PROMOTION":
    case "COUPON":
      return {
        icon: <GiftOutlined />,
        color: "orange",
        className: isDarkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-50 text-orange-600",
        label: "Khuyến mãi",
      };
    case "PRODUCT":
      return {
        icon: <TagsOutlined />,
        color: "purple",
        className: isDarkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-50 text-purple-600",
        label: "Sản phẩm",
      };
    default:
      return {
        icon: <NotificationOutlined />,
        color: "default",
        className: isDarkMode ? "bg-slate-800 text-gray-300" : "bg-gray-100 text-gray-600",
        label: "Hệ thống",
      };
  }
};

const getTargetPath = (notification) => {
  const relatedType = normalizeType(notification?.relatedEntityType);
  const relatedId = notification?.relatedEntityId;

  if (!relatedId) return null;

  if (relatedType === "ORDER") return `/orders/${relatedId}`;
  if (relatedType === "PRODUCT") return `/products/${relatedId}`;
  if (relatedType === "COUPON" || relatedType === "PROMOTION") return "/cart";

  return null;
};

const NotificationPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const isDarkMode = Boolean(outletContext?.isDarkMode);

  const authUser = getAuthUser();
  const userId = authUser?.id;

  const notificationEndpoint = API_ENDPOINTS.notifications || API_ENDPOINTS.notification;

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
      const endpoint = activeTab === "UNREAD" ? notificationEndpoint.myUnread : notificationEndpoint.my;
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
          if (String(notification.id) !== String(notificationId)) return notification;
          return updatedNotification?.id ? updatedNotification : { ...notification, isRead: true };
        })
      );
      window.dispatchEvent(new Event("notifications-changed"));
      message.success("Đã đánh dấu thông báo là đã đọc.");
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
      message.error(getApiErrorMessage(error, "Không thể cập nhật trạng thái thông báo."));
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.isRead);
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
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      window.dispatchEvent(new Event("notifications-changed"));
      message.success("Đã đánh dấu tất cả là đã đọc.");
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
      message.error(getApiErrorMessage(error, "Không thể đánh dấu tất cả là đã đọc."));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!notificationId) return;
    setDeletingId(notificationId);
    try {
      await api.delete(notificationEndpoint.deleteMy(notificationId));
      setNotifications((prev) => prev.filter((notification) => String(notification.id) !== String(notificationId)));
      window.dispatchEvent(new Event("notifications-changed"));
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
      title: <span className={isDarkMode ? 'text-white' : ''}>Xóa tất cả thông báo</span>,
      content: <span className={isDarkMode ? 'text-gray-400' : ''}>Bạn có chắc chắn muốn xóa toàn bộ thông báo của mình không?</span>,
      okText: "Xóa tất cả",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      className: isDarkMode ? "dark-modal" : "",
      styles: { content: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, header: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f0f0f0' } },
      onOk: async () => {
        setBulkLoading(true);
        try {
          await api.delete(notificationEndpoint.deleteMyAll);
          setNotifications([]);
          window.dispatchEvent(new Event("notifications-changed"));
          message.success("Đã xóa tất cả thông báo.");
        } catch (error) {
          console.error("Lỗi xóa tất cả thông báo:", error);
          message.error(getApiErrorMessage(error, "Không thể xóa tất cả thông báo."));
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
      <div className={`min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'}`}>
        <div className={`mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <BellOutlined className="mb-4 text-5xl text-orange-500" />
          <Title level={2} className={isDarkMode ? '!text-white' : ''}>Bạn chưa đăng nhập</Title>
          <Paragraph className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Vui lòng đăng nhập để xem thông báo của bạn.</Paragraph>
          <Button type="primary" size="large" onClick={() => navigate("/auth/login-register")} className="mt-4 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8">
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full bg-transparent`}>
      <div className="mx-auto w-full max-w-[1800px]">
        
        {/* COMPONENT: HERO BANNER (IMAGE VỚI GRADIENT OVERLAY L TO R) */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 min-h-[180px] md:min-h-[220px] flex items-center border ${
          isDarkMode ? 'border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.6)]' : 'border-orange-400 shadow-xl shadow-orange-500/10'
        }`}>
          {/* Background Image abstract concept for notifications */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1577563908411-50cb98976fea?q=80&w=1920&auto=format&fit=crop" 
              alt="Notifications Background" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Lớp mờ Linear phủ hoàn toàn mặt banner */}
          <div className={`absolute inset-0 z-10 bg-gradient-to-r ${
            isDarkMode 
              ? 'from-slate-950 via-slate-950/90 to-transparent' 
              : 'from-orange-600 via-orange-500/90 to-transparent'
          }`}></div>
          
          <div className="relative z-20 p-6 md:p-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl backdrop-blur-md ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'}`}>
                  <Badge count={unreadCount} offset={[4, -4]} color="#ef4444">
                    <BellTwoTone twoToneColor={isDarkMode ? "#f97316" : "#ffffff"} className="text-3xl" />
                  </Badge>
                </div>
                <h1 className="m-0 text-3xl md:text-4xl font-black tracking-tight text-white">Thông báo của bạn</h1>
              </div>
              <p className="text-sm md:text-base text-white/90">
                Cập nhật đơn hàng, thanh toán, khuyến mãi và các thông báo hệ thống mới nhất.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={fetchNotifications}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 hover:border-orange-500' 
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white'
                }`}
              >
                <ReloadOutlined spin={loading} /> Làm mới
              </button>

              <button 
                onClick={handleMarkAllAsRead}
                disabled={bulkLoading || unreadCount === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 hover:border-emerald-500 disabled:opacity-50' 
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white disabled:opacity-50'
                }`}
              >
                <CheckCircleOutlined /> Đọc tất cả
              </button>

              <button 
                onClick={handleDeleteAll}
                disabled={bulkLoading || notifications.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50' 
                    : 'bg-white text-red-500 border-0 hover:bg-red-50 disabled:opacity-50'
                }`}
              >
                <ClearOutlined /> Xóa tất cả
              </button>
            </div>
          </div>
        </section>

        {/* COMPONENT: TABS & STATS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'}`}>
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "ALL"
                  ? isDarkMode ? "bg-slate-800 text-orange-400 shadow-sm" : "bg-white text-orange-600 shadow-sm"
                  : isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("UNREAD")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "UNREAD"
                  ? isDarkMode ? "bg-slate-800 text-orange-400 shadow-sm" : "bg-white text-orange-600 shadow-sm"
                  : isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Chưa đọc
              {unreadCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  activeTab === "UNREAD" ? "bg-orange-500 text-white" : isDarkMode ? "bg-slate-700 text-gray-300" : "bg-gray-200 text-gray-600"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Tổng cộng: <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{notifications.length}</strong> thông báo
          </div>
        </div>

        {/* DANH SÁCH THÔNG BÁO */}
        {loading ? (
          <div className={`flex min-h-[360px] items-center justify-center rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
            <Spin size="large" tip="Đang tải thông báo..." />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className={`rounded-3xl px-6 py-20 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <Empty description={<span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Bạn chưa có thông báo nào.</span>} />
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/supermarket")}
              className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedNotifications.map((notification) => {
              const visual = getNotificationVisual(notification.type, isDarkMode);
              const targetPath = getTargetPath(notification);
              const isUnread = !notification.isRead;

              return (
                <article
                  key={notification.id}
                  className={`relative p-5 md:p-6 rounded-2xl border transition-all duration-300 group flex items-start gap-4 md:gap-5 ${
                    isUnread
                      ? isDarkMode 
                        ? "border-l-4 border-l-orange-500 bg-slate-900 border-slate-800 shadow-md" 
                        : "border-l-4 border-l-orange-500 bg-orange-50/50 border-orange-200 shadow-sm"
                      : isDarkMode 
                        ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700" 
                        : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                  }`}
                >
                  {isUnread && (
                    <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  )}

                  <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-bold border transition-transform group-hover:scale-110 ${visual.className} ${isDarkMode ? 'border-transparent' : 'border-current/10'}`}>
                    {visual.icon}
                  </div>

                  <div 
                    className={`flex-1 min-w-0 ${targetPath ? "cursor-pointer" : ""}`}
                    onClick={() => handleOpenNotification(notification)}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 pr-8">
                      <h3 className={`font-black text-base m-0 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {notification.title || "Thông báo"}
                      </h3>
                      <Tag color={visual.color} className="!m-0 !rounded-md uppercase text-[10px] tracking-wider font-bold">
                        {visual.label}
                      </Tag>
                      {isUnread && <Tag color="orange" className="!m-0 !rounded-md uppercase text-[10px] tracking-wider font-bold">Chưa đọc</Tag>}
                    </div>

                    <p className={`text-sm mb-3 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {notification.message || "Không có nội dung thông báo."}
                    </p>

                    <div className={`flex flex-wrap items-center gap-2 text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>{formatTime(notification.createdAt)}</span>
                      {notification.relatedEntityType && (
                        <span>&bull; Liên quan: {notification.relatedEntityType}</span>
                      )}
                      {targetPath && (
                        <span className="font-bold text-orange-500 hover:underline transition-all">
                          &bull; Bấm để xem chi tiết
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    <Dropdown
                      trigger={["click"]}
                      menu={{ items: buildMenuItems(notification) }}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        shape="circle"
                        icon={<MoreOutlined className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} />}
                        loading={
                          String(markingId) === String(notification.id) ||
                          String(deletingId) === String(notification.id)
                        }
                        onClick={(event) => event.stopPropagation()}
                        className={isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}
                      />
                    </Dropdown>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;