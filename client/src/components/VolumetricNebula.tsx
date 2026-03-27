import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const nebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform float uTime;
  uniform float uDensity;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Optimized 3D Noise for gas simulation
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = dot(i, vec3(1.0, 57.0, 113.0));
    return mix(mix(mix( fract(sin(n + 0.0) * 43758.5453), fract(sin(n + 1.0) * 43758.5453), f.x),
                   mix( fract(sin(n + 57.0) * 43758.5453), fract(sin(n + 58.0) * 43758.5453), f.x), f.y),
               mix(mix( fract(sin(n + 113.0) * 43758.5453), fract(sin(n + 114.0) * 43758.5453), f.x),
                   mix( fract(sin(n + 170.0) * 43758.5453), fract(sin(n + 171.0) * 43758.5453), f.x), f.y), f.z);
  }

  void main() {
    float t = uTime * 0.1;
    vec3 p = vPosition * 0.4;
    
    float noiseVal = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    
    // Fractal Brownian Motion for cinematic gas
    for(int i = 0; i < 5; i++) {
      noiseVal += noise(p * freq + t) * amp;
      amp *= 0.5;
      freq *= 2.1;
    }

    float mask = smoothstep(1.0, 0.4, length(vPosition / 1.5));
    vec3 finalColor = mix(uColor1, uColor2, noiseVal * 1.2);
    
    // High-fidelity depth mapping
    gl_FragColor = vec4(finalColor, noiseVal * mask * uDensity);
  }
`;

export function VolumetricNebula({ color = "#bf94ff", density = 0.15 }: { color?: string, density?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(color) },
    uColor2: { value: new THREE.Color("#7d5fff") },
    uDensity: { value: density }
  }), [color, density]);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uDensity.value = density;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -15]} scale={[25, 25, 25]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
