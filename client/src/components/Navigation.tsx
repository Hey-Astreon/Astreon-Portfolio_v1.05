import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Github, Linkedin, Menu, X } from 'lucide-react';
import { NeuralRKLogo } from '@/components/NeuralRKLogo';
import Magnetic from '@/components/Magnetic';
import { useMode } from '@/contexts/ModeContext';

gsap.registerPlugin(ScrollToPlugin);

export function Navigation() {
  const { isRecruiterMode } = useMode();
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    if (isRecruiterMode) {
      gsap.to(navRef.current, {
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)',
        borderBottomColor: isScrolled ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0)',
        duration: 0.4,
      });
    } else {
      gsap.to(navRef.current, {
        backgroundColor: isScrolled ? 'rgba(2, 2, 5, 0.8)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
        borderBottomColor: isScrolled ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 0, 0, 0)',
        duration: 0.4,
      });
    }
  }, [isScrolled, isRecruiterMode]);

  const scrollToSection = (id: string) => {
    if (!isRecruiterMode) {
      window.dispatchEvent(new CustomEvent('stellar-warp', { detail: { duration: 1.2 } }));
    }

    const element = document.getElementById(id);
    if (element) {
      gsap.to(window, {
        scrollTo: { y: element, offsetY: 80 },
        duration: 1.5,
        ease: isRecruiterMode ? 'power3.inOut' : 'expo.inOut',
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-[100] py-4 px-4 md:px-8 transition-all duration-300 border-b border-transparent ${isRecruiterMode ? 'text-black' : 'text-[#e5e4e2]'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NeuralRKLogo />

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10">
          {[
            { label: 'Projects', id: 'projects' },
            { label: 'Education', id: 'education' },
            { label: 'Contact', id: 'contact' },
          ].map((item) => (
            <Magnetic key={item.id} strength={0.15}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] font-space relative group p-2 transition-colors ${
                  isRecruiterMode ? 'hover:text-[var(--neon-purple)]' : 'hover:text-[var(--neon-cyan)]'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${
                  isRecruiterMode ? 'bg-[var(--neon-purple)]' : 'bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]'
                }`}></span>
              </button>
            </Magnetic>
          ))}
        </div>

        {/* Desktop Social Links */}
        <div className="hidden md:flex gap-4 items-center">
          <a
            href="https://github.com/Hey-Astreon"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 transition-all rounded-full ${
              isRecruiterMode 
              ? 'hover:bg-black hover:text-white border border-black/5' 
              : 'hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 border border-white/5'
            }`}
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/roushan-kumar-ab4b19250/"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 transition-all rounded-full ${
              isRecruiterMode 
              ? 'hover:bg-black hover:text-white border border-black/5' 
              : 'hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 border border-white/5'
            }`}
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-full left-0 right-0 p-8 shadow-2xl border-t animate-in slide-in-from-top duration-300 ${
          isRecruiterMode ? 'bg-white border-black/5 text-black' : 'bg-[#020205] border-[var(--neon-cyan)]/20 text-white'
        }`}>
          <div className="flex flex-col gap-6">
            {[
              { label: 'Projects', id: 'projects' },
              { label: 'Education', id: 'education' },
              { label: 'Contact', id: 'contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-2xl font-black uppercase tracking-tighter text-left py-2 font-space"
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-4 pt-6">
              <a href="https://github.com/Hey-Astreon" target="_blank" rel="noopener noreferrer" className="p-4 border border-current rounded-xl"><Github className="w-6 h-6" /></a>
              <a href="https://www.linkedin.com/in/roushan-kumar-ab4b19250/" target="_blank" rel="noopener noreferrer" className="p-4 border border-current rounded-xl"><Linkedin className="w-6 h-6" /></a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
