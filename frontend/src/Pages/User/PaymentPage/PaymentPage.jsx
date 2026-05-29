import React, { useEffect, useState } from 'react';
import { Button, Card, Table, Tag, Space, message, Empty, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import USER_ROUTE from '../../../Routes/User.routes';

const paymentStatusMap = {
  PAID: { color: 'green', label: 'Đã thanh toán' },
  UNPAID: { color: 'orange', label: 'Chưa thanh toán' },
  PENDING: { color: 'gold', label: 'Đang xử lý' },
  FAILED: { color: 'red', label: 'Thanh toán thất bại' },
  CANCELLED: { color: 'default', label: 'Đã hủy' },
};

const orderStatusMap = {
  PENDING: { color: 'gold', label: 'Chờ xử lý' },
  PROCESSING: { color: 'blue', label: 'Đang xử lý' },
  COMPLETED: { color: 'green', label: 'Hoàn thành' },
  CANCELLED: { color: 'red', label: 'Hủy' },
};

export default function PaymentPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.orders.list);
      const data = response?.data ?? [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatMoney = (value) => {
    if (value == null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handlePayOrder = async (order) => {
    setCheckoutLoading(order.id);
    try {
      const response = await api.post(API_ENDPOINTS.payments.sepayCheckout, {
        orderId: order.id,
        returnUrl: `${window.location.origin}${USER_ROUTE.Seapay}`,
      });

      const paymentUrl = response?.data?.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
        message.success('Đang mở cửa sổ thanh toán Sepay.');
      } else {
        message.error('Không tìm thấy liên kết thanh toán Sepay.');
      }
    } catch (error) {
      console.error(error);
      message.error('Tạo đường dẫn thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleRefreshStatus = async (order) => {
    setStatusLoading(order.id);
    try {
      const response = await api.get(API_ENDPOINTS.payments.orderStatus(order.id));
      const paymentData = response?.data;
      if (paymentData) {
        setOrders((prev) => prev.map((item) => item.id === order.id ? { ...item, paymentStatus: paymentData.paymentStatus || item.paymentStatus } : item));
        message.success('Cập nhật trạng thái thanh toán thành công.');
      }
    } catch (error) {
      console.error(error);
      message.error('Không thể cập nhật trạng thái thanh toán.');
    } finally {
      setStatusLoading(null);
    }
  };

  const hasOrders = orders.length > 0;
  const unpaidCount = orders.filter((order) => order.paymentStatus && order.paymentStatus !== 'PAID').length;
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-medium">#{id?.toString().slice(0, 8)}</span>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value) => <span className="font-semibold text-orange-600">{formatMoney(value)}</span>,
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        const data = paymentStatusMap[status] ?? { color: 'default', label: status || 'Chưa rõ' };
        return <Tag color={data.color}>{data.label}</Tag>;
      },
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method ? <Tag color="cyan">{method}</Tag> : <Tag>Chưa chọn</Tag>,
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const data = orderStatusMap[status] ?? { color: 'default', label: status || 'Chưa rõ' };
        return <Tag color={data.color}>{data.label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          {record.paymentStatus !== 'PAID' && (
            <Button
              type="primary"
              size="small"
              loading={checkoutLoading === record.id}
              onClick={() => handlePayOrder(record)}
              icon={<WalletOutlined />}
            >
              Thanh toán
            </Button>
          )}
          <Button
            size="small"
            onClick={() => handleRefreshStatus(record)}
            loading={statusLoading === record.id}
            icon={<ReloadOutlined />}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-[70vh] pb-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] mb-8 items-start">
        <Card className="rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <Typography.Title level={2} className="m-0">
                Thanh toán Sepay
              </Typography.Title>
              <Typography.Paragraph className="text-gray-500">
                Quản lý đơn hàng và hoàn tất thanh toán an toàn với Sepay. Chọn đơn hàng muốn thanh toán, sau đó hệ thống sẽ mở cổng Sepay để bạn thanh toán.
              </Typography.Paragraph>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-3xl border border-gray-100 shadow-none bg-orange-50">
                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalOrders}</p>
              </Card>
              <Card className="rounded-3xl border border-gray-100 shadow-none bg-slate-50">
                <p className="text-sm text-gray-500">Đơn chưa thanh toán</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">{unpaidCount}</p>
              </Card>
              <Card className="rounded-3xl border border-gray-100 shadow-none bg-slate-50">
                <p className="text-sm text-gray-500">Tổng giá trị</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">{formatMoney(totalAmount)}</p>
              </Card>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-gray-100 shadow-sm bg-linear-to-br from-slate-900 to-indigo-700 text-white">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ArrowRightOutlined className="text-3xl p-3 bg-white/10 rounded-2xl" />
              <div>
                <h3 className="text-xl font-bold m-0">Hướng dẫn nhanh</h3>
                <p className="text-sm text-gray-200 m-0">Bấm Thanh toán cho đơn hàng chưa thanh toán để mở cổng Sepay và hoàn tất giao dịch.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-gray-200 font-semibold">1. Chọn đơn hàng</p>
                <p className="text-sm text-slate-100/90">Tìm đơn có trạng thái thanh toán chưa hoàn thành.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-gray-200 font-semibold">2. Mở cổng Sepay</p>
                <p className="text-sm text-slate-100/90">Hệ thống sẽ chuyển sang trang thanh toán an toàn.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-gray-200 font-semibold">3. Cập nhật trạng thái</p>
                <p className="text-sm text-slate-100/90">Bấm Cập nhật để lấy lại thông tin thanh toán mới nhất.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Typography.Title level={4} className="m-0">Danh sách đơn hàng</Typography.Title>
            <Typography.Paragraph className="text-gray-500 m-0">Xem chi tiết thanh toán, trạng thái và thực hiện cập nhật ngay.</Typography.Paragraph>
          </div>
          <Button type="default" onClick={fetchOrders} icon={<ReloadOutlined />} loading={loading}>
            Làm mới
          </Button>
        </div>

        {hasOrders ? (
          <Table
            loading={loading}
            dataSource={orders}
            columns={columns}
            rowKey={(order) => order.id}
            pagination={{ pageSize: 6 }}
          />
        ) : (
          <div className="py-16">
            <Empty description="Chưa có đơn hàng nào" />
          </div>
        )}
      </Card>
    </div>
  );
}
