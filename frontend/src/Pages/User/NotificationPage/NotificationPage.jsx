import React, { useState, useMemo } from 'react';
import { 
  BellOutlined, 
  ShoppingOutlined, 
  GiftOutlined, 
  NotificationOutlined,
  CheckOutlined,
  DeleteOutlined,
  ClearOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { message, Dropdown } from 'antd';
import { useOutletContext } from 'react-router-dom';

// --- [MOCK_DATA] --- Dữ liệu giả lập cho USER
// Phản ánh các luồng: Đơn hàng, Khuyến mãi, Hệ thống...
const mockUserNotifications = [
  { id: "n-u-01", userId: "u-123", title: "Đơn hàng đang được giao!", message: "Đơn hàng #f47ac10b của bạn đã được giao cho đơn vị vận chuyển. Vui lòng chú ý điện thoại.", type: "ORDER", relatedEntityType: "ORDER", relatedEntityId: "f47ac10b", isRead: false, isSent: true, createdAt: "2026-05-18T08:30:00" },
  { id: "n-u-02", userId: "u-123", title: "Tặng bạn mã Giảm giá 50K 🎁", message: "MegaMart tặng bạn mã FREESHIP50 cho đơn hàng từ 200k. Hạn sử dụng đến cuối tháng này. Mua sắm ngay!", type: "PROMOTION", relatedEntityType: "COUPON", relatedEntityId: "c-002", isRead: false, isSent: true, createdAt: "2026-05-17T14:00:00" },
  { id: "n-u-03", userId: "u-123", title: "Thanh toán thành công", message: "Đơn hàng #e28bc21c đã được thanh toán qua VNPay thành công. Chúng tôi đang đóng gói sản phẩm.", type: "ORDER", relatedEntityType: "ORDER", relatedEntityId: "e28bc21c", isRead: true, isSent: true, createdAt: "2026-05-16T10:15:00" },
  { id: "n-u-04", userId: "u-123", title: "Chào mừng đến với MegaMart", message: "Cảm ơn bạn đã đăng ký tài khoản. Hãy khám phá hàng ngàn sản phẩm ưu đãi dành riêng cho bạn.", type: "SYSTEM", relatedEntityType: "USER", relatedEntityId: "u-123", isRead: true, isSent: true, createdAt: "2026-05-10T09:00:00" },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(mockUserNotifications);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD'

  const {isDarkMode}  = useOutletContext();

  // =========================================================================
  // TODO: [API_CALL] - Tích hợp các API của User theo tài liệu
  // Lấy userId từ Context (VD: AuthContext.user.id)
  // const userId = "u-123"; 
  // =========================================================================
  /*
  useEffect(() => {
    // 1. GET /api/v1/notifications/by-user/:userId
    // Hoặc GET /api/v1/notifications/by-user/:userId/unread (Nếu activeTab === 'UNREAD')
    // axios.get(`/api/v1/notifications/by-user/${userId}`).then(...)
  }, [activeTab]);
  */

  // --- XỬ LÝ ĐÁNH DẤU ĐÃ ĐỌC (Từng cái) ---
  const handleMarkAsRead = (id) => {
    // TODO: [API_CALL] - PUT /api/v1/notification/:id/mark-as-read
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // --- XỬ LÝ XÓA THÔNG BÁO (Từng cái) ---
  const handleDelete = (id) => {
    // TODO: [API_CALL] - DELETE /api/v1/notifications/:id
    setNotifications(prev => prev.filter(n => n.id !== id));
    message.success("Đã xóa thông báo!");
  };

  // --- XỬ LÝ XÓA TẤT CẢ ---
  const handleDeleteAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả thông báo không?")) {
      // TODO: [API_CALL] - DELETE /api/v1/notifications/by-user/:userId
      setNotifications([]);
      message.success("Đã dọn dẹp hòm thư thông báo!");
    }
  };

  // --- HELPERS GIAO DIỆN ---
  const getIconAndColor = (type) => {
    switch(type) {
      case 'ORDER': return { icon: <ShoppingOutlined />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'PROMOTION': return { icon: <GiftOutlined />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' };
      default: return { icon: <NotificationOutlined />, color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400' };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Lọc dữ liệu hiển thị theo Tab
  const displayedNotifications = useMemo(() => {
    return notifications.filter(n => activeTab === 'ALL' || (activeTab === 'UNREAD' && !n.isRead))
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in transition-colors duration-500 min-h-[70vh]">
      
      {/* HEADER KHÁCH HÀNG */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-black ${isDarkMode ? "text-shadow-amber-100" : "text-gray-800"} dark:text-gray-100 m-0 `}>Thông báo của bạn</h1>
          <p className={` dark:text-gray-400 text-sm mt-1 mb-0 ${isDarkMode ? "text-amber-100" : "text-gray-500"}`}>Cập nhật đơn hàng và khuyến mãi mới nhất.</p>
        </div>
        
        {notifications.length > 0 && (
          <button 
            onClick={handleDeleteAll}
            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
          >
            <ClearOutlined /> Xóa tất cả
          </button>
        )}
      </div>

      {/* TABS LỌC (Khách hàng quen dùng Tab ngang) */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-slate-700 mb-4">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'ALL' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 dark:hover:text-gray-300'} ${isDarkMode ? "hover:text-white" : "hover:text-red-500"}`}
        >
          Tất cả thông báo
        </button>
        <button 
          onClick={() => setActiveTab('UNREAD')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'UNREAD' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
        >
          Chưa đọc 
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full line-height-none">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* LIST THÔNG BÁO */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {displayedNotifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <BellOutlined className="text-5xl mb-4 opacity-20" />
            <p className="text-base font-medium m-0">Tuyệt vời! Bạn không bỏ lỡ thông báo nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700/80">
            {displayedNotifications.map(notif => {
              const { icon, color } = getIconAndColor(notif.type);
              
              // Dropdown Menu cho từng Item
              const menuItems = [
                !notif.isRead && { key: 'read', label: 'Đánh dấu đã đọc', icon: <CheckOutlined />, onClick: () => handleMarkAsRead(notif.id) },
                { key: 'delete', label: <span className="text-red-500">Xóa thông báo</span>, icon: <DeleteOutlined className="text-red-500"/>, onClick: () => handleDelete(notif.id) },
              ].filter(Boolean); // Lọc bỏ giá trị false (khi đã đọc rồi thì ẩn nút Đánh dấu)

              return (
                <div 
                  key={notif.id} 
                  className={`p-5 flex gap-4 transition-colors relative hover:bg-gray-50 dark:hover:bg-slate-700/50 ${!notif.isRead ? 'bg-orange-50/30 dark:bg-slate-700/30' : ''}`}
                >
                  {/* Chấm bi chưa đọc */}
                  {!notif.isRead && <div className="absolute top-1/2 -translate-y-1/2 left-2 w-2 h-2 rounded-full bg-orange-500"></div>}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xl ml-2 ${color}`}>
                    {icon}
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1">
                    <h4 className={`text-base m-0 mb-1 ${!notif.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>
                      {notif.title}
                    </h4>
                    <p className={`text-sm m-0 leading-relaxed mb-2 ${!notif.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {notif.message}
                    </p>
                    <span className="text-xs text-gray-400 font-mono">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>

                  {/* Nút thao tác (3 chấm) */}
                  <div className="shrink-0">
                    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        <MoreOutlined className="text-lg" />
                      </button>
                    </Dropdown>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}