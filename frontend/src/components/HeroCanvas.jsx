import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Floating Glow Sphere ─── */
function GlowSphere() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
      <Sphere ref={meshRef} args={[1.8, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#0ea5e9"
          attach="material"
          distort={0.35}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.15}
          wireframe
        />
      </Sphere>
    </Float>
  )
}

/* ─── Particle Field ─── */
function ParticleField({ count = 200 }) {
  const meshRef = useRef()

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      sizes[i] = Math.random() * 2 + 0.5
    }
    return { positions, sizes }
  }, [count])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.05
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particles.sizes.length}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#38bdf8"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ─── Orbital Rings ─── */
function OrbitalRing({ radius = 3, opacity = 0.08 }) {
  const ringRef = useRef()

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1
      ringRef.current.rotation.x = Math.PI / 3
    }
  })

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.005, 16, 100]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={opacity} />
    </mesh>
  )
}

/* ─── Main Canvas Component ─── */
export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#38bdf8" />
      <pointLight position={[-5, -5, 3]} intensity={0.3} color="#2dd4bf" />

      <GlowSphere />
      <ParticleField count={250} />
      <OrbitalRing radius={3} opacity={0.06} />
      <OrbitalRing radius={4} opacity={0.04} />
    </Canvas>
  )
}
