'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusIndicator from '@/components/ui/StatusIndicator';
import {
  relationshipNodes,
  relationshipEdges,
  getCategoryColor,
  type GraphNode,
} from '@/data/mock-relationships';

function NodeDetail({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const connectedEdges = relationshipEdges.filter(
    (e) => e.source === node.id || e.target === node.id
  );
  const connectedIds = new Set(
    connectedEdges.flatMap((e) => [e.source, e.target]).filter((id) => id !== node.id)
  );
  const connectedNodes = relationshipNodes.filter((n) => connectedIds.has(n.id));

  return (
    <div className="border border-border rounded-[var(--radius-md)] p-4 bg-bg-secondary">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="label-xs mb-1" style={{ color: getCategoryColor(node.category) }}>
            {node.category.toUpperCase()}
          </div>
          <h3 className="text-[15px] font-medium text-text-primary">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-[11px] text-text-muted hover:text-text-secondary transition-default"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border">
        <div>
          <div className="label-xs mb-1">Value</div>
          <div className="metric-value-sm">{node.value || '—'}</div>
        </div>
        <div>
          <div className="label-xs mb-1">Status</div>
          {node.status ? (
            <StatusIndicator status={node.status} />
          ) : (
            <span className="text-[12px] text-text-muted">—</span>
          )}
        </div>
        <div>
          <div className="label-xs mb-1">Evidence</div>
          <div className="metric-value-sm">{node.evidenceCount}</div>
        </div>
      </div>

      <p className="text-[12px] text-text-tertiary leading-relaxed mb-4">
        {node.description}
      </p>

      <div>
        <div className="label-xs mb-2">Connected variables</div>
        <div className="flex flex-wrap gap-1.5">
          {connectedNodes.map((cn) => (
            <span
              key={cn.id}
              className="text-[11px] px-2 py-0.5 border border-border rounded-[var(--radius-sm)] text-text-secondary"
            >
              {cn.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RelationshipsPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 700 });

  const updateDimensions = useCallback(() => {
    if (svgRef.current?.parentElement) {
      const w = svgRef.current.parentElement.clientWidth;
      setSvgDimensions({ width: Math.max(w, 600), height: 700 });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const scaleX = svgDimensions.width / 800;
  const scaleY = svgDimensions.height / 700;

  const getNodePos = (node: GraphNode) => ({
    x: node.x * scaleX,
    y: node.y * scaleY,
  });

  const isConnected = (nodeId: string) => {
    if (!hovered) return false;
    return relationshipEdges.some(
      (e) =>
        (e.source === hovered && e.target === nodeId) ||
        (e.target === hovered && e.source === nodeId)
    );
  };

  return (
    <div>
      <SectionHeader
        title="Ecological Relationships"
        subtitle="Interactive causal map showing how environmental variables influence each other in the current ecosystem."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Graph */}
        <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="label-xs">Relationship diagram</div>
            <div className="flex items-center gap-4">
              {['climate', 'soil', 'biodiversity', 'land', 'outcome'].map((cat) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(cat) }}
                  />
                  <span className="text-[10px] text-text-muted capitalize">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
            className="w-full"
            style={{ height: '600px' }}
          >
            {/* Edges */}
            {relationshipEdges.map((edge) => {
              const sourceNode = relationshipNodes.find((n) => n.id === edge.source);
              const targetNode = relationshipNodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const s = getNodePos(sourceNode);
              const t = getNodePos(targetNode);
              const isActive =
                hovered === edge.source ||
                hovered === edge.target ||
                selected?.id === edge.source ||
                selected?.id === edge.target;

              return (
                <g key={`${edge.source}-${edge.target}`}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={
                      isActive
                        ? edge.type === 'negative'
                          ? 'rgba(166, 82, 82, 0.5)'
                          : 'rgba(90, 122, 90, 0.5)'
                        : 'rgba(232, 236, 232, 0.06)'
                    }
                    strokeWidth={isActive ? 1.5 : 1}
                    strokeDasharray={edge.strength === 'weak' ? '4 4' : undefined}
                  />
                  {/* Arrowhead */}
                  {isActive && (
                    <circle
                      cx={t.x - (t.x - s.x) * 0.15}
                      cy={t.y - (t.y - s.y) * 0.15}
                      r={2.5}
                      fill={
                        edge.type === 'negative'
                          ? 'rgba(166, 82, 82, 0.6)'
                          : 'rgba(90, 122, 90, 0.6)'
                      }
                    />
                  )}
                  {isActive && edge.label && (
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 - 8}
                      fill="var(--text-muted)"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="var(--font-geist-mono)"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {relationshipNodes.map((node) => {
              const pos = getNodePos(node);
              const isActive =
                hovered === node.id ||
                selected?.id === node.id ||
                isConnected(node.id);
              const isSelected = selected?.id === node.id;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(isSelected ? null : node)}
                >
                  {/* Hit area */}
                  <circle cx={pos.x} cy={pos.y} r={24} fill="transparent" />
                  {/* Node */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 6 : isActive ? 5 : 4}
                    fill={getCategoryColor(node.category)}
                    opacity={isActive ? 1 : 0.5}
                    style={{ transition: 'all 150ms ease' }}
                  />
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={10}
                      fill="none"
                      stroke={getCategoryColor(node.category)}
                      strokeWidth={1}
                      opacity={0.3}
                    />
                  )}
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y - 14}
                    fill={isActive ? 'var(--text-primary)' : 'var(--text-muted)'}
                    fontSize={isActive ? '11' : '10'}
                    fontWeight={isActive ? '500' : '400'}
                    textAnchor="middle"
                    fontFamily="var(--font-geist-sans)"
                    style={{ transition: 'fill 150ms ease' }}
                  >
                    {node.label}
                  </text>
                  {/* Value on hover */}
                  {isActive && node.value && (
                    <text
                      x={pos.x}
                      y={pos.y + 20}
                      fill="var(--text-tertiary)"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="var(--font-geist-mono)"
                    >
                      {node.value}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <NodeDetail node={selected} onClose={() => setSelected(null)} />
          ) : (
            <div className="border border-border rounded-[var(--radius-md)] p-4 bg-bg-secondary">
              <div className="label-xs mb-3">Variable detail</div>
              <p className="text-[13px] text-text-muted leading-relaxed">
                Select a node in the relationship diagram to view its current state, connected
                variables, and supporting evidence.
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="label-xs mb-2">Graph summary</div>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <span className="text-text-muted">Variables</span>
                    <span className="mono text-text-secondary ml-2">{relationshipNodes.length}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Connections</span>
                    <span className="mono text-text-secondary ml-2">{relationshipEdges.length}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Causal paths</span>
                    <span className="mono text-text-secondary ml-2">6</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Feedback loops</span>
                    <span className="mono text-text-secondary ml-2">2</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
