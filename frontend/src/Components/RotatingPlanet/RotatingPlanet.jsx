import React, { useRef, useMemo } from 'react';
import { useGLTF, Float, Clone } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

const RotatingPlanet = ({ path, position = [0, 0, 0], scale = 1, rotationSpeed = 0.005, floatSpeed = 1.5, floatIntensity = 2 }) => {
  const { scene } = useGLTF(path);
  const { gl } = useThree();
  const planetRef = useRef();

  // Tối ưu hóa bóng đổ và texture giống hệt Global3DModel
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

export default RotatingPlanet;