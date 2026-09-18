'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

const dimensions = [
  { id: 'soil', label: 'SOIL', x: 200, y: 120, desc: 'Organic carbon, pH, moisture, nutrients' },
  { id: 'climate', label: 'CLIMATE', x: 500, y: 80, desc: 'Rainfall, temperature, seasonality' },
  { id: 'land', label: 'LAND USE', x: 500, y: 280, desc: 'Cultivation, fragmentation, habitat' },
  { id: 'biodiversity', label: 'BIODIVERSITY', x: 200, y: 280, desc: 'Species richness, pollinators, vegetation' },
];

const connections = [
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3],
];

function LandingVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Scale positions to canvas
    const scaleX = w / 700;
    const scaleY = h / 400;
    const nodes = dimensions.map((d) => ({
      ...d,
      sx: d.x * scaleX,
      sy: d.y * scaleY,
    }));

    function getHovered(mx: number, my: number): number | null {
      for (let i = 0; i < nodes.length; i++) {
        const dx = mx - nodes[i].sx;
        const dy = my - nodes[i].sy;
        if (dx * dx + dy * dy < 2500) return i;
      }
      return null;
    }

    function draw(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const hovered = hoveredRef.current;

      // Draw connections
      connections.forEach(([a, b]) => {
        const isHighlighted = hovered === a || hovered === b;
        ctx.beginPath();
        ctx.moveTo(nodes[a].sx, nodes[a].sy);
        ctx.lineTo(nodes[b].sx, nodes[b].sy);
        ctx.strokeStyle = isHighlighted
          ? 'rgba(90, 122, 90, 0.4)'
          : 'rgba(232, 236, 232, 0.06)';
        ctx.lineWidth = isHighlighted ? 1.5 : 1;
        ctx.stroke();

        // Subtle animated dot along the line
        if (isHighlighted) {
          const t = ((time / 3000) + a * 0.3) % 1;
          const px = nodes[a].sx + (nodes[b].sx - nodes[a].sx) * t;
          const py = nodes[a].sy + (nodes[b].sy - nodes[a].sy) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(90, 122, 90, 0.6)';
          ctx.fill();
        }
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        const isHovered = hovered === i;
        const isConnected = hovered !== null && connections.some(
          ([a, b]) => (a === hovered && b === i) || (b === hovered && a === i)
        );

        // Node dot
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, isHovered ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isHovered
          ? '#5A7A5A'
          : isConnected
          ? 'rgba(90, 122, 90, 0.6)'
          : 'rgba(232, 236, 232, 0.25)';
        ctx.fill();

        // Label
        ctx.font = `500 ${isHovered ? '11px' : '10px'} var(--font-geist-sans), system-ui`;
        ctx.fillStyle = isHovered
          ? '#E8ECE8'
          : isConnected
          ? '#9CA89C'
          : '#6B776B';
        ctx.letterSpacing = '0.08em';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.sx, node.sy - 14);

        // Description on hover
        if (isHovered) {
          ctx.font = '12px var(--font-geist-sans), system-ui';
          ctx.fillStyle = '#6B776B';
          ctx.fillText(node.desc, node.sx, node.sy + 22);
        }
      });

      animFrameRef.current = requestAnimationFrame(draw);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      hoveredRef.current = getHovered(mouseRef.current.x, mouseRef.current.y);
      canvas.style.cursor = hoveredRef.current !== null ? 'pointer' : 'default';
    };

    const handleMouseLeave = () => {
      hoveredRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[280px] sm:h-[340px]"
      style={{ maxWidth: '700px' }}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.12em] text-text-secondary">DARUKAA</span>
          <span className="text-[11px] font-medium tracking-[0.04em] text-text-tertiary ml-2">BIOSPHERE</span>
        </div>
        <Link
          href="/assessment"
          className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-default"
        >
          Open platform →
        </Link>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pt-16 sm:pt-24 pb-8">
        <div className="label-sm mb-5 text-center">Environmental Intelligence System</div>
        <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-semibold tracking-[-0.03em] text-text-primary text-center leading-[1.15] max-w-[640px]">
          Environmental intelligence<br />for living systems.
        </h1>
        <p className="text-[14px] sm:text-[15px] text-text-tertiary text-center mt-5 max-w-[520px] leading-relaxed">
          Connect soil, climate, land use and biodiversity to understand ecological risk and identify evidence-backed interventions.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 mt-8">
          <Link
            href="/assessment"
            className="flex items-center gap-2 text-[13px] font-medium bg-accent text-bg-primary px-5 py-2.5 rounded-[var(--radius-sm)] hover:bg-accent-hover transition-default"
          >
            Start an assessment
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/state"
            className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-default px-4 py-2.5 border border-border rounded-[var(--radius-sm)] hover:border-border-emphasis"
          >
            Explore how it works
          </Link>
        </div>

        {/* Visualization */}
        <div className="w-full max-w-[700px] mt-14 sm:mt-20">
          <LandingVisualization />
        </div>
      </div>

      {/* Process strip */}
      <div className="border-t border-border px-6 sm:px-10 py-8">
        <div className="max-w-[800px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {['Observe', 'Understand', 'Reason', 'Act'].map((step, i) => (
            <div key={step} className="text-center">
              <div className="mono text-[11px] text-text-muted mb-1.5">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="text-[14px] font-medium text-text-secondary">{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature description strip */}
      <div className="border-t border-border px-6 sm:px-10 py-12">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="label-xs mb-3">Evidence retrieval</div>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Scientific literature and environmental data are retrieved and ranked for relevance to the current assessment context.
            </p>
          </div>
          <div>
            <div className="label-xs mb-3">Multi-variable reasoning</div>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Environmental interactions are mapped across soil, climate, land use, and biodiversity to identify cascading effects.
            </p>
          </div>
          <div>
            <div className="label-xs mb-3">Ecological interventions</div>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Recommendations are generated from evidence, accounting for local conditions, resource constraints, and time horizons.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 sm:px-10 py-5">
        <div className="flex items-center justify-between text-[11px] text-text-muted">
          <span>Darukaa Biosphere · Environmental Intelligence System</span>
          <span>Demo instance · v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}
