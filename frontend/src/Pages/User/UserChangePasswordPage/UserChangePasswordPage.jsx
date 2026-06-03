import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../../../Apis/apiConfig';
import USER_ENDPOINTS from '../../../Apis/userEndpoints';

const { Title, Text } = Typography;

export default function SellerChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    
    // Tạo payload chuẩn với DTO của Backend
    const payload = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };

    try {
      // Gọi API backend (PUT /api/v1/users/me/password)
      await api.put(USER_ENDPOINTS.changePassword, payload);

      message.success('Đổi mật khẩu thành công!');
      form.resetFields(); // Xóa trắng form sau khi thành công
      
    } catch (error) {
      // Bắt lỗi từ backend trả về (ví dụ: Sai mật khẩu cũ)
      const errorMsg = error.response?.data?.message || 'Đổi mật khẩu thất bại, vui lòng thử lại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card 
        className="shadow-sm border-gray-200 rounded-xl"
        styles={{ body: { padding: '32px' } }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
            <SafetyCertificateOutlined className="text-3xl" />
          </div>
          <Title level={3} className="!mb-2">Đổi mật khẩu</Title>
          <Text className="text-gray-500">
            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để bảo mật tài khoản.
          </Text>
        </div>

        <Form
          form={form}
          name="change_password"
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          {/* Mật khẩu hiện tại */}
          <Form.Item
            name="currentPassword"
            label={<span className="font-medium text-gray-700">Mật khẩu hiện tại</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu hiện tại"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          {/* Mật khẩu mới */}
          <Form.Item
            name="newPassword"
            label={<span className="font-medium text-gray-700">Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
              { max: 100, message: 'Mật khẩu không được vượt quá 100 ký tự!' }
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          {/* Xác nhận mật khẩu mới (Chỉ validate ở Frontend) */}
          <Form.Item
            name="confirmPassword"
            label={<span className="font-medium text-gray-700">Xác nhận mật khẩu mới</span>}
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận lại mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập lại mật khẩu mới"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item className="mt-8 mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg h-12 font-semibold"
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}