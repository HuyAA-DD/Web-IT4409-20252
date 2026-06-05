import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftOutlined,
  CarOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SaveOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const extractData = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('vi-VN');
};

const getShortId = (id) => {
  if (!id) return 'N/A';
  return String(id).slice(0, 8).toUpperCase();
};

const getAddressText = (address) => {
  if (!address) return 'N/A';

  return [
    address.street,
    address.ward,
    address.district,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-blue-100 text-blue-700';
    case 'CONFIRMED':
      return 'bg-indigo-100 text-indigo-700';
    case 'PROCESSING':
      return 'bg-amber-100 text-amber-700';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-700';
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getPaymentBadge = (status) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    case 'REFUNDED':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-orange-100 text-orange-700';
  }
};

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const items = useMemo(() => {
    return Array.isArray(order?.items) ? order.items : [];
  }, [order]);

  const fetchOrderDetails = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await api.get(API_ENDPOINTS.admin.orders);
      const data = extractData(response);
      const orders = Array.isArray(data) ? data : [];
      const foundOrder = orders.find((item) => String(item.id) === String(id));

      if (!foundOrder) {
        setOrder(null);
        message.warning('Không tìm thấy đơn hàng.');
        return;
      }

      setOrder(foundOrder);
      setSelectedStatus(foundOrder.status || '');
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đơn hàng', error);
      message.error('Không thể tải chi tiết đơn hàng.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveStatus = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    setSaving(true);

    try {
      const response = await api.put(API_ENDPOINTS.admin.updateOrderStatus(order.id), {
        status: selectedStatus,
      });
      const updatedOrder = extractData(response);

      setOrder((current) => ({ ...current, ...updatedOrder }));
      setSelectedStatus(updatedOrder?.status || selectedStatus);
      message.success('Đã cập nhật trạng thái đơn hàng.');
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái đơn hàng', error);
      message.error('Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        Đang tải thông tin đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium mb-4">Không tìm thấy đơn hàng.</p>
        <button
          onClick={() => navigate('/admin/order-list')}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate('/admin/order-list')}
              className="text-gray-500 hover:text-orange-600 transition-colors"
              title="Quay lại"
            >
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 m-0">
              Chi tiết đơn hàng #{getShortId(order.id)}
            </h1>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(order.status)}`}>
              {order.status || 'N/A'}
            </span>
          </div>
          <p className="text-gray-500 text-sm m-0 ml-8">
            ID: <span className="font-mono text-gray-800">{order.id}</span> · Tạo lúc {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-8 md:ml-0">
          <button
            onClick={fetchOrderDetails}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            <ReloadOutlined /> Tải lại
          </button>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={handleSaveStatus}
            disabled={saving || selectedStatus === order.status}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
          >
            <SaveOutlined /> Lưu trạng thái
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0 border-b border-gray-100 pb-3">
              <UserOutlined className="text-gray-400" /> Khách hàng
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 m-0">Tên khách hàng</p>
                <p className="font-bold text-gray-800 m-0">{order.userName || order.address?.recipientName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 m-0">User ID</p>
                <p className="font-mono text-gray-800 m-0">{order.userId || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0 border-b border-gray-100 pb-3">
              <CarOutlined className="text-gray-400" /> Địa chỉ giao hàng
            </h2>
            <div className="space-y-2 text-gray-700 text-sm">
              <p className="font-bold text-gray-800 m-0">{order.address?.recipientName || 'N/A'}</p>
              <p className="m-0">{getAddressText(order.address)}</p>
              <p className="text-gray-500 mt-3 flex items-center gap-2 font-medium">
                <PhoneOutlined /> {order.address?.recipientPhone || 'N/A'}
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0 border-b border-gray-100 pb-3">
              <CreditCardOutlined className="text-gray-400" /> Thanh toán
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Phương thức</span>
                <span className="text-gray-800 font-bold">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between gap-4 pb-3 border-b border-gray-100">
                <span className="text-gray-500">Trạng thái</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getPaymentBadge(order.paymentStatus)}`}>
                  {order.paymentStatus || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Tạm tính</span>
                <span>{formatCurrency(order.subTotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Giảm giá</span>
                <span className="text-green-600">-{formatCurrency(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-gray-100">
                <span className="text-gray-800 font-bold">Tổng tiền</span>
                <span className="text-orange-600 font-black text-xl">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 m-0">
                <ShoppingOutlined className="text-gray-400" /> Sản phẩm ({items.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-white text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Sản phẩm</th>
                    <th className="p-4 font-semibold">SKU</th>
                    <th className="p-4 font-semibold text-right">Đơn giá</th>
                    <th className="p-4 font-semibold text-center">SL</th>
                    <th className="p-4 font-semibold text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id || `${item.productName}-${item.sku}`} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded border border-gray-200 bg-orange-50 text-orange-600 flex items-center justify-center font-black shrink-0">
                            {String(item.productName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-2 m-0 text-sm">{item.productName || 'N/A'}</p>
                            <p className="text-xs text-gray-500 m-0 mt-1">Product ID: {item.productId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-xs font-mono">{item.sku || 'N/A'}</td>
                      <td className="p-4 text-right text-gray-800 text-sm">{formatCurrency(item.price)}</td>
                      <td className="p-4 text-center text-gray-800 text-sm font-bold">{item.quantity || 0}</td>
                      <td className="p-4 text-right font-bold text-orange-600">
                        {formatCurrency(item.lineTotal || Number(item.price || 0) * Number(item.quantity || 0))}
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-500 font-medium">
                        Đơn hàng chưa có sản phẩm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0">
              <HistoryOutlined className="text-gray-400" /> Thông tin hệ thống
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 m-0">Ngày tạo</p>
                <p className="font-medium text-gray-800 m-0">{formatDateTime(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 m-0">Mã coupon</p>
                <p className="font-medium text-gray-800 m-0">{order.couponCode || 'Không áp dụng'}</p>
              </div>
              <div>
                <p className="text-gray-500 m-0">Address ID</p>
                <p className="font-mono text-gray-800 m-0">{order.addressId || order.address?.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 m-0">Order ID</p>
                <p className="font-mono text-gray-800 m-0">{order.id}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
