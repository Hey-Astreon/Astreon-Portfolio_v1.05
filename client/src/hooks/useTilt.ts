import { useState, useRef, useCallback } from 'react';

export function useTilt(maxTilt = 10) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const tiltX = (y - 0.5) * maxTilt * -1;
    const tiltY = (x - 0.5) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
  }, [maxTilt]);

  const onMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const style = {
    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: 'transform 0.1s ease-out'
  };

  return { ref, onMouseMove, onMouseLeave, style };
}
