import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DollarCircleOutlined, 
  ShoppingCartOutlined, 
  AppstoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  HomeOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  RiseOutlined,
  MinusOutlined,
  BranchesOutlined,
  FilterOutlined,
  InboxOutlined // Icon cho Tồn kho
} from '@ant-design/icons';
import { Select } from 'antd';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import { getAuthUser } from '../../../Utils/Auth';

// =========================================================================
// UI COMPONENTS
// =========================================================================

const StatCard = ({ title, value, icon, colorName, sparkline }) => {
  const colorMap = {
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', hover: 'group-hover:bg-orange-600 group-hover:text-white', stroke: '#aa3000' },
    slate: { text: 'text-slate-600', bg: 'bg-slate-100', hover: 'group-hover:bg-slate-600 group-hover:text-white', stroke: '#545f73' },
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'group-hover:bg-indigo-600 group-hover:text-white', stroke: '#4648d4' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'group-hover:bg-emerald-600 group-hover:text-white', stroke: '#10b981' },
  };

  const theme = colorMap[colorName] || colorMap.slate;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between cursor-default">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl transition-colors ${theme.bg} ${theme.text} ${theme.hover}`}>
            <span className="text-xl flex items-center justify-center">{icon}</span>
          </div>
          
          <span className={`text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
            sparkline?.trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
            sparkline?.trend === 'down' ? 'bg-red-50 text-red-600' :
            'bg-gray-100 text-gray-500'
          }`}>
            {sparkline?.trend === 'up' && <RiseOutlined />}
            {sparkline?.trend === 'neutral' && <MinusOutlined />}
            {sparkline?.trend === 'down' && <MinusOutlined className="rotate-45" />}
            {sparkline?.percent}%
          </span>
        </div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold mt-1 text-gray-900">{value}</h3>
      </div>

      <div className="mt-6 h-20 w-full relative overflow-hidden">
        {sparkline && (
          <svg className="w-full h-full absolute bottom-0" viewBox="0 0 100 25" preserveAspectRatio="none">
            {sparkline.fill && <path d={sparkline.fill} fill={theme.stroke} fillOpacity="0.1" className="transition-all duration-700 ease-in-out" />}
            <path 
              d={sparkline.line} 
              fill="none" 
              stroke={theme.stroke} 
              strokeWidth="1.5" 
              strokeDasharray={sparkline.dash || ""} 
              className="transition-all duration-700 ease-in-out"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

const WorkflowStatusTile = ({ title, count, percent, icon, colorClass, bgColorClass }) => (
  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between transition-all hover:bg-white hover:shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${bgColorClass} ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-lg font-extrabold text-gray-900 mt-0.5">{count}</p>
      </div>
    </div>
    <div className="text-right">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${bgColorClass} ${colorClass}`}>
        {percent}%
      </span>
    </div>
  </div>
);

// =========================================================================
// MAIN COMPONENT
// =========================================================================
export default function SellerDashboardPage() {
  // Khởi tạo data trống (Base 0) để render UI mà không cần Mock Data
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalStock: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentUser = getAuthUser();
  const sellerId = currentUser?.id;

  // --- STATE BỘ LỌC THỜI GIAN ---
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterQuarter, setFilterQuarter] = useState(null);

  // Đồng hồ chạy real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshData = useCallback(async () => {
    if (!sellerId) return;

    setLoading(true);
    try {
      const [dashboardResponse, productList] = await Promise.all([
        api.get(API_ENDPOINTS.seller.dashboard, {
          year: filterYear,
          month: filterMonth,
          quarter: filterQuarter,
        }),
        api.get(API_ENDPOINTS.products.filter, { sellerId }),
      ]);

      const dashboardData = dashboardResponse?.data || dashboardResponse || {};
      const products = Array.isArray(productList?.data ?? productList) ? (productList.data || productList) : [];
      const totalStock = products.reduce((sum, product) => {
        const mainVariant = product?.variants?.[0];
        return sum + (mainVariant?.stock || 0);
      }, 0);
      const totalProductsCount = products.length;

      setData((prevData) => ({
        ...prevData,
        totalRevenue: dashboardData.totalRevenue || 0,
        totalOrders: dashboardData.totalOrders || 0,
        totalProducts: totalProductsCount || dashboardData.totalProducts || 0,
        totalStock,
        pendingOrders: dashboardData.pendingOrders || 0,
        confirmedOrders: dashboardData.confirmedOrders || 0,
        processingOrders: dashboardData.processingOrders || 0,
        shippedOrders: dashboardData.shippedOrders || 0,
        deliveredOrders: dashboardData.deliveredOrders || 0,
        cancelledOrders: dashboardData.cancelledOrders || 0,
      }));
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu Seller Dashboard', error);
    } finally {
      setLoading(false);
    }
  }, [sellerId, filterYear, filterMonth, filterQuarter]);

  useEffect(() => {
    handleRefreshData();
  }, [handleRefreshData]);

  // TÍNH TOÁN DỮ LIỆU ĐỘNG CHO ĐỒ THỊ SPARKLINE
  const sparklines = useMemo(() => {
    if (!data) return null;
    const generatePath = (totalValue, isDashed = false) => {
      if (!totalValue || totalValue === 0) {
        return {
          line: "M 0,23 L 20,23 L 40,23 L 60,23 L 80,23 L 100,23",
          fill: isDashed ? null : "M 0,23 L 20,23 L 40,23 L 60,23 L 80,23 L 100,23 L 100,25 L 0,25 Z",
          dash: isDashed ? "4 4" : "",
          trend: "neutral",
          percent: 0
        };
      }
      
      let currentY = 22; 
      const pts = [{ x: 0, y: currentY }];
      const volatility = totalValue > 100 ? 5 : 2; 

      for (let i = 1; i <= 5; i++) {
        const step = (Math.random() * volatility) - (volatility / 3); 
        currentY = Math.max(2, Math.min(24, currentY - step - 2)); 
        pts.push({ x: i * 20, y: currentY });
      }
      pts[5].y = Math.max(2, Math.min(...pts.map(p => p.y)) - (Math.random() * 3));

      let dLine = `M ${pts[0].x},${pts[0].y} `;
      for(let i=0; i<pts.length-1; i++) {
        const cx = (pts[i].x + pts[i+1].x) / 2;
        dLine += `C ${cx},${pts[i].y} ${cx},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y} `;
      }
      const startScore = 25 - pts[0].y;
      const endScore = 25 - pts[5].y;
      const pctChange = Math.round(((endScore - startScore) / (startScore || 1)) * 100);

      return {
        line: dLine,
        fill: isDashed ? null : `${dLine} L 100,25 L 0,25 Z`,
        dash: isDashed ? "3 3" : "",
        trend: pctChange > 0 ? "up" : pctChange < 0 ? "down" : "neutral",
        percent: Math.abs(pctChange > 100 ? Math.floor(pctChange/10) : pctChange)
      };
    };

    return {
      revenue: generatePath(data.totalRevenue),
      orders: generatePath(data.totalOrders, true),
      products: generatePath(data.totalProducts),
      stock: generatePath(data.totalStock) // Dành riêng cho Seller
    };
  }, [data]);

  // TÍNH TOÁN PHẦN TRĂM QUY TRÌNH
  const metrics = useMemo(() => {
    if (!data) return null;
    const total = data.totalOrders || 0;
    const getPct = (val) => (total === 0 ? 0 : Number(((val / total) * 100).toFixed(1)));
    return {
      pending: { pct: getPct(data.pendingOrders), count: data.pendingOrders },
      confirmed: { pct: getPct(data.confirmedOrders), count: data.confirmedOrders },
      processing: { pct: getPct(data.processingOrders), count: data.processingOrders },
      shipped: { pct: getPct(data.shippedOrders), count: data.shippedOrders },
      delivered: { pct: getPct(data.deliveredOrders), count: data.deliveredOrders },
      cancelled: { pct: getPct(data.cancelledOrders), count: data.cancelledOrders },
    };
  }, [data]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in font-sans selection:bg-orange-100 selection:text-orange-600">
      
      {/* --- TOP HEADER & FILTERS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 m-0">Chào buổi sáng, Nhà bán hàng</h2>
          <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
            <CalendarOutlined className="text-orange-600" />
            {currentTime.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}
            <span className="mx-1">•</span> 
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{currentTime.toLocaleTimeString('vi-VN', { hour12: false })}</span>
          </p>
        </div>

        {/* BỘ LỌC THỜI GIAN */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="px-3 text-gray-400">
            <FilterOutlined className="text-lg" />
          </div>
          
          <Select 
            value={filterYear} 
            onChange={(value) => setFilterYear(value)}
            className="w-28 font-medium"
            options={yearOptions.map(y => ({ value: y, label: `Năm ${y}` }))}
          />

          <Select 
            value={filterQuarter} 
            onChange={(value) => {
              setFilterQuarter(value);
              if (value) setFilterMonth(null);
            }}
            placeholder="Chọn Quý"
            className="w-32 font-medium"
            allowClear
            options={[
              { value: 1, label: 'Quý 1' },
              { value: 2, label: 'Quý 2' },
              { value: 3, label: 'Quý 3' },
              { value: 4, label: 'Quý 4' },
            ]}
          />

          <Select 
            value={filterMonth} 
            onChange={(value) => {
              setFilterMonth(value);
              if (value) setFilterQuarter(null);
            }}
            placeholder="Chọn Tháng"
            className="w-36 font-medium"
            allowClear
            options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))}
          />
          
          <button 
            onClick={() => {
               setFilterYear(currentYear);
               setFilterMonth(null);
               setFilterQuarter(null);
               handleRefreshData();
            }} 
            className="bg-[#aa3000] hover:bg-orange-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95 ml-2 cursor-pointer"
          >
            <SyncOutlined spin={loading} />
            {loading ? 'Đang tải...' : 'Live'}
          </button>
        </div>
      </div>

      {/* --- KPI BENTO GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Doanh Thu Của Tôi" value={formatCurrency(data.totalRevenue)} icon={<DollarCircleOutlined />} colorName="orange" sparkline={sparklines?.revenue} />
        <StatCard title="Đơn Hàng Giao Dịch" value={data.totalOrders?.toLocaleString('vi-VN')} icon={<ShoppingCartOutlined />} colorName="slate" sparkline={sparklines?.orders} />
        <StatCard title="Sản Phẩm Đang Bán" value={data.totalProducts?.toLocaleString('vi-VN')} icon={<AppstoreOutlined />} colorName="emerald" sparkline={sparklines?.products} />
        {/* Thay thế Thẻ Users thành Thẻ Tồn Kho cho Seller */}
        <StatCard title="Tổng Tồn Kho" value={data.totalStock?.toLocaleString('vi-VN')} icon={<InboxOutlined />} colorName="indigo" sparkline={sparklines?.stock} />
      </div>

      {/* --- PHÂN TÍCH ĐỒ THỊ TIẾN TRÌNH QUY TRÌNH TỰ ĐỘNG --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h4 className="text-xl font-bold flex items-center gap-2 text-gray-900 m-0">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-[#aa3000] flex items-center justify-center">
              <BranchesOutlined />
            </span>
            Tiến trình & Trạng thái xử lý đơn hàng
          </h4>
          <span className="text-xs text-gray-400 font-medium font-mono">Total Orders: {data.totalOrders}</span>
        </div>

        {/* ĐỒ THỊ PIPELINE CHÍNH */}
        <div className="w-full bg-gray-50/60 rounded-2xl p-6 border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-2">
          
          <div className="flex flex-col items-center text-center w-full lg:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center border-4 border-white shadow-sm z-10">
              <ClockCircleOutlined />
            </div>
            <p className="text-xs font-bold text-gray-700 mt-2 uppercase tracking-wide">Chờ xác nhận</p>
            <p className="text-lg font-black text-gray-900 m-0 mt-0.5">{metrics.pending.count}</p>
          </div>

          <div className="h-8 lg:h-1 w-1 lg:w-full bg-gray-200 relative rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${metrics.confirmed.count > 0 || metrics.processing.count > 0 ? '100' : '0'}%` }} />
          </div>

          <div className="flex flex-col items-center text-center w-full lg:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 font-extrabold flex items-center justify-center border-4 border-white shadow-sm z-10">
              <CheckCircleOutlined />
            </div>
            <p className="text-xs font-bold text-gray-700 mt-2 uppercase tracking-wide">Đã xác nhận</p>
            <p className="text-lg font-black text-gray-900 m-0 mt-0.5">{metrics.confirmed.count}</p>
          </div>

          <div className="h-8 lg:h-1 w-1 lg:w-full bg-gray-200 relative rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000" style={{ width: `${metrics.processing.count > 0 || metrics.shipped.count > 0 ? '100' : '0'}%` }} />
          </div>

          <div className="flex flex-col items-center text-center w-full lg:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-extrabold flex items-center justify-center border-4 border-white shadow-sm z-10">
              <SyncOutlined spin={metrics.processing.count > 0} />
            </div>
            <p className="text-xs font-bold text-gray-700 mt-2 uppercase tracking-wide">Đang xử lý</p>
            <p className="text-lg font-black text-gray-900 m-0 mt-0.5">{metrics.processing.count}</p>
          </div>

          <div className="h-8 lg:h-1 w-1 lg:w-full bg-gray-200 relative rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-1000" style={{ width: `${metrics.shipped.count > 0 || metrics.delivered.count > 0 ? '100' : '0'}%` }} />
          </div>

          <div className="flex flex-col items-center text-center w-full lg:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-extrabold flex items-center justify-center border-4 border-white shadow-sm z-10">
              <CarOutlined />
            </div>
            <p className="text-xs font-bold text-gray-700 mt-2 uppercase tracking-wide">Đang giao</p>
            <p className="text-lg font-black text-gray-900 m-0 mt-0.5">{metrics.shipped.count}</p>
          </div>

          <div className="h-8 lg:h-1 w-1 lg:w-full bg-gray-200 relative rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${metrics.delivered.count > 0 ? '100' : '0'}%` }} />
          </div>

          <div className="flex flex-col items-center text-center w-full lg:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 font-extrabold flex items-center justify-center border-4 border-white shadow-sm z-10">
              <HomeOutlined />
            </div>
            <p className="text-xs font-bold text-emerald-700 mt-2 uppercase tracking-wide">Thành công</p>
            <p className="text-lg font-black text-emerald-600 m-0 mt-0.5">{metrics.delivered.count}</p>
          </div>
        </div>

        {/* LƯỚI THÔNG TIN BỔ SUNG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <WorkflowStatusTile title="Chờ xác nhận" count={metrics.pending.count} percent={metrics.pending.pct} icon={<ClockCircleOutlined />} colorClass="text-orange-600" bgColorClass="bg-orange-50" />
          <WorkflowStatusTile title="Đã xác nhận" count={metrics.confirmed.count} percent={metrics.confirmed.pct} icon={<CheckCircleOutlined />} colorClass="text-cyan-600" bgColorClass="bg-cyan-50" />
          <WorkflowStatusTile title="Đang đóng gói/Xử lý" count={metrics.processing.count} percent={metrics.processing.pct} icon={<SyncOutlined spin={metrics.processing.count > 0} />} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
          <WorkflowStatusTile title="Đang giao hàng" count={metrics.shipped.count} percent={metrics.shipped.pct} icon={<CarOutlined />} colorClass="text-purple-600" bgColorClass="bg-purple-50" />
          <WorkflowStatusTile title="Đã giao thành công" count={metrics.delivered.count} percent={metrics.delivered.pct} icon={<HomeOutlined />} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
          <WorkflowStatusTile title="Đơn đã hủy/Hoàn trả" count={metrics.cancelled.count} percent={metrics.cancelled.pct} icon={<CloseCircleOutlined />} colorClass="text-red-600" bgColorClass="bg-red-50" />
        </div>

      </div>
    </div>
  );
}