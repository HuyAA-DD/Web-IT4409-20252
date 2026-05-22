import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  InboxOutlined, 
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  DollarCircleOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button } from 'antd';

// TODO: Đổi thành đường dẫn thật của SELLER_ROUTE
// import SELLER_ROUTE from '../../Routes/Seller.routes';
const SELLER_ROUTE = {
  Revenue: '/seller/revenue',
  Product: '/seller/products',
  Setting: '/seller/settings',
  Notification: '/seller/notification'
};

// --- COMPONENT: SELLER SIDEBAR ---
const SellerSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <DollarCircleOutlined/> , label: 'Báo cáo Doanh thu', path: SELLER_ROUTE.Revenue},
    { icon: <InboxOutlined />, label: 'Quản lý Sản phẩm', path: SELLER_ROUTE.Product },
    { icon: <SettingOutlined />, label: 'Thiết lập Gian hàng', path: SELLER_ROUTE.Setting},
  ];

  const renderLinks = () => (
    <nav className="flex-1 mt-4">
      <ul className="space-y-1 px-2">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <li key={idx}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-150 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onCloseMobile} 
      />

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-[101] flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 lg:hidden">
          <div className="flex items-center gap-2 text-blue-600">
            <ShopOutlined className="text-xl" />
            <span className="text-xl font-black tracking-tight">Seller Center</span>
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onCloseMobile} />
        </div>

        {/* Desktop Logo Space */}
        <div className="hidden lg:flex items-center gap-2 px-6 h-16 border-b border-gray-200 text-blue-600">
          <ShopOutlined className="text-2xl" />
          <span className="text-xl font-black tracking-tight">Seller Center</span>
        </div>

        {renderLinks()}

        <div className="p-4 mt-auto mb-4 border-t border-gray-200 mx-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 border border-gray-200">
              P
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 m-0">ProTech Store</p>
              <p className="text-xs text-green-500 font-medium m-0">Đang hoạt động</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// --- MAIN LAYOUT ---
export default function SellerMainLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex overflow-hidden selection:bg-blue-100 selection:text-blue-600">
      
      <SellerSidebar 
        isMobileOpen={isMobileMenuOpen} 
        onCloseMobile={() => setIsMobileMenuOpen(false)} 
      />

      {/* Cột nội dung chính */}
      <div className="flex-1 flex flex-col h-screen lg:ml-64 w-full transition-all duration-300">
        
        {/* --- SELLER TOP NAVBAR --- */}
        <header className="bg-white w-full h-16 border-b border-gray-200 shadow-sm sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <MenuOutlined 
              className="text-xl text-gray-600 cursor-pointer lg:hidden" 
              onClick={() => setIsMobileMenuOpen(true)} 
            />
            {/* Logo thu gọn trên Mobile */}
            <div className="flex items-center gap-2 text-blue-600 lg:hidden">
              <ShopOutlined className="text-xl" />
              <span className="font-black text-xl tracking-tight">Seller</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-500 hover:text-blue-600 hidden md:block transition-colors">
              Đến trang mua sắm
            </button>
            <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
            
            <Badge count={5} size="small" offset={[-4, 4]} onClick={() => navigate(SELLER_ROUTE.Notification)}>
              <button className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors cursor-pointer">
                <BellOutlined className="text-lg" />
              </button>
            </Badge>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <Avatar icon={<UserOutlined />} className="bg-blue-600" />
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-bold text-gray-700 leading-tight">ProTech Store</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- NỘI DUNG RENDER TỪ ROUTER --- */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          <Outlet />
        </main>

      </div>
    </div>
  );
}