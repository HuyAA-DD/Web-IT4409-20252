import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftOutlined, 
  PrinterOutlined, 
  SyncOutlined, 
  UserOutlined, 
  MailOutlined, 
  CarOutlined, 
  CreditCardOutlined, 
  UnorderedListOutlined, 
  HistoryOutlined, 
  PhoneOutlined 
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import { message } from 'antd';

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID Đơn hàng từ Router

  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.orders.byId(id));
        setOrder(response?.data || response);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết đơn hàng', error);
        message.error('Không thể tải chi tiết đơn hàng.');
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id) return;
    try {
      const response = await api.put(API_ENDPOINTS.orders.cancel(id));
      const updatedOrder = response?.data || response;
      setOrder(updatedOrder);
      message.success('Đã cập nhật trạng thái đơn hàng.');
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái đơn hàng', error);
      message.error('Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  if (!order) return <div className="p-10 text-center text-gray-500">Đang tải thông tin đơn hàng...</div>;

  // Render màu Badge tùy theo Enum Status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      
      {/* --- PAGE HEADER & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-orange-600 transition-colors">
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 m-0">Chi tiết đơn hàng</h1>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm m-0 ml-8">
            Mã ĐH: <span className="font-mono text-gray-800">{order.id}</span> • Đặt lúc {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3 ml-8 md:ml-0">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            <PrinterOutlined /> In Hóa Đơn
          </button>
          <button 
            onClick={handleUpdateStatus}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm shadow-md"
          >
            <SyncOutlined /> Cập nhật trạng thái
          </button>
        </div>
      </div>

      {/* --- BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột Trái: Thông tin khách hàng & Thanh toán */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0 border-b border-gray-100 pb-3">
              <UserOutlined className="text-gray-400" /> Khách hàng
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg uppercase">
                  {order.userName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 m-0">{order.userName}</p>
                  <p className="text-sm text-gray-500 m-0 font-mono text-xs mt-1">ID: {order.userId.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-orange-600 hover:border-orange-600 transition-colors font-medium text-sm">
                  <MailOutlined /> Liên hệ
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Address (Từ DTO AddressResponse) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0 border-b border-gray-100 pb-3">
              <CarOutlined className="text-gray-400" /> Địa chỉ giao hàng
            </h2>
            <div className="space-y-1 text-gray-700 text-sm">
              <p className="font-bold text-gray-800 m-0 mb-1">{order.address?.receiverName}</p>
              <p className="m-0">{order.address?.street}</p>
              <p className="m-0">{order.address?.city}, {order.address?.state} {order.address?.zipCode}</p>
              <p className="m-0">{order.address?.country}</p>
              <p className="text-gray-500 mt-3 flex items-center gap-2 font-medium">
                <PhoneOutlined /> {order.address?.phone}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0 border-b border-gray-100 pb-3">
              <CreditCardOutlined className="text-gray-400" /> Thanh toán
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Hình thức</span>
                <span className="text-gray-800 font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-100">
                <span className="text-gray-500">Trạng thái</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              
              <div className="pt-2 flex justify-between items-center">
                <span className="text-gray-800 font-bold">Tổng thu</span>
                <span className="text-orange-600 font-black text-xl">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Order Items Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 m-0">
                <UnorderedListOutlined className="text-gray-400" /> Sản phẩm ({order.items.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
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
                  {order.items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden shrink-0 bg-white">
                            <img src={item.attributes?.imageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-2 m-0 text-sm">{item.productName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-xs font-mono">{item.sku}</td>
                      <td className="p-4 text-right text-gray-800 text-sm">${item.price.toFixed(2)}</td>
                      <td className="p-4 text-center text-gray-800 text-sm font-bold">{item.quantity}</td>
                      <td className="p-4 text-right font-bold text-orange-600">${item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Tracking / Timeline có thể thêm ở đây nếu DTO sau này hỗ trợ Trackings */}
          <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2 m-0">
              <HistoryOutlined className="text-gray-400" /> Log hoạt động
            </h2>
            <div className="text-sm text-gray-500 italic">
              Đơn hàng được khởi tạo thành công vào lúc {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}