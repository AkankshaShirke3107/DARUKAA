interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  label?: string;
}

export default function SectionHeader({ title, subtitle, actions, label }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        {label && <div className="label-sm mb-2">{label}</div>}
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-text-primary leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-text-tertiary mt-2 max-w-[560px] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 pt-1">{actions}</div>}
    </div>
  );
}
