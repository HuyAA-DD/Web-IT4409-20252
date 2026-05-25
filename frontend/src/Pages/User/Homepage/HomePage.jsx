import React, { useState } from 'react';
import { Progress, Rate, Statistic, Button } from 'antd';
import {
  ThunderboltOutlined,
  CompassOutlined,
  ShopOutlined,
  MobileOutlined,
  SkinOutlined,
  HomeOutlined,
  SmileOutlined,
  RocketOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Countdown } = Statistic;

// --- COMPONENT: HERO BANNER ---
const HeroBanner = () => {
  /* [TODO: API] GET /api/home/banners */
  return (
    <section className="relative overflow-hidden rounded-xl h-[300px] md:h-[400px] shadow-sm group">
      <img
        className="w-full h-full object-cover"
        alt="Banner"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOZqgFnlHa53TI65_v7xArwb4uaGrrHDvUlv9v5UewGM_7fWIApXtJcxh9TaSuMDSVZQIchAAJS3kVzrUBvaJzGyECc9HPSmi1j28DIuqSqDHnCdssQlYH76VxEaG87hz1oE4C1F4tbONxiVL-TLo_cJelY1_7bRIVxHizdwApFnr-ANzX4FYHXKsp1HmJwxG_CCaLY-k_2Th_h3r7TRwdJf25GxLCt5Fy4a_R3qrB_rjj7x15kbk4UIxHle21zCYtQAGTaYKKC911"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
        <div className="max-w-md space-y-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Mega Deals</span>
          <h2 className="text-white text-4xl font-bold leading-tight m-0">Lễ hội Điện tử & Công nghệ</h2>
          <p className="text-white/90 text-sm italic">Giảm giá lên tới 80% cho các tín đồ MegaMart</p>
          <button className="bg-orange-600 text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-orange-500 transition-all shadow-lg active:scale-95 uppercase">Mua Ngay</button>
        </div>
      </div>
    </section>
  );
};

// --- COMPONENT: CATEGORIES ---
// --- COMPONENT: CATEGORIES ---
const Categories = () => {
  /* [TODO: API] GET /api/categories */
  const cats = [
    { icon: <ShopOutlined />, name: "Tất cả" },
    { icon: <SkinOutlined />, name: "Thời trang nam" },
    { icon: <RocketOutlined />, name: "Giày dép" },
    { icon: <SmileOutlined />, name: "Phụ kiện" },
    { icon: <MobileOutlined />, name: "Đồ công nghệ" },
    { icon: <HomeOutlined />, name: "Đồ gia dụng" },
  ];

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 m-0">Danh Mục</h3>
        <a className="text-orange-600 font-semibold text-sm hover:underline" href="#">Xem Tất Cả</a>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {cats.map((c, i) => (
          <div key={i} className="group flex flex-col items-center text-center cursor-pointer">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 group-hover:scale-110 transition-all mb-2">
              <span className="text-orange-600 text-2xl">{c.icon}</span>
            </div>
            <span className="text-xs font-medium text-gray-600">{c.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- COMPONENT: FLASH SALE ---
const FlashSale = () => {
  /* [TODO: API] GET /api/deals/flash-sale */
  const [deadline] = useState(() => Date.now() + 1000 * 60 * 60 * 4);

  const products = [
    { id: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC040Jdm5RFALhVceg5MF9os-Jvu_3TP0pIu32RPa8dxrSHo_QlP5zdG5wJhnrWXKyLoVGBuvxNHZL8UbbCuyxsRzwXSXRJfAMKkrwcoIUjbEMYFGoHX8PmA0Z8Ypd4abTT1B_UWkfiQ271wsExbjWALAPrHkKVbTqAn4sw61-nS32HdHAIaHneb_cbnHz2UY7NRcm41S1Gi_MhHyoUHEKz7ABDDTGE2kP86RGVJ-L7ANksNVChul05S-A2K7MEKV9MbHalWcmJD_Dk", price: "29.00", sold: 75, discount: "-45%" },
    { id: 2, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3vdq0V54yeIxGbgGbikof7vm0Lo1oBgSOSEz7xc4Fm3jcEQvNenzfsbE21tMZ8mVTy0ebaxLmhvOffORfNcGIGJOgaEFEtmhdwM1nmZmmQTQcmjU4aqom0DTGt_kXqPQm4gvJSZ8xS_JURUYk3-FOagBdxo9UjEnRJlKSDIUbHUL-9KzLR-odFW2GdbxOgLhRZWsTrWWI34RRlKiUsAAYJFpV7g3OuU5VK4VxdngWgqmLA1---FvngvysJqY_mlWqF2SkhXPjNIkA", price: "85.00", sold: 20, discount: "-30%" },
    { id: 3, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPehCQ7bpZT2vXYQj3FnQRs_sEDPSW7xR34idmQmxddg-LA_j9xCegSMRqWbhXfR9SrnfN93BakJb6OtHe3FvS4qLuaXke_wItsECZBnecQfbgSRdzTR91B8Ak6tIX5uRr-kbjt9JTPdNY4nW7kLakOGObpVJ5y9i4fkRzsb-WVVO3kiYSOWULzqDnJC8Zvc0ybIU1Cw78kovXrYeQErHyX6HjoEjH-Csq4OfgSCsM_6yBwvFN7oODOnTC-RtklL2yMYMpGylD_n3V", price: "149.00", sold: 90, discount: "-15%" }
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="bg-orange-600 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <h3 className="flex items-center gap-2 text-white text-xl font-bold m-0 italic tracking-widest"><ThunderboltOutlined /> FLASH SALE</h3>
          <Countdown value={deadline} valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }} format="HH : mm : ss" />
        </div>
        <a className="text-white text-sm font-medium hover:underline" href="#">Tất cả &gt;</a>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((p, idx) => (
          <div key={p.id} className={`space-y-2 group cursor-pointer ${idx >= 4 ? 'hidden lg:block' : ''}`}>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Product" src={p.img} />
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">{p.discount}</div>
            </div>
            <div className="text-center">
              <p className="text-orange-600 font-bold text-lg m-0">${p.price}</p>
              <Progress percent={p.sold} size="small" strokeColor="#ea580c" format={(percent) => <span className="text-[10px] text-gray-400 font-bold">VỪA BÁN {percent}%</span>} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- COMPONENT: DAILY DISCOVER ---
const DailyDiscover = () => {
  /* [TODO: API] GET /api/products/discovery?page=... */
  const products = [
    { id: 101, title: "Tai nghe chống ồn không dây Pro", price: "45.50", rate: 4.5, sold: "2.4k", tag: "YÊU THÍCH+", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU-18DUDkHe4I-XC35t8Bd1gJxOeXYsZu04DnWr5cMogzmU0ojFDZHQ-_zewqXwrOb5lFiKm3VsY0bAjy21HnYaPfjigDfQcY4wgsOEHOCUjwhDtK7Hx8EH3vcYfP000OC-sdnvGAbRPvgEy953Bzr6W_NiBzmP-Hf4yQMc6B_mBqHsyJXhyVIHG1z6kKIEj0RtCQTyvqGXboJonPgzNsHNwJpNcAJOzvFoLPYCxmDESE1-ydIFQOAdeU5gf56Q0rgKS6xleWN1Ag0" },
    { id: 102, title: "Balo Canvas phong cách Vintage", price: "19.99", rate: 4.0, sold: "1.1k", tag: "SALE", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6mFq5DK0nMvAkFQRq0QlqzGtV9KYNfQxlS82-4cdkCu-KooE3Fz3jfl_ffGFplKJvsAEAfCk-_GH-4TeKoXaYIx3U6mgmvqCP5m6f_q5EtEM61aH8fhuVcAZckGNbxuhq-H9CXz_ocnP2ZmmXS24QokWEhQOxEyEkwOaNY4TGP0isP2Tfrlb9tR0ojzDih-S9IByDSgk_wFiQw1_s5zcphnwQa70-RZ9OMTAgBZ1Go5hpyJYOhcesYqSvZlBc9pj-uuwhbQ4hwAHO" },
    { id: 103, title: "Giày chạy bộ siêu nhẹ thoáng khí", price: "32.00", rate: 5.0, sold: "5k+", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzRgwduLDo-6L5XmXWojckS2fNyHunhBwrnh3QPx1Z13qxfnr99lT8sLdVw5I3zi8VgdcmoEmzRgOXTsOv5yjK_p6yFJytyt7773Q9-j5kVpvp-1NB5WcDduyWOmbqmgPSknSiQdOf61W1PvEluLGbBhjipI3qqNPZSIjMmElc7qX4Pwo39z2FlmeNc8CwUF0VZwp5EUIWdWVKVvcTE-tINa-pv_y5hRhqIqirY0Rp04YfKfra7KFAzHSj_53h8EBhvXhyfFPARvAZ" }
  ];

  return (
    <section className="mt-8 mb-20">
      <div className="flex items-center gap-4 border-b-4 border-orange-600 pb-2 w-fit mb-4">
        <h3 className="text-xl font-bold text-orange-600 uppercase tracking-wider m-0 tracking-[2px]">Gợi Ý Hôm Nay</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-transparent hover:border-orange-600 group cursor-pointer flex flex-col">
            <div className="relative aspect-square bg-gray-50">
              <img className="w-full h-full object-cover" alt={p.title} src={p.img} />
              {p.tag && <span className={`absolute top-0 right-0 text-white text-[10px] px-2 py-1 font-bold ${p.tag === 'SALE' ? 'bg-red-600' : 'bg-orange-500'}`}>{p.tag}</span>}
            </div>
            <div className="p-3 flex flex-col flex-grow justify-between space-y-2">
              <h4 className="text-sm text-gray-700 line-clamp-2 leading-tight m-0 group-hover:text-orange-600">{p.title}</h4>
              <div>
                <p className="text-orange-600 font-bold text-lg m-0">${p.price}</p>
                <div className="flex items-center justify-between mt-1">
                  <Rate disabled defaultValue={p.rate} allowHalf style={{ fontSize: 10, color: '#ea580c' }} />
                  <span className="text-[10px] text-gray-400">Bán {p.sold}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <Button size="large" className="px-16 h-12 font-bold text-gray-500 hover:text-orange-600 hover:border-orange-600 shadow-sm">Xem Thêm</Button>
      </div>
    </section>
  );
};

// --- CHỈNH SỬA TẠI ĐÂY ---
// Export trang chủ chứa tất cả các nội dung thay vì nhồi vào MainLayout
export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      <HeroBanner />
      <Categories />
      <FlashSale />
      <DailyDiscover />
    </div>
  );
}