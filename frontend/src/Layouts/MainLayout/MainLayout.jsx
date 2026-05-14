import React, { useEffect, useState, useMemo, Suspense, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Clone, Float, useGLTF, Environment, Center, PresentationControls, OrbitControls } from '@react-three/drei';
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
  MessageOutlined,
  MenuOutlined, 
  HeartOutlined,
  CloseOutlined,
  SunOutlined,
  MoonOutlined,
  StarOutlined
} from '@ant-design/icons';

import Loading from '../../Components/Loading/Loading';

const { Search } = Input;

// --- MẢNG MODELS BACKGROUND CHUNG ---
const models = [
  { id: 1, path: 'assets/Shopping_cart.glb', position: [1, -0.5, 0], rotation: [Math.PI / 6, Math.PI / 3, 0] },
  { id: 2, path: 'assets/Shopping_cart.glb', position: [8, 2, 0], rotation: [Math.PI / 6, -Math.PI / 3, 0] },
  { id: 3, path: 'assets/box.glb', position: [0.5, 2.5, 0], rotation: [Math.PI / 10, -3 * Math.PI / 4, 0], scale: 0.7 },
  { id: 4, path: 'assets/present_1_low_poly.glb', position: [7, 0, 0], rotation: [Math.PI / 10, -3 * Math.PI / 4, 0], scale: 0.015 },
  { id: 5, path: 'assets/nike_shoe_box.glb', position: [5, 0, 0], rotation: [Math.PI / 10, -3 * Math.PI / 4, 0], scale: 3 },

];

// --- MẢNG NGÔI SAO DÀNH CHO DARK MODE ---
const starRelativePositions = [
  { x: -0.4, y: 0.4, z: -3, rotation: [0, Math.PI / 4, 0] },
  { x: 0.3, y: 0.3, z: -4, rotation: [Math.PI / 6, 0, 0] },
  { x: -0.3, y: -0.2, z: -2, rotation: [0, 0, Math.PI / 8] },
  { x: 0.4, y: -0.4, z: -5, rotation: [Math.PI / 3, Math.PI / 3, 0] },
  { x: 0.1, y: 0.45, z: -3, rotation: [0, Math.PI / 2, 0] },
  { x: -0.45, y: -0.4, z: -4, rotation: [Math.PI / 4, 0, Math.PI / 4] },
];

useGLTF.preload('assets/Shopping_cart.glb');
useGLTF.preload('assets/juice_carton_shop.glb');
useGLTF.preload('assets/box.glb');
useGLTF.preload('assets/present_1_low_poly.glb');
useGLTF.preload('assets/stylized_planet.glb');
useGLTF.preload('assets/planet_earth.glb');
useGLTF.preload('assets/star.glb');
useGLTF.preload('assets/sun.glb');
useGLTF.preload('assets/blender_planet_basic.glb');
useGLTF.preload('assets/nike_shoe_box.glb');




// --- COMPONENT: MÔ HÌNH HÀNH TINH TỰ QUAY QUANH TRỤC ---
const RotatingPlanet = ({ path, position = [0,0,0], scale, rotationSpeed = 0.005, floatSpeed = 1.5, floatIntensity = 2 }) => {
  const { scene } = useGLTF(path);
  const planetRef = useRef();

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={1} floatIntensity={floatIntensity}>
      <group ref={planetRef} position={position} scale={scale}>
        <Clone object={scene} />
      </group>
    </Float>
  );
};

// --- COMPONENT: DARK MODE TOGGLE ---
const DarkModeToggle = ({isDarkMode, toggleDarkMode, className=''}) => {
    return (
      <div 
        className={`relative w-[80px] h-8 rounded-[2rem] flex items-center justify-end px-1 border cursor-pointer transition-colors z-50 ${isDarkMode ? 'border-gray-500 bg-slate-800' : 'border-black bg-white'} ${className}`} 
        onClick={toggleDarkMode}
      >
        <div className={`h-[90%] aspect-square rounded-full opacity-80 transition-transform duration-700 ease-in-out flex items-center justify-center ${!isDarkMode ? "bg-amber-300 translate-x-0" : "bg-gray-500 -translate-x-[160%]"}`}>
          <div className="animate-bounce flex items-center justify-center">
            {!isDarkMode ? (
              <SunOutlined className="text-white text-xl animate-spin-slow" />
            ) : (
              <div className="flex">
                <MoonOutlined className="text-white text-lg" />
                <StarOutlined className="text-white text-[8px] -mt-2" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

// --- COMPONENT: TOP NAVBAR ---
const TopNavBar = ({ onMenuClick, isDarkMode , toggleDarkMode, setActiveIndex}) => {
  const navigate = useNavigate();
  const [cartCount] = useState(2);
  const [notiCount] = useState(5);
  const [userAvatar] = useState(null);

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

    return (
      <PresentationControls 
        global={false} 
        cursor={true} 
        snap={{ mass: 1, tension: 150, friction: 100 }} 
        polar={[-Math.PI / 4, Math.PI / 4]} 
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <Float speed={5} rotationIntensity={0.5} floatIntensity={1}>
          <Center><Clone object={scene} scale={1.2} rotation={[Math.PI/10, -Math.PI/4, 0]} /></Center>
        </Float>
      </PresentationControls>
    );
  };

  const handleSearch = (value) => console.log("Searching:", value);

  return (
    <header className={`relative shadow-sm sticky top-0 z-50 w-full border-b transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
      
      {/* Mini Canvas: Cái Shop ở bên trái */}
      <div className="absolute -left-[2rem] -top-[4rem] w-48 h-48 md:w-60 md:h-60 cursor-grab active:cursor-grabbing z-[0] md:pointer-events-none">
        <Canvas camera={{ position: [0, 0, 9], fov: 45 }} shadows dpr={[1, 2]} gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}>
          <Suspense fallback={null}>
            {!isDarkMode && <Environment preset="city" />}
            <ambientLight intensity={isDarkMode ? 0.02 : 0.5} />
            <directionalLight position={[5, 5, 5]} intensity={isDarkMode ? 0 : 1.5} castShadow={!isDarkMode} />
            
            {isDarkMode && (
              <spotLight position={[0, 7, 3]} angle={0.6} penumbra={0.5} intensity={2500} distance={20} decay={1.5} castShadow color="#ffaa00" />
            )}
            <Navbar3DModel path='assets/juice_carton_shop.glb' />
          </Suspense>
        </Canvas>
      </div>

      {/* Mini Canvas: Trái Đất ở góc phải (Chỉ hiển thị khi DarkMode) */}
      {isDarkMode && (
        <div className="absolute -right-[1rem] -top-[3rem] w-40 h-40 md:w-56 md:h-56 z-[0] pointer-events-none">
          <Canvas camera={{ position: [0, 0, 20], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
              <Environment preset = "city"></Environment>
              <ambientLight intensity={0.1} />
              <spotLight position={[0, 10, 5]} angle={0.5} intensity={2000} color="#ffaa00" />
              <RotatingPlanet path="assets/planet_earth.glb" scale={1.3} rotationSpeed={-0.005} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {!isDarkMode && (
        <div className="absolute -right-[1rem] -top-[3rem] w-40 h-40 md:w-56 md:h-56 z-[0] pointer-events-none">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
              <Environment preset = "city"></Environment>
              <ambientLight intensity={0.1} />
              <spotLight position={[0, 10, 5]} angle={0.5} intensity={2000} color="#ffaa00" />
              <RotatingPlanet path="assets/blender_planet_basic.glb" scale={1.3} rotationSpeed={-0.005} />
            </Suspense>
          </Canvas>
        </div>
      )}



      <div className="relative flex flex-col md:flex-row items-center justify-between px-6 py-4 max-w-7xl mx-auto gap-4 pointer-events-none">
        <div className="flex items-center justify-between w-full md:w-auto pointer-events-auto z-10 md:mr-20">
          <div className="flex items-center gap-4">
            <MenuOutlined className={`text-xl cursor-pointer transition-colors ${isDarkMode ? 'text-gray-300 hover:text-orange-500' : 'text-gray-600 hover:text-orange-600'}`} onClick={onMenuClick} />
            <h1 className="relative text-3xl md:text-4xl font-black tracking-tighter m-0 cursor-pointer select-none leading-none w-fit group" onClick={() => { navigate('/'); setActiveIndex(0); }}>
              <span className={`relative z-20 inline-block transition-transform ${isDarkMode ? 'text-orange-500' : 'text-orange-600 [-webkit-text-stroke:0.5px_#ffffff] md:[-webkit-text-stroke:1px_#ffffff] drop-shadow-md'}`}>MegA</span>
              <span className={`italic absolute top-[35%] md:top-[40%] -right-[50%] md:-right-[65%] text-transparent z-10 whitespace-nowrap drop-shadow-sm ${isDarkMode ? '[-webkit-text-stroke:1.5px_#f97316] md:[-webkit-text-stroke:2px_#f97316]' : '[-webkit-text-stroke:1.5px_#ea580c] md:[-webkit-text-stroke:2px_#ea580c]'}`}>MaRt</span>
            </h1>
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} className="md:hidden ml-16" />
          </div>

          <div className="md:hidden flex gap-5 text-2xl items-center ">
            <div className="cursor-pointer" onClick={() => {navigate('/cart'); setActiveIndex(-1)}}>
              <Badge count={cartCount} size="small"><ShoppingCartOutlined className={isDarkMode ? "text-gray-100" : "text-orange-600"} /></Badge>
            </div>
            <Avatar size="medium" icon={<UserOutlined />}  />
          </div>
        </div>

        <div className="flex-grow max-w-xl w-full pointer-events-auto z-10">
          <Search placeholder="Săn deal hot tại MegaMart..." allowClear onSearch={handleSearch} enterButton={<Button type="primary" className="bg-orange-600 hover:bg-orange-500 border-none px-6"><SearchOutlined style={{ fontSize: '18px' }} /></Button>} size="large" />
        </div>

        <div className="hidden md:flex items-center gap-6 pointer-events-auto z-10 mr-[130px]">
          <div className="relative cursor-pointer group flex items-center justify-center">
            <Badge count={notiCount} overflowCount={99} offset={[2, 2]}>
              <BellOutlined className={`text-[24px] transition-all ${isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-600'}`} />
            </Badge>
          </div>
          <div className="relative cursor-pointer group flex items-center justify-center" onClick={() => {navigate('/cart'); setActiveIndex(-1)}}>
            <Badge count={cartCount} offset={[2, 2]}>
              <ShoppingCartOutlined className={`text-[26px] transition-all ${isDarkMode ? 'text-gray-100 hover:text-orange-400' : 'text-gray-600 hover:text-orange-600'}`} />
            </Badge>
          </div>
          <div className={`flex items-center gap-3 cursor-pointer pl-6 border-l ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <Avatar size={45} src={userAvatar} icon={<UserOutlined />} className="border-2 border-transparent hover:border-orange-600 transition-all shadow-sm" />
            <div className="flex flex-col">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Tài khoản</span>
              <span className={`text-sm font-bold truncate max-w-[80px] transition-colors cursor-pointer ${isDarkMode ? 'text-gray-200 hover:text-orange-500' : 'text-gray-700 hover:text-orange-600'}`} onClick={() => {navigate('/auth/login&register'); setActiveIndex(-1);}}>Đăng nhập</span>
            </div>
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}/>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- COMPONENT: SIDEBAR ---
const Sidebar = ({ collapsed, isMobileOpen, onCloseMobile, isDarkMode, setActiveIndex, activeIndex }) => {
  const navigate = useNavigate();
  const menuItems = [
    { icon: <ThunderboltOutlined />, label: 'Flash Sale', path: '/' },
    { icon: <CompassOutlined />, label: 'Khám phá hàng ngày', path: '/404NotFound' },
    { icon: <ShopOutlined />, label: 'Siêu thị', path: '/404NotFound' },
    { icon: <RiseOutlined />, label: 'Top Sản phẩm', path: '/topproducts' },
    { icon: <WalletOutlined />, label: 'Ví thanh toán', path: '/404NotFound' },
    { icon: <DollarCircleOutlined />, label: 'Săn xu', path: '/404NotFound' },
    { icon: <HeartOutlined />, label: 'Yêu thích', path: '/wishlist' },
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

// --- COMPONENT: FOOTER KÈM MINI CANVAS BÊN PHẢI ---
const Footer = ({ isDarkMode }) => (
  // Bỏ overflow-hidden để model planet có thể trôi nổi vượt khỏi giới hạn footer
  <footer className={`relative w-full mt-12 border-t transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 px-4 py-12 max-w-7xl mx-auto relative z-10 pointer-events-none">
      <div className="col-span-2 space-y-4 pointer-events-auto">
        <h4 className="text-2xl font-black text-orange-600 m-0">MegaMart</h4>
        <p className="text-sm text-gray-500">© 2024 MegaMart Global. Điểm đến mua sắm tuyệt vời nhất với thanh toán an toàn và giao hàng toàn cầu.</p>
      </div>
    </div>

    {/* MINI CANVAS: CHỨA STYLIZED PLANET TRONG FOOTER - Nâng z-index lên z-[50] */}
    {isDarkMode && (
      <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 pointer-events-none z-[50]">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.03} />
            <spotLight position={[0, 7, 3]} angle={0.5} penumbra={0.8} intensity={3000} distance={25} decay={1.5} color="#ffaa00" />
            <pointLight position={[0, -5, 2]} intensity={200} color="#334155" />
            
            <RotatingPlanet path="assets/stylized_planet.glb" scale={1.5} rotationSpeed={0.005} floatSpeed={2} floatIntensity={1} />
          </Suspense>
        </Canvas>
      </div>
    )}

    {!isDarkMode && (
      <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 pointer-events-none z-[50]">
        <Canvas camera={{ position: [0, 0, 30], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.03} />
            <spotLight position={[0, 7, 3]} angle={0.5} penumbra={0.8} intensity={3000} distance={25} decay={1.5} color="#ffaa00" />
            <pointLight position={[0, -5, 2]} intensity={200} color="#334155" />
            
            <RotatingPlanet path="assets/sun.glb" scale={0.8} rotationSpeed={0.005} floatSpeed={2} floatIntensity={1} />
          </Suspense>
        </Canvas>
      </div>
    )}

    
  </footer>
);

// --- 3D COMPONENTS (BACKGROUND CHUNG) ---
const Global3DModel = ({ path, position, rotation, scale = 1.2 }) => {
  const { scene } = useGLTF(path);

  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;  
      }
    });
  }, [scene]);

  return (
    <Float speed={1} rotationIntensity={2} floatIntensity={4}>
      <Clone object={scene} rotation={rotation} position={position} scale={scale} /> 
    </Float>
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
      {models.map(item => (
        <Global3DModel key={item.id} path={item.path} position={item.position} rotation={item.rotation} scale={item?.scale} />
      ))}
    </group>
  );
};

// --- MẢNG NGÔI SAO DÀNH RIÊNG CHO DARK MODE ---
const DarkModeStars = () => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 4.5;
  const starScale = isMobile ? 0.1 : 0.2; 

  return (
    <group>
      {starRelativePositions.map((pos, idx) => (
        <Float key={`star-${idx}`} speed={3} rotationIntensity={2} floatIntensity={2}>
          <Global3DModel 
            path="assets/star.glb" 
            position={[pos.x * viewport.width, pos.y * viewport.height, pos.z]} 
            rotation={pos.rotation} 
            scale={starScale} 
          />
        </Float>
      ))}
    </group>
  );
};


// --- MAIN LAYOUT ---
export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [activeIndex,setActiveIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
          <Sidebar collapsed={isSidebarCollapsed} isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} isDarkMode={isDarkMode} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
          <div className="flex-grow w-full overflow-hidden transition-all duration-300">
            {isLoading ? <Loading /> : <Outlet />}
          </div>
        </div>
      </main>

      {/* LỚP 3: BẬT FOOTER LÊN TRÊN (Nâng z-index lên z-20) */}
      <div className="relative z-20 pointer-events-auto">
        <Footer isDarkMode={isDarkMode} />
      </div>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around py-3 z-40 shadow-inner pointer-events-auto transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
        <a className="flex flex-col items-center gap-1 text-orange-600" href="#"><HomeOutlined className="text-xl" /><span className="text-[10px] font-bold">Trang chủ</span></a>
        <a className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} href="#"><CompassOutlined className="text-xl" /><span className="text-[10px]">Khám phá</span></a>
        <a className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} href="#"><UserOutlined className="text-xl" /><span className="text-[10px]">Tôi</span></a>
      </nav>

      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 80 }} className="z-50 pointer-events-auto">
        <FloatButton icon={<MessageOutlined />} type="primary" badge={{ count: 3 }} tooltip="Chat hỗ trợ" />
        <FloatButton.BackTop visibilityHeight={300} />
      </FloatButton.Group>
    </div>
  );
}