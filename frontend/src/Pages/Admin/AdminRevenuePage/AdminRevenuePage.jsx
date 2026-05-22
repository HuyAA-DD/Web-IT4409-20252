import React, { useState, useEffect } from 'react';
import { 
  DollarOutlined, 
  FallOutlined, 
  RiseOutlined, 
  WalletOutlined,
  CalendarOutlined,
  DownloadOutlined
} from '@ant-design/icons';

// --- [MOCK_DATA] --- Khớp với DTO RevenueResponse
const mockRevenueData = {
  totalRevenue: 1250000000, // 1.25 Tỷ
  averageOrderValue: 850000, 
  totalRefunds: 45000000,    // 45 Triệu
  netRevenue: 1205000000     // 1.2 Tỷ
};

export default function AdminRevenuePage() {
  const [revenue, setRevenue] = useState(mockRevenueData);
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================================
  // TODO: [API_CALL] - GET /api/v1/admin/revenue
  // =========================================================================
  /*
  useEffect(() => {
    const fetchRevenue = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/v1/admin/revenue');
        if (response.data.success) {
          setRevenue(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải doanh thu", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenue();
  }, []);
  */

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (isLoading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu doanh thu...</div>;

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in transition-colors duration-500">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
            <WalletOutlined className="text-orange-600" /> Báo cáo Doanh thu
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Thống kê dòng tiền, giá trị đơn hàng và đối soát hoàn trả.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <CalendarOutlined /> Tháng này
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm hover:bg-orange-700 transition-colors shadow-sm">
            <DownloadOutlined /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 4 THẺ THỐNG KÊ (KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Doanh thu gộp */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tổng doanh thu gộp</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg"><DollarOutlined /></div>
          </div>
          <h3 className="text-3xl font-black text-gray-800 dark:text-gray-200">{formatCurrency(revenue.totalRevenue)}</h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"><RiseOutlined /> +12.5% so với tháng trước</p>
        </div>

        {/* Tiền hoàn trả */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tổng tiền hoàn trả</span>
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-lg"><FallOutlined /></div>
          </div>
          <h3 className="text-3xl font-black text-gray-800 dark:text-gray-200">{formatCurrency(revenue.totalRefunds)}</h3>
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">Chiếm {(revenue.totalRefunds / revenue.totalRevenue * 100).toFixed(1)}% tổng doanh thu</p>
        </div>

        {/* Giá trị đơn TB (AOV) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giá trị đơn TB (AOV)</span>
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg"><RiseOutlined /></div>
          </div>
          <h3 className="text-3xl font-black text-gray-800 dark:text-gray-200">{formatCurrency(revenue.averageOrderValue)}</h3>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Khách hàng đang chi tiêu nhiều hơn</p>
        </div>

        {/* Doanh thu ròng */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-xl shadow-md flex flex-col gap-4 text-white transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-orange-100 uppercase tracking-wider">Doanh thu ròng (Net)</span>
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-lg"><WalletOutlined /></div>
          </div>
          <h3 className="text-3xl font-black">{formatCurrency(revenue.netRevenue)}</h3>
          <p className="text-xs text-orange-100 font-medium border-t border-orange-400/50 pt-2 mt-2">
            Đã khấu trừ các khoản hoàn trả & hủy đơn
          </p>
        </div>
      </div>
      
    </div>
  );
}