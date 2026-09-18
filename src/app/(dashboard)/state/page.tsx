'use client';

import SectionHeader from '@/components/ui/SectionHeader';
import { Metric, MetricGroup } from '@/components/ui/Metric';
import { environmentalState } from '@/data/mock-environmental-state';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { useAssessment } from '@/context/AssessmentContext';

function getOverallStatus(metrics: { status?: string }[]): 'good' | 'moderate' | 'poor' | 'critical' {
  const statuses = metrics.map((m) => m.status).filter(Boolean);
  if (statuses.includes('critical')) return 'critical';
  if (statuses.filter((s) => s === 'poor').length > statuses.length / 2) return 'poor';
  if (statuses.includes('poor')) return 'moderate';
  return 'good';
}

export default function StatePage() {
  const { result, backendAvailable } = useAssessment();

  // Use API data if available, otherwise fall back to mock
  const dimensions = (backendAvailable && result?.environmental_state?.length)
    ? result.environmental_state
    : environmentalState;

  const assessmentId = result?.assessment_id || 'ASM-001';

  return (
    <div>
      <SectionHeader
        title="Environmental State"
        subtitle="Current ecological conditions inferred from the submitted observations."
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-text-muted mono">{assessmentId}</span>
            <StatusIndicator status="poor" label="Under stress" />
          </div>
        }
      />

      {/* Location bar */}
      <div className="flex items-center gap-6 mb-8 text-[12px] border-b border-border pb-4">
        <div>
          <span className="text-text-muted mr-2">Region</span>
          <span className="text-text-secondary">Maharashtra, India</span>
        </div>
        <div>
          <span className="text-text-muted mr-2">Coordinates</span>
          <span className="text-text-secondary mono">19.0760°N, 72.8777°E</span>
        </div>
        <div>
          <span className="text-text-muted mr-2">Ecosystem</span>
          <span className="text-text-secondary">Semi-arid Agricultural</span>
        </div>
      </div>

      {/* Dimension grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dimensions.map((dimension) => (
          <MetricGroup
            key={dimension.id}
            title={dimension.title}
            columns={dimension.metrics.length >= 4 ? 2 : dimension.metrics.length}
          >
            {dimension.metrics.map((metric: any) => (
              <Metric
                key={metric.label}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                status={metric.status}
              />
            ))}
          </MetricGroup>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-6 border border-border rounded-[var(--radius-md)] p-4 flex items-start gap-6">
        <div className="flex-1">
          <div className="label-xs mb-2">Assessment summary</div>
          <p className="text-[13px] text-text-tertiary leading-relaxed">
            The ecosystem shows signs of environmental stress across multiple dimensions.
            Low soil organic carbon, limited rainfall, monoculture agriculture, and reduced
            biodiversity indicate a system with declining ecological resilience. Multiple
            reinforcing degradation pathways have been identified.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="label-xs mb-2">Overall status</div>
          <StatusIndicator status={getOverallStatus(dimensions.flatMap((d) => d.metrics))} size="md" />
        </div>
      </div>
    </div>
  );
}
