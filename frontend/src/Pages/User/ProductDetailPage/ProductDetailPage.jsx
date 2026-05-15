import React, { useState, useEffect } from 'react';
import { 
  StarFilled, 
  ThunderboltFilled, 
  CarOutlined, 
  ShoppingCartOutlined, 
  CheckCircleFilled, 
  MessageOutlined 
} from '@ant-design/icons';

// FIXME: [MOCK_DATA] - Xóa toàn bộ dữ liệu này khi kết nối API.
// Cấu trúc bám sát DTO ProductResponse (kèm giả lập ProductVariantResponse)
const mockProductResponse = {
  id: "p1000000-0000-0000-0000-000000000001",
  name: "ProStream Elite Z9 Laptop - 16\" 4K OLED, 32GB RAM, 1TB SSD, RTX 4080 Graphics, Ultra-Slim Design",
  description: "Experience the future of computing with the ProStream Elite Z9. Designed for creators, gamers, and professionals who demand nothing but the absolute best. Featuring an industry-leading 4K OLED display that covers 100% of the DCI-P3 color gamut.",
  categoryId: "c1000000-0000-0000-0000-000000000001",
  categoryName: "Laptops",
  sellerId: "s1000000-0000-0000-0000-000000000001",
  sellerName: "ProTech Official Store",
  status: "ACTIVE",
  imageUrls: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC8d6gwQVW97K7CCp-wecZNbtHY1Obn3qAEFWfbsufpHKLPUbHSky-Zu20qVHnwkcTrXaxDQSs8ctxVn20ZNVNuncoVPRzIm45WMFQ7nGy_obzNC3Ap2CjBtTAtZ_m5KD3L9jkWvV8j-7YpCVjJ8VPHr7U7ky4Gony_oXULXEHjY5DytR6C46z_BoV-jT0PvhycipsrtRKSNwFGbUOuOsdC3s4jfqdvgYU8q8G64JP76c9GIscWdzfN7zTCpTM1zRJKrg9OFNJc6wBK",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCmyoN7CJYLJOSbZWq5t4OLblLkfLSW6VackzjopYlF5mRhDiFm7z-u9rVCnm2PzoGys93B5hB1cE6Z8-GNdK6hxdY4Y-BpqLFv5-m5JnneabD_jeHmEFwRg9WaWq6oV-F3FZIA0HPCIUVunf5P9CyZL25nyle4YcDMBA7z1K9N3gt7h7YMmwUPSRxt4fs4Y0Lamtfiv1PcgWwQ-oEvUYu4xp-NugzLI-elDFoR9d0B1-MmtmM0ksQmNg1SDPDn5NqgW7rBFBqBN4o1",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBai1aX_jDGGCq2h3JF7G4Z9bhek4uh36OcsISAJ9DoOpr4es0pRdzN6PE4plDwkr1nlJ8bbn8XUwwWFtJwIX_zpUL5fBQpGNHBrmQRlLvXLfpfSWGWMn8aptnvL2FeFcM5uuYPW8xNhOi3bLqXhfr29q6LzbuAqFE4RYnXmkz1mNmcJYNPJ0EAuveDeJrBd_ihSzx3II9anDajZXfc6NtoWGRkIWS83-oNINYcV4_CO6COjIgGkBYpx781MSl35X3p-Qn4aTHvO66C",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuASRtMoMRjuQq477H5s8lTTE9ARvMmexIBErSyJdgtzOvTOWKC-88UrJIytrvXA9go4pyM1pKN_3Fx41zMbDLgyfz526h5zS1mt6r5kWJdBVYfHwhdmDm4PpvhC2z8kJbyVXVld6D4PVoa1xw86w745p8oQbGIBg8qz95OETQjL0edPlOv84ttjeJukHh1_uX6bw-y_mdsEBiMrEnP_rXefUGRD9ahuJ0iqWawyw4z_CUF-7kgB0kstM7v1LEmAXXXwCLzpUpFPKeGQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCxm5IgnLjhoj3l0eeiW03LfRx_J_CHBZeVTG_QcDLVF-IrtZ8IGO1zyxP3SqjKzaXAMr3JJZmUHQmJyt_ilL_3p23fE0Mk07aBYyM2VC7deFruH9nmIo_RwdVcBYHnms8dgPa3a6newWvA9Q0kdbrMk-D9SaQ1eGkm-WAJOmdJm4bgSYJ_Yx7qs7-qVuxba-KQJZ3xnIoeL2HkdDFRsoM6TDvxr2GnEvavw4uMMiTZk5qBt315erTr3xX9rHCM-gxLxXpoxruCZXx5"
  ],
  variants: [
    {
      id: "v1", sku: "Z9-GRY-16", price: 1699.00, originalPrice: 2099.00, stock: 50,
      attributes: { Color: "Space Gray", Memory: "16GB" }
    },
    {
      id: "v2", sku: "Z9-GRY-32", price: 1899.00, originalPrice: 2499.00, stock: 15,
      attributes: { Color: "Space Gray", Memory: "32GB" }
    },
    {
      id: "v3", sku: "Z9-BLK-32", price: 1899.00, originalPrice: 2499.00, stock: 0,
      attributes: { Color: "Midnight Black", Memory: "32GB" }
    }
  ],
  createdAt: "2024-01-01T10:00:00",
  updatedAt: "2024-05-10T15:30:00",
  // Các trường UI giả lập (Thường được gọi từ ReviewService/StatsService)
  rating: 4.9,
  reviewsCount: "1.2k",
  soldCount: "4.5k"
};

// FIXME: [MOCK_DATA] - Xóa mảng này khi có API gọi gợi ý sản phẩm
const relatedProducts = [
  { id: 1, name: "ProVision 34\" Ultra-Wide Curved Monitor 144Hz", price: 599.00, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDvPd1IQvjcVWuTQRT8uCJZtxJLKYZzLsSSw5cIerGrBoFMSMv2SHTQZnS5Yxj7k8FavAemA-pS3fkhemGmKX-oihAC0thL6d_woYOVKx2YADYELptOlAye7g9UEeP7b_-ZpwqpjuOb3SvguvhjQChABmdZsTdnxwskHgTPWdrj-_cAqIUqz-6wmwO0K_NNMuT8v1dc3nF9O-oSE435XXjPqGKDCEUFAp2x9DXDcaOmK5Ip_ApToWYzxzLrDn-KZZQcdcqg_ZwzUhz" },
  { id: 2, name: "MechType Z Mechanical RGB Keyboard - Brown Switches", price: 129.00, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyKnt1mOxYodxYeKkhqtR1ZoHYgo7QErOhl_Ywsx9QdgafxhTTPra5I8-tqfuizIPzc9vpKAycGNrpG0sibzsrej2SBOLEueC90j4-jAiDDlbpyGZt7jv4Xa0KOQPDm9d3d_NdJzmYlRpbvBwRBAEjvp39J5h0cZ17lYGC6keMSqpK_kThCW77BHcP2dWlFpI06zX5hP1GxkGUrGlWN-EjDfpgut5ETTXapSkk4qtKQyPmcZLQriWx9MQbYGI66Pa81qDfCjI33Rju" }
];

export default function ProductDetailPage() {
  // FIXME: [MOCK_DATA] - Đổi thành useState(null) khi có API
  const [product, setProduct] = useState(mockProductResponse);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // State lưu trữ các thuộc tính phân loại đang được người dùng chọn (VD: { Color: "Space Gray", Memory: "32GB" })
  const [selectedAttributes, setSelectedAttributes] = useState({
    Color: "Space Gray",
    Memory: "32GB"
  });

  // ----------------------------------------------------------------------
  // TODO: [API_CALL] - GET /api/v1/products/{id}
  // useEffect(() => {
  //   const fetchProduct = async () => {
  //     // Thay thế mockProductResponse bằng response.data
  //   };
  //   fetchProduct();
  // }, [productId]);
  // ----------------------------------------------------------------------

  if (!product) return <div className="text-center py-20">Đang tải sản phẩm...</div>;

  // XỬ LÝ LOGIC PHÂN LOẠI (VARIANTS)
  // 1. Trích xuất danh sách các thuộc tính độc nhất (để vẽ nút bấm)
  const availableColors = [...new Set(product.variants.map(v => v.attributes.Color))];
  const availableMemories = [...new Set(product.variants.map(v => v.attributes.Memory))];

  // 2. Tìm Variant hiện tại khớp với cấu hình người dùng đang chọn
  const currentVariant = product.variants.find(v => 
    v.attributes.Color === selectedAttributes.Color && 
    v.attributes.Memory === selectedAttributes.Memory
  ) || product.variants[0]; // Fallback nếu không tìm thấy

  // Hàm xử lý khi user click chọn phân loại
  const handleAttributeSelect = (key, value) => {
    setSelectedAttributes(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    // TODO: [API_CALL] - POST /api/v1/cart/items
    // Payload gửi đi: { productId: product.id, productVariantId: currentVariant.id, quantity: 1 }
    console.log("Adding to cart:", currentVariant);
  };

  return (
    <div className="animate-fade-in pb-12 pt-4">
      
      {/* Breadcrumbs */}
      <nav className="flex gap-2 text-xs font-medium mb-6 text-gray-500">
        <a href="#" className="hover:text-orange-600 transition-colors">MegaMart</a>
        <span>/</span>
        <a href="#" className="hover:text-orange-600 transition-colors">{product.categoryName}</a>
        <span>/</span>
        <span className="text-gray-800 line-clamp-1">{product.name}</span>
      </nav>

      {/* --- PRODUCT HERO SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 shadow-sm rounded-xl border border-gray-100">
        
        {/* Cột trái: Thư viện Ảnh */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <img src={product.imageUrls[selectedImage]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.imageUrls.map((url, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${selectedImage === idx ? 'border-orange-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Thông tin chi tiết */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3 leading-snug">{product.name}</h1>
            <div className="flex items-center gap-4 divide-x divide-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-bold text-lg border-b border-orange-600">{product.rating}</span>
                <div className="flex text-orange-600 text-sm">
                  <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                </div>
              </div>
              <div className="pl-4">
                <span className="text-gray-800 font-bold">{product.reviewsCount}</span>
                <span className="text-gray-500 text-sm ml-1">Đánh giá</span>
              </div>
              <div className="pl-4">
                <span className="text-gray-800 font-bold">{product.soldCount}</span>
                <span className="text-gray-500 text-sm ml-1">Đã bán</span>
              </div>
            </div>
          </div>

          {/* Khu vực Giá & Flash Sale */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-3 relative overflow-hidden mt-2">
            <div className="flex items-end gap-3">
              {currentVariant.originalPrice && (
                <span className="text-gray-400 line-through text-base mb-1">${currentVariant.originalPrice.toFixed(2)}</span>
              )}
              <span className="text-3xl font-black text-orange-600">${currentVariant.price.toFixed(2)}</span>
              {currentVariant.originalPrice && (
                <span className="bg-red-600 text-white px-1.5 py-0.5 text-[10px] font-bold rounded uppercase mb-1.5">
                  -{Math.round((1 - currentVariant.price / currentVariant.originalPrice) * 100)}%
                </span>
              )}
            </div>
            
            {/* Giả lập Flash Sale */}
            <div className="flex items-center gap-3 mt-1">
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                <ThunderboltFilled /> FLASH SALE
              </span>
              <div className="flex-1 max-w-[200px] bg-gray-200 h-3 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500 w-3/4 rounded-full"></div>
                <span className="absolute inset-0 text-[8px] text-center font-bold text-white flex items-center justify-center uppercase">Đã bán 75%</span>
              </div>
            </div>
          </div>

          {/* Vouchers & Vận chuyển */}
          <div className="grid grid-cols-1 gap-4 py-4 text-sm">
            <div className="flex gap-4 items-start">
              <span className="w-24 text-gray-500 font-medium">Mã giảm giá</span>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded border border-orange-200 border-dashed">Giảm 50K</span>
                <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded border border-orange-200 border-dashed">Hoàn 10% Xu</span>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="w-24 text-gray-500 font-medium">Vận chuyển</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-700">
                  <CarOutlined className="text-lg text-emerald-600" />
                  <span>Miễn phí vận chuyển cho đơn từ $500</span>
                </div>
                <div className="text-xs text-gray-400 pl-7">Giao hàng từ kho Quốc tế</div>
              </div>
            </div>
          </div>

          {/* Các Phân Loại (Variants) */}
          <div className="flex flex-col gap-5 py-4 border-t border-gray-100">
            <div className="flex gap-4 items-center">
              <span className="w-24 text-gray-500 font-medium text-sm">Màu sắc</span>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => handleAttributeSelect('Color', color)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all border ${selectedAttributes.Color === color ? 'border-orange-600 text-orange-600 font-bold bg-orange-50/50' : 'border-gray-200 text-gray-600 hover:border-orange-400'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <span className="w-24 text-gray-500 font-medium text-sm">Cấu hình</span>
              <div className="flex gap-2 flex-wrap">
                {availableMemories.map(memory => (
                  <button 
                    key={memory}
                    onClick={() => handleAttributeSelect('Memory', memory)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all border ${selectedAttributes.Memory === memory ? 'border-orange-600 text-orange-600 font-bold bg-orange-50/50' : 'border-gray-200 text-gray-600 hover:border-orange-400'}`}
                  >
                    {memory}
                  </button>
                ))}
              </div>
            </div>
            <div className="pl-28 text-xs text-gray-400">
              {currentVariant.stock > 0 ? `Còn ${currentVariant.stock} sản phẩm (SKU: ${currentVariant.sku})` : <span className="text-red-500">Hết hàng</span>}
            </div>
          </div>

          {/* Nút Hành Động */}
          <div className="flex gap-4 mt-2 pt-6 border-t border-gray-100">
            <button 
              onClick={handleAddToCart}
              disabled={currentVariant.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold rounded-xl transition-all ${currentVariant.stock > 0 ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <ShoppingCartOutlined className="text-xl" /> Thêm vào giỏ
            </button>
            <button 
              disabled={currentVariant.stock === 0}
              onClick={() => {
                // TODO: [API_CALL] - Logic Mua Ngay (Có thể tạo Order trực tiếp)
              }}
              className={`flex-1 py-4 font-bold rounded-xl shadow-md transition-all ${currentVariant.stock > 0 ? 'bg-orange-600 text-white hover:bg-orange-500 active:scale-[0.98]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              Mua Ngay
            </button>
          </div>
        </div>
      </div>

      {/* --- SHOP PROFILE --- */}
      <section className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="flex items-center gap-4 md:border-r border-gray-100 pr-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsKgEYVm03jmgiZXbkDQm5U5XiFvtYBF26Ttcjf7XWuzo6rfbzEUbf7yUVHdG4CELhmRarlYFrv_ED6Gs-FN-xmvjA_PLo-Nkz4tjsL7kKh7-cSrYuScdWgUUtLcdlVDd-SBiyY43QWQHCSYOnpNsvZkwypNntf8fYit9TWiiVzQppn6JKS6ddPLHJk4rlWD2m-_9JndFvNE_YWoYSTuufXhovaFAM-uVPVRHQZGiJPNqqPdPaPAsVKQpl7MFiPSKVmlIsm_co98Rd" alt="Shop" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 m-0">{product.sellerName}</h3>
            <div className="flex gap-2 mt-2">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircleFilled /> Yêu thích+
              </span>
              <button className="text-orange-600 border border-orange-600 px-3 py-0.5 text-xs rounded hover:bg-orange-50 transition-colors flex items-center gap-1">
                <MessageOutlined /> Chat ngay
              </button>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          <div className="flex flex-col text-center border-r border-gray-100">
            <span className="text-gray-500 text-xs">Đánh giá</span>
            <span className="text-orange-600 font-bold">4.8 / 5.0</span>
          </div>
          <div className="flex flex-col text-center border-r border-gray-100">
            <span className="text-gray-500 text-xs">Sản phẩm</span>
            <span className="text-orange-600 font-bold">142</span>
          </div>
          <div className="flex flex-col text-center">
            <span className="text-gray-500 text-xs">Tham gia</span>
            <span className="text-orange-600 font-bold">4 Năm trước</span>
          </div>
        </div>
      </section>

      {/* --- MÔ TẢ & GỢI Ý --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
        
        {/* Cột trái: Mô tả chi tiết */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 bg-gray-50 p-4 rounded-lg text-gray-800 m-0 border border-gray-100">Mô Tả Sản Phẩm</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
              <p>{product.description}</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-gray-700">
                <li>Bộ xử lý: Intel Core i9-13900HK 5.4GHz Max Turbo</li>
                <li>Đồ họa: NVIDIA GeForce RTX 4080 with 12GB GDDR6X</li>
                <li>Màn hình: 16-inch 4K (3840 x 2400) OLED Touchscreen, 120Hz</li>
                <li>Kết nối: 3x Thunderbolt 4, WiFi 6E, Bluetooth 5.3</li>
                <li>Pin: 99.9Wh cho hiệu suất cả ngày</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cột phải: Sản phẩm cùng Shop */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3 m-0">Sản phẩm khác của Shop</h4>
            <div className="space-y-5">
              {relatedProducts.map(item => (
                <div key={item.id} className="flex gap-4 group cursor-pointer items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-700 line-clamp-2 m-0 group-hover:text-orange-600 transition-colors">{item.name}</h5>
                    <div className="text-orange-600 font-bold mt-2">${item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}