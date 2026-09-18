'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeader from '@/components/ui/SectionHeader';
import LoadingState from '@/components/ui/LoadingState';
import { demoAssessment, ecosystemTypes, landUseTypes, analysisSteps } from '@/data/mock-assessment';
import type { AssessmentInput } from '@/data/mock-assessment';

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] text-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-7 mb-7 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
      <div className="label-sm mb-4">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const [form, setForm] = useState<AssessmentInput>(demoAssessment);
  const [analysing, setAnalysing] = useState(false);

  const updateField = (section: keyof AssessmentInput, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalysing(true);
  };

  const handleAnalysisComplete = () => {
    setTimeout(() => {
      router.push('/state');
    }, 600);
  };

  if (analysing) {
    return (
      <LoadingState
        title="ANALYSING ENVIRONMENT"
        steps={analysisSteps}
        onComplete={handleAnalysisComplete}
      />
    );
  }

  return (
    <div>
      <SectionHeader
        title="Environmental Assessment"
        subtitle="Define the current environmental state before analysis. Provide observations across soil, climate, land use, and biodiversity dimensions."
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-[var(--radius-md)]">
          <div className="p-5 sm:p-6">
            <FormSection title="LOCATION">
              <FormField label="Region">
                <input
                  type="text"
                  value={form.location.region}
                  onChange={(e) => updateField('location', 'region', e.target.value)}
                  placeholder="e.g. Maharashtra, India"
                  className="w-full"
                />
              </FormField>
              <FormField label="Latitude">
                <input
                  type="text"
                  value={form.location.latitude}
                  onChange={(e) => updateField('location', 'latitude', e.target.value)}
                  placeholder="e.g. 19.0760"
                  className="w-full mono"
                />
              </FormField>
              <FormField label="Longitude">
                <input
                  type="text"
                  value={form.location.longitude}
                  onChange={(e) => updateField('location', 'longitude', e.target.value)}
                  placeholder="e.g. 72.8777"
                  className="w-full mono"
                />
              </FormField>
              <FormField label="Ecosystem Type">
                <select
                  value={form.location.ecosystemType}
                  onChange={(e) => updateField('location', 'ecosystemType', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select type</option>
                  {ecosystemTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </FormField>
            </FormSection>

            <FormSection title="SOIL">
              <FormField label="pH">
                <input
                  type="text"
                  value={form.soil.ph}
                  onChange={(e) => updateField('soil', 'ph', e.target.value)}
                  placeholder="e.g. 6.2"
                  className="w-full mono"
                />
              </FormField>
              <FormField label="Organic Carbon (%)">
                <input
                  type="text"
                  value={form.soil.organicCarbon}
                  onChange={(e) => updateField('soil', 'organicCarbon', e.target.value)}
                  placeholder="e.g. 0.30"
                  className="w-full mono"
                />
              </FormField>
              <FormField label="Moisture">
                <select
                  value={form.soil.moisture}
                  onChange={(e) => updateField('soil', 'moisture', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level</option>
                  <option value="very-low">Very Low</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="adequate">Adequate</option>
                  <option value="high">High</option>
                </select>
              </FormField>
              <FormField label="Nitrogen (kg/ha)">
                <input
                  type="text"
                  value={form.soil.nitrogen}
                  onChange={(e) => updateField('soil', 'nitrogen', e.target.value)}
                  placeholder="Optional"
                  className="w-full mono"
                />
              </FormField>
              <FormField label="Phosphorus (kg/ha)">
                <input
                  type="text"
                  value={form.soil.phosphorus}
                  onChange={(e) => updateField('soil', 'phosphorus', e.target.value)}
                  placeholder="Optional"
                  className="w-full mono"
                />
              </FormField>
            </FormSection>

            <FormSection title="CLIMATE">
              <FormField label="Annual Rainfall (mm)">
                <input
                  type="text"
                  value={form.climate.rainfall}
                  onChange={(e) => updateField('climate', 'rainfall', e.target.value)}
                  placeholder="e.g. 680"
                  className="w-full mono"
                />
              </FormField>
              <FormField label="Mean Temperature (°C)">
                <input
                  type="text"
                  value={form.climate.temperature}
                  onChange={(e) => updateField('climate', 'temperature', e.target.value)}
                  placeholder="e.g. 31.4"
                  className="w-full mono"
                />
              </FormField>
              <FormField label="Seasonality">
                <select
                  value={form.climate.seasonality}
                  onChange={(e) => updateField('climate', 'seasonality', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </FormField>
            </FormSection>

            <FormSection title="LAND">
              <FormField label="Land Use">
                <select
                  value={form.land.landUse}
                  onChange={(e) => updateField('land', 'landUse', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select type</option>
                  {landUseTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Crop">
                <input
                  type="text"
                  value={form.land.crop}
                  onChange={(e) => updateField('land', 'crop', e.target.value)}
                  placeholder="e.g. Wheat"
                  className="w-full"
                />
              </FormField>
              <FormField label="Habitat Diversity">
                <select
                  value={form.land.habitatDiversity}
                  onChange={(e) => updateField('land', 'habitatDiversity', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level</option>
                  <option value="very-low">Very Low</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </FormField>
              <FormField label="Fragmentation">
                <select
                  value={form.land.fragmentation}
                  onChange={(e) => updateField('land', 'fragmentation', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </FormField>
            </FormSection>

            <FormSection title="BIODIVERSITY">
              <FormField label="Species Richness">
                <select
                  value={form.biodiversity.speciesRichness}
                  onChange={(e) => updateField('biodiversity', 'speciesRichness', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level</option>
                  <option value="very-low">Very Low</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </FormField>
              <FormField label="Pollinator Presence">
                <select
                  value={form.biodiversity.pollinatorPresence}
                  onChange={(e) => updateField('biodiversity', 'pollinatorPresence', e.target.value)}
                  className="w-full"
                >
                  <option value="">Select level</option>
                  <option value="absent">Absent</option>
                  <option value="limited">Limited</option>
                  <option value="moderate">Moderate</option>
                  <option value="abundant">Abundant</option>
                </select>
              </FormField>
              <FormField label="Native Vegetation (%)">
                <input
                  type="text"
                  value={form.biodiversity.nativeVegetation}
                  onChange={(e) => updateField('biodiversity', 'nativeVegetation', e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full mono"
                />
              </FormField>
            </FormSection>
          </div>

          {/* Submit bar */}
          <div className="border-t border-border px-5 sm:px-6 py-4 flex items-center justify-between">
            <span className="text-[12px] text-text-muted">
              All fields support demo values for demonstration purposes.
            </span>
            <button
              type="submit"
              className="text-[13px] font-medium bg-accent text-bg-primary px-5 py-2 rounded-[var(--radius-sm)] hover:bg-accent-hover transition-default"
            >
              Analyse ecosystem
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
