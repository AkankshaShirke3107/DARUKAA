'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// The full assessment response shape from the API
export interface AssessmentResult {
  assessment_id: string;
  environmental_state: any[];
  relationships: { nodes: any[]; edges: any[] };
  reasoning: {
    observations: any[];
    interactions: any[];
    implications: any[];
    supporting_evidence: { total: number; strong: number; moderate: number; ids: string[] };
  };
  recommendations: any[];
  evidence: any[];
  missing_information: string[];
  scientist?: {
    message: string;
    question?: string;
    options?: { value: string; label: string }[];
  };
}

interface AssessmentContextType {
  result: AssessmentResult | null;
  setResult: (r: AssessmentResult | null) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  backendAvailable: boolean;
  setBackendAvailable: (v: boolean) => void;
}

const AssessmentContext = createContext<AssessmentContextType>({
  result: null,
  setResult: () => {},
  isLoading: false,
  setIsLoading: () => {},
  backendAvailable: false,
  setBackendAvailable: () => {},
});

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  return (
    <AssessmentContext.Provider
      value={{ result, setResult, isLoading, setIsLoading, backendAvailable, setBackendAvailable }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  return useContext(AssessmentContext);
}
