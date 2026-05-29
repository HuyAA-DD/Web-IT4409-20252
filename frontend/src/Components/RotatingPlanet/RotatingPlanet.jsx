import React from 'react'
import { useRef } from 'react';
import { useGLTF , Float, Clone} from '@react-three/drei';
import { useFrame} from '@react-three/fiber';


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
}

export default RotatingPlanet
