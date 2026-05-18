import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  ShoppingCartOutlined, 
  InboxOutlined, 
  TeamOutlined, 
  LineChartOutlined, 
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  TagOutlined,
  DollarCircleOutlined,
  TrophyOutlined

} from '@ant-design/icons';
import { Avatar, Badge, Button } from 'antd';

import ADMIN_ROUTE from '../../Routes/Admin.routes';

// --- COMPONENT: ADMIN SIDEBAR ---
const AdminSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <DashboardOutlined />, label: 'Dashboard', path: ADMIN_ROUTE.Dashboard },
    { icon: <DollarCircleOutlined/> , label:'Revenue', path: ADMIN_ROUTE.Revenue},
    { icon: <ShoppingCartOutlined />, label: 'Orders', path: ADMIN_ROUTE.Orderlist },
    { icon: <InboxOutlined />, label: 'Products', path: ADMIN_ROUTE.Product },
    { icon: <TrophyOutlined/>, label : "Top products", path: ADMIN_ROUTE.Topproduct},
    { icon: <TagOutlined/> , label: "Vouchers", path: ADMIN_ROUTE.Voucher},
    { icon: <SettingOutlined />, label: 'Settings', path: ADMIN_ROUTE.Setting},
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
                    ? 'bg-orange-100 text-orange-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-orange-600'
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
          <span className="text-xl font-black text-orange-600 tracking-tight">MegaMart Admin</span>
          <Button type="text" icon={<CloseOutlined />} onClick={onCloseMobile} />
        </div>

        {/* Desktop Logo Space (if you want logo in sidebar, else leave empty as topbar has it) */}
        <div className="hidden lg:flex items-center px-6 h-16 border-b border-gray-200">
           <span className="text-xl font-black text-orange-600 tracking-tight">MegaMart Admin</span>
        </div>

        {renderLinks()}

        <div className="p-4 mt-auto mb-4 border-t border-gray-200 mx-4">
          <div className="text-gray-500 text-xs font-mono">Management<br/>v2.4.0</div>
        </div>
      </aside>
    </>
  );
};

// --- MAIN LAYOUT ---
export default function AdminMainLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex overflow-hidden selection:bg-orange-100 selection:text-orange-600">
      
      <AdminSidebar 
        isMobileOpen={isMobileMenuOpen} 
        onCloseMobile={() => setIsMobileMenuOpen(false)} 
      />

      {/* Cột nội dung chính: Căn lề trái 64 (256px) trên màn hình lớn để né Sidebar */}
      <div className="flex-1 flex flex-col h-screen lg:ml-64 w-full transition-all duration-300">
        
        {/* --- ADMIN TOP NAVBAR --- */}
        <header className="bg-white w-full h-16 border-b border-gray-200 shadow-sm sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <MenuOutlined 
              className="text-xl text-gray-600 cursor-pointer lg:hidden" 
              onClick={() => setIsMobileMenuOpen(true)} 
            />
            {/* Ẩn logo trên Mobile nếu đã có trong Sidebar Drawer */}
            <span className="font-black text-xl text-orange-600 tracking-tight lg:hidden">MegaMart</span>
          </div>

          <div className="flex items-center gap-4">
            <Badge count={3} size="small" offset={[-4, 4]} onClick = {()=>{navigate('/admin/notification')}}>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <BellOutlined className="text-lg" />
              </button>
            </Badge>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <Avatar icon={<UserOutlined />} className="bg-orange-600" />
              <span className="text-sm font-bold text-gray-700 hidden md:block">Admin</span>
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