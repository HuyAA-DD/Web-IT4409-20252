import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  EditOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";

const { Title, Text } = Typography;

const extractData = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

const roleColor = {
  ADMIN: "red",
  SELLER: "blue",
  USER: "green",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
};

export default function AdminUserPage() {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.users.list);
      const data = extractData(response);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Khong the tai danh sach nguoi dung", error);
      message.error("Không thể tải danh sách người dùng.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        !search ||
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        String(user.id || "").toLowerCase().includes(search);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesKeyword && matchesRole;
    });
  }, [users, keyword, roleFilter]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.role === "ADMIN").length;
  const totalSellers = users.filter((user) => user.role === "SELLER").length;
  const totalCustomers = users.filter((user) => user.role === "USER").length;
  const totalLocked = users.filter((user) => user.active === false).length;

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const values = await form.validateFields();
      setIsSaving(true);

      const userResponse = await api.put(API_ENDPOINTS.users.update(editingUser.id), {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
      });
      let updatedUser = extractData(userResponse);

      if (values.role !== editingUser.role) {
        const roleResponse = await api.put(API_ENDPOINTS.users.updateRole(editingUser.id), {
          role: values.role,
        });
        updatedUser = extractData(roleResponse);
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? { ...user, ...updatedUser } : user))
      );
      message.success("Cập nhật người dùng thành công.");
      closeEditModal();
    } catch (error) {
      console.error("Khong the cap nhat nguoi dung", error);
      if (!error.errorFields) {
        message.error(error?.response?.data?.message || "Không thể cập nhật người dùng.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const nextActive = user.active === false;

    try {
      const endpoint = nextActive
        ? API_ENDPOINTS.users.unlock(user.id)
        : API_ENDPOINTS.users.lock(user.id);
      const response = await api.put(endpoint);
      const updatedUser = extractData(response);

      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, ...updatedUser } : item))
      );
      fetchUsers();
      message.success(nextActive ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
    } catch (error) {
      console.error("Khong the cap nhat trang thai nguoi dung", error);
      message.error(error?.response?.data?.message || "Không thể cập nhật trạng thái tài khoản.");
    }
  };

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      width: 320,
      render: (_, record) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={record.avatarUrl}
            icon={!record.avatarUrl ? <UserOutlined /> : null}
            className="shrink-0 bg-orange-600"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-800">
              {record.fullName || "Chưa có tên"}
            </div>
            <div className="truncate text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => <Tag color={roleColor[role] || "default"}>{role}</Tag>,
      sorter: (a, b) => (a.role || "").localeCompare(b.role || ""),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 130,
      render: (active) =>
        active === false ? <Tag color="default">LOCKED</Tag> : <Tag color="green">ACTIVE</Tag>,
      sorter: (a, b) => Number(a.active !== false) - Number(b.active !== false),
    },
    {
      title: "User ID",
      dataIndex: "id",
      key: "id",
      width: 260,
      render: (id) => (
        <Text copyable ellipsis className="font-mono text-xs text-gray-500">
          {id}
        </Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: formatDateTime,
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size={8}>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title={record.active === false ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
            description={
              record.active === false
                ? "Người dùng sẽ có thể đăng nhập và sử dụng hệ thống trở lại."
                : "Người dùng sẽ không thể đăng nhập hoặc tiếp tục dùng token hiện tại."
            }
            okText={record.active === false ? "Mở khóa" : "Khóa"}
            cancelText="Hủy"
            okButtonProps={{ danger: record.active !== false }}
            onConfirm={() => handleToggleUserStatus(record)}
          >
            <Button
              danger={record.active !== false}
              icon={record.active === false ? <UnlockOutlined /> : <LockOutlined />}
            >
              {record.active === false ? "Mở" : "Khóa"}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Title level={2} className="!mb-0 !text-xl sm:!text-2xl">
            Quản lý người dùng
          </Title>
          <Text type="secondary" className="!text-xs sm:!text-sm">
            Xem, tìm kiếm và lọc tài khoản trong hệ thống.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={isLoading}>
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Tổng tài khoản</div>
              <div className="mt-1 text-xl font-bold">{totalUsers}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-lg text-orange-600">
              <TeamOutlined />
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
          <div className="text-xs text-gray-500">Khách hàng</div>
          <div className="mt-1 text-xl font-bold text-green-600">{totalCustomers}</div>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
          <div className="text-xs text-gray-500">Seller</div>
          <div className="mt-1 text-xl font-bold text-blue-600">{totalSellers}</div>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
          <div className="text-xs text-gray-500">Admin</div>
          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="text-xl font-bold text-red-600">{totalAdmins}</div>
            <div className="text-xs font-semibold text-gray-500">Khóa: {totalLocked}</div>
          </div>
        </Card>
      </div>

      <Card className="max-w-full overflow-hidden rounded-xl border-0 shadow-sm" styles={{ body: { padding: 16 } }}>
        <div className="mb-4 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-12">
          <Input
            placeholder="Tìm theo tên, email hoặc User ID..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="min-w-0 md:col-span-8"
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            className="min-w-0 md:col-span-4"
            options={[
              { label: "Tất cả role", value: "ALL" },
              { label: "USER", value: "USER" },
              { label: "SELLER", value: "SELLER" },
              { label: "ADMIN", value: "ADMIN" },
            ]}
          />
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          loading={isLoading}
          size="middle"
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
        />
      </Card>

      <Modal
        title="Cập nhật người dùng"
        open={editModalOpen}
        onOk={handleSaveUser}
        onCancel={closeEditModal}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        confirmLoading={isSaving}
        width="min(560px, 96vw)"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[
              { required: true, whitespace: true, message: "Vui lòng nhập họ tên." },
              { max: 150, message: "Họ tên tối đa 150 ký tự." },
            ]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, whitespace: true, message: "Vui lòng nhập email." },
              { type: "email", message: "Email không hợp lệ." },
              { max: 150, message: "Email tối đa 150 ký tự." },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn role." }]}
          >
            <Select
              options={[
                { label: "USER", value: "USER" },
                { label: "SELLER", value: "SELLER" },
                { label: "ADMIN", value: "ADMIN" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
