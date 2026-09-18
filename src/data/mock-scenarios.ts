export interface ScenarioParameter {
  id: string;
  label: string;
  unit: string;
  current: number;
  min: number;
  max: number;
  step: number;
}

export interface ScenarioResult {
  metric: string;
  current: number;
  scenario: number;
  unit: string;
  direction: 'better' | 'worse' | 'neutral';
}

export const scenarioParameters: ScenarioParameter[] = [
  { id: 'rainfall', label: 'Rainfall', unit: '%', current: 100, min: 50, max: 150, step: 5 },
  { id: 'soil-carbon', label: 'Soil Organic Carbon', unit: '%', current: 0.30, min: 0.10, max: 2.0, step: 0.05 },
  { id: 'temperature', label: 'Temperature Change', unit: '°C', current: 0, min: -2, max: 4, step: 0.5 },
  { id: 'habitat-diversity', label: 'Habitat Diversity', unit: '%', current: 15, min: 5, max: 60, step: 5 },
  { id: 'land-intensity', label: 'Land-use Intensity', unit: '%', current: 85, min: 30, max: 100, step: 5 },
];

export function computeScenarioResults(params: Record<string, number>): ScenarioResult[] {
  const rainfall = params['rainfall'] ?? 100;
  const soilCarbon = params['soil-carbon'] ?? 0.30;
  const tempChange = params['temperature'] ?? 0;
  const habitatDiv = params['habitat-diversity'] ?? 15;
  const landIntensity = params['land-intensity'] ?? 85;

  // Demo scenario model — clearly simplified
  const waterStress = Math.round(42 + (100 - rainfall) * 0.4 + tempChange * 5);
  const habitatPressure = Math.round(51 + (85 - habitatDiv) * 0.3 + landIntensity * 0.15);
  const soilResilience = Math.round(18 + soilCarbon * 40 + (rainfall - 80) * 0.1 - landIntensity * 0.1);
  const biodiversityIndex = Math.round(25 + habitatDiv * 0.6 + soilCarbon * 15 - waterStress * 0.2);
  const pollinatorCapacity = Math.round(20 + habitatDiv * 0.8 - landIntensity * 0.15 + soilCarbon * 10);

  const baseResults = computeBaseResults();

  return [
    {
      metric: 'Water Stress Index',
      current: baseResults.waterStress,
      scenario: Math.max(0, Math.min(100, waterStress)),
      unit: '/100',
      direction: waterStress > baseResults.waterStress ? 'worse' : waterStress < baseResults.waterStress ? 'better' : 'neutral',
    },
    {
      metric: 'Habitat Pressure',
      current: baseResults.habitatPressure,
      scenario: Math.max(0, Math.min(100, habitatPressure)),
      unit: '/100',
      direction: habitatPressure > baseResults.habitatPressure ? 'worse' : habitatPressure < baseResults.habitatPressure ? 'better' : 'neutral',
    },
    {
      metric: 'Soil Resilience',
      current: baseResults.soilResilience,
      scenario: Math.max(0, Math.min(100, soilResilience)),
      unit: '/100',
      direction: soilResilience < baseResults.soilResilience ? 'worse' : soilResilience > baseResults.soilResilience ? 'better' : 'neutral',
    },
    {
      metric: 'Biodiversity Index',
      current: baseResults.biodiversityIndex,
      scenario: Math.max(0, Math.min(100, biodiversityIndex)),
      unit: '/100',
      direction: biodiversityIndex < baseResults.biodiversityIndex ? 'worse' : biodiversityIndex > baseResults.biodiversityIndex ? 'better' : 'neutral',
    },
    {
      metric: 'Pollinator Capacity',
      current: baseResults.pollinatorCapacity,
      scenario: Math.max(0, Math.min(100, pollinatorCapacity)),
      unit: '/100',
      direction: pollinatorCapacity < baseResults.pollinatorCapacity ? 'worse' : pollinatorCapacity > baseResults.pollinatorCapacity ? 'better' : 'neutral',
    },
  ];
}

function computeBaseResults() {
  return {
    waterStress: 42,
    habitatPressure: 51,
    soilResilience: 23,
    biodiversityIndex: 31,
    pollinatorCapacity: 18,
  };
}
