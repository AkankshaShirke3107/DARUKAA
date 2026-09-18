'use client';

import { useState, useMemo } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusIndicator from '@/components/ui/StatusIndicator';
import {
  analysisObservations as mockObservations,
  analysisInteractions as mockInteractions,
  analysisImplications as mockImplications,
  analysisSupportingEvidence as mockSupportingEvidence,
  scientistConversation as mockScientist,
} from '@/data/mock-analysis';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAssessment } from '@/context/AssessmentContext';

function ObservationRow({ obs }: { obs: any }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-[13px] text-text-secondary">{obs.variable}</span>
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-text-tertiary mono">{obs.value}</span>
        <span
          className="inline-block w-[5px] h-[5px] rounded-full"
          style={{
            backgroundColor:
              obs.status === 'critical' ? '#C45252' :
              obs.status === 'poor' ? 'var(--danger)' :
              obs.status === 'moderate' ? 'var(--warning)' : 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}

function ReasoningArrow() {
  return (
    <div className="flex justify-center py-3">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-4 bg-border-emphasis" />
        <ChevronDown size={12} className="text-text-muted" />
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { result, backendAvailable } = useAssessment();
  const [selectedIrrigation, setSelectedIrrigation] = useState<string | null>(null);
  const [expandedInteraction, setExpandedInteraction] = useState<number>(0);

  // Use API data if available, otherwise fall back to mock
  const analysisObservations = useMemo(() =>
    backendAvailable && result?.reasoning?.observations?.length ? result.reasoning.observations : mockObservations,
    [backendAvailable, result]
  );
  const analysisInteractions = useMemo(() =>
    backendAvailable && result?.reasoning?.interactions?.length ? result.reasoning.interactions : mockInteractions,
    [backendAvailable, result]
  );
  const analysisImplications = useMemo(() =>
    backendAvailable && result?.reasoning?.implications?.length ? result.reasoning.implications : mockImplications,
    [backendAvailable, result]
  );
  const analysisSupportingEvidence = useMemo(() =>
    backendAvailable && result?.reasoning?.supporting_evidence ? result.reasoning.supporting_evidence : mockSupportingEvidence,
    [backendAvailable, result]
  );
  const scientistConversation = useMemo(() =>
    backendAvailable && result?.scientist ? result.scientist : mockScientist,
    [backendAvailable, result]
  );

  return (
    <div>
      <SectionHeader
        title="Environmental Analysis"
        subtitle="Multi-variable reasoning across soil, climate, land use, and biodiversity observations."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main reasoning chain */}
        <div>
          {/* Observations */}
          <div className="border border-border rounded-[var(--radius-md)] p-4 bg-bg-secondary">
            <div className="label-sm mb-3">OBSERVATIONS</div>
            {analysisObservations.map((obs) => (
              <ObservationRow key={obs.variable} obs={obs} />
            ))}
          </div>

          <ReasoningArrow />

          {/* Interactions */}
          <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary">
            <div className="p-4 pb-0">
              <div className="label-sm mb-3">INTERACTIONS IDENTIFIED</div>
            </div>
            {analysisInteractions.map((interaction, i) => (
              <div
                key={interaction.title}
                className="border-b border-border last:border-b-0"
              >
                <button
                  onClick={() =>
                    setExpandedInteraction(expandedInteraction === i ? -1 : i)
                  }
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition-default"
                >
                  <div className="flex items-center gap-3">
                    {expandedInteraction === i ? (
                      <ChevronDown size={14} className="text-text-muted" />
                    ) : (
                      <ChevronRight size={14} className="text-text-muted" />
                    )}
                    <span className="text-[13px] font-medium text-text-primary">
                      {interaction.title}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {interaction.variables.map((v: string) => (
                      <span
                        key={v}
                        className="text-[10px] text-text-muted px-1.5 py-0.5 bg-bg-elevated rounded"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </button>
                {expandedInteraction === i && (
                  <div className="px-4 pb-4 pl-10">
                    <p className="text-[13px] text-text-tertiary leading-relaxed">
                      {interaction.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <ReasoningArrow />

          {/* Implications */}
          <div className="border border-border rounded-[var(--radius-md)] p-4 bg-bg-secondary">
            <div className="label-sm mb-3">ENVIRONMENTAL IMPLICATIONS</div>
            <div className="space-y-3">
              {analysisImplications.map((impl) => (
                <div
                  key={impl.title}
                  className="pb-3 border-b border-border last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[13px] font-medium text-text-primary">
                      {impl.title}
                    </span>
                    <StatusIndicator
                      status={impl.severity === 'critical' ? 'critical' : impl.severity === 'high' ? 'poor' : 'moderate'}
                      label={impl.severity}
                    />
                  </div>
                  <p className="text-[12px] text-text-tertiary leading-relaxed">
                    {impl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ReasoningArrow />

          {/* Evidence summary */}
          <div className="border border-border rounded-[var(--radius-md)] p-4 bg-bg-secondary">
            <div className="label-sm mb-3">SUPPORTING EVIDENCE</div>
            <div className="flex items-center gap-6">
              <div>
                <div className="metric-value">{analysisSupportingEvidence.total}</div>
                <div className="text-[11px] text-text-muted mt-1">sources</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="metric-value-sm text-accent">{analysisSupportingEvidence.strong}</div>
                <div className="text-[11px] text-text-muted mt-1">strong</div>
              </div>
              <div>
                <div className="metric-value-sm text-warning">{analysisSupportingEvidence.moderate}</div>
                <div className="text-[11px] text-text-muted mt-1">moderate</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {analysisSupportingEvidence.ids.map((id) => (
                <span
                  key={id}
                  className="text-[10px] text-text-tertiary mono px-1.5 py-0.5 border border-border rounded"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Scientist panel */}
        <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary p-4 h-fit sticky top-10">
          <div className="label-sm mb-4">AI ENVIRONMENTAL SCIENTIST</div>
          <p className="text-[13px] text-text-tertiary leading-relaxed mb-4">
            {scientistConversation.message}
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-[13px] text-text-secondary mb-3">
              {scientistConversation.question}
            </p>
            <div className="space-y-2">
              {scientistConversation.options?.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedIrrigation(opt.value)}
                  className={`w-full text-left text-[13px] px-3 py-2 rounded-[var(--radius-sm)] border transition-default ${
                    selectedIrrigation === opt.value
                      ? 'border-border-accent bg-accent-subtle text-accent-hover'
                      : 'border-border text-text-secondary hover:border-border-emphasis hover:bg-bg-hover'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full border ${
                        selectedIrrigation === opt.value
                          ? 'border-accent bg-accent'
                          : 'border-text-muted'
                      }`}
                    >
                      {selectedIrrigation === opt.value && (
                        <span className="block w-1.5 h-1.5 rounded-full bg-bg-primary m-[2.5px]" />
                      )}
                    </span>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            {selectedIrrigation && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[12px] text-text-tertiary leading-relaxed">
                  With rain-fed conditions confirmed, water stress is the primary driver of
                  biodiversity decline in this system. The analysis now weights water-dependent
                  ecological pathways more heavily.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
