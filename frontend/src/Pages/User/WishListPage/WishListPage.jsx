import React, { useState } from 'react';
import { Checkbox, Button } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  CloseOutlined, 
  StarFilled,
  HeartOutlined
} from '@ant-design/icons';

// --- [MOCK DATA] --- Xóa mảng này khi có API thực tế
const MOCK_WISHLIST_ITEMS = [
  {
    id: 1,
    title: "Ultra-Fast Pro Runner X2 - Energy Orange",
    price: "120.00",
    originalPrice: "160.00",
    discount: "-25%",
    rating: 4.8,
    sold: "1.2k",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7xqbLOKkQaKYRk8SNzuJoc7yt1MGfb2GCwe1xLDlKNshh0M3LgIjhYBzmkSiMibwNYdGA1X6oiEe7mDRrm0cFhvvuhltTFkgxAtK7RGltMG7fCP43-L4c6CWg2hn6ZqtEaLX71w59VdgRm7biYnhoRxXQ8FP7jSNESw4e-4t44kFhNR8eqCOZcoKUYVu647xbtXwHfuBX4Th3ZHCI2GFlWQ732NSH07UX5eO9vTtvL7g6YMyOIfaHhrJRj35It4RiAj0LLq-69hOW"
  },
  {
    id: 2,
    title: "SonicBoom Wireless ANC Headphones",
    price: "299.00",
    originalPrice: null,
    discount: null,
    rating: 4.9,
    sold: "850",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqCWnhm9-GD2W_6Q5HdwCuv7g-jhkyTkEKN87A8Q-0CpV76pXXu0uw4_auE6iliLMfeuDj7TwwEjWX72fSn_CJ0JQAvRlLqthqayPayhgIfZ_5IEywptABgxy6cSAlP44q3qrFGEjko5iznrM-2cEFG_l6xq_cMuZK8Fi8VWLgJYOcrCmiJnf1OKII7InzWQjfKny0LlqUP9XDq2EN-fClTMnUaHQoqaZT3a6nklhiJmJn3zhknOq6V65aG4lPS_H-sBr3eFujhl5l"
  },
  {
    id: 3,
    title: "Minimalist Series 4 Watch - Tan Leather",
    price: "85.00",
    originalPrice: "100.00",
    discount: "-15%",
    rating: 4.7,
    sold: "2.4k",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOZUI2B2y2VJQ-9FxNSOLGgNJHK83p97eQLx0b-D6p0a4JckKSpeUAjBu1JsgzxDYCnD7hvU6iEttAcF0xAqHL0_K8VSMrMct3QBUQas3bxbl_oDAukpIQQ-B1qkvJlGP_t4yv9TB07Dai2Bi6_x9ErS4RWHZY5bgDdhyXuJ1-m3bVztdolsJoNb1Rux3AKj_d1WDhhJzx9qzrBvcuPKBsQn92FiQrMR9blgW7HcY4JoaILCh7G0sn2PNJyJjvYf4EBHXQZvXPanSu"
  },
  {
    id: 4,
    title: "RetroSnap Instant Camera - Sunshine Edition",
    price: "145.00",
    originalPrice: null,
    discount: null,
    rating: 4.6,
    sold: "500",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTPDu0Hw4UAWa_4ilPun7jxy9sGzyNbtiDLrpfxz9pWE0kto1PlSGCkMNVSEQWV8sYr_8yWHVqbkTcbGdpSiSAks8Qnn4oE6CPyLPr3Yc7yh428w0Foj70NWuIuqANG60YdPZfOs7rRPW1dpofrdmsVpPyuL346nWFN_hHrgTtOPjKaOzgckly53dsqb_n9XUXqIyWHk0neeziADXgRTV-yah18kfW57f4n0VIUUZrAAx4-4dWR0iREUFT2LDKz4f4prtJZ8v52pF0"
  }
];

export default function WishListPage() {
  /* [TODO: API] 
     - Lấy danh sách wishlist từ API: GET /api/user/wishlist 
     - set lại state `items` 
  */
  const [items, setItems] = useState(MOCK_WISHLIST_ITEMS); 
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // Vẫn giữ lại context nếu bạn cần xử lý riêng cho Ant Design ConfigProvider sau này,
  // nhưng giao diện ở đây sẽ chạy 100% bằng class `dark:` của Tailwind
  const { isDarkMode } = useOutletContext();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItemIds(items.map(item => item.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleRemoveItem = (id) => {
    /* [TODO: API] Gọi API xóa sản phẩm khỏi Wishlist: DELETE /api/user/wishlist/:id */
    setItems(items.filter(item => item.id !== id));
    setSelectedItemIds(selectedItemIds.filter(itemId => itemId !== id));
  };

  const handleRemoveSelected = () => {
    /* [TODO: API] Gọi API xóa hàng loạt: POST /api/user/wishlist/delete-multiple { ids: selectedItemIds } */
    setItems(items.filter(item => !selectedItemIds.includes(item.id)));
    setSelectedItemIds([]);
  };

  const handleMoveToCart = () => {
    /* [TODO: API] Gọi API thêm vào giỏ hàng: POST /api/cart/add-multiple { ids: selectedItemIds } */
    console.log("Moving to cart IDs:", selectedItemIds);
  };

  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length;
  const hasSelection = selectedItemIds.length > 0;

  return (
    <div className="w-full pb-10 animate-fade-in">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-xl mb-8 p-8 md:p-10 bg-gradient-to-br from-orange-700 to-orange-500 text-white shadow-md">
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        ></div>
        <div className="absolute -right-10 -top-10 opacity-20 pointer-events-none">
          <svg height="200" viewBox="0 0 100 100" width="200">
            <polygon fill="white" points="50,15 90,85 10,85"></polygon>
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-3">Yêu thích của tôi</h1>
          <p className="text-sm md:text-base opacity-90 max-w-xl">
            Lưu giữ bộ sưu tập hoàn hảo của bạn. Theo dõi mức giảm giá và dễ dàng chuyển chúng vào giỏ hàng bất cứ khi nào bạn sẵn sàng.
          </p>
        </div>
      </section>

      {items.length > 0 ? (
        <>
          {/* Wishlist Controls */}
          <section className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 mb-6 gap-4 transition-colors">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Checkbox 
                checked={isAllSelected} 
                onChange={handleSelectAll}
                className="text-gray-700 dark:text-gray-300 font-semibold text-sm"
              >
                Chọn tất cả
              </Checkbox>
              <span className="text-sm text-gray-500 dark:text-gray-400">({items.length} sản phẩm)</span>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                className={`flex-1 md:flex-none ${isDarkMode ? 'bg-transparent border-red-800 text-red-500 hover:bg-red-900/30' : ''}`}
                disabled={!hasSelection}
                onClick={handleRemoveSelected}
              >
                Xóa mục chọn
              </Button>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />} 
                className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-500 shadow-sm border-none disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
                disabled={!hasSelection}
                onClick={handleMoveToCart}
              >
                Thêm vào giỏ
              </Button>
            </div>
          </section>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <article key={item.id} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 group relative flex flex-col">
                
                {/* Badges & Checkboxes */}
                <div className="absolute top-3 left-3 z-10 bg-white/80 dark:bg-slate-800/80 rounded backdrop-blur-sm px-1 shadow-sm">
                  <Checkbox 
                    checked={selectedItemIds.includes(item.id)} 
                    onChange={() => handleSelectItem(item.id)} 
                  />
                </div>
                {item.discount && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">{item.discount}</span>
                  </div>
                )}
                
                {/* Image */}
                <div className="aspect-square bg-gray-50 dark:bg-slate-700 relative overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                
                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 pr-2 transition-colors">{item.title}</h3>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 pt-0.5"
                    >
                      <CloseOutlined className="text-[16px]" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 mt-1">
                    <span className="text-lg font-bold text-orange-600">${item.price}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 line-through">${item.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4 text-xs text-gray-500 dark:text-gray-400 mt-auto transition-colors">
                    <StarFilled className="text-orange-500" />
                    <span>{item.rating} (Đã bán {item.sold})</span>
                  </div>
                  
                  <Button 
                    className="w-full border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:text-orange-600 hover:border-orange-600 dark:hover:text-orange-400 dark:hover:border-orange-400 dark:bg-slate-800 transition-colors" 
                    icon={<ShoppingCartOutlined />}
                    onClick={() => {
                      /* [TODO: API] POST /api/cart/add { id: item.id } */
                      console.log("Add single item to cart:", item.id);
                    }}
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        /* TRẠNG THÁI EMPTY KHI WISHLIST TRỐNG */
        <section className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mt-4 transition-colors">
          <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 transition-colors">
            <HeartOutlined className="text-gray-300 dark:text-gray-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors">Danh sách yêu thích trống</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 transition-colors">Các sản phẩm bạn yêu thích sẽ được lưu tại đây.</p>
          <Button 
            type="primary" 
            size="large" 
            className="bg-orange-600 hover:bg-orange-500 shadow-md border-none px-8"
            onClick={() => {
              /* Chuyển hướng về trang chủ mua sắm */
              // navigate('/');
              console.log("Go to shopping");
            }}
          >
            Bắt đầu mua sắm
          </Button>
        </section>
      )}
    </div>
  );
}