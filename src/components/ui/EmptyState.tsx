import { Layers } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Layers size={28} strokeWidth={1} className="text-text-muted mb-4" />
      <h3 className="text-[15px] font-medium text-text-secondary mb-2">{title}</h3>
      <p className="text-[13px] text-text-tertiary max-w-[320px] mb-6 leading-relaxed">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="text-[13px] font-medium text-accent hover:text-accent-hover transition-default px-4 py-2 border border-border-accent rounded-[var(--radius-sm)]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
