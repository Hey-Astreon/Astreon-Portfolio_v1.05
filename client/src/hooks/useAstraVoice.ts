import { useState, useCallback, useEffect } from 'react';

export function useAstraVoice() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('astra-voice-enabled') === 'true';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
      console.log('--- ASTRA VOICE SYSTEM SUPPORTED ---');
      
      // Load voices immediately and on change
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) console.log(`--- ASTRA VOICE: ${v.length} VOICES LOADED ---`);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('--- ASTRA VOICE: SYSTEM NOT SUPPORTED ON THIS BROWSER ---');
      return;
    }
    if (!enabled) {
      console.log('--- ASTRA VOICE: TRANSMISSION BLOCKED (LOCAL PROTOCOL DISABLED) ---');
      return;
    }

    const masterEnabled = localStorage.getItem('astra-master-audio') === 'true';
    if (!masterEnabled) {
      console.log('--- ASTRA VOICE: TRANSMISSION BLOCKED (MASTER MUTE ACTIVE) ---');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose a professional robotic/system voice if available
    const voices = window.speechSynthesis.getVoices();
    const systemVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Samantha') || v.lang === 'en-US');
    if (systemVoice) utterance.voice = systemVoice;

    utterance.pitch = 0.8; // Lower pitch for "system" feel
    utterance.rate = 1.1;  // Slightly faster for modern AI feel
    utterance.volume = 1.0; // Max volume for debug

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('--- ASTRA TRANSMISSION: STARTING ---');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('--- ASTRA TRANSMISSION: COMPLETED ---');
    };
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      console.error('--- ASTRA TRANSMISSION: ERROR ---', e);
    };

    console.log(`--- ASTRA SPEAKING: "${text.substring(0, 30)}..." ---`);
    window.speechSynthesis.speak(utterance);
  }, [isSupported, enabled]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const toggleVoice = useCallback(() => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem('astra-voice-enabled', String(newState));
    
    if (newState && isSupported) {
      // Immediate feedback
      setTimeout(() => {
        speak("Astra voice protocol synchronized. Neural link active.");
      }, 100);
    }
  }, [enabled, isSupported, speak]);

  return { speak, stop, isSpeaking, isSupported, enabled, toggleVoice };
}
