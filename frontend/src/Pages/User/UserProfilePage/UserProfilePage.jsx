import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  LogoutOutlined, 
  MailOutlined, 
  IdcardOutlined, 
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  CameraOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Avatar, Tag, Button, message, Upload } from 'antd';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import { clearAuthUser, saveAuthUser, getStoredAuth } from '../../../Utils/Auth';
import Loading from '../../../Components/Loading/Loading';

export default function UserProfilePage() {
  const navigate = useNavigate();
  
  // Lấy hàm cập nhật Ref từ UserMainLayout
  const { isDarkMode, updateSharedAvatarRef } = useOutletContext(); 

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.users.profile);
        const profile = response?.data || response;
        setUser(profile);
        
        // Đồng bộ ảnh về Header nếu ảnh trên server khác với lúc login
        if (profile.avatarUrl) {
           updateSharedAvatarRef(profile.avatarUrl);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng', error);
        message.error('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    clearAuthUser();
    navigate('/auth/login&register');
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.postFormData(API_ENDPOINTS.users.updateAvatar, formData);
      const updatedUser = response?.data || response;
      const newAvatarUrl = `${updatedUser.avatarUrl}?t=${new Date().getTime()}`;

      // 1. Cập nhật giao diện trong Profile
      setUser(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      
      // 2. Cập nhật lưu trữ Local (để F5 không bị mất)
      const currentLocalData = getStoredAuth();
      if (currentLocalData) {
         saveAuthUser({ ...currentLocalData, avatarUrl: newAvatarUrl });
      }

      // 3. Cập nhật Shared Ref cho Navbar ở Layout thay đổi
      if (updateSharedAvatarRef) {
          updateSharedAvatarRef(newAvatarUrl);
      }
      
      onSuccess("ok");
      message.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Lỗi upload avatar:', error);
      onError(error);
      message.error('Lỗi khi tải ảnh lên. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

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

  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 flex items-center justify-center font-sans animate-fade-in">
      <div className="max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden transition-colors duration-300 w-full">
        
        {/* --- HEADER BANNER & AVATAR --- */}
        <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
          <div className="absolute -bottom-12 inset-x-0 flex justify-center">
            <div className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm transition-colors duration-300">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={customUpload}
              >
                <div className="relative group cursor-pointer rounded-full overflow-hidden">
                  <Avatar 
                    size={96} 
                    src={user.avatarUrl} 
                    icon={<UserOutlined />} 
                    className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-gray-100 dark:border-gray-700 text-4xl flex items-center justify-center transition-colors duration-300"
                  />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploading ? <LoadingOutlined className="text-white text-2xl" /> : <CameraOutlined className="text-white text-2xl" />}
                  </div>
                </div>
              </Upload>
            </div>
          </div>
        </div>

        {/* --- THÔNG TIN NGƯỜI DÙNG --- */}
        <div className="pt-16 pb-8 px-8 text-center">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white m-0 mb-2 transition-colors duration-300">{user.fullName}</h2>
          <div className="flex justify-center mb-6">
            {getRoleTag(user.role)}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-600 text-left space-y-4 transition-colors duration-300">
            
            <div className="flex items-start gap-3">
              <IdcardOutlined className="text-gray-400 dark:text-gray-300 text-lg mt-0.5" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider m-0 mb-1">ID Người Dùng</p>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-100 m-0 truncate" title={user.id}>{user.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MailOutlined className="text-gray-400 dark:text-gray-300 text-lg mt-0.5" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider m-0 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 m-0 truncate" title={user.email}>{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <SafetyCertificateOutlined className="text-gray-400 dark:text-gray-300 text-lg mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider m-0 mb-1">Quyền hạn hệ thống</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 m-0">{user.role}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarOutlined className="text-gray-400 dark:text-gray-300 text-lg mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider m-0 mb-1">Ngày tham gia</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 m-0">{formatDate(user.createdAt)}</p>
              </div>
            </div>

          </div>

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