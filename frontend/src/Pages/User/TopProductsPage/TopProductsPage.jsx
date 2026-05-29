import React, { useState, useEffect } from 'react';
import { Progress, Button } from 'antd';
import { useOutletContext } from 'react-router-dom';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import {
  StarFilled,
  ShoppingCartOutlined,
  TrophyFilled,
  FireFilled,
  EyeOutlined,
} from '@ant-design/icons';

export default function TopProductsPage() {
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' | 'month'
  const [activeCategory, setActiveCategory] = useState('all');
  const [topFeatured, setTopFeatured] = useState([]);
  const [listProducts, setListProducts] = useState([]);

  const { isDarkMode } = useOutletContext();

  const categories = [
    { id: 'all', name: 'Tất cả ngành hàng' },
    { id: 'electronics', name: 'Điện tử & Công nghệ' },
    { id: 'fashion', name: 'Thời trang Nam/Nữ' },
    { id: 'home', name: 'Nhà cửa & Đời sống' },
    { id: 'beauty', name: 'Sức khỏe & Sắc đẹp' },
  ];

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const resp = await api.get(API_ENDPOINTS.products.list, {
          params: { timeFrame: timeFilter, category: activeCategory, limit: 12 },
        });
        const data = resp?.data || resp || [];
        setTopFeatured(data.slice(0, 3));
        setListProducts(data.slice(3));
      } catch (err) {
        console.error('Failed to load top products', err);
      }
    };
    fetchTop();
  }, [timeFilter, activeCategory]);

  // Cập nhật Helper function có hỗ trợ Dark Mode
  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          border: 'border-yellow-400 dark:border-yellow-500',
          gradient: 'from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600',
          glow: 'shadow-[0_0_15px_rgba(250,204,21,0.4)] dark:shadow-[0_0_20px_rgba(234,88,12,0.3)]',
        };
      case 2:
        return {
          border: 'border-gray-300 dark:border-slate-500',
          gradient: 'from-gray-300 to-gray-500 dark:from-slate-500 dark:to-slate-700',
          glow: 'shadow-lg dark:shadow-none',
        };
      case 3:
        return {
          border: 'border-amber-600 dark:border-amber-700',
          gradient: 'from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-800',
          glow: 'shadow-lg dark:shadow-none',
        };
      default:
        return {
          border: 'border-gray-200 dark:border-slate-700',
          gradient: 'bg-gray-500 dark:bg-slate-600',
          glow: 'shadow-sm',
        };
    }
  };

  return (
    <div className="w-full pb-10 animate-fade-in transition-colors duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-orange-600 dark:text-orange-500 uppercase tracking-tight m-0 flex items-center gap-3 transition-colors">
            Sản phẩm bán chạy <FireFilled className="text-red-500" />
          </h1>
          <p className={` dark:text-gray-400 mt-2 transition-colors ${isDarkMode ? 'text-shadow-amber-200' : 'test-gray-800'}`}>
            Bảng xếp hạng xu hướng mua sắm được cập nhật liên tục mỗi giờ.
          </p>
        </div>

        {/* Lọc Theo Tuần / Theo Tháng */}
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner transition-colors">
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              timeFilter === 'week' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Theo Tuần
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              timeFilter === 'month' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Theo Tháng
          </button>
        </div>
      </div>

      {/* Industry Filter (Nút bộ lọc ngành hàng) */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold text-sm transition-all ${
              activeCategory === cat.id
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-orange-600 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Top 3 Featured (Bento Grid Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {topFeatured.map((item) => {
          const style = getRankStyle(item.rank);

          return (
            <div key={item.id} className={`relative group overflow-hidden rounded-xl bg-white dark:bg-slate-800 border-2 ${style.border} ${style.glow} transform transition-all duration-300 hover:-translate-y-2 flex flex-col`}>
              {/* Rank Badge */}
              <div className={`absolute top-0 right-0 bg-gradient-to-br ${style.gradient} text-white px-4 py-2 font-black z-10 rounded-bl-xl shadow-md flex items-center gap-1`}>
                <TrophyFilled /> RANK {item.rank}
              </div>

              {/* Image */}
              <div className="aspect-square bg-gray-50 dark:bg-slate-700 overflow-hidden relative transition-colors">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                {item.badge && (
                  <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg mb-3 w-fit tracking-wider shadow-sm">{item.badge}</span>
                )}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 line-clamp-2 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 mb-4 mt-auto">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 transition-colors">{item.price}</span>
                  {item.originalPrice && <span className="text-sm text-gray-400 dark:text-gray-500 line-through transition-colors">{item.originalPrice}</span>}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4 mt-2 transition-colors">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <StarFilled className="text-orange-500" />
                    <span>{item.rating} | {item.sold} đã bán</span>
                  </div>
                  <Button type={item.rank === 1 ? 'primary' : 'default'} className={item.rank === 1 ? 'bg-orange-600 hover:bg-orange-500 font-bold border-none shadow-sm' : 'border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700 dark:border-orange-500 dark:text-orange-400 font-bold'} onClick={() => { /* TODO: navigate or add to cart */ }}>
                    {item.rank === 1 ? 'MUA NGAY' : 'XEM CHI TIẾT'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List of Rank 4 - 10 */}
      <div className="space-y-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-shadow-amber-200' : 'test-gray-800'} dark:text-gray-300 mb-6 flex items-center gap-2 transition-colors`}>Danh sách Top sản phẩm thịnh hành</h2>

        {listProducts.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-4 md:gap-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-500 transition-all group">

            {/* Rank Number */}
            <div className="text-3xl md:text-4xl font-black text-gray-300 dark:text-slate-600 w-10 md:w-12 text-center group-hover:text-orange-400 transition-colors">{item.rank}</div>

            {/* Thumbnail */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 transition-colors">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 md:line-clamp-1">{item.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 transition-colors"><span className="font-medium text-gray-700 dark:text-gray-300">{item.category}</span> <span className="text-gray-300 dark:text-slate-600">|</span> <EyeOutlined /> {item.views} lượt xem tuần này</p>
              </div>

              {/* Price & Actions (Responsive) */}
              <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto">
                <div className="flex flex-col">
                  <p className="text-orange-600 dark:text-orange-400 font-bold text-lg transition-colors">{item.price}</p>

                  {/* Thanh Progress hiển thị % Sold */}
                  <div className="hidden md:block w-32 mt-1">
                    <Progress percent={item.soldPercent} size="small" strokeColor="#ea580c" trailColor="#334155" showInfo={false} />
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mt-0.5 transition-colors">{item.soldPercent}% ĐÃ BÁN</p>
                  </div>
                </div>

                <Button icon={<ShoppingCartOutlined />} className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-slate-700 font-bold" onClick={() => { /* TODO: add to cart */ }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
