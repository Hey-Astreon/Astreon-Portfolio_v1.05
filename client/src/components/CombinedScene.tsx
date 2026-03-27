import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, Points, PointMaterial, Text } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, Scanline } from '@react-three/postprocessing';
import { VolumetricNebula } from './VolumetricNebula';
import * as THREE from 'three';
import { AetherEngine } from './AetherEngine';
import { NeuralDataStream } from './NeuralDataStream';
import gsap from 'gsap';

// --- Shader Background Components ---
const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uScrollY;

#define PI 3.14159265359

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uTime * 0.15;
  float scrollOffset = uScrollY * 0.0005;
  
  vec2 st = uv;
  st.y += scrollOffset;
  
  float n1 = snoise(vec2(st.x * 3.0, st.y * 2.0 - t));
  float n2 = snoise(vec2(st.x * 5.0 + t, st.y * 4.0 - t * 1.5));
  float noise = n1 * 0.6 + n2 * 0.4;
  
  vec3 absoluteBlack = vec3(0.0, 0.0, 0.0); 
  vec3 electricViolet = vec3(0.749, 0.58, 1.0); 
  vec3 deepSpace = vec3(0.02, 0.02, 0.04);
  vec3 auroraBlue = vec3(0.3, 0.68, 0.92);
  
  vec3 color = absoluteBlack;
  float f1 = smoothstep(-0.2, 0.8, noise);
  float f2 = smoothstep(0.4, 1.0, noise);
  
  color = mix(color, deepSpace, f1 * 0.15);
  color = mix(color, electricViolet, f2 * 0.06);
  color = mix(color, auroraBlue, f1 * f2 * 0.04);
  
  float dist = distance(uv, vec2(0.5));
  color *= smoothstep(1.0, 0.2, dist * 0.7);

  gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

function BackgroundShader() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uScrollY: { value: 0 }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollY.value = window.scrollY;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function MorphingCore() {
  const meshRef = useRef<THREE.Points>(null);
  const vertexCount = 1500;
  const states = useMemo(() => {
    const geo = { crystal: new Float32Array(vertexCount * 3), neural: new Float32Array(vertexCount * 3), matrix: new Float32Array(vertexCount * 3), helix: new Float32Array(vertexCount * 3) };
    const oct = new THREE.OctahedronGeometry(2.5, 0);
    const posAttr = oct.getAttribute('position');
    for (let i = 0; i < vertexCount; i++) {
        const index = i % posAttr.count;
        geo.crystal[i * 3] = posAttr.getX(index) + (Math.random() - 0.5) * 0.1;
        geo.crystal[i * 3 + 1] = posAttr.getY(index) + (Math.random() - 0.5) * 0.1;
        geo.crystal[i * 3 + 2] = posAttr.getZ(index) + (Math.random() - 0.5) * 0.1;
    }
    for (let i = 0; i < vertexCount; i++) {
      const r = 2.5; const theta = Math.random() * 2 * Math.PI; const phi = Math.acos(2 * Math.random() - 1);
      geo.neural[i * 3] = r * Math.sin(phi) * Math.cos(theta); geo.neural[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); geo.neural[i * 3 + 2] = r * Math.cos(phi);
    }
    const side = Math.floor(Math.pow(vertexCount, 1/3)); let idx = 0;
    for (let x = 0; x < side; x++) { for (let y = 0; y < side; y++) { for (let z = 0; z < side; z++) { if (idx >= vertexCount) break; geo.matrix[idx * 3] = (x / side - 0.5) * 5; geo.matrix[idx * 3 + 1] = (y / side - 0.5) * 5; geo.matrix[idx * 3 + 2] = (z / side - 0.5) * 5; idx++; } } }
    for (let i = 0; i < vertexCount; i++) {
      const t = (i / vertexCount) * Math.PI * 10; const r = 1.5; const spiral = i % 2 === 0 ? 1 : -1;
      geo.helix[i * 3] = r * Math.cos(t * spiral); geo.helix[i * 3 + 1] = (i / vertexCount - 0.5) * 8; geo.helix[i * 3 + 2] = r * Math.sin(t * spiral);
    }
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / maxScroll) * 3;
    const stateIdx = Math.floor(progress);
    const weight = progress % 1;
    const p1 = stateIdx === 0 ? states.crystal : stateIdx === 1 ? states.neural : stateIdx === 2 ? states.matrix : states.helix;
    const p2 = stateIdx === 0 ? states.neural : stateIdx === 1 ? states.matrix : stateIdx === 2 ? states.helix : states.helix;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertexCount * 3; i++) {
      positions[i] = THREE.MathUtils.lerp(p1[i], p2[i], weight) + Math.sin(state.clock.elapsedTime + i) * 0.005;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.y += 0.005;
    meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    if (meshRef.current.material instanceof THREE.PointsMaterial) {
        meshRef.current.material.opacity = Math.max(0, 1 - (window.scrollY - 4000) / 1000);
    }
  });

  return (
    <Points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={vertexCount} array={new Float32Array(vertexCount * 3)} itemSize={3} args={[new Float32Array(vertexCount * 3), 3]} />
      </bufferGeometry>
      <PointMaterial transparent color="#bf94ff" size={0.05} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

function AetherLattice({ velocity }: { velocity: number }) {
  const meshRef = useRef<THREE.LineSegments>(null);
  const segments = 40;
  const size_val = 150;
  const geometry = useMemo(() => {
    const points = []; const step = size_val / segments;
    for (let x = -size_val/2; x <= size_val/2; x += step) points.push(x, -size_val/2, 0, x, size_val/2, 0);
    for (let y = -size_val/2; y <= size_val/2; y += step) points.push(-size_val/2, y, 0, size_val/2, y, 0);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); return geo;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: { value: 0 }, uVelocity: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) }, uOpacity: { value: 0.15 } },
    vertexShader: `
      uniform float uTime; uniform float uVelocity; uniform vec2 uMouse; varying float vDist;
      void main() {
        vec3 pos = position; pos.z += uVelocity * 0.05 * sin(pos.y * 0.2 + uTime) + sin(pos.x * 0.1 + uTime) * (1.0 + abs(uVelocity) * 0.1);
        float mDist = distance(pos.xy, uMouse * 50.0); pos.z += smoothstep(15.0, 0.0, mDist) * 5.0;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0); gl_Position = projectionMatrix * mvPosition; vDist = -mvPosition.z;
      }
    `,
    fragmentShader: `
      uniform float uOpacity; varying float vDist;
      void main() {
        float fade = smoothstep(60.0, 20.0, vDist); gl_FragColor = vec4(0.0, 0.96, 1.0, uOpacity * fade);
        if (mod(vDist - uOpacity * 10.0, 10.0) < 0.1) gl_FragColor += vec4(0.75, 0.58, 1.0, 0.2 * fade);
      }
    `,
    blending: THREE.AdditiveBlending, depthWrite: false
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uVelocity.value = THREE.MathUtils.lerp(mat.uniforms.uVelocity.value, velocity, 0.1);
      mat.uniforms.uMouse.value.lerp(state.pointer, 0.1);
      meshRef.current.position.z = -20 + Math.sin(state.clock.elapsedTime * 0.5) * 2;
      meshRef.current.rotation.x = -0.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });
  return <lineSegments ref={meshRef} geometry={geometry} material={material} />;
}

function SectionHeaders() {
  const headers = [{ text: "ABOUT PROTOCOL", y: -10 }, { text: "COMPILED PROJECTS", y: -30 }, { text: "TACTICAL ARSENAL", y: -50 }, { text: "INITIATE UPLINK", y: -70 }];
  return (
    <>
      {headers.map((h, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text 
            position={[0, h.y + (window.scrollY * 0.01), -5]} 
            fontSize={1.2} 
            color="#fdf0ff" 
            font="https://fonts.gstatic.com/s/orbitron/v25/y97ZGS6ndY96C8UqWw.ttf"
            material-toneMapped={false} 
            anchorX="center" 
            anchorY="middle" 
            maxWidth={10} 
            textAlign="center"
          >
            {h.text}
            <meshStandardMaterial emissive="#bf94ff" emissiveIntensity={0.5} toneMapped={false} />
          </Text>
        </Float>
      ))}
    </>
  );
}

function OrbitalLights({ intensity = 20 }: { intensity?: number }) {
  const light1Ref = useRef<THREE.PointLight>(null); const light2Ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (light1Ref.current) { 
      light1Ref.current.position.set(Math.sin(t * 0.8) * 5, 0, Math.cos(t * 0.8) * 5); 
      light1Ref.current.intensity = (intensity * 1.5) * Math.max(0, 1 - window.scrollY / 1000); 
    }
    if (light2Ref.current) { 
      light2Ref.current.position.set(Math.sin(t * 0.6 + Math.PI) * 4, 0, Math.cos(t * 0.6 + Math.PI) * 4); 
      light2Ref.current.intensity = intensity * Math.max(0, 1 - window.scrollY / 1000); 
    }
  });
  return <><pointLight ref={light1Ref} color="#bf94ff" intensity={30} distance={20} /><pointLight ref={light2Ref} color="#7d5fff" intensity={20} distance={20} /></>;
}

function SceneManager({ settings, warp, velocity }: { settings: any, warp: number, velocity: number }) {
  const { camera } = useThree();
  
  useEffect(() => {
    const handleWarp = (e: any) => {
      const duration = e.detail?.duration || 1.2;
      const tl = gsap.timeline();
      tl.to({ fov: 75 }, { fov: 90, duration: duration * 0.4, ease: "power2.in", onUpdate: function() { (camera as THREE.PerspectiveCamera).fov = this.targets()[0].fov; camera.updateProjectionMatrix(); } })
        .to({ fov: 90 }, { fov: 75, duration: duration * 0.6, ease: "power2.out", onUpdate: function() { (camera as THREE.PerspectiveCamera).fov = this.targets()[0].fov; camera.updateProjectionMatrix(); } }, duration * 0.4);
    };
    window.addEventListener('stellar-warp', handleWarp);
    return () => window.removeEventListener('stellar-warp', handleWarp);
  }, [camera]);

  return (
    <>
      <BackgroundShader />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#bf94ff" />
      <AetherEngine uWarp={warp} uSingularity={0} />
      <AetherLattice velocity={velocity} />
      <VolumetricNebula color="#bf94ff" density={settings.density} />
      <MorphingCore />
      <group position={[0, -30 + (window.scrollY * 0.01), 0]}>
        <NeuralDataStream />
      </group>
      <SectionHeaders />
      <OrbitalLights intensity={settings.perfMode ? 0 : 20} />
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom 
          intensity={settings.perfMode ? settings.bloom * 0.5 : settings.bloom} 
          luminanceThreshold={0.2} 
          height={settings.perfMode ? 200 : 300} 
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(Math.abs(velocity) * 0.0004, Math.abs(velocity) * 0.0004)} 
        />
        <Noise opacity={settings.perfMode ? 0 : 0.02} />
        <Vignette darkness={1.1} />
        <Scanline opacity={settings.perfMode ? 0 : 0.01} />
      </EffectComposer>
    </>
  );
}

export function CombinedScene({ 
  forceGlitch = 0, 
  forceSingularity = 0, 
  ecoMode = false 
}: { 
  forceGlitch?: number; 
  forceSingularity?: number; 
  ecoMode?: boolean;
}) {
  const [engineSettings, setEngineSettings] = useState({ density: 0.15, bloom: 1.5, perfMode: ecoMode });
  const [velocity, setVelocity] = useState(0);
  const [warp, setWarp] = useState(forceGlitch);
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    setEngineSettings(prev => ({ ...prev, perfMode: ecoMode }));
    setWarp(forceGlitch); // Link warp to glitch for visual impact
  }, [ecoMode, forceGlitch]);

  useEffect(() => {
    const handleUpdate = (e: any) => setEngineSettings(e.detail);
    window.addEventListener('aether-update', handleUpdate);
    const handleScroll = () => {
      setVelocity(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
       window.removeEventListener('aether-update', handleUpdate);
       window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 5], fov: 75 }} 
        gl={{ antialias: !engineSettings.perfMode, alpha: true }} 
        dpr={engineSettings.perfMode ? [1, 1.5] : [1, 2]}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('--- AETHER ENGINE: WEBGL CONTEXT LOST ---');
          }, false);
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('--- AETHER ENGINE: WEBGL CONTEXT RESTORED ---');
          }, false);
        }}
      >
        <Suspense fallback={null}>
          <SceneManager settings={engineSettings} warp={warp} velocity={velocity} />
        </Suspense>
      </Canvas>
    </div>
  );
}
