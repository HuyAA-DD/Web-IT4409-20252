import React from 'react'
import { Canvas } from '@react-three/fiber';
import RotatingPlanet from '../RotatingPlanet/RotatingPlanet';
import { Suspense } from 'react';

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
      <div className="absolute bottom-1/3 md:bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 pointer-events-none z-[50]">
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
      <div className="absolute bottom-1/3 md:bottom-0 right-0 w-44 h-44 md:w-64 md:h-64 pointer-events-none z-[50]">
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

export default Footer
