import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogoutOutlined, 
  MailOutlined, 
  IdcardOutlined, 
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Tag, Button } from 'antd';

// --- MOCK DATA ---
// Dữ liệu giả lập khớp với DTO UserResponse
const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "giahuy@example.com",
  fullName: "Gia Huy",
  role: "USER", 
  createdAt: "2026-04-10T08:15:30"
};

export default function UserProfilePage() {
  const navigate = useNavigate();
  // Khởi tạo state với mock data (Sau này sẽ thay bằng dữ liệu gọi từ API)
  const [user, setUser] = useState(mockUser);

  // =========================================================================
  // TODO: [API_CALL] - Lấy thông tin user đang đăng nhập
  // =========================================================================
  /*
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // const response = await axios.get('/api/v1/users/me');
        // setUser(response.data.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng", error);
      }
    };
    fetchUserProfile();
  }, []);
  */

  // --- XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = () => {
    // TODO: Thêm logic xóa Token / Context / Redux Store ở đây
    // localStorage.removeItem('token');
    
    // Điều hướng ra trang đăng nhập
    navigate('auth/login&register');
  };

  // --- UI HELPERS ---
  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleTag = (role) => {
    switch (role) {
      case 'ADMIN': return <Tag color="red" className="m-0">Quản trị viên (ADMIN)</Tag>;
      case 'SELLER': return <Tag color="orange" className="m-0">Người bán (SELLER)</Tag>;
      default: return <Tag color="blue" className="m-0">Thành viên (USER)</Tag>;
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center text-gray-500">Đang tải thông tin...</div>;

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 flex items-center justify-center font-sans animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg  overflow-hidden">
        
        {/* --- HEADER BANNER & AVATAR --- */}
        <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
          <div className="absolute -bottom-12 inset-x-0 flex justify-center">
            <div className="p-1.5 bg-white rounded-full shadow-sm">
              <Avatar 
                size={96} 
                icon={<UserOutlined />} 
                className="bg-orange-100 text-orange-600 border border-gray-100 text-4xl flex items-center justify-center"
              />
            </div>
          </div>
        </div>

        {/* --- THÔNG TIN NGƯỜI DÙNG --- */}
        <div className="pt-16 pb-8 px-8 text-center">
          <h2 className="text-2xl font-black text-gray-800 m-0 mb-2">{user.fullName}</h2>
          <div className="flex justify-center mb-6">
            {getRoleTag(user.role)}
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left space-y-4">
            
            {/* ID */}
            <div className="flex items-start gap-3">
              <IdcardOutlined className="text-gray-400 text-lg mt-0.5" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider m-0 mb-1">ID Người Dùng</p>
                <p className="text-sm font-mono text-gray-800 m-0 truncate" title={user.id}>{user.id}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <MailOutlined className="text-gray-400 text-lg mt-0.5" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider m-0 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-800 m-0 truncate" title={user.email}>{user.email}</p>
              </div>
            </div>

            {/* Phân quyền */}
            <div className="flex items-start gap-3">
              <SafetyCertificateOutlined className="text-gray-400 text-lg mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider m-0 mb-1">Quyền hạn hệ thống</p>
                <p className="text-sm font-medium text-gray-800 m-0">{user.role}</p>
              </div>
            </div>

            {/* Ngày tham gia */}
            <div className="flex items-start gap-3">
              <CalendarOutlined className="text-gray-400 text-lg mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider m-0 mb-1">Ngày tham gia</p>
                <p className="text-sm font-medium text-gray-800 m-0">{formatDate(user.createdAt)}</p>
              </div>
            </div>

          </div>

          {/* --- NÚT ĐĂNG XUẤT --- */}
          <div className="mt-8">
            <Button 
              type="primary" 
              danger 
              size="large" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="w-full h-12 rounded-xl font-bold shadow-sm"
            >
              Đăng xuất
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}