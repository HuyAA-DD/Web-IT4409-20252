import React from 'react'
import { useMemo } from 'react';
import { useGLTF , Float, Clone} from '@react-three/drei';


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
export default Global3DModel
