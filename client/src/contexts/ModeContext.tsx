import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModeContextType {
  isPerformanceMode: boolean;
  setIsPerformanceMode: (value: boolean) => void;
  isRecruiterMode: boolean;
  setIsRecruiterMode: (value: boolean) => void;
  isAstraOpen: boolean;
  setIsAstraOpen: (value: boolean) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: React.ReactNode }) => {
  // Performance mode is ON by default for best performance stability
  const [isPerformanceMode, setIsPerformanceMode] = useState(() => {
    const saved = localStorage.getItem('astra-perf-mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [isRecruiterMode, setIsRecruiterMode] = useState(() => {
    return localStorage.getItem('astra-recruiter-mode') === 'true';
  });

  const [isAstraOpen, setIsAstraOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('astra-perf-mode', String(isPerformanceMode));
    if (isPerformanceMode) {
        document.documentElement.classList.add('perf-mode');
    } else {
        document.documentElement.classList.remove('perf-mode');
    }
  }, [isPerformanceMode]);

  useEffect(() => {
    localStorage.setItem('astra-recruiter-mode', String(isRecruiterMode));
    if (isRecruiterMode) {
        document.documentElement.classList.add('recruiter-mode');
    } else {
        document.documentElement.classList.remove('recruiter-mode');
    }
  }, [isRecruiterMode]);

  return (
    <ModeContext.Provider value={{ 
      isPerformanceMode, 
      setIsPerformanceMode, 
      isRecruiterMode, 
      setIsRecruiterMode,
      isAstraOpen,
      setIsAstraOpen
    }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
