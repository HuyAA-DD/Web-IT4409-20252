import React from 'react'
import { StarPosition } from '../../Data/3Dmodels';
import { useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import Global3DModel from '../Global3DModel/Global3DModel';

const DarkModeStars = () => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 4.5;
  const starScale = isMobile ? 0.1 : 0.2; 

  return (
    <group>
      {StarPosition.map((pos, idx) => (
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

export default DarkModeStars;
