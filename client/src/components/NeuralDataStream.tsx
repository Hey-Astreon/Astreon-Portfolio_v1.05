import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import axios from "axios";

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: any;
  created_at: string;
}

const vertexShader = `
  varying vec2 vUv;
  varying float vOpacity;
  uniform float uTime;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aOpacity;

  void main() {
    vUv = uv;
    vOpacity = aOpacity;
    
    vec3 pos = position;
    // Vertical stream motion
    pos.y = mod(pos.y - uTime * aSpeed + aOffset + 10.0, 20.0) - 10.0;
    
    // Subtle horizontal sway
    pos.x += sin(uTime * 0.5 + aOffset) * 0.2;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 4.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vOpacity;
  uniform vec3 uColor;
  uniform float uTime;

  void main() {
    // Sparkle effect
    float sparkle = Math.sin(uTime * 10.0 + vOpacity * 100.0) * 0.5 + 0.5;
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 3.0);
    
    vec3 color = uColor * (0.8 + sparkle * 0.2);
    gl_FragColor = vec4(color, strength * vOpacity * 0.6);
  }
`;

export function NeuralDataStream() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const pointsRef = useRef<THREE.Points>(null);
  const COUNT = 1000;

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get("/api/github/activity");
        setEvents(res.data);
      } catch (e) {
        console.error("Failed to fetch GitHub activity for stream", e);
      }
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const { positions, speeds, offsets, opacities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    const off = new Float32Array(COUNT);
    const opc = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Randomly distributed in a column
      pos[i * 3 + 0] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 10;

      spd[i] = 0.5 + Math.random() * 1.5;
      off[i] = Math.random() * 20;
      opc[i] = 0.1 + Math.random() * 0.5;
    }
    return { positions: pos, speeds: spd, offsets: off, opacities: opc };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#bf94ff") }
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={COUNT}
          array={speeds}
          itemSize={1}
          args={[speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          count={COUNT}
          array={offsets}
          itemSize={1}
          args={[offsets, 1]}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          count={COUNT}
          array={opacities}
          itemSize={1}
          args={[opacities, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </points>
  );
}
