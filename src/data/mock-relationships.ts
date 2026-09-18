export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  category: 'climate' | 'soil' | 'biodiversity' | 'land' | 'outcome';
  value?: string;
  status?: 'good' | 'moderate' | 'poor' | 'critical';
  description: string;
  evidenceCount: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: 'strong' | 'moderate' | 'weak';
  type: 'positive' | 'negative' | 'neutral';
  label?: string;
}

export const relationshipNodes: GraphNode[] = [
  {
    id: 'rainfall',
    label: 'Rainfall',
    x: 400, y: 40,
    category: 'climate',
    value: '680 mm/yr',
    status: 'poor',
    description: 'Annual precipitation drives water availability across the ecosystem, directly influencing soil moisture retention and plant survival capacity.',
    evidenceCount: 12,
  },
  {
    id: 'temperature',
    label: 'Temperature',
    x: 620, y: 40,
    category: 'climate',
    value: '31.4°C',
    status: 'moderate',
    description: 'Mean temperature affects evapotranspiration rates, soil microbial activity, and species metabolic demands.',
    evidenceCount: 8,
  },
  {
    id: 'water-availability',
    label: 'Water Availability',
    x: 500, y: 140,
    category: 'climate',
    value: 'Low',
    status: 'poor',
    description: 'Effective water availability for ecosystem processes, determined by rainfall minus evapotranspiration and runoff.',
    evidenceCount: 6,
  },
  {
    id: 'soil-moisture',
    label: 'Soil Moisture',
    x: 300, y: 240,
    category: 'soil',
    value: 'Low',
    status: 'poor',
    description: 'Available water content in the soil profile, critical for root uptake, microbial activity, and nutrient cycling.',
    evidenceCount: 9,
  },
  {
    id: 'soil-biology',
    label: 'Soil Biology',
    x: 300, y: 340,
    category: 'soil',
    value: 'Reduced',
    status: 'poor',
    description: 'Diversity and activity of soil microorganisms, fungi, and invertebrates that drive decomposition and nutrient cycling.',
    evidenceCount: 7,
  },
  {
    id: 'organic-carbon',
    label: 'Organic Carbon',
    x: 300, y: 440,
    category: 'soil',
    value: '0.30%',
    status: 'poor',
    description: 'Soil organic carbon content, a primary indicator of soil health, fertility, and carbon sequestration capacity.',
    evidenceCount: 14,
  },
  {
    id: 'species-survival',
    label: 'Species Survival',
    x: 650, y: 240,
    category: 'biodiversity',
    value: 'Stressed',
    status: 'poor',
    description: 'Capacity of local species populations to persist under current environmental conditions.',
    evidenceCount: 5,
  },
  {
    id: 'monoculture',
    label: 'Monoculture',
    x: 150, y: 340,
    category: 'land',
    value: 'Wheat',
    status: 'poor',
    description: 'Single-crop cultivation reduces habitat heterogeneity and depletes specific soil nutrients while increasing pest vulnerability.',
    evidenceCount: 11,
  },
  {
    id: 'habitat-diversity',
    label: 'Habitat Diversity',
    x: 650, y: 380,
    category: 'biodiversity',
    value: 'Low',
    status: 'poor',
    description: 'Variety of distinct habitats available within the landscape, essential for supporting diverse species assemblages.',
    evidenceCount: 8,
  },
  {
    id: 'pollinator-resources',
    label: 'Pollinator Resources',
    x: 500, y: 440,
    category: 'biodiversity',
    value: 'Limited',
    status: 'poor',
    description: 'Availability of floral resources, nesting sites, and foraging habitat for pollinating species.',
    evidenceCount: 6,
  },
  {
    id: 'biodiversity',
    label: 'Biodiversity',
    x: 500, y: 540,
    category: 'outcome',
    value: 'Low',
    status: 'poor',
    description: 'Overall biological diversity of the ecosystem, integrating species richness, functional diversity, and ecological connectivity.',
    evidenceCount: 16,
  },
  {
    id: 'ecosystem-resilience',
    label: 'Ecosystem Resilience',
    x: 500, y: 630,
    category: 'outcome',
    value: 'Low',
    status: 'critical',
    description: 'Capacity of the ecosystem to absorb disturbances while retaining its essential structure and functions.',
    evidenceCount: 10,
  },
];

export const relationshipEdges: GraphEdge[] = [
  { source: 'rainfall', target: 'water-availability', strength: 'strong', type: 'positive' },
  { source: 'temperature', target: 'water-availability', strength: 'moderate', type: 'negative', label: 'evapotranspiration' },
  { source: 'water-availability', target: 'soil-moisture', strength: 'strong', type: 'positive' },
  { source: 'water-availability', target: 'species-survival', strength: 'strong', type: 'positive' },
  { source: 'soil-moisture', target: 'soil-biology', strength: 'strong', type: 'positive' },
  { source: 'soil-biology', target: 'organic-carbon', strength: 'strong', type: 'positive' },
  { source: 'monoculture', target: 'soil-biology', strength: 'moderate', type: 'negative' },
  { source: 'monoculture', target: 'habitat-diversity', strength: 'strong', type: 'negative' },
  { source: 'species-survival', target: 'biodiversity', strength: 'strong', type: 'positive' },
  { source: 'habitat-diversity', target: 'biodiversity', strength: 'strong', type: 'positive' },
  { source: 'pollinator-resources', target: 'biodiversity', strength: 'moderate', type: 'positive' },
  { source: 'organic-carbon', target: 'biodiversity', strength: 'moderate', type: 'positive' },
  { source: 'organic-carbon', target: 'pollinator-resources', strength: 'weak', type: 'positive' },
  { source: 'habitat-diversity', target: 'pollinator-resources', strength: 'strong', type: 'positive' },
  { source: 'biodiversity', target: 'ecosystem-resilience', strength: 'strong', type: 'positive' },
  { source: 'organic-carbon', target: 'ecosystem-resilience', strength: 'moderate', type: 'positive' },
];

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'climate': return '#6B8E9B';
    case 'soil': return '#A6885A';
    case 'biodiversity': return '#5A7A5A';
    case 'land': return '#8B7355';
    case 'outcome': return '#7A7A8A';
    default: return '#6B776B';
  }
}
