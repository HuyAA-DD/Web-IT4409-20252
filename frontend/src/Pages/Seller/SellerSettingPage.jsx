import React from 'react';
import { Form, Input, Switch, Button, Card, Typography, message } from 'antd';
import { SettingOutlined, ShopOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

export default function SellerSettingPage() {
  const [form] = Form.useForm();

  const initialValues = {
    storeName: 'ProTech Store',
    email: 'protech.store@example.com',
    phone: '+84 912 345 678',
    address: '123 Võ Văn Tần, Quận 3, TP.HCM',
    workingHours: '08:00 - 18:00',
    active: true,
  };

  const handleSave = (values) => {
    console.log('save seller settings', values);
    message.success('Cập nhật thông tin gian hàng thành công!');
  };

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl text-blue-600 p-4 rounded-3xl bg-blue-50">
              <SettingOutlined />
            </div>
            <div>
              <Typography.Title level={3} className="m-0">Thiết lập gian hàng</Typography.Title>
              <Typography.Paragraph className="text-gray-500 m-0">Cập nhật thông tin cơ bản, địa chỉ và trạng thái cửa hàng của bạn.</Typography.Paragraph>
            </div>
          </div>

          <Card className="rounded-3xl border border-gray-100 shadow-none bg-slate-50/80">
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              onFinish={handleSave}
              className="space-y-6"
            >
              <Form.Item label="Tên gian hàng" name="storeName" rules={[{ required: true, message: 'Vui lòng nhập tên gian hàng' }]}>
                <Input size="large" prefix={<ShopOutlined />} placeholder="Tên gian hàng" />
              </Form.Item>

              <Form.Item label="Email liên hệ" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                <Input size="large" prefix={<MailOutlined />} placeholder="Email liên hệ" />
              </Form.Item>

              <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                <Input size="large" prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>

              <Form.Item label="Địa chỉ cửa hàng" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                <Input.TextArea rows={3} placeholder="Địa chỉ cụ thể" />
              </Form.Item>

              <Form.Item label="Giờ làm việc" name="workingHours" rules={[{ required: true, message: 'Vui lòng nhập giờ làm việc' }]}>
                <Input size="large" placeholder="08:00 - 18:00" />
              </Form.Item>

              <Form.Item label="Kích hoạt gian hàng" name="active" valuePropName="checked">
                <Switch checkedChildren="Đang mở" unCheckedChildren="Đã đóng" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" size="large" htmlType="submit">
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
