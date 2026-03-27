import { useState, useEffect } from 'react';
import { Sliders, Zap, Activity, Volume2, Shield, Radio, Mic2, VolumeX } from 'lucide-react';
import { useAstraVoice } from '@/hooks/useAstraVoice';
import { useAcousticVoid } from '@/hooks/useAcousticVoid';
import gsap from 'gsap';

export function AetherTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [density, setDensity] = useState(15); // Percentage
  const [bloom, setBloom] = useState(1.5);
  const [perfMode, setPerfMode] = useState(true);
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
      detail: { density: density / 100, bloom, perfMode } 
    }));
  }, [density, bloom, perfMode]);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[10000] flex items-center gap-4">
      {/* Trigger */}
      <button 
        onClick={toggleHUD}
        className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[#bf94ff] border-white shadow-[0_0_20px_#bf94ff] text-white' : 'bg-black/80 border-[#bf94ff]/40 text-[#bf94ff] hover:border-[#bf94ff]'}`}
      >
        <Sliders className={`w-6 h-6 ${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-500`} />
      </button>

      {/* Main HUD Panel */}
      <div className={`flex flex-col gap-6 p-6 bg-black/90 border border-[#bf94ff]/30 rounded-2xl backdrop-blur-2xl transition-all duration-700 transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0 pointer-events-none'}`} style={{ width: '280px' }}>
        <div className="flex items-center justify-between border-b border-[#bf94ff]/20 pb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00f5ff] animate-pulse" />
            <h3 className="text-xs font-black font-orbitron text-white tracking-widest uppercase">Aether Tuner</h3>
          </div>
          <span className="text-[8px] font-mono text-[#00f5ff]/60 tracking-tighter">V5.0_CALIBRATION</span>
        </div>

        {/* Master Mute Protocol */}
        <button 
          onClick={toggleMasterAudio}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${masterAudio ? 'bg-[#00f5ff]/10 border-[#00f5ff]/30 text-white' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${masterAudio ? 'bg-[#00f5ff]/20 text-[#00f5ff]' : 'bg-red-500/20 text-red-500 animate-pulse'}`}>
              {masterAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest">{masterAudio ? 'Audio_Link_Active' : 'Acoustic_Mute_Enabled'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-1 transition-colors ${masterAudio ? 'bg-[#00f5ff]' : 'bg-red-500/40'}`}>
             <div className={`w-2 h-2 bg-white rounded-full transition-transform ${masterAudio ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className={`space-y-6 transition-all duration-500 ${masterAudio ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          {/* Controls */}
          <div className="space-y-6">
            {/* Density */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Nebula_Density</span>
                <span className="text-[10px] font-mono text-[#bf94ff]">{density}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={density} 
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full h-1 bg-[#bf94ff]/10 rounded-lg appearance-none cursor-pointer accent-[#bf94ff]"
              />
            </div>
  
            {/* Bloom */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Celestial_Bloom</span>
                <span className="text-[10px] font-mono text-[#bf94ff]">{bloom}x</span>
              </div>
              <input 
                type="range" 
                min="0" max="5" step="0.1"
                value={bloom} 
                onChange={(e) => setBloom(Number(e.target.value))}
                className="w-full h-1 bg-[#bf94ff]/10 rounded-lg appearance-none cursor-pointer accent-[#bf94ff]"
              />
            </div>
  
            {/* Perf Mode */}
            <button 
              onClick={() => setPerfMode(!perfMode)}
              className="w-full group flex items-center justify-between p-3 rounded-xl border border-[#bf94ff]/10 bg-white/5 hover:border-[#00f5ff]/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${perfMode ? 'bg-[#00f5ff]/20 text-[#00f5ff]' : 'bg-white/5 text-white/40'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Max_Perf</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-1 transition-colors ${perfMode ? 'bg-[#00f5ff]' : 'bg-white/10'}`}>
                 <div className={`w-2 h-2 bg-white rounded-full transition-transform ${perfMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
  
            {/* Voice Protocol */}
            <button 
              onClick={toggleVoice}
              className="w-full group flex items-center justify-between p-3 rounded-xl border border-[#bf94ff]/10 bg-white/5 hover:border-[#bf94ff]/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${voiceEnabled ? 'bg-[#bf94ff]/20 text-[#bf94ff]' : 'bg-white/5 text-white/40'}`}>
                  <Mic2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Voice_Link</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-1 transition-colors ${voiceEnabled ? 'bg-[#bf94ff]' : 'bg-white/10'}`}>
                 <div className={`w-2 h-2 bg-white rounded-full transition-transform ${voiceEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
  
            {/* Acoustic Void */}
            <button 
              onClick={() => audioActive ? stopAudio() : startAudio()}
              className="w-full group flex items-center justify-between p-3 rounded-xl border border-[#bf94ff]/10 bg-white/5 hover:border-[#6c5ce7]/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${audioActive ? 'bg-[#6c5ce7]/20 text-[#a29bfe]' : 'bg-white/5 text-white/40'}`}>
                  <Volume2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Acoustic_Void</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-1 transition-colors ${audioActive ? 'bg-[#6c5ce7]' : 'bg-white/10'}`}>
                 <div className={`w-2 h-2 bg-white rounded-full transition-transform ${audioActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
  
            {/* Global Volume */}
            <div className={`space-y-3 transition-opacity ${audioActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Calibration_Gain</span>
                <span className="text-[10px] font-mono text-[#a29bfe]">{Math.round(volume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(e) => updateVolume(Number(e.target.value))} 
                className="w-full h-1 bg-[#6c5ce7]/10 rounded-lg appearance-none cursor-pointer accent-[#a29bfe]"
              />
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
           <div className="flex justify-between items-center text-[7px] font-mono text-white/20 uppercase tracking-[0.2em]">
             <span>SYSTEM_LOAD: 3.2%</span>
             <span>STABLE_REPLICATION</span>
           </div>
           <div className="w-full h-0.5 bg-white/5 overflow-hidden">
             <div className="w-1/3 h-full bg-[#00f5ff] animate-progress-glow" />
           </div>
        </div>
      </div>
    </div>
  );
}
