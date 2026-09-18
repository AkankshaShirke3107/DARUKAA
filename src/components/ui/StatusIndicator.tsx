interface StatusIndicatorProps {
  status: 'good' | 'moderate' | 'poor' | 'critical';
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig = {
  good: { color: 'var(--accent)', bg: 'var(--accent-subtle)', label: 'Good' },
  moderate: { color: 'var(--warning)', bg: 'var(--warning-subtle)', label: 'Moderate' },
  poor: { color: 'var(--danger)', bg: 'var(--danger-subtle)', label: 'Poor' },
  critical: { color: '#C45252', bg: 'rgba(196, 82, 82, 0.12)', label: 'Critical' },
};

export default function StatusIndicator({ status, label, size = 'sm' }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[12px] px-2.5 py-1'
      }`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <span
        className="inline-block w-[5px] h-[5px] rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {displayLabel}
    </span>
  );
}
