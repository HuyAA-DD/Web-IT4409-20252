import React, { useState, useMemo } from 'react';
import { 
  BellOutlined, 
  CheckOutlined, 
  CheckCircleOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  TagOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { message } from 'antd';

// --- [MOCK_DATA] --- Dữ liệu giả lập khớp với DTO NotificationResponse
const mockNotifications = [
  { id: "n-001", userId: "admin-1", title: "Đơn hàng mới chờ xác nhận", message: "Khách hàng Nguyễn Văn A vừa đặt một đơn hàng mới (Tổng: 1.500.000đ). Vui lòng xử lý sớm.", type: "ORDER", relatedEntityType: "ORDER", relatedEntityId: "ord-883", isRead: false, isSent: true, createdAt: "2026-05-18T09:30:00" },
  { id: "n-002", userId: "admin-1", title: "Cảnh báo hết hàng", message: "Sản phẩm 'MacBook Air M2' (SKU: APL-MBA-M2) hiện chỉ còn 2 chiếc trong kho.", type: "ALERT", relatedEntityType: "PRODUCT", relatedEntityId: "p-02", isRead: false, isSent: true, createdAt: "2026-05-18T08:15:00" },
  { id: "n-003", userId: "admin-1", title: "Yêu cầu hoàn tiền", message: "Người dùng Trần Thị B đã gửi yêu cầu hoàn tiền cho đơn hàng #f47ac10b.", type: "ORDER", relatedEntityType: "ORDER", relatedEntityId: "f47ac10b-58cc-4372-a567-0e02b2c3d479", isRead: true, isSent: true, createdAt: "2026-05-17T15:45:00" },
  { id: "n-004", userId: "admin-1", title: "Khuyến mãi hết hạn", message: "Mã giảm giá 'FREESHIP50' đã hết hạn vào lúc 23:59 ngày hôm qua.", type: "PROMOTION", relatedEntityType: "COUPON", relatedEntityId: "c-002", isRead: true, isSent: true, createdAt: "2026-05-16T00:05:00" },
  { id: "n-005", userId: "admin-1", title: "Hệ thống bảo trì", message: "Lịch bảo trì máy chủ định kỳ sẽ diễn ra vào 02:00 AM ngày mai.", type: "SYSTEM", relatedEntityType: null, relatedEntityId: null, isRead: true, isSent: true, createdAt: "2026-05-15T10:00:00" },
  { id: "n-006", userId: "admin-1", title: "Người dùng mới đăng ký", message: "Có 50 người dùng mới đã đăng ký tài khoản trong 24 giờ qua.", type: "USER", relatedEntityType: "USER", relatedEntityId: null, isRead: true, isSent: true, createdAt: "2026-05-14T08:00:00" },
];

export default function AdminNotificationPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // =========================================================================
  // TODO: [API_CALL] - GET /api/v1/admin/notifications
  // =========================================================================
  /*
  React.useEffect(() => {
    // Lấy danh sách thông báo khi vào trang
    // axios.get('/api/v1/admin/notifications').then(res => setNotifications(res.data.data));
  }, []);
  */

  // --- XỬ LÝ ĐÁNH DẤU ĐÃ ĐỌC ---
  const handleMarkAsRead = (id) => {
    // TODO: [API_CALL] - PUT /api/v1/admin/notifications/{id}/read
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    // TODO: [API_CALL] - PUT /api/v1/admin/notifications/read-all
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    message.success("Đã đánh dấu tất cả là đã đọc!");
  };

  // --- XỬ LÝ XÓA THÔNG BÁO ---
  const handleDelete = (id) => {
    // TODO: [API_CALL] - DELETE /api/v1/admin/notifications/{id}
    setNotifications(prev => prev.filter(n => n.id !== id));
    message.success("Đã xóa thông báo!");
  };

  // --- UI HELPERS ---
  const getNotificationStyle = (type) => {
    switch(type) {
      case 'ORDER': return { icon: <ShoppingCartOutlined />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' };
      case 'ALERT': return { icon: <WarningOutlined />, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' };
      case 'PROMOTION': return { icon: <TagOutlined />, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' };
      case 'USER': return { icon: <UserOutlined />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' };
      default: return { icon: <InfoCircleOutlined />, color: 'text-gray-500 bg-gray-100 dark:bg-slate-700' };
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // --- LỌC VÀ PHÂN TRANG ---
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => filter === 'ALL' || (filter === 'UNREAD' && !n.isRead))
                        // Sắp xếp: Chưa đọc lên đầu, sau đó xếp theo thời gian mới nhất
                        .sort((a, b) => {
                          if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
                          return new Date(b.createdAt) - new Date(a.createdAt);
                        });
  }, [notifications, filter]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize) || 1;
  const paginatedNotifs = filteredNotifications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in transition-colors duration-500">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
            <BellOutlined className="text-orange-600" /> Thông báo hệ thống
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold relative -top-2">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý và theo dõi các hoạt động, cảnh báo mới nhất.</p>
        </div>
        
        <button 
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <CheckCircleOutlined className="text-emerald-500" /> Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 mb-6">
        <button 
          onClick={() => { setFilter('ALL'); setCurrentPage(1); }}
          className={`pb-3 font-bold text-sm px-2 transition-colors border-b-2 ${filter === 'ALL' ? 'border-orange-600 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          Tất cả thông báo
        </button>
        <button 
          onClick={() => { setFilter('UNREAD'); setCurrentPage(1); }}
          className={`pb-3 font-bold text-sm px-2 transition-colors border-b-2 flex items-center gap-1 ${filter === 'UNREAD' ? 'border-orange-600 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          Chưa đọc {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>}
        </button>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col min-h-[500px] transition-colors">
        <div className="flex-1">
          {paginatedNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <BellOutlined className="text-4xl mb-3 opacity-20" />
              <p className="font-medium">Bạn không có thông báo nào ở đây.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700/80">
              {paginatedNotifs.map(notif => {
                const style = getNotificationStyle(notif.type);
                
                return (
                  <div 
                    key={notif.id} 
                    className={`p-4 flex gap-4 transition-colors group relative ${!notif.isRead ? 'bg-orange-50/50 dark:bg-slate-700/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                  >
                    {/* Unread dot indicator */}
                    {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg mt-1 ${style.color}`}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <h4 className={`text-sm m-0 ${!notif.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs text-gray-400 font-mono shrink-0 whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm m-0 line-clamp-2 ${!notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {notif.message}
                      </p>

                      {/* Optional: Related Entity Link */}
                      {notif.relatedEntityId && (
                        <div className="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer inline-block">
                          Xem chi tiết {notif.relatedEntityType}
                        </div>
                      )}
                    </div>

                    {/* Actions (Hiện khi hover vào dòng) */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-center shrink-0 ml-2">
                      {!notif.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="Đánh dấu đã đọc"
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 flex items-center justify-center transition-colors"
                        >
                          <CheckOutlined />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(notif.id)}
                        title="Xóa thông báo"
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 disabled:opacity-30 transition-colors"
              >
                <LeftOutlined className="text-xs" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 disabled:opacity-30 transition-colors"
              >
                <RightOutlined className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}