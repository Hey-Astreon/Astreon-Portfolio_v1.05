import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { use3DScroll, useStaggerChildren, useCounterAnimation } from '@/hooks/use3DScroll';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HolographicCard } from '@/components/HolographicCard';
import { SplitTextGlow } from '@/components/SplitTextGlow';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Github, Linkedin, Mail, Code, Zap, Award, ArrowRight, Sparkles, MessageSquare, Briefcase } from 'lucide-react';
import { ScrambleText } from '@/components/ScrambleText';
import { NeuralContactForm } from '@/components/NeuralContactForm';
import { NeuralNexusSocials } from '@/components/NeuralNexusSocials';
import { GitHubActivityCard } from '@/components/GitHubActivityCard';
import { ResumeScanModal } from '@/components/ResumeScanModal';
import { useIsMobile } from '@/hooks/useMobile';
import { useMode } from '@/contexts/ModeContext';

// Lazy-Uplink: Heavy Graphical & Interactive Modules
const CombinedScene = lazy(() => import('@/components/CombinedScene').then(m => ({ default: m.CombinedScene })));
const NeuralTimeline = lazy(() => import('@/components/NeuralTimeline').then(m => ({ default: m.NeuralTimeline })));
const TacticalArsenal = lazy(() => import('@/components/TacticalArsenal').then(m => ({ default: m.TacticalArsenal })));
const VolumetricAvatar = lazy(() => import('@/components/VolumetricAvatar').then(m => ({ default: m.VolumetricAvatar })));


function HeroSection() {
  const { isPerformanceMode, isRecruiterMode } = useMode();
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      gsap.to(window, {
        scrollTo: { y: element, offsetY: 80 },
        duration: 1.5,
        ease: 'power3.inOut',
      });
    }
  };

  useEffect(() => {
    if (isPerformanceMode || isRecruiterMode) return;
    if (!titleGroupRef.current || !subtitleRef.current || !descRef.current || !ctaRef.current || !badgeRef.current) return;

    const tl = gsap.timeline({ delay: 0.5 });

    tl.fromTo(badgeRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.5)' })
      .fromTo(titleGroupRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, "-=0.4")
      .fromTo(subtitleRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, "-=0.8")
      .fromTo(descRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, "-=0.6")
      .fromTo(ctaRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, "-=0.4");
  }, [isPerformanceMode, isRecruiterMode]);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className={`relative z-10 flex flex-col ${isRecruiterMode ? 'items-center text-center' : 'lg:flex-row items-center gap-12'} max-w-7xl mx-auto px-6 py-20`}>
        
        {/* Volumetric Avatar - Hidden in Recruiter mode or on scroll focus */}
        {!isRecruiterMode && (
          <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] lg:-mr-12 group avatar-container transition-opacity duration-1000">
            {!isPerformanceMode && (
              <Suspense fallback={<div className="w-full h-full bg-white/5 animate-pulse rounded-full" />}>
                <VolumetricAvatar />
              </Suspense>
            )}
            
            {/* Floating HUD accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-[var(--neon-purple)]/10 rounded-full animate-spin-slow pointer-events-none" />
          </div>
        )}

        {/* Hero Content */}
        <div className={`${isRecruiterMode ? 'text-center' : 'text-center lg:text-left'} max-w-3xl`}>
          {!isRecruiterMode && (
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-[var(--neon-purple)] bg-[rgba(138,43,226,0.1)] text-[var(--neon-cyan)] mb-8 text-xs md:text-sm font-bold tracking-widest uppercase" style={{ boxShadow: '0 0 15px rgba(138,43,226,0.2)' }}>
              <Sparkles className="w-4 h-4" />
              <span>System Online</span>
            </div>
          )}

          <div ref={titleGroupRef} className="mb-6">
            <h1 className={`${isRecruiterMode ? 'text-[#1a1a1a]' : 'text-white glow-text'} text-[clamp(2.5rem,8vw,7rem)] leading-none font-black relative break-words tracking-tighter uppercase font-space`}>
              Roushan Kumar
            </h1>
          </div>

          <p ref={subtitleRef} className={`text-sm md:text-base lg:text-lg mb-8 font-bold tracking-[0.2em] uppercase font-space ${isRecruiterMode ? 'text-[#444]' : 'text-[var(--neon-cyan)]'}`}>
            &gt; BCA Student | Python & AI Developer _
          </p>

          <p ref={descRef} className={`text-sm md:text-base mb-12 max-w-2xl leading-relaxed font-inter ${isRecruiterMode ? 'text-[#333] border-l-4 border-[var(--neon-cyan)] pl-6 text-left mx-auto' : 'text-[#e5e4e2] opacity-80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 bg-black/40'} lg:mx-0`}>
            I build scalable web applications and AI-powered systems focused on performance and real-world impact.
          </p>

          <div ref={ctaRef} className={`flex gap-4 md:gap-6 justify-center ${isRecruiterMode ? 'justify-center' : 'lg:justify-start'} flex-wrap`}>
            <button onClick={() => scrollToSection('projects')} className="btn-primary flex items-center gap-3">
              View Projects
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="btn-secondary flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Me
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {!isRecruiterMode && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-opacity focus-fade">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-[var(--neon-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 5px var(--neon-cyan))' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}



function ProjectsSection() {
  const { isRecruiterMode } = useMode();
  const sectionRef = use3DScroll() as React.RefObject<HTMLDivElement>;

  const projects = [
    {
      title: 'Dynamic Quiz Management System',
      description: 'Designed a dynamic quiz platform with optimized data handling and role-based architecture for scalable user interaction.',
      tech: ['Python', 'File Architecture', 'Modular Programming'],
      github: 'https://github.com/Hey-Astreon/Dynamic-Quiz-Management-System',
      live: 'https://github.com/Hey-Astreon/Dynamic-Quiz-Management-System',
      date: 'Jan 2026',
      previewUrl: '/quiz-preview.png'
    },
    {
      title: 'AI CRM HCP Interaction Hub',
      description: 'Engineered a high-performance AI CRM module for pharmaceutical interactions, featuring neural link synchronization and real-time data persistence.',
      tech: ['Python', 'React', 'FastAPI', 'JavaScript'],
      github: 'https://github.com/Hey-Astreon/AI-CRM-HCP-Interaction-Logging-Module',
      live: 'https://github.com/Hey-Astreon/AI-CRM-HCP-Interaction-Logging-Module',
      date: 'Mar 2026',
      previewUrl: '/crm-preview.png'
    },
    {
      title: 'Student Record Management System',
      description: 'Architected a secure student record system with encrypted authentication and modular data streams for high-integrity institutional management.',
      tech: ['Python', 'File Management', 'Admin Auth', 'CLI'],
      github: 'https://github.com/Hey-Astreon/Student-Record-Management-System',
      live: 'https://github.com/Hey-Astreon/Student-Record-Management-System',
      date: '2025',
      previewUrl: '/prompt-preview.png'
    },
  ];

  return (
    <section id="projects" ref={sectionRef} className={`py-32 px-4 relative z-10 ${isRecruiterMode ? 'bg-white border-none' : 'border-t border-white/5 bg-black/40'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          {isRecruiterMode ? (
            <h2 className="text-4xl font-black text-black mb-4 font-space">COMPILED PROJECTS</h2>
          ) : (
            <SplitTextGlow text="COMPILED PROJECTS" className="text-4xl md:text-6xl font-black mb-4 justify-center" colorType="secondary" />
          )}
          <p className={`${isRecruiterMode ? 'text-gray-500' : 'text-[var(--neon-cyan)]'} text-lg font-mono tracking-widest uppercase`}>System Architecture Showcase</p>
        </div>

        <div className={`grid ${isRecruiterMode ? 'grid-cols-1' : 'md:grid-cols-2'} gap-10`}>
          {projects.map((project, idx) => (
            <HolographicCard key={idx} index={idx} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}


function EducationSection() {
  const { isRecruiterMode } = useMode();
  const sectionRef = use3DScroll() as React.RefObject<HTMLDivElement>;

  const education = [
    {
      title: 'Bachelor of Computer Applications',
      subtitle: 'Software Development Core',
      school: 'Amity University Noida',
      date: 'Jul 2025 - Jul 2028',
    },
    {
      title: 'Gemini Certified University Student',
      subtitle: 'Google for Education / Generative AI Mastery',
      school: 'AI Infrastructure, LLM Orchestration & Prompt Engineering',
      date: 'Feb 2026 - Feb 2029 (Verified)',
    },
    {
      title: 'Python Automation & Systems Logic',
      subtitle: 'Google Career Certificate / Computer Science',
      school: 'OOP, Computational Thinking & Automated Scripting Protocols',
      date: 'Sep 2022 (Verified)',
    },
    {
      title: 'Relational Database Architecture',
      subtitle: 'Meta Certified Database Engineer',
      school: 'Schema Optimization, SQL Orchestration & Data Integrity',
      date: 'Sep 2022 (Verified)',
    },
  ];

  return (
    <section id="education" ref={sectionRef} className={`py-32 px-4 relative z-10 ${isRecruiterMode ? 'bg-white border-y border-gray-100' : 'neural-border-top bg-[rgba(5,5,10,0.4)]'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          {isRecruiterMode ? (
             <h2 className="text-4xl font-black text-black mb-4 font-space">DATA TRAINING</h2>
          ) : (
             <SplitTextGlow text="DATA TRAINING CENTERS" className="text-4xl md:text-6xl font-black mb-4 justify-center" colorType="secondary" />
          )}
          <p className={`${isRecruiterMode ? 'text-gray-500' : 'text-[var(--neon-cyan)]'} text-lg font-mono tracking-widest uppercase`}>Academic Archives & Certs</p>
        </div>

        <div className="space-y-6 mb-24">
          {education.map((edu, idx) => (
            <div key={idx} className={isRecruiterMode ? 'p-6 border border-gray-100 bg-gray-50 rounded-xl' : 'card-premium'}>
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <h3 className={`text-xl font-bold mb-1 font-space ${isRecruiterMode ? 'text-black' : 'text-white'}`}>{edu.title}</h3>
                  <p className={`${isRecruiterMode ? 'text-[var(--neon-cyan)]' : 'text-[var(--neon-purple)]'} font-mono text-sm mb-2`}>{edu.subtitle}</p>
                  <p className={isRecruiterMode ? 'text-gray-600' : 'text-white opacity-70'}>{edu.school}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-4 py-1 rounded-sm border font-mono text-sm ${isRecruiterMode ? 'border-gray-300 text-gray-500 bg-white' : 'border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-cyan-500/5'}`}>
                    {edu.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { isRecruiterMode } = useMode();
  const sectionRef = use3DScroll() as React.RefObject<HTMLDivElement>;
  const counter1Ref = useCounterAnimation(0, 2);
  const counter2Ref = useCounterAnimation(0, 1);
  const counter3Ref = useCounterAnimation(0, 4);

  return (
    <section id="stats" ref={sectionRef} className={`py-24 px-4 relative z-10 ${isRecruiterMode ? 'hidden' : 'neural-border-top'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { ref: counter1Ref, label: 'Neural Systems Deployed', suffix: '+' },
            { ref: counter2Ref, label: 'Verified Credentials', suffix: '' },
            { ref: counter3Ref, label: 'Architectural Frameworks', suffix: '+' },
          ].map((stat, idx) => (
            <div key={idx} className="card-premium text-center group flex flex-col items-center justify-center py-12">
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-cyan)] to-[#4dadeb] mb-4 font-space" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 245, 255, 0.4))' }}>
                <span ref={stat.ref}>0</span>
                {stat.suffix}
              </div>
              <p className="text-[#e5e4e2] font-mono tracking-widest uppercase text-[10px] opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { isRecruiterMode } = useMode();
  const sectionRef = use3DScroll() as React.RefObject<HTMLDivElement>;

  return (
    <section id="contact" ref={sectionRef} className={`py-40 px-4 relative z-10 ${isRecruiterMode ? 'bg-white' : 'neural-border-top bg-black/80'}`}>
      <div className="max-w-6xl mx-auto text-center">
        {/* Terminal Header */}
        <div className="mb-24 relative inline-block">
          {!isRecruiterMode && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent to-[var(--neon-purple)]" />
          )}
          {isRecruiterMode ? (
             <h2 className="text-4xl font-black text-black mb-6 font-space uppercase">INITIATE CONTACT</h2>
          ) : (
             <SplitTextGlow text="INITIATE UPLINK" className="text-5xl md:text-8xl font-black mb-6 justify-center tracking-tighter" colorType="primary" />
          )}
          <div className={`flex items-center justify-center gap-4 font-mono text-xs uppercase tracking-[0.4em] ${isRecruiterMode ? 'text-gray-400' : 'text-[var(--neon-purple)]'}`}>
            <span className="animate-pulse">●</span>
            SYSTEM_STATUS: NODE_READY
            <span className="animate-pulse">●</span>
          </div>
        </div>

        {/* Neural Nexus Socials */}
        <div className="mb-32">
          <NeuralNexusSocials />
        </div>

        {/* Global Transmission Terminal */}
        <div className="max-w-3xl mx-auto relative group">
          <h3 className={`text-2xl font-bold font-space mb-12 tracking-widest uppercase ${isRecruiterMode ? 'text-black' : 'text-[#e5e4e2]'}`}>
            Global Transmission <span className="text-[var(--neon-purple)]">Terminal</span>
          </h3>
          
          <NeuralContactForm />
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  const isMobile = useIsMobile();
  const { isPerformanceMode, isRecruiterMode } = useMode();
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    (window as any).openResumeScan = () => setIsResumeModalOpen(true);
    
    // GSAP ScrollTrigger for Focus Mode
    if (!isRecruiterMode) {
      ScrollTrigger.create({
        trigger: ".avatar-container",
        start: "top top",
        end: "bottom center",
        onUpdate: (self) => {
          gsap.to(".avatar-container, .focus-fade", { opacity: 1 - self.progress, duration: 0.5 });
        }
      });
    }
  }, [isRecruiterMode]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Roushan_Kumar_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsResumeModalOpen(false);
  };

  return (
    <main className={`relative ${isRecruiterMode ? 'bg-white' : 'bg-[#020205]'} text-[#e5e4e2] min-h-screen overflow-x-hidden selection:bg-[var(--neon-purple)]/30 transition-colors duration-700`}>
      {!isRecruiterMode && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-100 backdrop-noise">
          {!isPerformanceMode && (
            <Suspense fallback={null}>
              <CombinedScene 
                ecoMode={isPerformanceMode}
              />
            </Suspense>
          )}
        </div>
      )}

      <div className="relative z-10">
        <Navigation />
        
        <HeroSection />
        
        {!isRecruiterMode && (
          <div className="neural-border-top py-12">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <SplitTextGlow text="NEURAL JOURNEY" className="text-3xl md:text-5xl font-black mb-4 justify-center" colorType="primary" />
              <p className="text-[#d1b3ff] text-xs font-mono tracking-[0.3em] uppercase opacity-60">Authentication & Growth History</p>
            </div>
            <Suspense fallback={<div className="py-20 text-center text-white/20 font-mono text-xs">HYDRATING...</div>}>
              <NeuralTimeline />
            </Suspense>
          </div>
        )}

        <ProjectsSection />
        
        {!isRecruiterMode && (
          <Suspense fallback={null}>
            <TacticalArsenal />
          </Suspense>
        )}
        
        <EducationSection />
        {!isRecruiterMode && <StatsSection />}
        <ContactSection />
        <Footer />
      </div>

      <ResumeScanModal 
        isOpen={isResumeModalOpen} 
        onClose={() => setIsResumeModalOpen(false)} 
        onDownload={handleDownload}
      />
    </main>
  );
}
