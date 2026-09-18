import { getStatusColor } from '@/data/mock-environmental-state';

interface MetricProps {
  label: string;
  value: string;
  unit?: string;
  status?: 'good' | 'moderate' | 'poor' | 'critical';
  mono?: boolean;
}

export function Metric({ label, value, unit, status, mono = true }: MetricProps) {
  return (
    <div className="min-w-0">
      <div className="label-xs mb-1.5">{label}</div>
      <div className="flex items-baseline gap-1">
        <span
          className={mono ? 'metric-value-sm' : 'text-[14px] font-medium text-text-primary'}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-text-tertiary">{unit}</span>
        )}
        {status && (
          <span
            className="inline-block w-[6px] h-[6px] rounded-full ml-1.5 shrink-0"
            style={{ backgroundColor: getStatusColor(status) }}
            title={status}
          />
        )}
      </div>
    </div>
  );
}

interface MetricGroupProps {
  title: string;
  children: React.ReactNode;
  columns?: number;
}

export function MetricGroup({ title, children, columns = 3 }: MetricGroupProps) {
  return (
    <div className="border border-border rounded-[var(--radius-md)] p-4">
      <div className="label-sm mb-4">{title}</div>
      <div
        className="grid gap-x-6 gap-y-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </div>
  );
}
