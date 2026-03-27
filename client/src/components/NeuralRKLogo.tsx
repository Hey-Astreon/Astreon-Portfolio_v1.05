import React from 'react';
import { motion } from 'framer-motion';

export function NeuralRKLogo() {
  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.1 }}
      style={{ perspective: '1000px' }}
    >
      {/* 3D Tilt Container */}
      <motion.div
        className="relative flex items-center justify-center p-2 rounded-sm border border-[rgba(0,245,255,0.1)] bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-500 group-hover:border-[#00f5ff] group-hover:shadow-[0_0_20px_rgba(0,245,255,0.2)]"
        initial={{ rotateX: 0, rotateY: 0 }}
        whileHover={{ rotateX: 10, rotateY: -10 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Tactical Brackets */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-[#00f5ff] transition-colors duration-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-[#00f5ff] transition-colors duration-500" />

        {/* Nebula RK Signature Image */}
        <motion.div
          className="relative z-10 w-16 h-12 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img 
            src="/nebula-mark.png" 
            alt="RK Nebula Logo" 
            className="w-full h-full object-contain mix-blend-screen drop-shadow-[0_0_15px_rgba(191,148,255,0.6)]"
          />
        </motion.div>

        {/* High-Frequency Glow Pulse */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff]/0 via-[#00f5ff]/5 to-[#bf94ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        {/* Dynamic Scanning Line */}
        <div className="absolute top-0 left-[-100%] w-full h-[1px] bg-[#00f5ff]/40 group-hover:animate-scan-line-fast pointer-events-none" />
      </motion.div>

      {/* Identity Tag (Hidden but appears on desktop hover) */}
       <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <span className="text-[6px] font-mono text-[#00f5ff] uppercase tracking-[0.5em]">Auth_Kernel: RK_v4</span>
       </div>
    </motion.div>
  );
}
