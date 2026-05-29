import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { message, Upload, Button, Input } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import api from '../../../Apis/apiConfig';
import USER_ENDPOINTS from '../../../Apis/userEndpoints';
import { getStoredAuth, saveAuthUser } from '../../../Utils/Auth';

export default function SellerProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({ fullName: '', email: '' });

  const handleAvatarUpdate = useOutletContext();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(USER_ENDPOINTS.profile);
        const profile = response?.data || response;
        setUser(profile);
        setFormValues({ fullName: profile.fullName || '', email: profile.email || '' });
      } catch (error) {
        console.error('Lỗi khi tải thông tin seller profile', error);
        message.error('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id).then(() => {
      message.success('Đã sao chép Account ID vào khay nhớ tạm!');
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormValues({ fullName: user.fullName || '', email: user.email || '' });
    }
    setIsEditing(false);
  };

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        fullName: formValues.fullName,
        email: formValues.email
      };
      const response = await api.put(USER_ENDPOINTS.updateProfile, payload);
      const updatedUser = response?.data || response;
      setUser(updatedUser);
      setFormValues({ fullName: updatedUser.fullName || '', email: updatedUser.email || '' });
      setIsEditing(false);
      message.success('Cập nhật thông tin thành công!');

      const currentLocalData = getStoredAuth();
      if (currentLocalData) {
        saveAuthUser({ ...currentLocalData, fullName: updatedUser.fullName, email: updatedUser.email });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật profile', error);
      message.error('Cập nhật thông tin không thành công. Vui lòng thử lại.');
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file ảnh!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUploadAvatar = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.postFormData(USER_ENDPOINTS.updateAvatar, formData);
      const updatedUser = response?.data || response;
      const newAvatarUrl = `${updatedUser.avatarUrl}?t=${new Date().getTime()}`;
      setUser((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      handleAvatarUpdate(newAvatarUrl);
      const currentLocalData = getStoredAuth();
      if (currentLocalData) {
        saveAuthUser({ ...currentLocalData, avatarUrl: newAvatarUrl });
      }

      message.success('Cập nhật ảnh đại diện thành công!');
      onSuccess('ok');
    } catch (error) {
      console.error('Lỗi upload avatar:', error);
      message.error('Lỗi khi tải ảnh lên. Vui lòng thử lại!');
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gray-600 flex items-center gap-2">
          <LoadingOutlined className="text-blue-600 text-xl" />
          <span>Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  return (
    // Sử dụng w-full và max-w-7xl để mở rộng vùng hiển thị
    <div className="w-full max-w-7xl mx-auto pb-8">
      
      {/* --- Profile Header Section --- */}
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
        {/* Ảnh bìa (Cover) - Hỗ trợ Responsive height */}
        <div className="h-40 sm:h-48 md:h-56 bg-blue-600 relative">
          <img 
            alt="Profile Cover" 
            className="w-full h-full object-cover mix-blend-overlay opacity-40" 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
          />
        </div>
        
        {/* Căn giữa trên Mobile, Căn trái trên Desktop */}
        <div className="px-6 sm:px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10 text-center md:text-left">
          
          {/* Avatar Upload */}
          <div className="relative group shrink-0">
            <img
              alt="Seller Avatar"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-white object-cover"
              src={user.avatarUrl || 'https://via.placeholder.com/150'}
            />
            <div className="absolute inset-0 flex items-center justify-center md:items-end md:pb-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full md:bg-transparent">
              <Upload
                name="file"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={handleUploadAvatar}
              >
                <button
                  type="button"
                  disabled={uploading}
                  className="bg-blue-600/90 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed"
                >
                  {uploading ? <LoadingOutlined /> : <UploadOutlined />}
                </button>
              </Upload>
            </div>
          </div>

          {/* User Basic Info */}
          <div className="flex-1 w-full pb-2">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 line-clamp-1">{user.fullName}</h1>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
                {user.role}
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-500 mt-2">{user.email}</p>
          </div>
        </div>
      </div>

      {/* --- Profile Details Card --- */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
        
        {/* Responsive Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">badge</span>
            Hồ sơ cá nhân
          </h3>
          
          <div className="w-full sm:w-auto">
            {isEditing ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button size="large" onClick={handleCancelEdit} className="flex-1 sm:flex-none">Hủy bỏ</Button>
                <Button type="primary" size="large" onClick={handleSaveProfile} className="bg-blue-600 flex-1 sm:flex-none">
                  Lưu thay đổi
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleStartEdit}
                size="large"
                className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                Cập nhật hồ sơ
              </Button>
            )}
          </div>
        </div>

        {/* Thông tin hiển thị dạng Grid - Tối ưu khoảng cách cho khung rộng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-8">
          
          {/* Cột 1: Họ và tên */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Họ và tên</p>
            {isEditing ? (
              <Input size="large" value={formValues.fullName} onChange={handleChange('fullName')} className="w-full" />
            ) : (
              <p className="text-base text-gray-900 font-medium py-1">{user.fullName}</p>
            )}
          </div>

          {/* Cột 2: Email */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Địa chỉ Email</p>
            {isEditing ? (
              <Input size="large" value={formValues.email} onChange={handleChange('email')} className="w-full" />
            ) : (
              <p className="text-base text-gray-900 font-medium py-1">{user.email}</p>
            )}
          </div>

          {/* Account ID - Chiếm cả 2 cột trên khung rộng */}
          <div className="space-y-2 md:col-span-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mã định danh (Account ID)</p>
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 overflow-hidden">
              <code className="text-sm font-mono text-blue-600 truncate mr-4">{user.id}</code>
              <button
                onClick={handleCopyId}
                className="flex items-center justify-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0"
                title="Sao chép ID"
              >
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
            </div>
          </div>

          {/* Cột 1: Ngày tạo */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ngày tham gia</p>
            <p className="text-base text-gray-900 font-medium py-1">{formatDateTime(user.createdAt)}</p>
          </div>

          {/* Cột 2: Trạng thái */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái hoạt động</p>
            <div className="py-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider">Đang hoạt động</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}