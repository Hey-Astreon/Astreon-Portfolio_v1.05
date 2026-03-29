import * as THREE from 'three';
import { AdditiveBlending } from 'three';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ASTRA_SYSTEM_PROMPT, ASTRA_QUICK_CHIPS } from '@/data/astraData';
import { X, Send, Copy, Check, ChevronDown, Sparkles, Brain, Cpu, ShieldCheck, Rocket, FileText, MessageCircle, Briefcase } from 'lucide-react';
import gsap from 'gsap';
import { useIsMobile } from '@/hooks/useMobile';
import { useMode } from '@/contexts/ModeContext';
import { Canvas, useFrame } from '@react-three/fiber';

// --- Types ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

// --- Constants ---
const MAX_REQUESTS_PER_DAY = 1200;
const SESSION_CACHE_KEY_PREFIX = 'astra_cache_v3_';
const USAGE_TRACKER_KEY = 'astra_usage_tracker_v3';

// --- Reactive Lifeform Core (v3.0 - Optimized) ---
const ReactiveAstraCore = ({ isOpen, globalMouse, isMobile, isPerformanceMode }: { isOpen: boolean, globalMouse: React.MutableRefObject<THREE.Vector2>, isMobile: boolean, isPerformanceMode: boolean }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const shellRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (isPerformanceMode) return;
    const t = state.clock.elapsedTime;
    const mousePos = globalMouse.current;

    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mousePos.y * 0.3, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mousePos.x * 0.3, 0.1);
    }

    if (shellRef.current) {
      shellRef.current.rotation.y = t * 0.5;
    }
    
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.1;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  if (isPerformanceMode) {
    return (
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.8} />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight intensity={2} color="#00f5ff" distance={5} />
      </mesh>
      
      <mesh ref={shellRef} scale={1.4}>
        <icosahedronGeometry args={[0.25, 1]} />
        <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.3} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
};

const AstraLogo = ({ isOpen }: { isOpen: boolean }) => {
  const { isPerformanceMode } = useMode();
  const globalMouse = useRef(new THREE.Vector2(0, 0));
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      globalMouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  return (
    <div className={`relative ${isMobile ? 'w-12 h-12' : 'w-16 h-16'} flex items-center justify-center cursor-pointer pointer-events-auto group`}>
      <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10`}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ alpha: true }}
          style={{ pointerEvents: 'none' }}
        >
          <ReactiveAstraCore isOpen={isOpen} globalMouse={globalMouse} isMobile={isMobile} isPerformanceMode={isPerformanceMode} />
        </Canvas>
      </div>
  
      {!isOpen && (
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#00f5ff] rounded-full border border-black shadow-[0_0_8px_#00f5ff] z-20 animate-pulse" />
      )}
    </div>
  );
};

export function AstraAssistant() {
  const { isAstraOpen: isOpen, setIsAstraOpen: setIsOpen, isPerformanceMode, isRecruiterMode } = useMode();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Greetings. I am **ASTRA**. I can provide technical intel on Roushan's architecture or provide his resume. How shall we proceed?",
    id: 'welcome',
  }]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const handleAction = (type: string) => {
    switch(type) {
      case 'projects':
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
        break;
      case 'contact':
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
        break;
      case 'resume':
        const link = document.createElement('a');
        link.href = '/resume.pdf';
        link.download = 'Roushan_Kumar_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
    }
  };

  const getUsage = () => {
    const data = localStorage.getItem(USAGE_TRACKER_KEY);
    if (!data) return { count: 0, date: new Date().toDateString() };
    const parsed = JSON.parse(data);
    return parsed.date !== new Date().toDateString() ? { count: 0, date: new Date().toDateString() } : parsed;
  };

  const incrementUsage = () => {
    const usage = getUsage();
    localStorage.setItem(USAGE_TRACKER_KEY, JSON.stringify({ count: usage.count + 1, date: usage.date }));
  };

  const sendMessage = useCallback(async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isStreaming) return;

    const usage = getUsage();
    if (usage.count >= MAX_REQUESTS_PER_DAY) {
      setMessages(prev => [...prev, 
        { role: 'user', content: trimmed, id: Date.now().toString() },
        { role: 'assistant', content: "⚠️ **Daily Limit Reached**.", id: (Date.now() + 1).toString() }
      ]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: trimmed, id: Date.now().toString() }]);
    setInput('');
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantId }]);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "ERROR: API Key missing." } : m));
      setIsStreaming(false);
      return;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [
            { role: 'system', content: ASTRA_SYSTEM_PROMPT },
            ...messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: trimmed }
          ],
          stream: true,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              fullContent += content;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + content } : m));
            } catch (e) {}
          }
        }
      }
      incrementUsage();
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "⚠️ Neural Node unreachable." } : m));
    }
    setIsStreaming(false);
  }, [messages, isStreaming]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isRecruiterMode) return null;

  return (
    <>
      {/* Trigger */}
      <div className={`fixed ${isMobile ? 'bottom-6 right-6 scale-90' : 'bottom-8 right-8'} z-[9999] flex flex-col items-end gap-3`}>
        {!isOpen && !isMobile && (
          <div className="px-3 py-1 bg-black/80 border border-[var(--neon-cyan)]/30 rounded-full text-[9px] font-mono text-[var(--neon-cyan)] uppercase tracking-[0.2em] backdrop-blur-md shadow-lg">
            Astra Active
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-1 rounded-full border-2 transition-all duration-500 scale-hover ${isOpen ? 'border-[var(--neon-purple)] bg-black' : 'border-[var(--neon-cyan)] bg-black'}`}
          style={{ boxShadow: isOpen ? '0 0 30px rgba(138, 43, 226, 0.3)' : '0 0 20px rgba(0, 245, 255, 0.2)' }}
        >
          {isOpen ? <X className="w-10 h-10 text-[var(--neon-purple)] p-2" /> : <AstraLogo isOpen={isOpen} />}
        </button>
      </div>

      {/* Interface Panel */}
      {isOpen && (
        <div className={`fixed ${isMobile ? 'inset-0 z-[10000] rounded-none' : 'bottom-28 right-8 w-96 h-[600px] rounded-3xl'} bg-[#020205]/98 border border-white/10 z-[9998] flex flex-col shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-5`}>
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--neon-cyan)]/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-[var(--neon-cyan)]" />
              </div>
              <h3 className="text-sm font-black font-space text-white tracking-widest uppercase">ASTRA ASSISTANT</h3>
            </div>
            {isMobile && <button onClick={() => setIsOpen(false)}><X className="w-6 h-6 text-white/40" /></button>}
          </div>

          {/* Quick Action Toolkit */}
          <div className="p-3 bg-white/5 flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
            <button onClick={() => handleAction('projects')} className="chip-action leading-none"><Rocket className="w-3 h-3" /> Projects</button>
            <button onClick={() => handleAction('resume')} className="chip-action leading-none"><FileText className="w-3 h-3" /> Resume</button>
            <button onClick={() => handleAction('contact')} className="chip-action leading-none"><MessageCircle className="w-3 h-3" /> Contact</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] md:text-xs leading-relaxed ${
                  msg.role === 'user' ? 'bg-[var(--neon-purple)]/20 text-white border border-[var(--neon-purple)]/30' : 'bg-white/5 text-white/80 border border-white/5'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content || '...'}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-white/5">
            <div className="relative flex items-center gap-2 bg-white/5 rounded-2xl p-2 border border-white/10 focus-within:border-[var(--neon-cyan)]/40 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask Astra..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-white text-xs p-2 resize-none font-mono"
              />
              <button 
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className={`p-2 rounded-xl transition-all ${input.trim() ? 'bg-[var(--neon-cyan)] text-black' : 'bg-white/10 text-white/20'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chip-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.7rem;
          white-space: nowrap;
          transition: all 0.3s;
        }
        .chip-action:hover {
          background: var(--neon-cyan);
          color: black;
          border-color: var(--neon-cyan);
        }
      `}</style>
    </>
  );
}
