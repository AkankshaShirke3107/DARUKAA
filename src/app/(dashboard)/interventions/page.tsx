import SectionHeader from '@/components/ui/SectionHeader';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { interventions } from '@/data/mock-interventions';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import Link from 'next/link';

const timeHorizonLabels = {
  short: 'Short term (0–6 months)',
  medium: 'Medium term (6–24 months)',
  long: 'Long term (2–5 years)',
};

function InterventionCard({ intervention, index }: { intervention: typeof interventions[0]; index: number }) {
  return (
    <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="mono text-[11px] text-text-muted">{intervention.id}</span>
            <span className="text-[11px] text-text-muted">·</span>
            <span className="text-[11px] text-text-muted">Priority {intervention.priority}</span>
          </div>
          <StatusIndicator
            status={
              intervention.evidenceStrength === 'strong'
                ? 'good'
                : intervention.evidenceStrength === 'moderate'
                ? 'moderate'
                : 'poor'
            }
            label={`${intervention.evidenceStrength} evidence`}
          />
        </div>
        <h3 className="text-[15px] font-medium text-text-primary leading-snug mb-3">
          {intervention.title}
        </h3>
      </div>

      {/* Why */}
      <div className="px-4 sm:px-5 pb-4">
        <div className="label-xs mb-1.5">Rationale</div>
        <p className="text-[12px] text-text-tertiary leading-relaxed">{intervention.why}</p>
      </div>

      {/* Impacts */}
      <div className="border-t border-border px-4 sm:px-5 py-4">
        <div className="label-xs mb-3">Projected impacts</div>
        <div className="space-y-1.5">
          {intervention.impacts.map((impact) => (
            <div key={impact.metric} className="flex items-center justify-between text-[12px]">
              <span className="text-text-secondary">{impact.metric}</span>
              <div className="flex items-center gap-1.5">
                {impact.direction === 'up' ? (
                  <ArrowUp size={12} className="text-accent" />
                ) : impact.direction === 'down' ? (
                  <ArrowDown size={12} style={{ color: 'var(--danger)' }} />
                ) : (
                  <Minus size={12} className="text-text-muted" />
                )}
                <span
                  className={`text-[11px] capitalize ${
                    impact.magnitude === 'high' ? 'text-text-primary' : 'text-text-tertiary'
                  }`}
                >
                  {impact.magnitude}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="border-t border-border px-4 sm:px-5 py-3 flex items-center justify-between text-[11px]">
        <span className="text-text-muted">
          {timeHorizonLabels[intervention.timeHorizon]}
        </span>
        <div className="flex gap-1.5">
          {intervention.supportingEvidence.map((id) => (
            <Link
              key={id}
              href="/knowledge"
              className="mono text-text-tertiary hover:text-accent transition-default"
            >
              {id}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InterventionsPage() {
  return (
    <div>
      <SectionHeader
        title="Intervention Plan"
        subtitle="Evidence-backed ecological recommendations prioritised by impact potential and implementation feasibility."
        actions={
          <span className="text-[11px] text-text-muted mono">
            {interventions.length} interventions
          </span>
        }
      />

      <div className="space-y-4">
        {interventions.map((intervention, i) => (
          <InterventionCard key={intervention.id} intervention={intervention} index={i} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-[11px] text-text-muted leading-relaxed border-t border-border pt-4">
        Intervention recommendations are generated from retrieved scientific evidence and
        environmental state analysis. Projected impacts represent directional estimates based
        on published research — actual outcomes depend on local conditions, implementation
        quality, and environmental variability.
      </div>
    </div>
  );
}
