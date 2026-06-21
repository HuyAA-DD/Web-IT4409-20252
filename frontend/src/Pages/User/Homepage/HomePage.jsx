import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Skeleton, Empty } from 'antd';
import {
  FireOutlined,
  TagOutlined,
  ShoppingOutlined,
  GiftOutlined
} from '@ant-design/icons';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import USER_ROUTE from '../../../Routes/User.routes';

import { useOutletContext } from 'react-router-dom';

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
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-xl h-[300px] md:h-[400px] shadow-sm group">
      <img
        className="w-full h-full object-cover"
        alt="Banner"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOZqgFnlHa53TI65_v7xArwb4uaGrrHDvUlv9v5UewGM_7fWIApXtJcxh9TaSuMDSVZQIchAAJS3kVzrUBvaJzGyECc9HPSmi1j28DIuqSqDHnCdssQlYH76VxEaG87hz1oE4C1F4tbONxiVL-TLo_cJelY1_7bRIVxHizdwApFnr-ANzX4FYHXKsp1HmJwxG_CCaLY-k_2Th_h3r7TRwdJf25GxLCt5Fy4a_R3qrB_rjj7x15kbk4UIxHle21zCYtQAGTaYKKC911"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
        <div className="max-w-md space-y-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Mega Marts</span>
          <h2 className="text-white text-4xl font-bold leading-tight m-0">Trải nghiệm mua sắm không giới hạn</h2>
          <p className="text-white/90 text-sm italic">Tiện lợi - Nhanh chóng - Tiết kiệm</p>
          <button
            className="bg-orange-600 text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-orange-500 transition-all shadow-lg active:scale-95 uppercase"
            onClick={() => navigate(USER_ROUTE.Supermarket)}
          >
            Mua Ngay
          </button>
        </div>
      </div>
    </section>
  );
};

// --- 1. COMPONENT: TEXT CATEGORIES ---
const TextCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
        <ShoppingOutlined className="text-orange-600 text-xl" />
        <h3 className="text-lg font-bold text-gray-800 m-0">Danh Mục Mua Sắm Phổ Biến</h3>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : categories.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500">
          Không có danh mục nào.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer select-none"
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
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <TagOutlined className="text-orange-600 text-xl" />
        <h3 className={`text-lg font-bold  m-01 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Voucher hấp dẫn</h3>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : vouchers.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm border border-gray-100">
          Hiện không có voucher hợp lệ.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white">
                <GiftOutlined className="text-2xl" />
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] font-bold">Voucher</div>
                  <div className="text-xl font-black">{getVoucherLabel(voucher)}</div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="text-sm text-gray-600">Mã: <span className="font-semibold text-orange-600">{voucher.code}</span></div>
                <div className="text-sm text-gray-600">Điều kiện: {getVoucherCondition(voucher)}</div>
                <div className="text-sm text-gray-600">Hiệu lực: {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}</div>
                <div className="text-sm text-gray-600">Đã sử dụng: {voucher.currentUsage ?? 0}/{voucher.usageLimit ?? '∞'}</div>
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
    <section className="bg-gradient-to-b from-orange-50 to-white p-6 rounded-xl shadow-sm border border-orange-100 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FireOutlined className="text-red-500 text-2xl" />
          <h3 className="text-xl font-black text-gray-800 m-0 uppercase tracking-wide">Top Sản Phẩm Bán Chạy</h3>
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : products.length === 0 ? (
        <Empty description="Không có sản phẩm nổi bật" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleViewProduct(product.id)}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer border border-gray-100"
            >
              <div className={`absolute top-0 left-0 w-8 h-10 flex justify-center pt-1 z-10 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-orange-400' : 'bg-gray-700'} text-white font-black text-lg`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}>
                {index + 1}
              </div>

              <div className="relative aspect-square">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={getProductName(product)} src={getProductImage(product)} />
              </div>

              <div className="p-3 text-center">
                <h4 className="text-xs text-gray-600 line-clamp-2 mb-1 group-hover:text-orange-600 h-12">{getProductName(product)}</h4>
                <p className="text-orange-600 font-bold text-base mb-1">{formatCurrency(getProductPrice(product))}</p>
                <p className="text-[10px] text-gray-400 font-medium bg-gray-50 rounded-full py-0.5 inline-block px-2">Top sản phẩm</p>
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
    <div className="w-full flex flex-col">
      <HeroBanner />
      <TextCategories />
      <TopProducts />
      <VoucherSection />
    </div>
  );
}
