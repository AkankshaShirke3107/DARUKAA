import SectionHeader from '@/components/ui/SectionHeader';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { assessmentHistory } from '@/data/mock-history';
import Link from 'next/link';

export default function HistoryPage() {
  return (
    <div>
      <SectionHeader
        title="Assessment History"
        subtitle="Previous environmental assessments and their current analysis status."
        actions={
          <Link
            href="/assessment"
            className="text-[12px] font-medium text-accent hover:text-accent-hover transition-default px-3 py-1.5 border border-border-accent rounded-[var(--radius-sm)]"
          >
            New assessment
          </Link>
        }
      />

      {/* Table */}
      <div className="border border-border rounded-[var(--radius-md)] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_160px_120px_100px] gap-4 px-4 sm:px-5 py-2.5 bg-bg-secondary border-b border-border text-[11px] text-text-muted uppercase tracking-wider">
          <span>Assessment</span>
          <span>Region</span>
          <span>Ecosystem</span>
          <span>Created</span>
          <span className="text-right">Status</span>
        </div>

        {/* Rows */}
        {assessmentHistory.map((record) => (
          <Link
            key={record.id}
            href="/state"
            className="grid grid-cols-[1fr_140px_160px_120px_100px] gap-4 px-4 sm:px-5 py-3 border-b border-border last:border-b-0 hover:bg-bg-hover transition-default items-center"
          >
            <div>
              <div className="text-[13px] text-text-primary font-medium">{record.name}</div>
              <div className="text-[11px] text-text-muted mono mt-0.5">{record.id}</div>
            </div>
            <span className="text-[12px] text-text-secondary">{record.region}</span>
            <span className="text-[12px] text-text-secondary">{record.ecosystem}</span>
            <span className="text-[12px] text-text-tertiary mono">{record.created}</span>
            <span className="text-right">
              <StatusIndicator
                status={
                  record.status === 'analysed'
                    ? 'good'
                    : record.status === 'in-progress'
                    ? 'moderate'
                    : 'poor'
                }
                label={record.status === 'analysed' ? 'Analysed' : record.status === 'in-progress' ? 'In progress' : 'Draft'}
              />
            </span>
          </Link>
        ))}
      </div>

      {/* Responsive mobile view */}
      <div className="mt-4 block xl:hidden">
        <p className="text-[10px] text-text-muted">
          Scroll horizontally on smaller screens to view all columns.
        </p>
      </div>
    </div>
  );
}
