import { useRef, useState, useEffect, ReactNode } from 'react';
import gsap from 'gsap';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  range?: number;
}

export default function Magnetic({ children, strength = 0.5, range = 80 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = element.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const distanceX = clientX - centerX;
      const distanceY = clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < range) {
        // Significantly boosted strength for better visibility (doubled the force)
        xTo(distanceX * strength * 2); 
        yTo(distanceY * strength * 2);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength, range]);

  return (
    <div ref={ref} className="inline-block transition-transform duration-300">
      {children}
    </div>
  );
}
