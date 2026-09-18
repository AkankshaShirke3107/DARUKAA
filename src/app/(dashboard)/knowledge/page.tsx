'use client';

import { useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { evidenceSources, retrievalQuery, type EvidenceSource } from '@/data/mock-evidence';
import { Search, ExternalLink, X } from 'lucide-react';

const categories = ['all', 'soil', 'climate', 'biodiversity', 'land', 'human-impact'] as const;

function EvidenceCard({
  source,
  onSelect,
}: {
  source: EvidenceSource;
  onSelect: (s: EvidenceSource) => void;
}) {
  return (
    <button
      onClick={() => onSelect(source)}
      className="w-full text-left border border-border rounded-[var(--radius-md)] p-4 hover:border-border-emphasis transition-default bg-bg-secondary"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-secondary px-1.5 py-0.5 border border-border rounded">
            {source.source}
          </span>
          <span className="text-[11px] text-text-muted mono">{source.year}</span>
        </div>
        <span className="text-[11px] text-text-muted mono">{source.id}</span>
      </div>

      <h3 className="text-[13px] font-medium text-text-primary mb-2 leading-snug">
        {source.title}
      </h3>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] text-text-muted">{source.topic}</span>
        <span className="text-[11px] text-text-muted">·</span>
        <span className="text-[11px] text-text-muted capitalize">{source.evidenceType.replace('-', ' ')}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {source.variables.map((v) => (
          <span
            key={v}
            className="text-[10px] text-text-tertiary px-1.5 py-0.5 bg-bg-elevated rounded"
          >
            {v}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-[60px] h-[3px] bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${source.relevance}%`,
                backgroundColor: source.relevance >= 90 ? 'var(--accent)' : 'var(--warning)',
              }}
            />
          </div>
          <span className="text-[11px] mono text-text-tertiary">{source.relevance}%</span>
        </div>
      </div>
    </button>
  );
}

function EvidenceDrawer({
  source,
  onClose,
}: {
  source: EvidenceSource;
  onClose: () => void;
}) {
  return (
    <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium text-text-secondary px-1.5 py-0.5 border border-border rounded">
              {source.source}
            </span>
            <span className="text-[11px] text-text-muted mono">{source.year}</span>
            <span className="text-[11px] text-text-muted capitalize">
              {source.evidenceType.replace('-', ' ')}
            </span>
          </div>
          <h3 className="text-[15px] font-medium text-text-primary leading-snug">
            {source.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-text-muted hover:text-text-secondary transition-default"
          aria-label="Close drawer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="pb-4 mb-4 border-b border-border">
        <div className="label-xs mb-2">Abstract</div>
        <p className="text-[13px] text-text-tertiary leading-relaxed">{source.abstract}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-border">
        <div>
          <div className="label-xs mb-1.5">Relevance</div>
          <div className="flex items-center gap-2">
            <div className="w-[80px] h-[3px] bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${source.relevance}%`,
                  backgroundColor: source.relevance >= 90 ? 'var(--accent)' : 'var(--warning)',
                }}
              />
            </div>
            <span className="metric-value-sm">{source.relevance}%</span>
          </div>
        </div>
        <div>
          <div className="label-xs mb-1.5">Category</div>
          <span className="text-[13px] text-text-secondary capitalize">
            {source.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div>
        <div className="label-xs mb-2">Environmental variables</div>
        <div className="flex flex-wrap gap-1.5">
          {source.variables.map((v) => (
            <span
              key={v}
              className="text-[11px] text-text-secondary px-2 py-0.5 border border-border rounded"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <span className="text-[11px] text-text-muted mono">{source.id}</span>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(retrievalQuery);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);

  const filtered =
    filter === 'all'
      ? evidenceSources
      : evidenceSources.filter((s) => s.category === filter);

  return (
    <div>
      <SectionHeader
        title="Knowledge"
        subtitle="Scientific evidence retrieved for the current environmental assessment."
        actions={
          <span className="text-[11px] text-text-muted mono">
            {filtered.length} sources
          </span>
        }
      />

      {/* Query display */}
      <div className="border border-border rounded-[var(--radius-md)] p-4 mb-6 bg-bg-secondary">
        <div className="label-xs mb-2">Retrieval query</div>
        <div className="flex items-center gap-2">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-[13px] text-text-primary mono p-0 focus:outline-none"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-[11px] px-2.5 py-1 rounded-[var(--radius-sm)] transition-default capitalize ${
              filter === cat
                ? 'bg-accent-subtle text-accent-hover'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
            }`}
          >
            {cat === 'human-impact' ? 'Human impact' : cat}
          </button>
        ))}
      </div>

      {/* Evidence grid + drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((source) => (
            <EvidenceCard
              key={source.id}
              source={source}
              onSelect={setSelectedEvidence}
            />
          ))}
        </div>

        {selectedEvidence && (
          <EvidenceDrawer
            source={selectedEvidence}
            onClose={() => setSelectedEvidence(null)}
          />
        )}
      </div>
    </div>
  );
}
