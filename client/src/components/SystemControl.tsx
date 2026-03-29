import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Volume2, 
  Radio, 
  VolumeX, 
  Briefcase, 
  Globe, 
  Cpu, 
  Shield, 
  Terminal,
  ExternalLink,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { useAcousticVoid } from '@/hooks/useAcousticVoid';
import { useMode } from '@/contexts/ModeContext';

export function SystemControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [density, setDensity] = useState(15);
  const [bloom, setBloom] = useState(1.2);
  const [uptime, setUptime] = useState('00:00:00');
  const [vitalData, setVitalData] = useState({ entropy: '0.0012', latency: '12ms', replication: '99.9%' });
  
  const { isPerformanceMode, setIsPerformanceMode, isRecruiterMode, setIsRecruiterMode } = useMode();
  const { isPlaying: audioActive, startAudio, stopAudio, volume, updateVolume } = useAcousticVoid();
  
  const [masterAudio, setMasterAudio] = useState(() => {
    return localStorage.getItem('astra-master-audio') === 'true';
  });

  // Uptime Timer
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
      
      // Randomize Vitals slightly
      setVitalData({
        entropy: (0.001 + Math.random() * 0.0005).toFixed(4),
        latency: (10 + Math.floor(Math.random() * 5)) + 'ms',
        replication: (99.8 + Math.random() * 0.2).toFixed(1) + '%'
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('aether-update', { 
      detail: { density: density / 100, bloom, perfMode: isPerformanceMode } 
    }));
  }, [density, bloom, isPerformanceMode]);

  const toggleMasterAudio = () => {
    const newState = !masterAudio;
    setMasterAudio(newState);
    localStorage.setItem('astra-master-audio', String(newState));
    if (!newState) stopAudio();
  };

  return (
    <div className="fixed left-6 bottom-8 z-[10000] flex items-end gap-4 pointer-events-none">
      {/* Neural Core Trigger */}
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative w-16 h-16 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Holographic Rings */}
        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${isOpen ? 'border-[var(--neon-purple)] scale-110 blur-sm' : 'border-[var(--neon-cyan)] opacity-20 group-hover:opacity-100 group-hover:scale-110 group-hover:blur-sm'}`} />
        <div className={`absolute inset-2 rounded-full border border-dashed transition-all duration-1000 animate-spin-slow ${isOpen ? 'border-[var(--neon-purple)] opacity-60' : 'border-[var(--neon-cyan)] opacity-20'}`} />
        
        {/* Core Orb */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isOpen ? 'bg-[var(--neon-purple)] shadow-[0_0_30px_var(--neon-purple)]' : 'bg-black/60 border border-[var(--neon-cyan)]/30 group-hover:border-[var(--neon-cyan)]'}`}>
          <Cpu className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-[var(--neon-cyan)]'}`} />
        </div>
      </motion.button>

      {/* Main Command Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="pointer-events-auto w-80 bg-[#020205]/95 border border-white/10 rounded-3xl backdrop-blur-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] animate-pulse shadow-[0_0_8px_var(--neon-cyan)]" />
                <h3 className="text-[10px] font-black font-space text-white tracking-[0.3em] uppercase">System_Control_V2</h3>
              </div>
              <div className="px-2 py-0.5 rounded-full border border-[var(--neon-cyan)]/20 bg-[var(--neon-cyan)]/5">
                <span className="text-[8px] font-mono text-[var(--neon-cyan)] uppercase tracking-tighter">Live_Uplink</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Neural Vitals Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Entropy', val: vitalData.entropy, color: 'text-[var(--neon-purple)]' },
                  { label: 'Latency', val: vitalData.latency, color: 'text-[var(--neon-cyan)]' },
                  { label: 'Stability', val: vitalData.replication, color: 'text-green-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1 items-center">
                    <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">{stat.label}</span>
                    <span className={`text-[9px] font-mono font-bold ${stat.color}`}>{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* Execution Bridge */}
              <div className="space-y-3">
                <span className="text-[8px] font-mono text-white/20 tracking-[0.3em] uppercase block">Execution_Bridge</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setIsPerformanceMode(!isPerformanceMode)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${isPerformanceMode ? 'bg-[var(--neon-cyan)]/10 border-[var(--neon-cyan)]/40 text-white' : 'bg-white/5 border-white/10 text-white/40 opacity-60'}`}
                  >
                    <Zap className={`w-4 h-4 ${isPerformanceMode ? 'text-[var(--neon-cyan)]' : 'text-white'}`} />
                    <span className="text-[9px] font-mono uppercase tracking-widest">Overclock</span>
                  </button>
                  <button 
                    onClick={() => setIsRecruiterMode(!isRecruiterMode)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${isRecruiterMode ? 'bg-[var(--neon-gold)]/10 border-[var(--neon-gold)]/40 text-white' : 'bg-white/5 border-white/10 text-white/40 opacity-60'}`}
                  >
                    <Briefcase className={`w-4 h-4 ${isRecruiterMode ? 'text-[var(--neon-gold)]' : 'text-white'}`} />
                    <span className="text-[9px] font-mono uppercase tracking-widest">Focus_UX</span>
                  </button>
                </div>
              </div>

              {/* Graphical Synthesis */}
              <div className="space-y-4">
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className="flex justify-between items-center text-[8px] font-mono mb-1">
                      <span className="text-white/40 uppercase tracking-widest">Aether_Density</span>
                      <span className="text-[var(--neon-purple)]">{density}%</span>
                   </div>
                   <input 
                      type="range" min="0" max="100" value={density} 
                      onChange={(e) => setDensity(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--neon-purple)]"
                   />
                   <div className="flex justify-between items-center text-[8px] font-mono pt-1">
                      <span className="text-white/40 uppercase tracking-widest">Lumen_Bloom</span>
                      <span className="text-[var(--neon-purple)]">{bloom}x</span>
                   </div>
                   <input 
                      type="range" min="0" max="3" step="0.1" value={bloom} 
                      onChange={(e) => setBloom(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--neon-purple)]"
                   />
                </div>
              </div>

              {/* Acoustic Void Control */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => audioActive ? stopAudio() : startAudio()}
                    className={`p-2 rounded-xl border transition-all ${audioActive ? 'bg-[var(--neon-cyan)]/20 border-[var(--neon-cyan)]/40 text-[var(--neon-cyan)]' : 'bg-white/10 border-white/10 text-white/20'}`}
                  >
                    <Radio className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-white/80 uppercase">Acoustic_Void</span>
                    <span className="text-[7px] font-mono text-white/20 tracking-widest uppercase">Null_Field_Gen</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={volume} 
                  onChange={(e) => updateVolume(Number(e.target.value))}
                  className={`w-16 h-0.5 rounded-full appearance-none cursor-pointer accent-[var(--neon-cyan)] bg-white/10 ${!audioActive && 'opacity-20 pointer-events-none'}`}
                />
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="p-4 bg-white/[0.03] border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-3 h-3 text-white/20" />
                <span className="text-[8px] font-mono text-white/40 tracking-widest uppercase">Uptime: {uptime}</span>
              </div>
              <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
                 <span className="text-[7px] font-mono text-white/30 uppercase tracking-tighter">Node_Secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
