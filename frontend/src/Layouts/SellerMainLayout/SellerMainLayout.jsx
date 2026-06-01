import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  InboxOutlined, 
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  DashboardOutlined,
  ShopOutlined,
  LogoutOutlined // Import thêm icon đăng xuất
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown } from 'antd'; // Import thêm Dropdown
import SELLER_ROUTE from '../../Routes/Seller.routes';
import USER_ROUTE from '../../Routes/User.routes';

import { clearAuthUser, getAuthUser } from '../../Utils/Auth';

// --- COMPONENT: SELLER SIDEBAR ---
const SellerSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <DashboardOutlined />, label: 'Báo cáo Doanh thu', path: SELLER_ROUTE.Dashboard },
    { icon: <InboxOutlined />, label: 'Quản lý Sản phẩm', path: SELLER_ROUTE.Product },
    { icon: <SettingOutlined />, label: 'Thông tin cá nhân', path: SELLER_ROUTE.Profile },
  ];

  const renderLinks = () => (
    <nav className="flex-1 mt-4">
      <ul className="space-y-1 px-2">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname.includes(item.path);
          
          return (
            <li key={idx}>
              <a
                href={item.path}
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
      <div 
        className={`fixed inset-0 bg-black/60 z-100 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onCloseMobile} 
      />

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-101 flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 lg:hidden">
          <div className="flex items-center gap-2 text-blue-600">
            <ShopOutlined className="text-xl" />
            <span className="text-xl font-black tracking-tight">Seller Center</span>
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onCloseMobile} />
        </div>

        <div className="hidden lg:flex items-center gap-2 px-6 h-16 border-b border-gray-200 text-blue-600">
          <ShopOutlined className="text-2xl" />
          <span className="text-xl font-black tracking-tight">Seller Center</span>
        </div>

        {renderLinks()}

        <div className="p-4 mt-auto mb-4 border-t border-gray-200 mx-4">
          <div className="flex items-center gap-3">
            <div>
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

  const user = getAuthUser();

  const [avatarUpdate, setAvatarUpdate] = useState(null);

  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUpdate(newAvatarUrl);
  } 





  // Logic khi bấm Đăng xuất
  const handleLogout = () => {
    clearAuthUser();
    navigate('/auth/login&register');
  };

  // Cấu hình các item cho Dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Trang cá nhân',
      icon: <UserOutlined />,
      onClick: () => navigate(SELLER_ROUTE.Profile),
    },
    {
      type: 'divider', // Đường kẻ ngang phân cách
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true, // Thuộc tính của antd giúp chữ tự động chuyển sang màu đỏ
      onClick: handleLogout,
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex overflow-hidden selection:bg-blue-100 selection:text-blue-600">
      
      <SellerSidebar 
        isMobileOpen={isMobileMenuOpen} 
        onCloseMobile={() => setIsMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col h-screen lg:ml-64 w-full transition-all duration-300">
        
        <header className="bg-white w-full h-16 border-b border-gray-200 shadow-sm sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <MenuOutlined 
              className="text-xl text-gray-600 cursor-pointer lg:hidden" 
              onClick={() => setIsMobileMenuOpen(true)} 
            />
            <div className="flex items-center gap-2 text-blue-600 lg:hidden">
              <ShopOutlined className="text-xl" />
              <span className="font-black text-xl tracking-tight">Seller</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-500 hover:text-blue-600 hidden md:block transition-colors" onClick={() => navigate(USER_ROUTE.Home)}>
              Đến trang mua sắm
            </button>
            <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
            
            <Badge count={5} size="small" offset={[-4, 4]} onClick={() => navigate(SELLER_ROUTE.Notification)}>
              <button className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors cursor-pointer">
                <BellOutlined className="text-lg" />
              </button>
            </Badge>

            {/* Bọc khu vực Avatar bằng Dropdown */}
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight" 
              arrow
              trigger={['hover']} // Mặc định là hover, có thể đổi thành ['click'] nếu muốn
            >
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                <Avatar 
                  src={avatarUpdate || user?.avatarUrl} 
                  icon={!avatarUpdate && !user?.avatarUrl ? <UserOutlined /> : null} 
                  className="bg-blue-600"  
                />
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-bold text-gray-700 leading-tight">{user?.fullName || 'Người bán hàng'}</span>
                </div>
              </div>
            </Dropdown>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          <Outlet context={handleAvatarUpdate} />
        </main>

      </div>
    </div>
  );
 }
