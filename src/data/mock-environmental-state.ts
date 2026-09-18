export interface MetricData {
  label: string;
  value: string;
  unit?: string;
  status?: 'good' | 'moderate' | 'poor' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export interface DimensionData {
  id: string;
  title: string;
  metrics: MetricData[];
}

export const environmentalState: DimensionData[] = [
  {
    id: 'soil',
    title: 'SOIL',
    metrics: [
      { label: 'Organic Carbon', value: '0.30', unit: '%', status: 'poor' },
      { label: 'pH', value: '6.2', status: 'moderate' },
      { label: 'Moisture', value: 'Low', status: 'poor' },
      { label: 'Nitrogen', value: '180', unit: 'kg/ha', status: 'moderate' },
      { label: 'Phosphorus', value: '12', unit: 'kg/ha', status: 'poor' },
    ],
  },
  {
    id: 'climate',
    title: 'CLIMATE',
    metrics: [
      { label: 'Rainfall', value: '680', unit: 'mm/yr', status: 'poor' },
      { label: 'Temperature', value: '31.4', unit: '°C', status: 'moderate' },
      { label: 'Seasonality', value: 'High', status: 'moderate' },
      { label: 'Drought Risk', value: 'Elevated', status: 'poor' },
    ],
  },
  {
    id: 'land',
    title: 'LAND',
    metrics: [
      { label: 'Crop', value: 'Wheat', status: 'moderate' },
      { label: 'Cultivation', value: 'Monoculture', status: 'poor' },
      { label: 'Habitat Diversity', value: 'Low', status: 'poor' },
      { label: 'Fragmentation', value: 'High', status: 'poor' },
    ],
  },
  {
    id: 'biodiversity',
    title: 'BIODIVERSITY',
    metrics: [
      { label: 'Species Richness', value: 'Low', status: 'poor' },
      { label: 'Pollinator Resources', value: 'Limited', status: 'poor' },
      { label: 'Native Vegetation', value: '15', unit: '%', status: 'critical' },
      { label: 'Ecological Connectivity', value: 'Fragmented', status: 'poor' },
    ],
  },
];

export function getStatusColor(status?: string): string {
  switch (status) {
    case 'good': return 'var(--accent)';
    case 'moderate': return 'var(--warning)';
    case 'poor': return 'var(--danger)';
    case 'critical': return '#C45252';
    default: return 'var(--text-tertiary)';
  }
}
