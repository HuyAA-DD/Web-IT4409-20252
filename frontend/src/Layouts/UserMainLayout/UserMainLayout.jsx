import React, { useEffect, useState, Suspense, useRef} from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Input, Badge, FloatButton, Button, Avatar, message, Dropdown } from "antd";
import USER_ROUTE from '../../Routes/User.routes';
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
  HomeOutlined,
  MenuOutlined, 
  HeartOutlined,
  CloseOutlined,
  FileTextOutlined,
  KeyOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { isAuthenticated, getStoredAuth } from '../../Utils/Auth';
import { CART_CHANGED_EVENT, getCartItemCount } from '../../Utils/CartEvents';

import api from "../../Apis/apiConfig";
import API_ENDPOINTS from "../../Apis/apiEndpoints";

import {
  clearAuthUser,
  getAuthUser,
  getAuthUserAvatar,
  getAuthUserName,
  updateAuthUser,
} from "../../Utils/Auth";

// Data import
import { ObjectModels } from '../../Data/3Dmodels';

// Component import
import RotatingPlanet from '../../Components/RotatingPlanet/RotatingPlanet';
import DarkModeToggle from '../../Components/DarkModeToggle/DarkModeToggle';
import Footer from '../../Components/Footer/Footer';
import Loading from '../../Components/Loading/Loading';
import DarkModeStars from '../../Components/DarkModeStar/DarkModeStars';
import Global3DModel from '../../Components/Global3DModel/Global3DModel';

const { Search } = Input;

// Preload 3D Models
import { useGLTF } from '@react-three/drei';
useGLTF.preload("/assets/Shopping_cart.glb");
useGLTF.preload("/assets/juice_carton_shop.glb");
useGLTF.preload("/assets/box.glb");
useGLTF.preload("/assets/present_1_low_poly.glb");
useGLTF.preload("/assets/stylized_planet.glb");
useGLTF.preload("/assets/planet_earth.glb");
useGLTF.preload("/assets/star.glb");
useGLTF.preload("/assets/sun.glb");
useGLTF.preload("/assets/blender_planet_basic.glb");
useGLTF.preload("/assets/nike_shoe_box.glb");

// --- COMPONENT: TOP NAVBAR ---
const TopNavBar = ({ onMenuClick, isDarkMode, toggleDarkMode, setActiveIndex }) => {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [notiCount, setNotiCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(getAuthUser());

  const isLoggedIn = isAuthenticated();
  const userName = getAuthUserName();
  const userAvatar = getAuthUserAvatar();

  useEffect(() => {
    const fetchCartCount = async () => {
      const authUser = getAuthUser();
      const userId = authUser?.id;

      if (!isAuthenticated() || !userId) {
        setCartCount(0);
        return;
      }

      try {
        const response = await api.get(API_ENDPOINTS.cart.byUser(userId));
        setCartCount(getCartItemCount(response));
      } catch (error) {
        console.warn("Khong the lay so luong gio hang:", error);
        setCartCount(0);
      }
    };

    const fetchNotificationCount = async () => {
      const authUser = getAuthUser();
      const userId = authUser?.id;

      if (!isAuthenticated() || !userId) {
        setNotiCount(0);
        return;
      }

      try {
        const response = await api.get(API_ENDPOINTS.notifications.myUnread);
        const data = response?.data || response;
        setNotiCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.warn("Khong the lay so thong bao chua doc:", error);
        setNotiCount(0);
      }
    };

    const syncUserFromBackend = async () => {
      if (!isAuthenticated()) {
        setCurrentUser(null);
        setCartCount(0);
        setNotiCount(0);
        return;
      }
      try {
        const response = await api.get(API_ENDPOINTS.users.profile);
        const userData = response?.data || response;
        updateAuthUser(userData);
        setCurrentUser(getAuthUser());
      } catch (error) {
        console.warn("Không thể lấy thông tin user từ backend:", error);
        setCurrentUser(getAuthUser());
      }
    };

    syncUserFromBackend();
    fetchCartCount();
    fetchNotificationCount();

    const handleAuthChanged = () => {
      setCurrentUser(getAuthUser());
      fetchCartCount();
      fetchNotificationCount();
    };

    const handleCartChanged = (event) => {
      const nextCount = Number(event?.detail?.cartCount);

      if (Number.isFinite(nextCount)) {
        setCartCount(nextCount);
        return;
      }

      fetchCartCount();
    };

    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener(CART_CHANGED_EVENT, handleCartChanged);
    window.addEventListener("notifications-changed", fetchNotificationCount);
    window.addEventListener("storage", handleAuthChanged);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener(CART_CHANGED_EVENT, handleCartChanged);
      window.removeEventListener("notifications-changed", fetchNotificationCount);
      window.removeEventListener("storage", handleAuthChanged);
    };
  }, []);

  // const handleSearch = (value) => {
  //   console.log("Searching:", value);
  // };

  const handleLogin = () => {
    navigate("/auth/login-register");
    setActiveIndex(-1);
  };

  const handleLogout = () => {
    clearAuthUser();
    setCurrentUser(null);
    setCartCount(0);
    setNotiCount(0);
    window.dispatchEvent(new Event("auth-changed"));
    message.success("Đã đăng xuất.");
    navigate("/auth/login-register");
    setActiveIndex(-1);
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Trang cá nhân',
      icon: <UserOutlined />,
      onClick: () => {
        navigate(USER_ROUTE.Profile);
        setActiveIndex(-1);
      },
    },
    {
      key: 'changePassword',
      label: 'Đổi mật khẩu',
      icon: <KeyOutlined />,
      onClick: () => {
        navigate(USER_ROUTE.ChangePassword);
        setActiveIndex(-1);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-4 md:px-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-black/30 backdrop-blur-md border-b border-white/10"
          : "bg-[#fff7ed]/80 backdrop-blur-md border-b border-orange-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          className={isDarkMode ? "!text-white" : "!text-gray-700"}
        />

        <div
          onClick={() => {
            navigate("/");
            setActiveIndex(0);
          }}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-18 h-18 hidden sm:block">
            {!isDarkMode && (
              <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
                <ambientLight intensity={2.5} />
                <directionalLight position={[2, 5, 5]} intensity={3} castShadow />
                <pointLight position={[-3, -3, 3]} intensity={2} color="#ffffff" />
                <Environment preset="city" />
                
                <Suspense fallback={null}>
                  <RotatingPlanet path="/assets/blender_planet_basic.glb" rotationSpeed={0.015} floatSpeed={1} scale={2} />
                </Suspense>
              </Canvas>
            )}

            {isDarkMode && (
              <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[3, 3, 3]} intensity={1.8} />
                <Suspense fallback={null}>
                  <RotatingPlanet path="/assets/planet_earth.glb" rotationSpeed={0.01} floatSpeed={2} scale={0.5} />
                </Suspense>
              </Canvas>
            )}
          </div>

          <h1
            className={`text-xl md:text-2xl font-black tracking-tight ${
              isDarkMode ? "text-white" : "text-orange-600"
            }`}
          >
            MegA MaRt
          </h1>
        </div>
      </div>

      {/* <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
        />
      </div> */}

      <div className="flex items-center gap-3">
        <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        <Badge count={cartCount} size="small">
          <Button
            shape="circle"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              navigate(USER_ROUTE.Cart);
              setActiveIndex(-1);
            }}
          />
        </Badge>

        <Badge count={notiCount} size="small">
          <Button
            shape="circle"
            icon={<BellOutlined />}
            onClick={() => {
              navigate(USER_ROUTE.Notification);
              setActiveIndex(-1);
            }}
          />
        </Badge>

        {isLoggedIn && currentUser ? (
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight" 
            arrow
            trigger={['hover']}
          >
            <div className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg transition-colors border border-transparent ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-orange-100/50'}`}>
              <Avatar
                src={userAvatar}
                icon={!userAvatar ? <UserOutlined /> : null}
                className="border-2 border-orange-500 shadow-sm"
              />
              <span
                className={`hidden lg:inline max-w-[140px] truncate font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-700"
                }`}
              >
                {userName}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={handleLogin}>
            Đăng nhập
          </Button>
        )}
      </div>
    </header>
  );
};

// --- COMPONENT: SIDEBAR ---
const Sidebar = ({ collapsed, isMobileOpen, onCloseMobile, isDarkMode, setActiveIndex, activeIndex }) => {
  const navigate = useNavigate();
  const menuItems = [
    { icon: <ThunderboltOutlined />, label: 'Trang chủ', path: USER_ROUTE.Home },
    { icon: <ShopOutlined />, label: 'Siêu thị', path: USER_ROUTE.Supermarket },
    { icon: <RiseOutlined />, label: 'Top Sản phẩm', path: USER_ROUTE.TopProduct },
    { icon: <WalletOutlined />, label: 'Ví thanh toán', path: USER_ROUTE.Seapay },
    { icon: <HeartOutlined />, label: 'Yêu thích', path: USER_ROUTE.WishList },
    { icon: <FileTextOutlined />, label: 'Đơn hàng', path: USER_ROUTE.Orders },
  ];

  const renderNavLinks = (isDesktopCollapsed) => (
    <nav className="space-y-2 w-full px-2 flex flex-col items-center ">
      {menuItems.map((item, idx) => (
        <a
          key={idx}
          href="#"
          title={isDesktopCollapsed ? item.label : ''}
          className={`flex items-center transition-all overflow-hidden w-full rounded-lg ${
              activeIndex === idx 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                : `${isDarkMode ? 'text-gray-300 hover:bg-slate-700 hover:text-orange-400' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'}`
            } px-4 py-3 gap-3 ${isDesktopCollapsed ? 'lg:justify-center lg:p-3 lg:w-12 lg:h-12 lg:gap-0' : ''}
          `}
          onClick={(e) => {
            e.preventDefault();
            navigate(item.path);
            setActiveIndex(idx);
            onCloseMobile(); 
          }}
        >
          <span className="text-xl flex-shrink-0">{item.icon}</span>
          <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>{item.label}</span>
        </a>
      ))}
    </nav>
  );


  // Tạo hàm render Model 3D dùng chung cho cả 2 chế độ (Desktop/Mobile)
  const renderSidebarModel = () => (
    <div className={`absolute w-40 h-40 lg:top-0 bottom-16 right-4 flex justify-center items-center pointer-events-none `}>
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[2, 5, 5]} intensity={3} />
        <pointLight position={[-3, -3, 3]} intensity={2} color="#ffffff" />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <Global3DModel 
            path="/assets/juice_carton_shop.glb" 
            rotationSpeed={0.01} 
            floatSpeed={1} 
            scale={1.1} 
            position={[0, -2, 0]} 
            rotation={[0, -Math.PI / 4 , 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );

  return (
    <>
      {/* Background mờ khi mở Menu Mobile */}
      {/* <div className={`fixed inset-0 bg-black/60 z-[100] lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onCloseMobile} /> */}
      
      {/* KHUNG MENU MOBILE (Trượt từ trái sang) */}
      <div className={`fixed top-0 left-0 h-full w-72 shadow-2xl z-[101] lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col py-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`flex items-center justify-between px-6 mb-6 border-b pb-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <h1 className="text-2xl font-black text-orange-600 m-0">MegA<span className="italic text-transparent [-webkit-text-stroke:1px_#ea580c]">MaRt</span></h1>
          <Button type="text" icon={<CloseOutlined className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`} />} onClick={onCloseMobile} />
        </div>
        
        {/* Vùng cuộn linh hoạt chứa Menu và Model */}
        <div className="flex-1 overflow-y-auto flex flex-col px-2">
          <div className="px-4 mb-2"><h2 className={`text-sm font-bold m-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Danh mục</h2></div>
          {renderNavLinks(false)}
          
          {/* Đưa mô hình 3D vào CUỐI menu trượt nhờ margin-top: auto */}
          <div className="mt-auto pt-8 pb-4">
            {renderSidebarModel()}
          </div>
        </div>
      </div>

      {/* KHUNG MENU DESKTOP (Đứng im bên trái) */}
      <aside className={`hidden lg:flex flex-col gap-2 py-4 h-fit border rounded-xl sticky top-28 shadow-sm transition-all duration-300 ease-in-out z-20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} ${collapsed ? 'w-[80px] items-center' : 'w-64'}`}>
        
        {/* Đưa mô hình 3D vào ĐẦU Sidebar Desktop */}
        <div className={`w-full overflow-hidden transition-all duration-300 ${collapsed ? 'h-0 opacity-0 mb-0' : 'h-32 opacity-100 mb-2'}`}>
          {!collapsed && renderSidebarModel("h-full")}
        </div>

        <div className={`mb-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0 px-0' : 'w-full opacity-100 px-4'}`}>
          <h2 className={`text-lg font-bold m-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Danh mục</h2>
          <p className="text-xs text-gray-500 m-0">Truy cập nhanh</p>
        </div>
        
        {renderNavLinks(collapsed)}
      </aside>
    </>
  );
};

const ResponsiveModelGroup = () => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 4.5;
  const isTablet = viewport.width >= 4.5 && viewport.width < 7;
  const currentScale = isMobile ? 0.5 : isTablet ? 0.75 : 1; 
  const currentPosition = isMobile ? [-1.5, -1, 0] : isTablet ? [-3, -1.5, 0] : [-4, -1.5, 0];

  return (
    <group position={currentPosition} scale={currentScale}>
      {ObjectModels.map(item => (
        <Global3DModel key={item.id} path={item.path} position={item.position} rotation={item.rotation} scale={item?.scale} />
      ))}
    </group>
  );
};

// --- MAIN LAYOUT ---
export default function UserMainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const avatarRef = useRef(getStoredAuth()?.avatarUrl || null);
  const [, forceRender] = useState(0); 

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const location = useLocation();
  const isDetailsPage = location.pathname.startsWith('/product') || location.pathname.startsWith('/cart');
  const isPaymentStatusPage = location.pathname.startsWith('/payment-success') || location.pathname.startsWith('/payment-failure');

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleMenuAction = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    } else {
      setIsMobileMenuOpen(true); 
    }
  };

  const updateSharedAvatarRef = (newUrl) => {
    avatarRef.current = newUrl;
    forceRender(prev => prev + 1); 
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      
      <div className="relative z-50 pointer-events-auto">
        <TopNavBar 
          onMenuClick={handleMenuAction} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          setActiveIndex={setActiveIndex} 
          avatarRef={avatarRef} 
        />
      </div>

      <div className="fixed inset-0 z-[15] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows style={{ pointerEvents: isDarkMode ? 'auto' : 'none' }}>
          <Suspense fallback={null}>
            {isDarkMode ? (
              <>
                <Environment background={true} files={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']} path="/assets/night-sky/" environmentIntensity={0.05} />
                <ambientLight intensity={0.03} />
                <spotLight position={[0, 7, 3]} angle={0.5} penumbra={0.8} intensity={3000} distance={25} decay={1.5} castShadow shadow-mapSize={[2048, 2048]} color="#ffaa00" />
                <pointLight position={[0, -5, 2]} intensity={200} color="#334155" />
                <ResponsiveModelGroup />
                <DarkModeStars />
                <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate={true} autoRotateSpeed={0.8} />
              </>
            ) : (
              <>
                <Environment preset="city" />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <ResponsiveModelGroup />
              </>
            )}
          </Suspense>
        </Canvas>
      </div>

      <main className="relative z-20 max-w-7xl mx-auto px-4 py-8 flex-grow w-full pointer-events-auto">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {!isDetailsPage && !isPaymentStatusPage && (
            <Sidebar collapsed={isSidebarCollapsed} isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} isDarkMode={isDarkMode} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
          )}
          <div className="flex-grow w-full overflow-hidden transition-all duration-300">
            {isLoading ? <Loading /> : <Outlet context={{ isDarkMode, updateSharedAvatarRef }} />}
          </div>
        </div>
      </main>

      <div className="relative z-20 pointer-events-auto">
        <Footer isDarkMode={isDarkMode} />
      </div>

      {!isDetailsPage && (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around py-3 z-40 shadow-inner pointer-events-auto transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
          <a className="flex flex-col items-center gap-1 text-orange-600" href="#"><HomeOutlined className="text-xl" /><span className="text-[10px] font-bold">Trang chủ</span></a>
          <a className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} href="#"><CompassOutlined className="text-xl" /><span className="text-[10px]">Khám phá</span></a>
          <a className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} href="#"><UserOutlined className="text-xl" /><span className="text-[10px]">Tôi</span></a>
        </nav>
      )}

      <FloatButton.BackTop visibilityHeight={300} style={{ right: 24, bottom: 100 }} />
    </div>
  );
}
