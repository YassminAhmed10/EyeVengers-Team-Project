import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// استيراد الصورة الشفافة PNG
import GlassImage from "../assets/Glass3-removebg-preview.png";

// الصورة كـ texture 3D (بدون خلفية)
const Image3D = () => {
  const imageRef = useRef();
  
  // تحميل الصورة كـ texture
  const texture = new THREE.TextureLoader().load(GlassImage);
  
  useFrame((state) => {
    if (imageRef.current) {
      // دوران الصورة ببطء
      imageRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.3;
      imageRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
      // حركة طافية
      imageRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1) * 0.1;
    }
  });

  return (
    <mesh ref={imageRef} position={[0, 0, 0]}>
      <planeGeometry args={[3, 3]} />
      <meshStandardMaterial 
        map={texture} 
        transparent={true}
        side={THREE.DoubleSide}
        alphaTest={0.1}
      />
    </mesh>
  );
};

// الجسيمات الطائرة
const FloatingParticles = () => {
  const particlesRef = useRef();
  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    const height = (Math.random() - 0.5) * 4;
    
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      particlesRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#60a5fa" size={0.05} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// كرة خلفية متحركة
const RotatingSphere = () => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <mesh ref={sphereRef} position={[0, 0, -4]} scale={[2.5, 2.5, 2.5]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#1e3a8a" wireframe transparent opacity={0.15} emissive="#3b82f6" emissiveIntensity={0.1} />
    </mesh>
  );
};

// حلقات دوارة حول الصورة
const RotatingRings = () => {
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = state.clock.getElapsedTime() * 0.3;
      ring1Ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = state.clock.getElapsedTime() * -0.2;
      ring2Ref.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <torusGeometry args={[1.8, 0.05, 64, 200]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} emissive="#1e3a8a" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, 0]}>
        <torusGeometry args={[2.2, 0.03, 64, 200]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.7} roughness={0.3} transparent opacity={0.8} />
      </mesh>
    </>
  );
};

const ThreeScene = () => {
  return (
    <div style={{ 
      height: "100vh", 
      width: "100%", 
      position: "absolute",
      top: 0,
      left: 0,
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      zIndex: 1
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: "transparent" }}
      >
        {/* الإضاءة */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#60a5fa" />
        <pointLight position={[0, 5, 5]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[0, -3, 3]} intensity={0.4} color="#ffffff" />
        <spotLight position={[0, 5, 2]} intensity={0.6} angle={0.3} penumbra={0.5} />
        
        <Suspense fallback={null}>
          <RotatingSphere />
          <RotatingRings />
          <FloatingParticles />
          <Image3D />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default ThreeScene;