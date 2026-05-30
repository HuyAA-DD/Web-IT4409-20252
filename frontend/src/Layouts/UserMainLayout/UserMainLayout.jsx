import React, { useEffect, useState, useMemo, Suspense} from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // <-- Đã thêm useLocation
import { Canvas, useThree } from '@react-three/fiber';
import { Clone, Float, useGLTF, Environment, Center, PresentationControls, OrbitControls } from '@react-three/drei';
import { Input, Badge, FloatButton, Button, Avatar, message } from "antd";
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
  DollarCircleOutlined,
  HomeOutlined,
  MessageOutlined,
  MenuOutlined, 
  HeartOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

import api from "../../Apis/apiConfig";
import API_ENDPOINTS from "../../Apis/apiEndpoints";

import {
  clearAuthUser,
  getAuthUser,
  getAuthUserAvatar,
  getAuthUserName,
  isAuthenticated,
  updateAuthUser,
} from "../../Utils/Auth";

//Data import
import { ObjectModels, StarPosition } from '../../Data/3Dmodels';

// Component import
import RotatingPlanet from '../../Components/RotatingPlanet/RotatingPlanet';
import DarkModeToggle from '../../Components/DarkModeToggle/DarkModeToggle';
import Footer from '../../Components/Footer/Footer';
import Loading from '../../Components/Loading/Loading';
import DarkModeStars from '../../Components/DarkModeStar/DarkModeStars';
import Global3DModel from '../../Components/Global3DModel/Global3DModel';

const { Search } = Input;

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

  const [cartCount] = useState(2);
  const [notiCount] = useState(5);
  const [currentUser, setCurrentUser] = useState(getAuthUser());

  const isLoggedIn = isAuthenticated();
  const userName = getAuthUserName();
  const userAvatar = getAuthUserAvatar();

  useEffect(() => {
    const syncUserFromBackend = async () => {
      if (!isAuthenticated()) {
        setCurrentUser(null);
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

    const handleAuthChanged = () => {
      setCurrentUser(getAuthUser());
    };

    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
    };
  }, []);

  const Navbar3DModel = ({ path }) => {
    const { scene } = useGLTF(path);
    const { gl } = useThree();

    useMemo(() => {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material.map) {
            child.material.map.anisotropy = gl.capabilities.getMaxAnisotropy();
          }
        }
      });
    }, [scene, gl]);

    return <primitive object={scene} />;
  };

  const handleSearch = (value) => {
    console.log("Searching:", value);
  };

  const handleLogin = () => {
    navigate("/auth/login-register");
    setActiveIndex(-1);
  };

  const handleLogout = () => {
    clearAuthUser();
    setCurrentUser(null);

    window.dispatchEvent(new Event("auth-changed"));

    message.success("Đã đăng xuất.");

    navigate("/auth/login-register");
    setActiveIndex(-1);
  };

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
          <div className="w-12 h-12 hidden sm:block">
            {!isDarkMode && (
              <Canvas camera={{ position: [0, 0, 4], fov: 35 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[3, 3, 3]} intensity={1.8} />
                <Suspense fallback={null}>
                  <Navbar3DModel path="/assets/Shopping_cart.glb" />
                </Suspense>
              </Canvas>
            )}

            {isDarkMode && (
              <Canvas camera={{ position: [0, 0, 4], fov: 35 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[3, 3, 3]} intensity={1.8} />
                <Suspense fallback={null}>
                  <Navbar3DModel path="/assets/planet_earth.glb" />
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

      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
        />
      </div>

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
          <div className="flex items-center gap-2">
            <Avatar
              src={userAvatar}
              icon={!userAvatar ? <UserOutlined /> : null}
              className="border-2 border-orange-500 shadow-sm cursor-pointer"
              onClick={() => {
                navigate(USER_ROUTE.Profile);
                setActiveIndex(-1);
              }}
            />

            <span
              className={`hidden lg:inline max-w-[140px] truncate font-semibold ${
                isDarkMode ? "text-white" : "text-gray-700"
              }`}
            >
              {userName}
            </span>

            <Button danger onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
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
    { icon: <ThunderboltOutlined />, label: 'Flash Sale', path: USER_ROUTE.Home },
    { icon: <ShopOutlined />, label: 'Siêu thị', path: USER_ROUTE.Supermarket },
    { icon: <RiseOutlined />, label: 'Top Sản phẩm', path: USER_ROUTE.TopProduct },
    { icon: <WalletOutlined />, label: 'Ví thanh toán', path: USER_ROUTE.Seapay },
    { icon: <HeartOutlined />, label: 'Yêu thích', path: USER_ROUTE.WishList },
    { icon: <FileTextOutlined />, label: 'Đơn hàng', path: USER_ROUTE.Orders },
  ];

  const renderNavLinks = (isDesktopCollapsed) => (
    <nav className="space-y-2 w-full px-2 flex flex-col items-center">
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

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-[100] lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onCloseMobile} />
      <div className={`fixed top-0 left-0 h-full w-72 shadow-2xl z-[101] lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col py-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`flex items-center justify-between px-6 mb-6 border-b pb-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <h1 className="text-2xl font-black text-orange-600 m-0">MegA<span className="italic text-transparent [-webkit-text-stroke:1px_#ea580c]">MaRt</span></h1>
          <Button type="text" icon={<CloseOutlined className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`} />} onClick={onCloseMobile} />
        </div>
        <div className="px-6 mb-2"><h2 className={`text-sm font-bold m-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Danh mục</h2></div>
        {renderNavLinks(false)}
      </div>

      <aside className={`hidden lg:flex flex-col gap-2 py-4 h-fit border rounded-xl sticky top-28 shadow-sm transition-all duration-300 ease-in-out z-20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} ${collapsed ? 'w-[80px] items-center' : 'w-64'}`}>
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
  const [activeIndex,setActiveIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- LOGIC ẨN SIDEBAR DỰA VÀO ĐƯỜNG DẪN TẠI ĐÂY ---
  const location = useLocation();
  const isDetailsPage = location.pathname.startsWith('/product') || location.pathname.startsWith('/cart');

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

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      
      <div className="relative z-50 pointer-events-auto">
        <TopNavBar onMenuClick={handleMenuAction} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} setActiveIndex={setActiveIndex} />
      </div>

      <div className="fixed inset-0 z-[15] pointer-events-none">
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }} 
          shadows  
          style={{ pointerEvents: isDarkMode ? 'auto' : 'none' }}
        >
          <Suspense fallback={null}>
            {isDarkMode ? (
              <>
                <Environment 
                  background={true}
                  files={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']}
                  path="/assets/night-sky/"
                  environmentIntensity={0.05}  
                />
                <ambientLight intensity={0.03} />
                <spotLight 
                  position={[0, 7, 3]} 
                  angle={0.5}
                  penumbra={0.8}       
                  intensity={3000} 
                  distance={25} 
                  decay={1.5} 
                  castShadow           
                  shadow-mapSize={[2048, 2048]}  
                  color="#ffaa00" 
                />
                <pointLight position={[0, -5, 2]} intensity={200} color="#334155" />
                
                {/* Chỉ Render Models và Stars ở đây */}
                <ResponsiveModelGroup />
                <DarkModeStars />

                <OrbitControls 
                  enableZoom={false} 
                  enablePan={false}    
                  enableRotate={false} 
                  autoRotate={true}    
                  autoRotateSpeed={0.8} 
                />
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

      {/* LỚP 2: Nội dung chính */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 py-8 flex-grow w-full pointer-events-auto">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Tự động Ẩn Sidebar ở trang chi tiết sản phẩm / giỏ hàng */}
          {!isDetailsPage && (
            <Sidebar 
              collapsed={isSidebarCollapsed} 
              isMobileOpen={isMobileMenuOpen} 
              onCloseMobile={() => setIsMobileMenuOpen(false)} 
              isDarkMode={isDarkMode} 
              activeIndex={activeIndex} 
              setActiveIndex={setActiveIndex} 
            />
          )}
          <div className="flex-grow w-full overflow-hidden transition-all duration-300">
            {isLoading ? <Loading /> : <Outlet context = {{isDarkMode}} />}
          </div>
        </div>
      </main>

      {/* LỚP 3: BẬT FOOTER LÊN TRÊN (Nâng z-index lên z-20) */}
      <div className="relative z-20 pointer-events-auto">
        <Footer isDarkMode={isDarkMode} />
      </div>

      {/* Tự động Ẩn Mobile Bottom Nav ở trang chi tiết sản phẩm / giỏ hàng */}
      {!isDetailsPage && (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around py-3 z-40 shadow-inner pointer-events-auto transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
          <a className="flex flex-col items-center gap-1 text-orange-600" href="#"><HomeOutlined className="text-xl" /><span className="text-[10px] font-bold">Trang chủ</span></a>
          <a className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} href="#"><CompassOutlined className="text-xl" /><span className="text-[10px]">Khám phá</span></a>
          <a className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} href="#"><UserOutlined className="text-xl" /><span className="text-[10px]">Tôi</span></a>
        </nav>
      )}

      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 80 }} className="z-50 pointer-events-auto">
        <FloatButton icon={<MessageOutlined />} type="primary" badge={{ count: 3 }} tooltip="Chat hỗ trợ" />
        <FloatButton.BackTop visibilityHeight={300} />
      </FloatButton.Group>
    </div>
  );
}