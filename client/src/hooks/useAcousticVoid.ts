import { useEffect, useRef, useState, useCallback } from 'react';

export function useAcousticVoid() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem('astra-audio-volume')) || 0.3;
  });

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    console.log('--- ACOUSTIC VOID: INITIALIZING AUDIO CONTEXT ---');

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Drone Oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime); // 80Hz - Clear "hum/drone" range
    oscillatorRef.current = osc;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime);
    filterRef.current = filter;

    // LFO for filter modulation (Nebula shimmer)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(100, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfoRef.current = lfo;

    // Connect chain
    osc.connect(filter);
    filter.connect(masterGain);

    osc.start();
    lfo.start();
  }, []);

  const startAudio = useCallback(() => {
    if (!audioContextRef.current) initAudio();
    if (audioContextRef.current?.state === 'suspended') {
      console.log('--- ACOUSTIC VOID: RESUMING SUSPENDED CONTEXT ---');
      audioContextRef.current.resume();
    }
    
    console.log(`--- ACOUSTIC VOID: STARTING AT VOLUME ${volume} ---`);
    
    // Significantly boosted gain staging
    masterGainRef.current?.gain.setTargetAtTime(volume * 0.8, audioContextRef.current!.currentTime, 0.5); 
    setIsPlaying(true);
  }, [initAudio, volume]);

  const stopAudio = useCallback(() => {
    masterGainRef.current?.gain.setTargetAtTime(0, audioContextRef.current!.currentTime, 1);
    setIsPlaying(false);
  }, []);

  const updateVolume = useCallback((val: number) => {
    setVolume(val);
    localStorage.setItem('astra-audio-volume', String(val));
    if (isPlaying && masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.setTargetAtTime(val * 0.8, audioContextRef.current.currentTime, 0.2);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { isPlaying, startAudio, stopAudio, volume, updateVolume };
}
