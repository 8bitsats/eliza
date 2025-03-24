import React, { createContext, useContext, useState, useEffect } from 'react';
import { TestModeConfig } from '@/types/token';

// Default test mode configuration
const defaultTestMode: TestModeConfig = {
  enabled: false,
  mode: 'disabled',
};

// Create the context with default value
interface TestModeContextType {
  testMode: TestModeConfig;
  toggleTestMode: (mode?: 'mock' | 'devnet' | 'disabled') => void;
}

const TestModeContext = createContext<TestModeContextType>({
  testMode: defaultTestMode,
  toggleTestMode: () => {},
});

export function TestModeProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage if available
  const [testMode, setTestMode] = useState<TestModeConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('testMode');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse testMode from localStorage:', e);
        }
      }
    }
    return defaultTestMode;
  });

  // Update localStorage when test mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('testMode', JSON.stringify(testMode));
    }
  }, [testMode]);

  // Function to toggle test mode
  const toggleTestMode = (mode?: 'mock' | 'devnet' | 'disabled') => {
    setTestMode(prev => {
      // If mode is explicitly provided, use it; otherwise cycle through modes
      const newMode = mode || (!prev.enabled ? 'mock' : 
                              prev.mode === 'mock' ? 'devnet' : 'disabled');
      
      return {
        enabled: newMode !== 'disabled',
        mode: newMode,
      };
    });
  };

  return (
    <TestModeContext.Provider value={{ testMode, toggleTestMode }}>
      {children}
    </TestModeContext.Provider>
  );
}

export const useTestMode = () => useContext(TestModeContext);
