import SectionHeader from '@/components/ui/SectionHeader';

export default function SettingsPage() {
  return (
    <div>
      <SectionHeader
        title="Settings"
        subtitle="Workspace configuration and system information."
      />

      <div className="space-y-6">
        {/* Workspace */}
        <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary">
          <div className="p-4 sm:p-5 border-b border-border">
            <div className="label-sm mb-3">WORKSPACE</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="text-text-muted block mb-1">Name</span>
                <span className="text-text-secondary">Demo workspace</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Version</span>
                <span className="text-text-secondary mono">0.1.0</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Environment</span>
                <span className="text-text-secondary">Development (demo)</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Last updated</span>
                <span className="text-text-secondary mono">18 Sep 2026</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="label-sm mb-3">DATA SOURCES</div>
            <div className="space-y-2 text-[13px]">
              {[
                { name: 'FAO Soils Portal', type: 'Soil data', status: 'Connected' },
                { name: 'IPCC Climate Data', type: 'Climate variables', status: 'Connected' },
                { name: 'UNEP-WCMC', type: 'Biodiversity indicators', status: 'Connected' },
                { name: 'Scientific literature index', type: 'Evidence retrieval', status: 'Active' },
              ].map((source) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                >
                  <div>
                    <span className="text-text-secondary">{source.name}</span>
                    <span className="text-text-muted ml-2 text-[11px]">{source.type}</span>
                  </div>
                  <span className="text-[11px] text-accent">{source.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About */}
        <div className="border border-border rounded-[var(--radius-md)] bg-bg-secondary p-4 sm:p-5">
          <div className="label-sm mb-3">ABOUT</div>
          <div className="text-[13px] text-text-tertiary leading-relaxed space-y-3">
            <p>
              Darukaa Biosphere is an environmental intelligence system that analyses soil health,
              climate conditions, land use patterns, and biodiversity indicators to produce
              evidence-backed ecological assessments and intervention recommendations.
            </p>
            <p>
              The system retrieves scientific evidence from published research, maps ecological
              relationships across environmental variables, and applies multi-variable reasoning
              to identify cascading environmental interactions.
            </p>
            <p className="text-[11px] text-text-muted">
              This is a demonstration instance. Environmental data and analysis results shown
              are based on mock data for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
