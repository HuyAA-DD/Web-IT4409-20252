import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  CameraOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, message, Spin, Tag, Upload } from "antd";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import {
  clearAuthUser,
  getAuthUser,
  updateAuthUser,
} from "../../../Utils/Auth";

export default function UserProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getAuthUser());
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const userEndpoint = useMemo(() => {
    return API_ENDPOINTS.users || API_ENDPOINTS.user;
  }, []);

  const profileEndpoint = userEndpoint?.profile || "/users/me";
  const uploadAvatarEndpoint = userEndpoint?.uploadAvatar || "/users/me/avatar";

  const fetchUserProfile = async () => {
    setLoading(true);

    try {
      const response = await api.get(profileEndpoint);
      const profile = response?.data || response;

      setUser(profile);
      updateAuthUser(profile);

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

  const validateAvatarFile = (file) => {
    const isImage = file.type?.startsWith("image/");

    if (!isImage) {
      message.error("Vui lòng chọn file ảnh.");
      return false;
    }

    const isLessThan5MB = file.size / 1024 / 1024 < 5;

    if (!isLessThan5MB) {
      message.error("Ảnh đại diện phải nhỏ hơn 5MB.");
      return false;
    }

    return true;
  };

  const handleAvatarUpload = async (file) => {
    if (!validateAvatarFile(file)) {
      return false;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingAvatar(true);

    try {
      const response = await api.postFormData(uploadAvatarEndpoint, formData);
      const updatedProfile = response?.data || response;

      setUser(updatedProfile);
      updateAuthUser(updatedProfile);

      window.dispatchEvent(new Event("auth-changed"));

      message.success("Cập nhật ảnh đại diện thành công.");
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);

      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Không thể cập nhật ảnh đại diện.";

      message.error(serverMessage);
    } finally {
      setUploadingAvatar(false);
    }

    return false;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";

    const date = new Date(dateString);

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleTag = (role) => {
    switch (role) {
      case "ADMIN":
        return <Tag color="red">Quản trị viên</Tag>;
      case "SELLER":
        return <Tag color="blue">Người bán</Tag>;
      default:
        return <Tag color="green">Thành viên</Tag>;
    }
  };

  const avatarUrl =
    user?.avatarUrl ||
    user?.avatar ||
    user?.imageUrl ||
    user?.profileImage ||
    null;

  if (loading && !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin tài khoản..." />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 md:px-8 py-10 bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-5xl mx-auto">
        <Card className="rounded-3xl shadow-xl overflow-hidden border-0">
          <div className="relative h-48 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />

            <div className="absolute left-8 top-7 text-white">
              <h1 className="text-4xl font-black leading-tight">Tài khoản của tôi</h1>
              <p className="mt-2 text-white/90 text-base">
                Quản lý thông tin cá nhân và ảnh đại diện.
              </p>
            </div>
          </div>

          <div className="relative px-4 md:px-8 pb-8">
            <div className="-mt-16 flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative w-fit">
                <Avatar
                  size={128}
                  src={avatarUrl}
                  icon={!avatarUrl ? <UserOutlined /> : null}
                  className="bg-orange-100 text-orange-600 border-4 border-white shadow-lg text-5xl"
                />

                <Upload
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  accept="image/*"
                  disabled={uploadingAvatar}
                >
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    loading={uploadingAvatar}
                    className="absolute right-0 bottom-2 shadow-md"
                  />
                </Upload>
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user?.fullName || "Người dùng"}
                  </h2>

                  {getRoleTag(user?.role)}
                </div>

                <p className="mt-2 text-gray-500">
                  {user?.email || "Chưa có email"}
                </p>
              </div>

              <Button onClick={fetchUserProfile} loading={loading}>
                Làm mới
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                  <IdcardOutlined />
                  <span className="font-semibold">ID người dùng</span>
                </div>

                <p className="mt-3 text-gray-900 break-all">
                  {user?.id || "Không xác định"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                  <MailOutlined />
                  <span className="font-semibold">Email</span>
                </div>

                <p className="mt-3 text-gray-900">
                  {user?.email || "Không xác định"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                  <SafetyCertificateOutlined />
                  <span className="font-semibold">Quyền hạn hệ thống</span>
                </div>

                <p className="mt-3 text-gray-900">
                  {user?.role || "USER"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                  <CalendarOutlined />
                  <span className="font-semibold">Ngày tham gia</span>
                </div>

                <p className="mt-3 text-gray-900">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="h-12 px-8 rounded-xl font-bold shadow-sm"
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}