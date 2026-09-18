'use client';

import { useState, useEffect } from 'react';

interface LoadingStateProps {
  title: string;
  steps: { label: string; duration: number }[];
  onComplete?: () => void;
}

export default function LoadingState({ title, steps, onComplete }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setCompleted(true);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="label-sm mb-6">{title}</div>
      <div className="w-full max-w-[360px] space-y-2.5">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div className="w-4 flex justify-center">
              {i < currentStep ? (
                <div className="w-[6px] h-[6px] rounded-full bg-accent" />
              ) : i === currentStep && !completed ? (
                <div className="w-[6px] h-[6px] rounded-full bg-text-secondary animate-pulse" />
              ) : (
                <div className="w-[6px] h-[6px] rounded-full bg-border-emphasis" />
              )}
            </div>
            <span
              className={`text-[13px] transition-colors duration-300 ${
                i < currentStep
                  ? 'text-text-secondary'
                  : i === currentStep
                  ? 'text-text-primary'
                  : 'text-text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 text-[12px] text-text-muted mono">
        {String(Math.min(currentStep + 1, steps.length)).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
      </div>
    </div>
  );
}
