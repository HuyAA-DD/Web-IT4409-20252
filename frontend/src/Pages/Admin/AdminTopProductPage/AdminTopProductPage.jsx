import React, { useState, useEffect } from 'react';
import { 
  TrophyOutlined, 
  FireOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Progress } from 'antd';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

export default function AdminTopProductPage() {
  const currentYear = new Date().getFullYear();
  const [products, setProducts] = useState([]);
  const [limit, setLimit] = useState(10);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterQuarter, setFilterQuarter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setIsLoading(true);
      try {
        const params = { limit, year: filterYear };
        if (filterMonth) params.month = filterMonth;
        if (filterQuarter) params.quarter = filterQuarter;

        const response = await api.get(API_ENDPOINTS.admin.topProducts, params);
        setProducts(response?.data || response);
      } catch (error) {
        console.error('Lỗi tải danh sách top sản phẩm', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopProducts();
  }, [limit, filterYear, filterMonth, filterQuarter]);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Lấy số lượng bán cao nhất để tính phần trăm thanh Progress Bar
  const maxSold = products.length > 0 ? Math.max(...products.map(p => p.soldCount)) : 1;

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in transition-colors duration-500">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
            <FireOutlined className="text-red-500" /> Bảng xếp hạng Sản phẩm
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Danh sách các sản phẩm bán chạy nhất mang lại doanh thu cao.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <FilterOutlined className="text-gray-400" />
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Lọc:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-orange-600 dark:text-orange-400 outline-none cursor-pointer"
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
          </select>
          <select
            value={filterQuarter || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setFilterQuarter(value);
              if (value) setFilterMonth(null);
            }}
            className="bg-transparent text-sm font-bold text-orange-600 dark:text-orange-400 outline-none cursor-pointer"
          >
            <option value="">Chọn Quý</option>
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>Quý {q}</option>
            ))}
          </select>
          <select
            value={filterMonth || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setFilterMonth(value);
              if (value) setFilterQuarter(null);
            }}
            className="bg-transparent text-sm font-bold text-orange-600 dark:text-orange-400 outline-none cursor-pointer"
          >
            <option value="">Chọn Tháng</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>Tháng {month}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setFilterYear(currentYear);
              setFilterMonth(null);
              setFilterQuarter(null);
            }}
            className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Xóa
          </button>
          <span className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2" />
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Hiển thị:</span>
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-orange-600 dark:text-orange-400 outline-none cursor-pointer"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      {/* BẢNG XẾP HẠNG */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                <th className="py-4 px-4 w-20 text-center font-bold text-gray-500">Hạng</th>
                <th className="py-4 px-4 font-bold text-gray-500">Sản phẩm</th>
                <th className="py-4 px-4 font-bold text-gray-500">Danh mục</th>
                <th className="py-4 px-4 font-bold text-gray-500 w-1/4">Đã bán (Số lượng)</th>
                <th className="py-4 px-4 font-bold text-gray-500 text-right">Doanh thu mang lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              
              {isLoading ? (
                <tr><td colSpan="5" className="py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : products.map((product, index) => {
                
                // Xử lý UI Huy chương cho Top 3
                let rankUI;
                if (index === 0) rankUI = <div className="w-8 h-8 mx-auto rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-black shadow-sm border border-yellow-200 text-lg"><TrophyOutlined /></div>;
                else if (index === 1) rankUI = <div className="w-8 h-8 mx-auto rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-black shadow-sm border border-gray-200">2</div>;
                else if (index === 2) rankUI = <div className="w-8 h-8 mx-auto rounded-full bg-orange-100 text-amber-700 flex items-center justify-center font-black shadow-sm border border-orange-200">3</div>;
                else rankUI = <div className="w-8 h-8 mx-auto rounded-full text-gray-400 flex items-center justify-center font-bold">{index + 1}</div>;

                const percentSold = (product.soldCount / maxSold) * 100;

                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                    {/* Hạng */}
                    <td className="py-4 px-4 align-middle">{rankUI}</td>
                    
                    {/* Thông tin sản phẩm */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-800 dark:text-gray-200 m-0 group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">{product.sku}</span>
                        {product.stock < 50 && <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded uppercase">Sắp hết hàng</span>}
                      </div>
                    </td>
                    
                    {/* Danh mục */}
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {product.category}
                    </td>
                    
                    {/* Số lượng bán (Kèm Progress bar trực quan) */}
                    <td className="py-4 px-4 pr-8">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-black text-gray-800 dark:text-gray-200">{product.soldCount.toLocaleString('vi-VN')}</span>
                        <span className="text-xs text-gray-400">cái</span>
                      </div>
                      <Progress 
                        percent={percentSold} 
                        showInfo={false} 
                        size="small" 
                        strokeColor={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : index === 2 ? '#eab308' : '#3b82f6'} 
                      />
                    </td>
                    
                    {/* Doanh thu */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                        {formatCurrency(product.revenue)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}