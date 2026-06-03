import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  LogoutOutlined,
  UploadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Upload } from "antd";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import {
  clearAuthUser,
  getAuthUser,
  updateAuthUser,
} from "../../../Utils/Auth";

export default function UserProfilePage() {
  const navigate = useNavigate();

  // Lấy hàm cập nhật avatar trực tiếp trên Navbar từ Context của Layout
  const { updateSharedAvatarRef } = useOutletContext?.() || {};

  const [user, setUser] = useState(getAuthUser());
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // State cho Edit Form
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({ fullName: '', email: '' });

  const userEndpoint = useMemo(() => {
    return API_ENDPOINTS.users || API_ENDPOINTS.user || {};
  }, []);

  const profileEndpoint = userEndpoint.profile || "/users/me";
  const uploadAvatarEndpoint = userEndpoint.updateAvatar || "/api/v1/users/me/avatar";
  const updateProfileEndpoint = userEndpoint.updateProfile || "/users/me"; // Thêm endpoint cập nhật

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(profileEndpoint);
      const profile = response?.data || response;

      setUser(profile);
      updateAuthUser(profile);
      setFormValues({ fullName: profile.fullName || '', email: profile.email || '' });

      window.dispatchEvent(new Event("auth-changed"));
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      message.error("Không thể tải thông tin tài khoản. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearAuthUser();
    window.dispatchEvent(new Event("auth-changed"));
    message.success("Đã đăng xuất.");
    navigate("/auth/login-register", { replace: true });
  };

  // --- LOGIC CHỈNH SỬA HỒ SƠ ---
  const handleStartEdit = () => setIsEditing(true);
  
  const handleCancelEdit = () => {
    if (user) setFormValues({ fullName: user.fullName || '', email: user.email || '' });
    setIsEditing(false);
  };

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSaveProfile = async () => {
    try {
      const payload = { fullName: formValues.fullName, email: formValues.email };
      const response = await api.put(updateProfileEndpoint, payload);
      const updatedUser = response?.data || response;
      
      setUser(updatedUser);
      updateAuthUser(updatedUser);
      setFormValues({ fullName: updatedUser.fullName || '', email: updatedUser.email || '' });
      setIsEditing(false);
      
      window.dispatchEvent(new Event("auth-changed"));
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật profile', error);
      message.error('Cập nhật thông tin không thành công. Vui lòng thử lại.');
    }
  };

  // --- LOGIC UPLOAD AVATAR ---
  const beforeUpload = (file) => {
    const isImage = file.type?.startsWith("image/");
    if (!isImage) {
      message.error("Vui lòng chọn file ảnh.");
      return Upload.LIST_IGNORE;
    }
    const isLessThan5MB = file.size / 1024 / 1024 < 5;
    if (!isLessThan5MB) {
      message.error("Ảnh đại diện phải nhỏ hơn 5MB.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploadingAvatar(true);

    try {
      const response = await api.postFormData(uploadAvatarEndpoint, formData);
      const updatedProfile = response?.data || response;
      const avatarSource =
        updatedProfile?.avatarUrl ||
        updatedProfile?.avatar ||
        updatedProfile?.imageUrl ||
        updatedProfile?.profileImage;

      if (!avatarSource) {
        throw new Error("Upload avatar response does not include avatar URL.");
      }
      
      // Fix cache trình duyệt bằng cách thêm timestamp vào URL
      const separator = avatarSource.includes("?") ? "&" : "?";
      const newAvatarUrl = `${avatarSource}${separator}t=${new Date().getTime()}`;

      const userWithNewAvatar = { ...updatedProfile, avatarUrl: newAvatarUrl };
      
      setUser(userWithNewAvatar);
      updateAuthUser(userWithNewAvatar);

      // Bắn tín hiệu sang Navbar thông qua Outlet Context
      if (updateSharedAvatarRef) {
        updateSharedAvatarRef(newAvatarUrl);
      }

      window.dispatchEvent(new Event("auth-changed"));
      message.success("Cập nhật ảnh đại diện thành công.");
      onSuccess("ok");
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error || "Không thể cập nhật ảnh đại diện.";
      message.error(serverMessage);
      onError(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const getRoleName = (role) => {
    switch (role) {
      case "ADMIN": return "Quản trị viên";
      case "SELLER": return "Người bán";
      default: return "Thành viên";
    }
  };

  const avatarUrl = user?.avatarUrl || user?.avatar || user?.imageUrl || user?.profileImage || 'https://via.placeholder.com/150';

  if (loading && !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gray-600 flex items-center gap-2">
          <LoadingOutlined className="text-orange-600 text-xl" />
          <span>Đang tải thông tin tài khoản...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-8 pt-4">
      
      {/* ẢNH BÌA & AVATAR */}
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="h-40 sm:h-48 md:h-56 bg-orange-600 relative">
          <img 
            alt="Profile Cover" 
            className="w-full h-full object-cover mix-blend-overlay opacity-40" 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
          />
        </div>

        <div className="px-6 sm:px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10 text-center md:text-left">
          {/* Box Avatar có hiệu ứng hover */}
          <div className="relative group shrink-0">
            <img 
              alt="User Avatar" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-white object-cover" 
              src={avatarUrl} 
            />
            <div className="absolute inset-0 flex items-center justify-center md:items-end md:pb-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full md:bg-transparent">
              <Upload 
                name="file" 
                showUploadList={false} 
                beforeUpload={beforeUpload} 
                customRequest={handleAvatarUpload}
              >
                <button 
                  type="button" 
                  disabled={uploadingAvatar} 
                  className="bg-orange-600/90 text-white p-2.5 rounded-full shadow-lg hover:bg-orange-700 transition-colors disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? <LoadingOutlined /> : <UploadOutlined />}
                </button>
              </Upload>
            </div>
          </div>

          <div className="flex-1 w-full pb-2">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 line-clamp-1">
                {user?.fullName || "Người dùng"}
              </h1>
              <span className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
                {getRoleName(user?.role)}
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              {user?.email || "Chưa cập nhật email"}
            </p>
          </div>
        </div>
      </div>

      {/* FORM THÔNG TIN CÁ NHÂN */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600">badge</span>
            Thông tin hồ sơ
          </h3>

          <div className="w-full sm:w-auto">
            {isEditing ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button size="large" onClick={handleCancelEdit} className="flex-1 sm:flex-none">Hủy bỏ</Button>
                <Button type="primary" size="large" onClick={handleSaveProfile} className="bg-orange-600 flex-1 sm:flex-none">Lưu thay đổi</Button>
              </div>
            ) : (
              <Button onClick={handleStartEdit} size="large" className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium text-orange-600 border-orange-600 hover:bg-orange-50">
                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                Cập nhật hồ sơ
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-8">
          {/* Cột 1: Tên */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Họ và tên</p>
            {isEditing ? (
              <Input size="large" value={formValues.fullName} onChange={handleChange('fullName')} className="w-full" />
            ) : (
              <p className="text-base text-gray-900 font-medium py-1">{user?.fullName || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* Cột 2: Email */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Địa chỉ Email</p>
            {isEditing ? (
              <Input size="large" value={formValues.email} onChange={handleChange('email')} className="w-full" />
            ) : (
              <p className="text-base text-gray-900 font-medium py-1">{user?.email || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* Cột 3: ID Người Dùng */}
          <div className="space-y-2 md:col-span-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mã định danh (Account ID)</p>
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 overflow-hidden">
              <code className="text-sm font-mono text-orange-600 truncate mr-4">{user?.id || "Không xác định"}</code>
            </div>
          </div>

          {/* Cột 4: Ngày tham gia */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ngày tham gia</p>
            <p className="text-base text-gray-900 font-medium py-1">{formatDateTime(user?.createdAt)}</p>
          </div>

          {/* Cột 5: Trạng thái */}
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

        {/* NÚT ĐĂNG XUẤT NẰM Ở CUỐI */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
          <Button 
            danger 
            size="large"
            icon={<LogoutOutlined />} 
            onClick={handleLogout} 
            className="font-semibold px-8 hover:opacity-80 transition-opacity"
          >
            Đăng xuất
          </Button>
        </div>

      </section>
    </div>
  );
}
