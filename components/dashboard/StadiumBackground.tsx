'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function ParticleField() {
  const count = 720;
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      data[index * 3] = (Math.random() - 0.5) * 20;
      data[index * 3 + 1] = (Math.random() - 0.5) * 11;
      data[index * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    return data;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.y = time * 0.025;
    pointsRef.current.rotation.x = Math.sin(time * 0.08) * 0.035;
    pointsRef.current.position.y = Math.sin(time * 0.16) * 0.24;

    if (materialRef.current) {
      materialRef.current.opacity = 0.38 + Math.sin(time * 0.7) * 0.08;
    }
  });

  return (
    <points ref={pointsRef} position={[0, 0, -0.8]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.036}
        color="#a3e635"
        transparent
        opacity={0.42}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function CyanDust() {
  const count = 180;
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      data[index * 3] = (Math.random() - 0.5) * 17;
      data[index * 3 + 1] = (Math.random() - 0.5) * 9;
      data[index * 3 + 2] = (Math.random() - 0.5) * 7;
    }

    return data;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.y = -time * 0.018;
    pointsRef.current.position.x = Math.sin(time * 0.12) * 0.35;
  });

  return (
    <points ref={pointsRef} position={[0, 0.2, -1.2]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#22d3ee"
        transparent
        opacity={0.24}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function StadiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030605]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ParticleField />
        <CyanDust />
      </Canvas>

      <div className="stadium-background-grid absolute inset-[-18%]" />
      <div className="stadium-light stadium-light-left absolute" />
      <div className="stadium-light stadium-light-right absolute" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(0,0,0,.20)_48%,rgba(0,0,0,.76)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
    </div>
  );
}
