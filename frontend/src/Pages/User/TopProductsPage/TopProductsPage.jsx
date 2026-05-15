import React, { useState } from 'react';
import { Progress, Button, Rate } from 'antd';
import { 
  StarFilled, 
  ShoppingCartOutlined, 
  TrophyFilled,
  FireFilled,
  EyeOutlined
} from '@ant-design/icons';

// --- [MOCK DATA] --- Xóa mảng này khi có API thực tế
const MOCK_TOP_3_PRODUCTS = [
  {
    id: 1,
    rank: 1,
    title: "Tai nghe Over-ear Wireless Pro Sound Elite 2024",
    price: "2.450.000đ",
    originalPrice: "3.200.000đ",
    rating: 4.9,
    sold: "12k",
    badge: "HOT TREND",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTsak4CyH_1qnv1tDyNS-L3yOfeFvrYOMVwVWxBiQq64DNMsKNIlpZTjCh3RwUarMEpH-xIERWZG3Ny7LzcBB5Ztru4ZF-qarmoJBoQ63ffb6MGoiuZgT1WM3qsEp08kZOCJPM5reB3Uoz6r9bkig0WmEb4zSfrU3XWukTWNJFIZo2F8UVsAaHQpbiVNcAOh0FYAFxAGF9tXMLNlPZFKk-EkJQHQ8yxYjvNrBvjPgOeb-B2Nb0KVTsG7YxYR5qcF3zUG2xhO2fRpPV"
  },
  {
    id: 2,
    rank: 2,
    title: "Đồng hồ thông minh MegaWatch GT Series",
    price: "1.890.000đ",
    originalPrice: null,
    rating: 4.8,
    sold: "8.5k",
    badge: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuABAty6o9glq08b7wtH4pqGagZi3peU_U0neWd8-6F6w5cj9-DVvX3rUcdCCn5A8jkFSy_LFceADKVma8_YYR99hGZ8D4c-lN50qN2EEbQra_4iL4anrGM7O6_ZLgtYi3vfBrUuO3jkid9MHGYTFaFA0EwPvlPm4B4UWIuRgIPQ5EgH8y0mmQC3NUHxTi7NujmO5z0rqsJZQ6R3GQc02Sdybtpeg0j5VMzRuyTFISreFkxPGCdvKNsMLQ_78UjyX7C5PZXZfdEH74Cz"
  },
  {
    id: 3,
    rank: 3,
    title: "Giày Chạy Bộ Performance Ultra Boost X",
    price: "1.550.000đ",
    originalPrice: null,
    rating: 4.7,
    sold: "7.2k",
    badge: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVGFDfS4olmA_O1VzdEkEGLGMArUFB2Z-69W5OtaBQkgfA2uByOEI3LwFP7M-xKGux-1GdNvTwnEDTUyk6wbxfME9Y7n1B3yjkfIu88QT8dxHp9ZdLKuPhJBpyYOSzTQ5GNQwR-bgZpcQsiRe1G41bjQkf-DRfeaqEbr_-nW7VlVuu-AgLxVCcz0JpLqf8aKU-uP4DzF0XTwdpksUhAQwBf5nKpskWHQpEwZyMXCky7fXTUK6Scu6xuI3UpFPfAg-CtGPv8lU_oXac"
  }
];

const MOCK_LIST_PRODUCTS = [
  {
    id: 4,
    rank: 4,
    title: "Máy Ảnh Phóng Lớn Instant Cam Gen-2",
    category: "Điện tử",
    views: "5.4k",
    price: "1.200.000đ",
    soldPercent: 85,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCS_mSPtO_4qSE4tD-PMX2l_sw0jC2Mof57MjQRR-zlHlpHBDqRYfLagqpo8RWy1G04tSTvuVQo4Ts1ufNqPZgJ3FDMxfQG2Kn07wH5qQJ9Ei2ExkyFNER5_UW6_UBpV-DfKf7QcDHrCT4pwWHlfrknUEvnC87SZAsuq8DGeZK8VXF0mwcF8US1r1XvhXd9vttbVcXd8oiDO6OkMdfhL5u_hnfpsNtG45Y8_9KP6f6uRUuTB1UNgNO-rf4Dmw_Gbcvf4gK89ev8seI-"
  },
  {
    id: 5,
    rank: 5,
    title: "Bình Nước Giữ Nhiệt Vacu-Steel 1.2L",
    category: "Nhà cửa",
    views: "4.9k",
    price: "450.000đ",
    soldPercent: 60,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrhesTOghc5jpA1WBFHDMZFPkjC0-c6Tc71a7APy_K1sXVAamnxo8QzewTYS0bUaNzSMvbh8NlA4De66AeQutlsl0qlaTYEdb4pyn2nxWx-H7BlpeBzhw-7_iAkpE7g8GXv2PffP7ODD4_HI12aUpZ7Db130oYohTam9zlOYyTR-A6-MYGYASQguBsDN18t3AFLzE6rkk_SiYNt2Hawdn9yAYGLJQaUNL-ysuEyb2MCmLrUhwykaZjLg5awoCz-1Nao_Pqe146RtQI"
  },
  {
    id: 6,
    rank: 6,
    title: "Chuột Gaming Pro X Speed RGB",
    category: "Điện tử",
    views: "3.2k",
    price: "950.000đ",
    soldPercent: 45,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuArvb1im7lNmDcNgFRaMbw9t9ALQanEeqZSsK87OfqvnJAt1IyOm2u1DeYYdRWrzUV0FpDSfXUCmFczzORe1MYoi0nPq6PgQQ1V5CCxCaobWr2M4ITGVdcwO609lOQOFlwnvTT4dqKyg3GMpPVmYZiU_yU0QdgvwI8Kq3OxQR6DuHFdcL5g_TzI_Gq0I-QLiG97MaZWjBgbNBd17EfNMZzEo9xp4B9yxeOqd9fd44LI0UmiRsAwUcY-X83Gnws7kZczEaofX5gLzOlM"
  }
];

export default function TopProductsPage() {
  /* 
     [TODO: API] 
     - Lấy danh sách Top Sản phẩm: GET /api/products/top-ranking?timeFrame={timeFilter}&category={activeCategory}
  */
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' | 'month'
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tất cả ngành hàng' },
    { id: 'electronics', name: 'Điện tử & Công nghệ' },
    { id: 'fashion', name: 'Thời trang Nam/Nữ' },
    { id: 'home', name: 'Nhà cửa & Đời sống' },
    { id: 'beauty', name: 'Sức khỏe & Sắc đẹp' },
  ];

  // Helper function để lấy màu gradient và border theo Rank (1, 2, 3)
  const getRankStyle = (rank) => {
    switch(rank) {
      case 1: return { border: 'border-yellow-400', gradient: 'from-yellow-400 to-orange-500', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.4)]' };
      case 2: return { border: 'border-gray-300', gradient: 'from-gray-300 to-gray-500', glow: 'shadow-lg' };
      case 3: return { border: 'border-amber-600', gradient: 'from-amber-500 to-amber-700', glow: 'shadow-lg' };
      default: return { border: 'border-gray-200', gradient: 'bg-gray-500', glow: 'shadow-sm' };
    }
  };

  return (
    <div className="w-full pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-orange-600 uppercase tracking-tight m-0 flex items-center gap-3">
            Sản phẩm bán chạy <FireFilled className="text-red-500" />
          </h1>
          <p className="text-gray-500 mt-2">Bảng xếp hạng xu hướng mua sắm được cập nhật liên tục mỗi giờ.</p>
        </div>
        
        {/* Lọc Theo Tuần / Theo Tháng */}
        <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
          <button 
            onClick={() => setTimeFilter('week')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${timeFilter === 'week' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
          >
            Theo Tuần
          </button>
          <button 
            onClick={() => setTimeFilter('month')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${timeFilter === 'month' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
          >
            Theo Tháng
          </button>
        </div>
      </div>

      {/* Industry Filter (Nút bộ lọc ngành hàng) */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold text-sm transition-all ${
              activeCategory === cat.id 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'bg-white border border-gray-200 text-gray-500 hover:border-orange-600 hover:text-orange-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Top 3 Featured (Bento Grid Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {MOCK_TOP_3_PRODUCTS.map((item) => {
          const style = getRankStyle(item.rank);
          
          return (
            <div key={item.id} className={`relative group overflow-hidden rounded-xl bg-white border-2 ${style.border} ${style.glow} transform transition-transform duration-300 hover:-translate-y-2 flex flex-col`}>
              
              {/* Rank Badge */}
              <div className={`absolute top-0 right-0 bg-gradient-to-br ${style.gradient} text-white px-4 py-2 font-black z-10 rounded-bl-xl shadow-md flex items-center gap-1`}>
                <TrophyFilled /> RANK {item.rank}
              </div>

              {/* Image */}
              <div className="aspect-square bg-gray-50 overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                {item.badge && (
                  <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg mb-3 w-fit tracking-wider">
                    {item.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-4 mt-auto">
                  <span className="text-2xl font-bold text-orange-600">{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">{item.originalPrice}</span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                    <StarFilled className="text-orange-500" />
                    <span>{item.rating} | {item.sold} đã bán</span>
                  </div>
                  <Button 
                    type={item.rank === 1 ? "primary" : "default"}
                    className={item.rank === 1 ? "bg-orange-600 hover:bg-orange-500 font-bold" : "border-orange-600 text-orange-600 hover:bg-orange-50 font-bold"}
                    onClick={() => {
                      /* [TODO: API] Thêm vào giỏ hàng hoặc chuyển sang trang chi tiết */
                    }}
                  >
                    {item.rank === 1 ? "MUA NGAY" : "XEM CHI TIẾT"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List of Rank 4 - 10 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
          Danh sách Top sản phẩm thịnh hành
        </h2>
        
        {MOCK_LIST_PRODUCTS.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 flex items-center gap-4 md:gap-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all group">
            
            {/* Rank Number */}
            <div className="text-3xl md:text-4xl font-black text-gray-300 w-10 md:w-12 text-center group-hover:text-orange-400 transition-colors">
              {item.rank}
            </div>

            {/* Thumbnail */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors line-clamp-2 md:line-clamp-1">{item.title}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="font-medium text-gray-700">{item.category}</span> 
                  <span className="text-gray-300">|</span> 
                  <EyeOutlined /> {item.views} lượt xem tuần này
                </p>
              </div>

              {/* Price & Actions (Responsive) */}
              <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto">
                <div className="flex flex-col">
                  <p className="text-orange-600 font-bold text-lg">{item.price}</p>
                  
                  {/* Thanh Progress hiển thị % Sold */}
                  <div className="hidden md:block w-32 mt-1">
                    <Progress 
                      percent={item.soldPercent} 
                      size="small" 
                      strokeColor="#ea580c" 
                      showInfo={false}
                    />
                    <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">{item.soldPercent}% ĐÃ BÁN</p>
                  </div>
                </div>

                <Button 
                  icon={<ShoppingCartOutlined />} 
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 font-bold"
                  onClick={() => {
                    /* [TODO: API] POST /api/cart/add { id: item.id } */
                  }}
                >
                  <span className="hidden sm:inline">THÊM VÀO GIỎ</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Nút Load More (Tùy chọn) */}
        <div className="flex justify-center mt-8">
          <Button size="large" className="text-gray-500 hover:text-orange-600 hover:border-orange-600 font-medium px-12">
            Xem thêm Bảng Xếp Hạng
          </Button>
        </div>
      </div>
    </div>
  );
}