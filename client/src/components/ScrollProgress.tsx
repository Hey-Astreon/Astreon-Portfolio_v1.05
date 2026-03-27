import { useEffect, useRef } from 'react';

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let requestRef: number;
    
    const updateProgress = () => {
      if (!progressRef.current) return;
      
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? scrollY / height : 0;
      
      // GPU accelerated transform instead of width
      progressRef.current.style.transform = `scaleX(${progress})`;
      
      requestRef = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    
    return () => {
      cancelAnimationFrame(requestRef);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-[10001] pointer-events-none">
      <div 
        ref={progressRef}
        className="h-full bg-gradient-to-r from-[#e91e8c] to-[#00f5ff] origin-left will-change-transform"
        style={{ 
          width: '100%',
          transform: 'scaleX(0)',
          boxShadow: '0 0 10px rgba(233, 30, 140, 0.5), 0 0 20px rgba(0, 245, 255, 0.3)'
        }}
      />
    </div>
  );
}
