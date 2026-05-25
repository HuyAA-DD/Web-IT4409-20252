import React, { useState, useMemo, useEffect } from 'react';
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
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import { getAuthUser } from '../../../Utils/Auth';

// const mockUserNotifications = [];

export default function NotificationPage() {
  const authUser = getAuthUser();
  const userId = authUser?.id;
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD'

  const {isDarkMode}  = useOutletContext();

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const endpoint = activeTab === 'UNREAD'
          ? API_ENDPOINTS.notifications.unreadByUser(userId)
          : API_ENDPOINTS.notifications.byUser(userId);
        const response = await api.get(endpoint);
        setNotifications(response?.data || response || []);
      } catch (error) {
        console.error('Lỗi khi tải thông báo', error);
      }
    };

    fetchNotifications();
  }, [userId, activeTab]);

  // --- XỬ LÝ ĐÁNH DẤU ĐÃ ĐỌC (Từng cái) ---
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(API_ENDPOINTS.notifications.markAsRead(id));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      message.success('Đã đánh dấu là đã đọc.');
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc', error);
      message.error('Không thể cập nhật trạng thái thông báo.');
    }
  };

  // --- XỬ LÝ XÓA THÔNG BÁO (Từng cái) ---
  const handleDelete = async (id) => {
    try {
      await api.delete(API_ENDPOINTS.notifications.byId(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      message.success('Đã xóa thông báo!');
    } catch (error) {
      console.error('Lỗi xóa thông báo', error);
      message.error('Không thể xóa thông báo.');
    }
  };

  // --- XỬ LÝ XÓA TẤT CẢ ---
  const handleDeleteAll = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo không?')) {
      try {
        await Promise.all(notifications.map((notif) => api.delete(API_ENDPOINTS.notifications.byId(notif.id))));
        setNotifications([]);
        message.success('Đã dọn dẹp hòm thư thông báo!');
      } catch (error) {
        console.error('Lỗi xóa tất cả thông báo', error);
        message.error('Không thể xóa tất cả thông báo.');
      }
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