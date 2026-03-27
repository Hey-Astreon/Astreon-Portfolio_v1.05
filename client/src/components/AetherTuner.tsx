import { useState, useEffect } from 'react';
import { Sliders, Zap, Activity, Volume2, Shield, Radio, Mic2, VolumeX, Briefcase } from 'lucide-react';
import { useAstraVoice } from '@/hooks/useAstraVoice';
import { useAcousticVoid } from '@/hooks/useAcousticVoid';
import { useMode } from '@/contexts/ModeContext';
import gsap from 'gsap';

export function AetherTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [density, setDensity] = useState(15); // Percentage
  const [bloom, setBloom] = useState(1.2);
  const { isPerformanceMode, setIsPerformanceMode, isRecruiterMode, setIsRecruiterMode } = useMode();
  const { enabled: voiceEnabled, toggleVoice } = useAstraVoice();
  const { isPlaying: audioActive, startAudio, stopAudio, volume, updateVolume } = useAcousticVoid();
  
  // Master Audio Toggle (Muted by default)
  const [masterAudio, setMasterAudio] = useState(() => {
    return localStorage.getItem('astra-master-audio') === 'true'; // Defaults to false
  });

  const toggleMasterAudio = () => {
    const newState = !masterAudio;
    setMasterAudio(newState);
    localStorage.setItem('astra-master-audio', String(newState));
    if (!newState) {
       stopAudio();
    }
  };

  const toggleHUD = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Broadcast changes to the Aether Engine
    window.dispatchEvent(new CustomEvent('aether-update', { 
      detail: { density: density / 100, bloom, perfMode: isPerformanceMode } 
    }));
  }, [density, bloom, isPerformanceMode]);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[10000] flex items-center gap-4">
      {/* Trigger */}
      <button 
        onClick={toggleHUD}
        className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[var(--neon-purple)] border-white shadow-[0_0_20px_var(--neon-purple)] text-white' : 'bg-black/80 border-[var(--neon-purple)]/40 text-[var(--neon-purple)] hover:border-[var(--neon-purple)]'}`}
      >
        <Sliders className={`w-6 h-6 ${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-500`} />
      </button>

      {/* Main HUD Panel */}
      <div className={`flex flex-col gap-6 p-6 bg-[#020205]/95 border border-[var(--neon-purple)]/30 rounded-2xl backdrop-blur-3xl transition-all duration-700 transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0 pointer-events-none'}`} style={{ width: '280px' }}>
        <div className="flex items-center justify-between border-b border-[var(--neon-purple)]/20 pb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[var(--neon-cyan)] animate-pulse" />
            <h3 className="text-xs font-black font-space text-white tracking-widest uppercase">System Control</h3>
          </div>
          <span className="text-[8px] font-mono text-[var(--neon-cyan)]/60 tracking-tighter uppercase">V6.0_STABLE</span>
        </div>

        {/* Master Mute Protocol */}
        <button 
          onClick={toggleMasterAudio}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${masterAudio ? 'bg-[var(--neon-cyan)]/10 border-[var(--neon-cyan)]/30 text-white' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${masterAudio ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]' : 'bg-red-500/20 text-red-500 animate-pulse'}`}>
              {masterAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest">{masterAudio ? 'Audio_Link_Active' : 'Acoustic_Mute_ON'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-1 transition-colors ${masterAudio ? 'bg-[var(--neon-cyan)]' : 'bg-red-500/40'}`}>
             <div className={`w-2 h-2 bg-white rounded-full transition-transform ${masterAudio ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className={`space-y-4 transition-all duration-500 ${masterAudio ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          {/* Modes Section */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
             <span className="text-[9px] font-mono text-white/30 tracking-[0.2em] uppercase block mb-1">Execution_Modes</span>
             
             {/* Perf Mode */}
             <button 
                onClick={() => setIsPerformanceMode(!isPerformanceMode)}
                className="w-full flex items-center justify-between group transition-all"
             >
                <div className="flex items-center gap-2">
                  <Zap className={`w-3 h-3 ${isPerformanceMode ? 'text-[var(--neon-cyan)] shadow-[0_0_5px_var(--neon-cyan)]' : 'text-white/20'}`} />
                  <span className="text-[10px] font-mono text-white/80 uppercase">Boost_Perf</span>
                </div>
                <div className={`w-7 h-3 rounded-full p-0.5 transition-colors ${isPerformanceMode ? 'bg-[var(--neon-cyan)]' : 'bg-white/10'}`}>
                   <div className={`w-2 h-2 bg-white rounded-full transition-transform ${isPerformanceMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
             </button>

             {/* Recruiter Mode */}
             <button 
                onClick={() => setIsRecruiterMode(!isRecruiterMode)}
                className="w-full flex items-center justify-between group transition-all"
             >
                <div className="flex items-center gap-2">
                  <Briefcase className={`w-3 h-3 ${isRecruiterMode ? 'text-[var(--neon-gold)] shadow-[0_0_5px_var(--neon-gold)]' : 'text-white/20'}`} />
                  <span className="text-[10px] font-mono text-white/80 uppercase">Recruiter_UX</span>
                </div>
                <div className={`w-7 h-3 rounded-full p-0.5 transition-colors ${isRecruiterMode ? 'bg-[var(--neon-gold)]' : 'bg-white/10'}`}>
                   <div className={`w-2 h-2 bg-white rounded-full transition-transform ${isRecruiterMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
             </button>
          </div>

          {/* Graphical Calibration */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-white/40 uppercase">Nebula_Density</span>
                <span className="text-[10px] font-mono text-[var(--neon-purple)]">{density}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={density} 
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full h-1 bg-[var(--neon-purple)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--neon-purple)]"
              />
            </div>
  
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-white/40 uppercase">Chroma_Bloom</span>
                <span className="text-[10px] font-mono text-[var(--neon-purple)]">{bloom}x</span>
              </div>
              <input 
                type="range" 
                min="0" max="3" step="0.1"
                value={bloom} 
                onChange={(e) => setBloom(Number(e.target.value))}
                className="w-full h-1 bg-[var(--neon-purple)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--neon-purple)]"
              />
            </div>
          </div>
  
          {/* System Links */}
          <div className="flex gap-2">
            <button 
              onClick={toggleVoice}
              className={`flex-1 p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${voiceEnabled ? 'bg-[var(--neon-purple)]/10 border-[var(--neon-purple)]/40 text-[var(--neon-purple)]' : 'bg-white/5 border-white/10 text-white/30'}`}
            >
              <Mic2 className="w-3 h-3" />
              <span className="text-[8px] font-mono uppercase">Voice</span>
            </button>
            <button 
              onClick={() => audioActive ? stopAudio() : startAudio()}
              className={`flex-1 p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${audioActive ? 'bg-[var(--neon-cyan)]/10 border-[var(--neon-cyan)]/40 text-[var(--neon-cyan)]' : 'bg-white/5 border-white/10 text-white/30'}`}
            >
              <Volume2 className="w-3 h-3" />
              <span className="text-[8px] font-mono uppercase">Void</span>
            </button>
          </div>

          {/* Global Volume */}
          <div className={`space-y-2 pt-2 transition-opacity ${audioActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={volume} 
              onChange={(e) => updateVolume(Number(e.target.value))} 
              className="w-full h-0.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--neon-cyan)]"
            />
          </div>
        </div>

        {/* Status Metrics */}
        <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
           <div className="flex justify-between items-center text-[7px] font-mono text-white/20 tracking-[0.3em] uppercase">
             <span>SYS_REPLICATION: STABLE</span>
             <span>{Math.round(density * 0.4)} GFLOPs</span>
           </div>
           <div className="w-full h-0.5 bg-white/5 overflow-hidden">
             <div className="w-1/3 h-full bg-[var(--neon-cyan)] animate-progress-glow" />
           </div>
        </div>
      </div>
    </div>
  );
}
