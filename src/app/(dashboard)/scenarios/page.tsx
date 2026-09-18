'use client';

import { useState, useMemo } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import {
  scenarioParameters,
  computeScenarioResults,
  type ScenarioResult,
} from '@/data/mock-scenarios';

function ScenarioSlider({
  param,
  value,
  onChange,
}: {
  param: typeof scenarioParameters[0];
  value: number;
  onChange: (v: number) => void;
}) {
  const isDefault = value === param.current;

  return (
    <div className="pb-4 mb-4 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-text-secondary">{param.label}</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-text-muted">
            Current: <span className="mono">{param.current}{param.unit}</span>
          </span>
          <span className="text-[11px] text-text-primary mono font-medium">
            {param.id === 'soil-carbon' ? value.toFixed(2) : value}{param.unit}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-[3px] appearance-none bg-bg-elevated rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-text-secondary
            [&::-webkit-slider-thumb]:hover:bg-accent [&::-webkit-slider-thumb]:transition-colors
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-text-secondary [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:hover:bg-accent"
          style={{ outline: 'none', border: 'none' }}
        />
        {!isDefault && (
          <button
            onClick={() => onChange(param.current)}
            className="text-[10px] text-text-muted hover:text-text-secondary transition-default"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function ResultRow({ result }: { result: ScenarioResult }) {
  const delta = result.scenario - result.current;
  const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;

  return (
    <div className="flex items-center py-2.5 border-b border-border last:border-b-0">
      <span className="flex-1 text-[13px] text-text-secondary">{result.metric}</span>
      <div className="flex items-center gap-6 text-right">
        <span className="w-12 text-[13px] mono text-text-muted">{result.current}</span>
        <span
          className={`w-12 text-[13px] mono font-medium ${
            result.direction === 'better'
              ? 'text-accent'
              : result.direction === 'worse'
              ? 'text-danger'
              : 'text-text-secondary'
          }`}
        >
          {result.scenario}
        </span>
        <span
          className={`w-10 text-[11px] mono ${
            result.direction === 'better'
              ? 'text-accent'
              : result.direction === 'worse'
              ? 'text-danger'
              : 'text-text-muted'
          }`}
        >
          {delta === 0 ? '—' : deltaStr}
        </span>
      </div>
    </div>
  );
}

export default function ScenariosPage() {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    scenarioParameters.forEach((p) => {
      initial[p.id] = p.current;
    });
    return initial;
  });

  const results = useMemo(() => computeScenarioResults(params), [params]);

  const hasChanges = scenarioParameters.some((p) => params[p.id] !== p.current);

  const resetAll = () => {
    const initial: Record<string, number> = {};
    scenarioParameters.forEach((p) => {
      initial[p.id] = p.current;
    });
    setParams(initial);
  };

  return (
    <div>
      <SectionHeader
        title="Scenario Lab"
        subtitle="Explore how environmental changes may alter the current ecosystem state."
        actions={
          hasChanges ? (
            <button
              onClick={resetAll}
              className="text-[12px] text-text-muted hover:text-text-secondary transition-default"
            >
              Reset all
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        {/* Controls */}
        <div className="border border-border rounded-[var(--radius-md)] p-4 sm:p-5 bg-bg-secondary">
          <div className="label-sm mb-4">SCENARIO PARAMETERS</div>
          {scenarioParameters.map((param) => (
            <ScenarioSlider
              key={param.id}
              param={param}
              value={params[param.id]}
              onChange={(v) => setParams((prev) => ({ ...prev, [param.id]: v }))}
            />
          ))}
        </div>

        {/* Results */}
        <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary">
          <div className="p-4 sm:p-5 pb-3">
            <div className="label-sm mb-1">SCENARIO RESULTS</div>
            <div className="flex items-center gap-6 text-right mb-3 mt-3">
              <span className="flex-1" />
              <span className="w-12 text-[10px] text-text-muted uppercase tracking-wider">Current</span>
              <span className="w-12 text-[10px] text-text-muted uppercase tracking-wider">Scenario</span>
              <span className="w-10 text-[10px] text-text-muted uppercase tracking-wider">Delta</span>
            </div>
          </div>
          <div className="px-4 sm:px-5 pb-4">
            {results.map((result) => (
              <ResultRow key={result.metric} result={result} />
            ))}
          </div>

          {/* Visual comparison bars */}
          <div className="border-t border-border p-4 sm:p-5">
            <div className="label-xs mb-3">Visual comparison</div>
            <div className="space-y-3">
              {results.map((result) => (
                <div key={`bar-${result.metric}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-text-muted">{result.metric}</span>
                  </div>
                  <div className="flex gap-1 h-[6px]">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${result.current}%`,
                        backgroundColor: 'rgba(232, 236, 232, 0.1)',
                      }}
                    />
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${result.scenario}%`,
                        backgroundColor:
                          result.direction === 'better'
                            ? 'rgba(90, 122, 90, 0.5)'
                            : result.direction === 'worse'
                            ? 'rgba(166, 82, 82, 0.5)'
                            : 'rgba(232, 236, 232, 0.15)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-border px-4 sm:px-5 py-3">
            <p className="text-[10px] text-text-muted leading-relaxed">
              Scenario values are computed from a simplified demonstration model. Actual
              ecosystem responses involve complex nonlinear interactions and are subject to
              local environmental conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
