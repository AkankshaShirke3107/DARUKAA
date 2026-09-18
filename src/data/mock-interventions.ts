export interface Intervention {
  id: string;
  title: string;
  why: string;
  impacts: { metric: string; direction: 'up' | 'down' | 'stable'; magnitude: 'high' | 'moderate' | 'low' }[];
  timeHorizon: 'short' | 'medium' | 'long';
  evidenceStrength: 'strong' | 'moderate' | 'limited';
  supportingEvidence: string[];
  priority: number;
}

export const interventions: Intervention[] = [
  {
    id: 'INT-001',
    title: 'Introduce diversified cropping and native vegetation strips',
    why: 'Monoculture wheat cultivation combined with low habitat diversity has created a simplified landscape with limited ecological function. Diversifying crops and introducing native vegetation strips along field margins would increase habitat heterogeneity, support pollinator populations, and improve soil biological activity through varied root systems and organic matter inputs.',
    impacts: [
      { metric: 'Soil organic carbon', direction: 'up', magnitude: 'high' },
      { metric: 'Habitat diversity', direction: 'up', magnitude: 'high' },
      { metric: 'Pollinator resources', direction: 'up', magnitude: 'high' },
      { metric: 'Species richness', direction: 'up', magnitude: 'moderate' },
      { metric: 'Soil moisture', direction: 'up', magnitude: 'moderate' },
    ],
    timeHorizon: 'medium',
    evidenceStrength: 'strong',
    supportingEvidence: ['EV-004', 'EV-008', 'EV-003'],
    priority: 1,
  },
  {
    id: 'INT-002',
    title: 'Implement soil carbon restoration through cover cropping',
    why: 'Soil organic carbon at 0.30% is critically low for this ecosystem type. Cover cropping during fallow periods would increase organic matter inputs, protect soil from erosion, improve moisture retention through mulch effects, and stimulate soil microbial communities essential for nutrient cycling.',
    impacts: [
      { metric: 'Soil organic carbon', direction: 'up', magnitude: 'high' },
      { metric: 'Soil moisture', direction: 'up', magnitude: 'high' },
      { metric: 'Soil biology', direction: 'up', magnitude: 'high' },
      { metric: 'Water retention', direction: 'up', magnitude: 'moderate' },
    ],
    timeHorizon: 'medium',
    evidenceStrength: 'strong',
    supportingEvidence: ['EV-001', 'EV-007', 'EV-010'],
    priority: 2,
  },
  {
    id: 'INT-003',
    title: 'Establish ecological corridors between habitat patches',
    why: 'High habitat fragmentation is isolating the remaining 15% native vegetation cover into disconnected patches. Establishing linear corridors of native species between patches would restore ecological connectivity, enable species dispersal, and increase effective habitat area for wildlife populations.',
    impacts: [
      { metric: 'Ecological connectivity', direction: 'up', magnitude: 'high' },
      { metric: 'Species richness', direction: 'up', magnitude: 'moderate' },
      { metric: 'Habitat diversity', direction: 'up', magnitude: 'moderate' },
      { metric: 'Native vegetation', direction: 'up', magnitude: 'moderate' },
    ],
    timeHorizon: 'long',
    evidenceStrength: 'moderate',
    supportingEvidence: ['EV-006', 'EV-008'],
    priority: 3,
  },
  {
    id: 'INT-004',
    title: 'Adopt water harvesting and soil moisture conservation',
    why: 'With rainfall at 680 mm/year and high seasonality, water stress is a primary limiting factor. In-situ water harvesting techniques combined with mulching and reduced tillage would maximize the ecological benefit of available precipitation and reduce drought vulnerability.',
    impacts: [
      { metric: 'Soil moisture', direction: 'up', magnitude: 'high' },
      { metric: 'Water stress', direction: 'down', magnitude: 'high' },
      { metric: 'Drought resilience', direction: 'up', magnitude: 'moderate' },
      { metric: 'Soil biology', direction: 'up', magnitude: 'moderate' },
    ],
    timeHorizon: 'short',
    evidenceStrength: 'strong',
    supportingEvidence: ['EV-002', 'EV-009', 'EV-001'],
    priority: 4,
  },
];
