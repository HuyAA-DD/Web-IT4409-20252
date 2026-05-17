import React, { useState, useEffect } from 'react';
import { 
  DollarCircleOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  AppstoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  HomeOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Progress } from 'antd';

// FIXME: [MOCK_DATA] - Dữ liệu giả lập khớp 100% với DTO DashboardResponse
const mockDashboardData = {
  totalOrders: 1250,
  pendingOrders: 150,
  confirmedOrders: 200,
  processingOrders: 100,
  shippedOrders: 350,
  deliveredOrders: 400,
  cancelledOrders: 50,
  totalRevenue: 45678.90, // Tương đương BigDecimal
  totalUsers: 840,
  totalProducts: 320
};

// =========================================================================
// 1. ĐÃ CHUYỂN COMPONENT CON RA NGOÀI ĐỂ TRÁNH LỖI RE-RENDER
// =========================================================================

// Component Thẻ Thống Kê Tổng Quan
const StatCard = ({ title, value, icon, colorClass, bgColorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors duration-500 group">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${bgColorClass} ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 m-0 transition-colors">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 dark:text-gray-200 m-0 transition-colors">{value}</h3>
    </div>
  </div>
);

// Component Thẻ Trạng Thái Đơn Hàng (Đã thêm prop `percent` truyền từ ngoài vào)
const OrderStatusCard = ({ title, count, icon, colorClass, strokeColor, percent }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-500 hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <span className={`text-lg ${colorClass}`}>{icon}</span>
        <span className="font-bold text-gray-700 dark:text-gray-300 transition-colors">{title}</span>
      </div>
      <span className="text-xl font-black text-gray-800 dark:text-gray-200 transition-colors">{count}</span>
    </div>
    <Progress 
      percent={percent} 
      strokeColor={strokeColor} 
      trailColor="rgba(156, 163, 175, 0.2)" 
      size="small" 
    />
  </div>
);

// =========================================================================
// 2. COMPONENT CHA CHÍNH
// =========================================================================
export default function DashboardPage() {
  const [data, setData] = useState(mockDashboardData);

  // ----------------------------------------------------------------------
  // TODO: [API_CALL] - GET /api/v1/admin/dashboard
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //      try {
  //        const res = await axios.get('/api/v1/admin/dashboard');
  //        setData(res.data);
  //      } catch(e) { console.error(e) }
  //   };
  //   fetchDashboardData();
  // }, []);
  // ----------------------------------------------------------------------

  if (!data) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu tổng quan...</div>;

  // Tính phần trăm cho Progress Bar (bảo vệ lỗi chia cho 0)
  const getPercent = (value) => {
    if (data.totalOrders === 0) return 0;
    return Number(((value / data.totalOrders) * 100).toFixed(1));
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 m-0 transition-colors">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 m-0 mt-1 transition-colors">Báo cáo hiệu suất và dữ liệu đơn hàng cập nhật theo thời gian thực.</p>
        </div>
        <div className="bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <SyncOutlined className="text-orange-600 dark:text-orange-400 animate-spin-slow" />
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Dữ liệu đang Live</span>
        </div>
      </div>

      {/* --- TOP METRICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={formatCurrency(data.totalRevenue)} 
          icon={<DollarCircleOutlined />} 
          colorClass="text-emerald-600 dark:text-emerald-400"
          bgColorClass="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard 
          title="Tổng đơn hàng" 
          value={data.totalOrders.toLocaleString('vi-VN')} 
          icon={<ShoppingCartOutlined />} 
          colorClass="text-blue-600 dark:text-blue-400"
          bgColorClass="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard 
          title="Khách hàng" 
          value={data.totalUsers.toLocaleString('vi-VN')} 
          icon={<UserOutlined />} 
          colorClass="text-purple-600 dark:text-purple-400"
          bgColorClass="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard 
          title="Sản phẩm" 
          value={data.totalProducts.toLocaleString('vi-VN')} 
          icon={<AppstoreOutlined />} 
          colorClass="text-orange-600 dark:text-orange-400"
          bgColorClass="bg-orange-100 dark:bg-orange-900/30"
        />
      </div>

      {/* --- ORDER STATUS BREAKDOWN --- */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 transition-colors">
          <ShoppingCartOutlined className="text-orange-600" />
          Phân tích trạng thái đơn hàng
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <OrderStatusCard 
            title="Chờ xác nhận (Pending)" 
            count={data.pendingOrders} 
            percent={getPercent(data.pendingOrders)}
            icon={<ClockCircleOutlined />} 
            colorClass="text-amber-500" 
            strokeColor="#f59e0b" 
          />
          <OrderStatusCard 
            title="Đã xác nhận (Confirmed)" 
            count={data.confirmedOrders} 
            percent={getPercent(data.confirmedOrders)}
            icon={<CheckCircleOutlined />} 
            colorClass="text-cyan-500" 
            strokeColor="#06b6d4" 
          />
          <OrderStatusCard 
            title="Đang xử lý (Processing)" 
            count={data.processingOrders} 
            percent={getPercent(data.processingOrders)}
            icon={<SyncOutlined spin />} 
            colorClass="text-blue-500" 
            strokeColor="#3b82f6" 
          />
          <OrderStatusCard 
            title="Đang giao hàng (Shipped)" 
            count={data.shippedOrders} 
            percent={getPercent(data.shippedOrders)}
            icon={<CarOutlined />} 
            colorClass="text-purple-500" 
            strokeColor="#a855f7" 
          />
          <OrderStatusCard 
            title="Đã giao thành công (Delivered)" 
            count={data.deliveredOrders} 
            percent={getPercent(data.deliveredOrders)}
            icon={<HomeOutlined />} 
            colorClass="text-emerald-500" 
            strokeColor="#10b981" 
          />
          <OrderStatusCard 
            title="Đã hủy (Cancelled)" 
            count={data.cancelledOrders} 
            percent={getPercent(data.cancelledOrders)}
            icon={<CloseCircleOutlined />} 
            colorClass="text-red-500" 
            strokeColor="#ef4444" 
          />
        </div>
      </div>

    </div>
  );
}