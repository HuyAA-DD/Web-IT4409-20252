import React, { useState } from 'react';
import { 
  DeleteOutlined, 
  CloseOutlined, 
  MinusOutlined, 
  PlusOutlined, 
  ThunderboltOutlined, 
  TagOutlined, 
  CheckCircleOutlined, 
  ArrowRightOutlined, 
  SafetyCertificateOutlined, 
  CarOutlined, 
  RightOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';

// FIXME: [MOCK_DATA] - Xóa toàn bộ biến này khi có API.
// Mock data tuân thủ chính xác cấu trúc DTO CartResponse bọc ngoài CartItemResponse
const mockCartResponse = {
  id: "c7d8e9f0-3456-7890-12ab-cdef34567890",
  userId: "u1a2b3c4-9876-5432-10fe-dcba98765432",
  createdAt: "2026-05-13T14:53:03",
  totalItems: 2,
  totalAmount: 478.99, // Tổng tiền do BE trả về (Có thể dùng để check đối chiếu)
  items: [
    {
      id: "a1b2c3d4-1234-5678-90ab-cdef12345678",
      productId: "p1000000-0000-0000-0000-000000000001",
      productName: "UltraBoost Velocity Pro - Orange/Black Limited Edition",
      productVariantId: "v1000000-0000-0000-0000-000000000001",
      sku: "UB-ORG-42",
      price: 129.99,
      quantity: 1,
      lineTotal: 129.99,
      attributes: {
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDH46lkiY2NUy2qZG3OQbJfEmtpWHG6vdfFGNaKYitsLbvmA-_96-0p38i6BlbnwonuP5YwCtfSZ7tVH8NCNaqI8-36mMkK8vTXLv292d-iLqO6GbYNxEnbunz-9cv9CxeDZ9mkRGYL-H0-bhUQ0hplhSsNHgg6R75MEau9umK9KeCmeN89LhFSagdY8_LOWDEP-oOK6h3BVbnKXKjChcihHBXCfObXgvEb1Zy4DCrbjZra7aWzHFz13kLjzxEdzjGVJkyWRlSY-893",
        originalPrice: 180.00,
        color: "Sunset Orange",
        size: "42",
        isFlashSale: false,
        isPreferred: true
      },
      selected: true // Thuộc tính bổ sung trên Frontend
    },
    {
      id: "b2c3d4e5-2345-6789-01bc-def012345679",
      productId: "p2000000-0000-0000-0000-000000000002",
      productName: "Nova Smart Watch Series 5 - Ceramic White",
      productVariantId: "v2000000-0000-0000-0000-000000000002",
      sku: "NW5-WHT-44",
      price: 349.00,
      quantity: 1,
      lineTotal: 349.00,
      attributes: {
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBroTZCLnvxUVvjyln8veaXh0gnui8NNJ-xKEkxxH19evW7BieE0MD3qkamtlbiMWTBPU304eu_Z2wPBjNNnyoSnuHD78K8bV-iM_9kex_WHiTXlXWmNeoNQizUbF9cGGRKTqLDDrShgj4eccB4KlFRHSzVdH6ES6qF4cbDe52kNRV8dk6s67m39I1elJotZjr_GkkcZcLP_B77GfxE926masXQ-uaaOkSjJ-Sd5r8-naiR8aQrEYshcCiUdBhDb023tLTmAEBVzumF",
        originalPrice: 349.00,
        color: "Ceramic White",
        size: "44mm",
        isFlashSale: true,
        isPreferred: false
      },
      selected: true
    }
  ]
};

// FIXME: [MOCK_DATA] - Xóa mảng `recommendations` này và thay bằng API.
const recommendations = [
  { id: 1, productName: "LuxeVision Polarized Sport Sunglasses", price: 45.00, sold: "1.2k", discount: "-15%", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARhzrA3j6c2R2Bm2NVLe9DNVBTg8L26TtSxI6I1qoRbIps9oNZJZfI5dvnUOsBYvnTs9ZKYX7U8CWD6KzkSgagN8hV7Rt3l5OfcNrCC28vFLwkZqXg21-0ac8veA5j0qvEAfYd0s8h7W80RcEgoabulnlGeu-oJDcwlrEaqXGLPrDCzka-Q51W9jugIvyAmfLvpSMMQFjiaJ4NyyRu3zw73C46ygPY5ZgL75wHo3hJ1oGboFPda616NQ4ObpT2ZeZn9JtB7YavtfFF" },
  { id: 2, productName: "ProClick RGB Wireless Gaming Mouse", price: 62.90, sold: "850", discount: null, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHsCtRSyfx6y-q_AVmowOAmdpW19P0WOb-XpcMaxEiDO8t7Oa9ggannmT1zR9ju_2nurcL6KrjUtndwljlPqVaZEI1lffUamduBs4fdBZRZXuW7ZWy-8LUouQgba702OUA6YFl-YLOroJ9TE01QIj6Y4aTygdCZCq_pE7S-YlAgGaSnof_J0qSeIVTMYNyUmkR5Qt7KoCqYWDxuneb4qgCQ0N-_yRd2mdhL7_OlukxWY36DA4GyqHvtZj201mwttk4dcZPIUTwAanx" }
];

export default function CartPage() {
  // FIXME: [MOCK_DATA] - Khi có API, đổi thành `useState(null)` để làm trạng thái loading ban đầu
  const [cart, setCart] = useState(mockCartResponse);
  const [voucher, setVoucher] = useState('');

  // ----------------------------------------------------------------------
  // TODO: [API_CALL] - GET /api/v1/cart
  // useEffect(() => {
  //   const fetchCart = async () => {
  //      try {
  //        const response = await axios.get('/api/v1/cart'); // Trả về CartResponse
  //        // Map lại mảng items bên trong để gắn thêm selected: true (dành cho UI)
  //        const data = response.data;
  //        if (data && data.items) {
  //           data.items = data.items.map(item => ({...item, selected: true}));
  //        }
  //        setCart(data);
  //      } catch(e) { console.log(e) }
  //   };
  //   fetchCart();
  // }, []);
  // ----------------------------------------------------------------------

  // Lấy danh sách items an toàn (nếu cart null thì trả về mảng rỗng)
  const cartItems = cart?.items || [];

  const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
  
  const handleSelectAll = () => {
    const newState = !isAllSelected;
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item => ({ ...item, selected: newState }))
    }));
  };

  const handleSelectItem = (id) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, selected: !item.selected } : item)
    }));
  };

  const updateQuantity = (id, delta) => {
    // TODO: [API_CALL] - PUT /api/v1/cart/items/{id} kèm body { quantity: newQuantity }
    // Có thể Backend sẽ trả về cục CartResponse mới cập nhật `totalAmount`, lúc đó chỉ cần `setCart(response.data)`
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta); 
          return { ...item, quantity: newQuantity, lineTotal: item.price * newQuantity };
        }
        return item;
      })
    }));
  };

  const handleRemoveItem = (id) => {
    // TODO: [API_CALL] - DELETE /api/v1/cart/items/{id}
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleRemoveSelectedItems = () => {
    // TODO: [API_CALL] - DELETE /api/v1/cart/items/batch
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => !item.selected)
    }));
  };

  const handleApplyVoucher = () => {
    // TODO: [API_CALL] - POST /api/v1/vouchers/apply kèm body { code: voucher, cartId: cart.id }
    console.log("Applying voucher:", voucher, "to cart ID:", cart?.id);
  };

  // Tính tiền dựa trên các sản phẩm ĐƯỢC CHECK (Mặc dù Backend có gửi totalAmount, nhưng user có thể chỉ checkout 1 phần giỏ hàng)
  const subtotal = cartItems.filter(item => item.selected).reduce((acc, item) => acc + item.lineTotal, 0);
  const shippingFee = subtotal > 0 ? 12.50 : 0;
  const shippingDiscount = subtotal > 0 ? -12.50 : 0;
  const voucherDiscount = subtotal > 0 ? -25.00 : 0; 
  const total = Math.max(0, subtotal + shippingFee + shippingDiscount + voucherDiscount);

  // Nếu chưa có data giỏ hàng (chờ API)
  if (!cart) return <div className="text-center py-20">Đang tải giỏ hàng...</div>;

  return (
    <div className="animate-fade-in pb-12">
      <h1 className="text-3xl font-black mb-8 text-gray-800">Giỏ hàng ({cartItems.length})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- DANH SÁCH SẢN PHẨM TRONG GIỎ --- */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-600 cursor-pointer" 
              />
              <span className="font-semibold text-gray-700">Chọn tất cả ({cartItems.length} sản phẩm)</span>
            </div>
            <button 
              onClick={handleRemoveSelectedItems}
              className="text-red-500 font-medium flex items-center gap-1 hover:text-red-600 hover:underline transition-colors"
            >
              <DeleteOutlined className="text-lg" /> Xóa mục đã chọn
            </button>
          </div>

          {cartItems.map((item) => (
            <React.Fragment key={item.id}>
              {item.attributes?.isFlashSale && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-center gap-3">
                  <ThunderboltOutlined className="text-orange-600 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-orange-600 m-0">Flash Sale sắp kết thúc!</p>
                    <div className="w-full bg-orange-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-orange-600 h-full w-3/4"></div>
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 font-bold m-0">Chỉ còn 2 sản phẩm!</p>
                </div>
              )}

              <div className={`bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 transition-all ${item.selected ? 'border-l-4 border-l-orange-600 border-t border-r border-b border-gray-100' : 'border border-gray-100'}`}>
                <div className="flex items-center gap-3 self-start md:self-center">
                  <input 
                    type="checkbox" 
                    checked={item.selected}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-600 cursor-pointer" 
                  />
                </div>
                
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <img src={item.attributes?.imageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-base font-semibold text-gray-800 line-clamp-2 m-0 hover:text-orange-600 cursor-pointer transition-colors">{item.productName}</h3>
                      <CloseOutlined className="text-gray-400 hover:text-red-500 cursor-pointer text-lg transition-colors p-1" onClick={() => handleRemoveItem(item.id)} />
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 m-0">
                      Phân loại: {item.attributes?.color} {item.attributes?.size ? `- Size ${item.attributes.size}` : ''} 
                      <span className="ml-2 font-mono text-gray-400">({item.sku})</span>
                    </p>

                    {item.attributes?.isPreferred && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">SHOP ĐẶC QUYỀN</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                      {item.attributes?.originalPrice && item.price < item.attributes.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">${item.attributes.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                        <MinusOutlined className="text-[12px]" />
                      </button>
                      <input type="text" readOnly value={item.quantity} className="w-10 h-8 border-x border-gray-200 text-center focus:ring-0 focus:outline-none p-0 text-sm font-semibold text-gray-800 bg-white" />
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                        <PlusOutlined className="text-[12px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {cartItems.length === 0 && (
            <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-4"><ShoppingCartOutlined style={{fontSize: '48px'}} /></div>
              <p className="text-gray-500 font-medium">Giỏ hàng của bạn đang trống</p>
            </div>
          )}
        </div>

        {/* --- CỘT TÓM TẮT ĐƠN HÀNG --- */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0"><TagOutlined className="text-orange-600" /> MegaMart Vouchers</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Nhập mã ưu đãi" value={voucher} onChange={(e) => setVoucher(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 h-10 focus:ring-1 focus:ring-orange-600 focus:border-orange-600 outline-none transition-all" />
              <button onClick={handleApplyVoucher} className="bg-slate-800 text-white px-4 rounded-lg font-bold hover:bg-slate-700 transition-all h-10">Áp dụng</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3 m-0">Tóm tắt đơn hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600"><span>Tổng tiền hàng (Đã chọn)</span><span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Phí vận chuyển</span><span className="font-medium text-gray-800">${shippingFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Giảm giá vận chuyển</span><span className="text-green-600 font-medium">{shippingDiscount < 0 ? '-' : ''}${Math.abs(shippingDiscount).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Voucher giảm giá</span><span className="text-orange-600 font-medium">{voucherDiscount < 0 ? '-' : ''}${Math.abs(voucherDiscount).toFixed(2)}</span></div>
              <div className="pt-4 mt-4 border-t border-dashed border-gray-200 flex justify-between items-center"><span className="text-base font-bold text-gray-800">Tổng thanh toán</span><span className="text-2xl font-black text-orange-600">${total.toFixed(2)}</span></div>
            </div>

            <button 
              className={`w-full mt-6 py-3.5 rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 ${subtotal > 0 ? 'bg-orange-600 text-white hover:bg-orange-500 active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={subtotal === 0}
              onClick={() => {
                // TODO: [API_CALL] - POST /api/v1/orders/checkout
                // 1. Tạo request chứa list các item ID được chọn.
                const selectedItemIds = cartItems.filter(item => item.selected).map(i => i.id);
                console.log("Proceeding to checkout with Cart ID:", cart.id, " Items:", selectedItemIds);
              }}
            >
              Tiến hành thanh toán <ArrowRightOutlined />
            </button>
          </div>
        </aside>
      </div>

      {/* --- PHẦN GỢI Ý MUA KÈM --- */}
      <section className="mt-20">
        <h2 className="text-2xl font-black text-gray-800 mb-8 m-0">Có thể bạn sẽ thích</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendations.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 group cursor-pointer">
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-800 line-clamp-2 m-0 group-hover:text-orange-600 transition-colors">{item.productName}</h4>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-orange-600">${item.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}