import React, { useState } from 'react';
import { Outlet,useNavigate } from 'react-router-dom'; // Import Outlet từ react-router-dom
import { Input, Badge, FloatButton, Button, Avatar } from 'antd';
import {
  ShoppingCartOutlined,
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  CompassOutlined,
  ShopOutlined,
  RiseOutlined,
  WalletOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  PlaySquareOutlined,
  MessageOutlined,
  MenuOutlined // Thêm icon Menu
} from '@ant-design/icons';

const { Search } = Input;

// --- COMPONENT: TOP NAVBAR ---
const TopNavBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate(); // Hook để điều hướng
  const [cartCount] = useState(2); 
  const [notiCount] = useState(5); 
  const [userAvatar] = useState(null); 

  const handleSearch = (value) => {
    console.log("Searching:", value);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full border-b border-gray-100">
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 max-w-7xl mx-auto gap-4">
        
        {/* Logo & Toggle Menu */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            {/* Nút đóng/mở sidebar trên Desktop */}
            <MenuOutlined 
              className="text-xl text-gray-600 cursor-pointer hover:text-orange-600 transition-colors hidden lg:block" 
              onClick={onToggleSidebar}
            />
            <h1 className="text-3xl font-black text-orange-600 tracking-tighter m-0 cursor-pointer">MegaMart</h1>
          </div>
          
          {/* Mobile Icons */}
          <div className="md:hidden flex gap-5 text-2xl text-orange-600 items-center">
            <Badge count={cartCount} size="small">
              <ShoppingCartOutlined />
            </Badge>
            <Avatar size="medium" icon={<UserOutlined />} />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-grow max-w-xl w-full">
          <Search
            placeholder="Săn deal hot tại MegaMart..."
            allowClear
            onSearch={handleSearch}
            enterButton={
              <Button type="primary" className="bg-orange-600 hover:bg-orange-500 border-none px-6">
                <SearchOutlined style={{ fontSize: '18px' }} />
              </Button>
            }
            size="large"
          />
        </div>

        {/* Action Icons (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {/* Thông báo */}
          <div className="relative cursor-pointer group flex items-center justify-center">
            <Badge count={notiCount} overflowCount={99} offset={[2, 2]}>
              <BellOutlined className="text-[24px] text-gray-600 group-hover:text-orange-600 transition-all" />
            </Badge>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Thông báo</span>
          </div>

          {/* Giỏ hàng */}
          <div className="relative cursor-pointer group flex items-center justify-center">
            <Badge count={cartCount} offset={[2, 2]}>
              <ShoppingCartOutlined className="text-[26px] text-gray-600 group-hover:text-orange-600 transition-all" />
            </Badge>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Giỏ hàng</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer group pl-6 border-l border-gray-200">
            <Avatar 
              size={45} 
              src={userAvatar} 
              icon={<UserOutlined />} 
              className="border-2 border-transparent group-hover:border-orange-600 transition-all shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Tài khoản</span>
              <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600 truncate max-w-[80px]" onClick = {() => navigate('/auth/login&register')}>Đăng nhập</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- COMPONENT: SIDEBAR ---
const Sidebar = ({ collapsed }) => {
  const menuItems = [
    { icon: <ThunderboltOutlined />, label: 'Flash Sale', active: true },
    { icon: <CompassOutlined />, label: 'Khám phá hàng ngày' },
    { icon: <ShopOutlined />, label: 'Siêu thị' },
    { icon: <RiseOutlined />, label: 'Top Sản phẩm' },
    { icon: <WalletOutlined />, label: 'Ví thanh toán' },
    { icon: <DollarCircleOutlined />, label: 'Săn xu' },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col gap-2 py-4 h-fit border border-gray-100 rounded-xl bg-white sticky top-28 shadow-sm transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[80px] items-center' : 'w-64'
      }`}
    >
      <div className={`mb-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0 px-0' : 'w-full opacity-100 px-4'}`}>
        <h2 className="text-lg font-bold text-gray-800 m-0">Danh mục</h2>
        <p className="text-xs text-gray-500 m-0">Truy cập nhanh</p>
      </div>

      <nav className="space-y-2 w-full px-2 flex flex-col items-center">
        {menuItems.map((item, idx) => (
          <a
            key={idx}
            href="#"
            title={collapsed ? item.label : ''} // Hiện tooltip khi thu gọn
            className={`flex items-center transition-all overflow-hidden ${
              item.active
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            } ${collapsed ? 'justify-center p-3 rounded-xl w-12 h-12' : 'gap-3 px-4 py-3 rounded-lg w-full'}`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

// --- COMPONENT: FOOTER ---
const Footer = () => (
  <footer className="w-full mt-12 bg-white border-t border-gray-200">
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 px-4 py-12 max-w-7xl mx-auto">
      <div className="col-span-2 space-y-4">
        <h4 className="text-2xl font-black text-orange-600 m-0">MegaMart</h4>
        <p className="text-sm text-gray-500">© 2024 MegaMart Global. Điểm đến mua sắm tuyệt vời nhất với thanh toán an toàn và giao hàng toàn cầu.</p>
      </div>
      <div className="space-y-3">
        <h5 className="font-bold text-gray-800">Chăm sóc khách hàng</h5>
        <ul className="space-y-2 p-0 list-none text-sm">
          <li><a className="text-gray-500 hover:text-orange-600 transition-colors" href="#">Trung tâm trợ giúp</a></li>
          <li><a className="text-gray-500 hover:text-orange-600 transition-colors" href="#">Giao hàng & Nhận hàng</a></li>
          <li><a className="text-gray-500 hover:text-orange-600 transition-colors" href="#">Trả hàng & Hoàn tiền</a></li>
        </ul>
      </div>
      <div className="space-y-3">
        <h5 className="font-bold text-gray-800">Về MegaMart</h5>
        <ul className="space-y-2 p-0 list-none text-sm">
          <li><a className="text-gray-500 hover:text-orange-600 transition-colors" href="#">Giới thiệu</a></li>
          <li><a className="text-gray-500 hover:text-orange-600 transition-colors" href="#">Điều khoản sử dụng</a></li>
        </ul>
      </div>
      <div className="col-span-2 space-y-4">
        <h5 className="font-bold text-gray-800">Tải ứng dụng</h5>
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-800 text-white p-2 rounded flex items-center gap-2 cursor-pointer w-32 hover:bg-gray-900 transition-colors">
            <span className="text-[10px] font-bold">Google Play</span>
          </div>
          <div className="bg-gray-800 text-white p-2 rounded flex items-center gap-2 cursor-pointer w-32 hover:bg-gray-900 transition-colors">
            <span className="text-[10px] font-bold">App Store</span>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
      MegaMart Global © 2024. All rights reserved.
    </div>
  </footer>
);

// --- MAIN LAYOUT (Kiến trúc Outlet) ---
export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans selection:bg-orange-100 selection:text-orange-600 flex flex-col">
      <TopNavBar onToggleSidebar={toggleSidebar} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Sidebar */}
          <Sidebar collapsed={isSidebarCollapsed} />
          
          {/* Outlet: Nơi render nội dung thay đổi (HomePage, ProductDetail, Cart...) */}
          <div className="flex-grow w-full overflow-hidden transition-all duration-300">
            <Outlet />
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Mobile Nav Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 z-50 shadow-inner">
        <a className="flex flex-col items-center gap-1 text-orange-600" href="#"><HomeOutlined className="text-xl" /><span className="text-[10px] font-bold">Trang chủ</span></a>
        <a className="flex flex-col items-center gap-1 text-gray-400" href="#"><CompassOutlined className="text-xl" /><span className="text-[10px]">Khám phá</span></a>
        <a className="flex flex-col items-center gap-1 text-gray-400" href="#"><UserOutlined className="text-xl" /><span className="text-[10px]">Tôi</span></a>
      </nav>

      {/* FABs (Antd) */}
      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 80 }}>
        <FloatButton icon={<MessageOutlined />} type="primary" badge={{ count: 3 }} tooltip="Chat hỗ trợ" />
        <FloatButton.BackTop visibilityHeight={300} />
      </FloatButton.Group>
    </div>
  );
}