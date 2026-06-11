import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Carousel, Skeleton, Empty } from 'antd';
import {
  FireTwoTone,
  TagsTwoTone,
  ShoppingTwoTone,
  GiftTwoTone
} from '@ant-design/icons';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

const PLACEHOLDER_IMAGE =
  'https://via.placeholder.com/500x500?text=MEGAMART+PRODUCT';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return 'Không giới hạn';
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return 'Không xác định';
  }
};

const getVoucherLabel = (voucher) => {
  const type = String(voucher?.discountType || '').toUpperCase();
  const amount = Number(voucher?.discountValue || 0);
  if (type.includes('PERCENT')) {
    return `Giảm ${amount}%`;
  }
  return `Giảm ${formatCurrency(amount)}`;
};

const getVoucherCondition = (voucher) => {
  const minOrder = Number(voucher?.minOrderValue || 0);
  if (minOrder > 0) {
    return `Đơn tối thiểu ${formatCurrency(minOrder)}`;
  }
  return 'Áp dụng cho mọi đơn hàng';
};

const getProductImage = (product) => {
  return product?.imageUrls?.[0] || PLACEHOLDER_IMAGE;
};

const getProductPrice = (product) => {
  const price = product?.variants?.[0]?.price;
  return Number(price || 0);
};

const getProductName = (product) => {
  return product?.name || 'Sản phẩm';
};

// --- COMPONENT: HERO BANNER ---
const HeroBanner = () => {
  const { isDarkMode } = useOutletContext();
  
  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200',
      badge: 'Bộ Sưu Tập Mới',
      title: 'Thời Trang Thu Đông',
      subtitle: 'Khám phá xu hướng mới nhất năm nay với ưu đãi 30%',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
      badge: 'Thực Phẩm Sạch',
      title: 'Đồ Ăn Tươi Ngon',
      subtitle: 'Nguồn nguyên liệu hữu cơ đạt chuẩn, giao nhanh 2h',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
      badge: 'Flash Sale',
      title: 'Phong Cách Giới Trẻ',
      subtitle: 'Giảm sâu lên tới 40% cho các mặt hàng áo thun và phụ kiện',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1200',
      badge: 'Combo Tiết Kiệm',
      title: 'Dinh Dưỡng Mỗi Ngày',
      subtitle: 'Rau củ quả tươi sạch nhập mới mỗi buổi sáng',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
      badge: 'Hàng Hiệu',
      title: 'Phụ Kiện Thời Thượng',
      subtitle: 'Túi xách và giày dép cao cấp - Nâng tầm phong cách của bạn',
    }
  ];

  return (
    <section className={`relative overflow-hidden rounded-xl h-[300px] md:h-[400px] group transition-all duration-300 ${
      isDarkMode ? 'shadow-[0_4px_30px_rgba(0,0,0,0.8)] border border-gray-800' : 'shadow-sm'
    }`}>
      <Carousel autoplay effect="fade" autoplaySpeed={4000} className="w-full h-full">
        {banners.map(banner => (
          <div key={banner.id} className="relative h-[300px] md:h-[400px] w-full outline-none">
            <img
              className="w-full h-full object-cover"
              alt={banner.title}
              src={banner.image}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-12">
              <div className="max-w-md space-y-4 animate-fade-in-up">
                <span className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                  {banner.badge}
                </span>
                <h2 className="text-white text-4xl md:text-5xl font-black leading-tight m-0 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-gray-200 text-base italic drop-shadow-md">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

// --- 1. COMPONENT: TEXT CATEGORIES ---
const TextCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useOutletContext();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.categories.list);
        const data = response?.data ?? response;
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className={`p-5 rounded-xl shadow-sm border mt-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <ShoppingTwoTone twoToneColor="#f97316" className="text-2xl" />
        <h3 className={`text-lg font-bold m-0 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Danh Mục Mua Sắm
        </h3>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : categories.length === 0 ? (
        <div className={`rounded-2xl p-6 text-center text-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          Không có danh mục nào.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`border px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer select-none ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-500/10' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              {cat.name || cat.title || 'Danh mục'}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// --- 2. COMPONENT: VOUCHERS ---
const VoucherSection = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useOutletContext();

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.coupons.list);
        const data = response?.data ?? response;
        const items = Array.isArray(data) ? data : [];

        const now = new Date();
        const validCoupons = items.filter((coupon) => {
          if (!coupon?.isActive) return false;
          const startDate = coupon?.startDate ? new Date(coupon.startDate) : null;
          const endDate = coupon?.endDate ? new Date(coupon.endDate) : null;
          if (startDate && startDate > now) return false;
          if (endDate && endDate < now) return false;
          return true;
        });

        setVouchers(validCoupons.slice(0, 3));
      } catch (error) {
        console.error('Lỗi khi tải voucher:', error);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-5">
        <TagsTwoTone twoToneColor="#10b981" className="text-2xl" />
        <h3 className={`text-lg font-bold m-0 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Voucher hấp dẫn
        </h3>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : vouchers.length === 0 ? (
        <div className={`rounded-xl p-6 text-center text-sm shadow-sm border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-white border-gray-100 text-gray-500'
        }`}>
          Hiện không có voucher hợp lệ.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className={`rounded-xl overflow-hidden transition-shadow duration-300 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-black/20' : 'bg-white border border-orange-100 shadow-sm'
            }`}>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-20">
                  <GiftTwoTone twoToneColor="#ffffff" className="text-7xl" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-[0.2em] font-bold text-orange-100 mb-1">Mã Ưu Đãi</div>
                  <div className="text-2xl font-black">{getVoucherLabel(voucher)}</div>
                </div>
              </div>

              <div className={`p-5 space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="text-sm flex justify-between">
                  <span>Mã code:</span>
                  <span className="font-bold text-orange-500">{voucher.code}</span>
                </div>
                <div className="text-sm">Điều kiện: <span className="font-medium">{getVoucherCondition(voucher)}</span></div>
                <div className="text-sm">Hạn dùng: <span className="font-medium">{formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}</span></div>
                
                <div className="mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min(((voucher.currentUsage ?? 0) / (voucher.usageLimit || 1)) * 100, 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-right text-gray-400">Đã dùng: {voucher.currentUsage ?? 0}/{voucher.usageLimit ?? '∞'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// --- 3. COMPONENT: TOP PRODUCTS ---
const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.products.list);
        const data = response?.data ?? response;
        const list = Array.isArray(data) ? data : data?.items ?? [];
        setProducts(list.slice(0, 5));
      } catch (error) {
        console.error('Lỗi khi tải top products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  const handleViewProduct = (productId) => {
    if (!productId) return;
    navigate(`/products/${productId}`);
  };

  return (
    <section className={`p-6 rounded-xl shadow-sm border mt-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 'bg-gradient-to-b from-orange-50 to-white border-orange-100'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FireTwoTone twoToneColor="#ef4444" className="text-3xl animate-pulse" />
          <h3 className={`text-xl font-black m-0 uppercase tracking-wide ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Top Sản Phẩm Bán Chạy
          </h3>
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : products.length === 0 ? (
        <Empty description="Không có sản phẩm nổi bật" className={isDarkMode ? 'text-gray-400' : ''} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleViewProduct(product.id)}
              className={`rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative group cursor-pointer border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-500' : 'bg-white border-gray-100 hover:border-orange-200'
              }`}
            >
              <div className={`absolute top-0 left-0 w-8 h-10 flex justify-center pt-1 z-10 text-white font-black text-lg ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-700'
              }`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}>
                {index + 1}
              </div>

              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt={getProductName(product)} 
                  src={getProductImage(product)} 
                />
              </div>

              <div className="p-3 text-center">
                <h4 className={`text-xs line-clamp-2 mb-1 h-8 font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300 group-hover:text-orange-400' : 'text-gray-700 group-hover:text-orange-600'
                }`}>
                  {getProductName(product)}
                </h4>
                <p className="text-orange-500 font-black text-base mb-2">
                  {formatCurrency(getProductPrice(product))}
                </p>
                <span className={`text-[10px] font-semibold rounded-full py-1 px-3 ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'
                }`}>
                  Top sản phẩm
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="w-full flex flex-col gap-2">
      <HeroBanner />
      <TextCategories />
      <TopProducts />
      <VoucherSection />
    </div>
  );
}