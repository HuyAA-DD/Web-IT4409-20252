import React from 'react';
import { Card, Statistic, Avatar, Typography, Progress, Button } from 'antd';
import { ShopOutlined, DollarCircleOutlined, ShoppingCartOutlined, RiseOutlined } from '@ant-design/icons';

const metrics = [
  { title: 'Doanh thu tuần', value: 128500000, suffix: '₫', icon: <DollarCircleOutlined className="text-2xl text-orange-500" /> },
  { title: 'Đơn hàng mới', value: 18, suffix: '', icon: <ShoppingCartOutlined className="text-2xl text-blue-500" /> },
  { title: 'Sản phẩm đang bán', value: 45, suffix: '', icon: <ShopOutlined className="text-2xl text-green-500" /> },
];

export default function SellerPage() {
  return (
    <div className="min-h-[70vh]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography.Title level={3} className="m-0">Bảng điều khiển Seller</Typography.Title>
              <Typography.Paragraph className="text-gray-500 m-0">Tổng quan về gian hàng, đơn hàng, doanh thu và cập nhật nhanh.</Typography.Paragraph>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="primary">Xem chi tiết doanh thu</Button>
              <Button>Quản lý sản phẩm</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.title} className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                  {metric.icon}
                </div>
                <div>
                  <Statistic title={metric.title} value={metric.value} suffix={metric.suffix} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Typography.Title level={4} className="m-0">Tổng quan đơn hàng</Typography.Title>
                <Typography.Paragraph className="text-gray-500 m-0">Các đơn hàng đang xử lý, trạng thái thanh toán và điểm nổi bật.</Typography.Paragraph>
              </div>
              <Avatar size={64} icon={<RiseOutlined className="text-xl" />} className="bg-orange-50 text-orange-600" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6 border border-gray-100">
                <p className="text-sm text-gray-500">Đơn chờ xác nhận</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">8</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6 border border-gray-100">
                <p className="text-sm text-gray-500">Tỉ lệ hoàn thành</p>
                <p className="mt-2 text-3xl font-bold text-green-600">92%</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Avatar size={48} icon={<ShopOutlined />} className="bg-blue-50 text-blue-600" />
              <div>
                <Typography.Title level={5} className="m-0">Gian hàng ProTech</Typography.Title>
                <Typography.Text type="secondary">Trang đang hoạt động tốt.</Typography.Text>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Hoàn thành đơn</span>
                  <span>92%</span>
                </div>
                <Progress percent={92} status="active" />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Đánh giá trung bình</span>
                  <span>4.8/5</span>
                </div>
                <Progress percent={96} status="active" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
