export interface AnalysisObservation {
  variable: string;
  value: string;
  status: 'good' | 'moderate' | 'poor' | 'critical';
}

export interface AnalysisInteraction {
  title: string;
  variables: string[];
  description: string;
}

export interface AnalysisImplication {
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

export const analysisObservations: AnalysisObservation[] = [
  { variable: 'Annual rainfall', value: '680 mm — below regional average', status: 'poor' },
  { variable: 'Soil organic carbon', value: '0.30% — critically depleted', status: 'critical' },
  { variable: 'Cultivation pattern', value: 'Wheat monoculture', status: 'poor' },
  { variable: 'Habitat diversity', value: 'Low — simplified landscape', status: 'poor' },
  { variable: 'Native vegetation', value: '15% cover remaining', status: 'critical' },
  { variable: 'Pollinator presence', value: 'Limited resources detected', status: 'poor' },
];

export const analysisInteractions: AnalysisInteraction[] = [
  {
    title: 'Water–Soil Carbon Feedback',
    variables: ['Rainfall', 'Soil moisture', 'Organic carbon'],
    description: 'Low rainfall limits soil moisture, reducing microbial activity and organic matter decomposition. This decreases soil organic carbon accumulation, which in turn reduces water retention capacity — creating a reinforcing degradation cycle.',
  },
  {
    title: 'Monoculture–Habitat Simplification',
    variables: ['Monoculture', 'Habitat diversity', 'Pollinator resources'],
    description: 'Continuous wheat monoculture eliminates habitat heterogeneity, reducing structural diversity needed by pollinating species. Limited floral resources outside crop flowering windows create temporal gaps in pollinator support.',
  },
  {
    title: 'Fragmentation–Biodiversity Cascade',
    variables: ['Habitat fragmentation', 'Species richness', 'Ecosystem resilience'],
    description: 'High fragmentation isolates remaining native vegetation patches, reducing gene flow and species dispersal capacity. Small, isolated populations face increased extinction risk, reducing overall ecosystem functional redundancy.',
  },
];

export const analysisImplications: AnalysisImplication[] = [
  {
    title: 'Reduced ecological resilience',
    description: 'The combination of depleted soil carbon, water stress, and simplified habitat creates an ecosystem with limited capacity to absorb disturbances. Recovery from drought or pest events would be significantly delayed.',
    severity: 'high',
  },
  {
    title: 'Declining pollination services',
    description: 'Continued monoculture with limited native vegetation threatens pollinator populations, which may reduce crop productivity and compromise reproductive success of remaining native plant species.',
    severity: 'high',
  },
  {
    title: 'Soil degradation trajectory',
    description: 'Current organic carbon levels suggest ongoing soil degradation. Without intervention, carbon levels may continue declining, further reducing soil fertility, water retention, and biological activity.',
    severity: 'critical',
  },
];

export const analysisSupportingEvidence = {
  total: 8,
  strong: 5,
  moderate: 3,
  ids: ['EV-001', 'EV-003', 'EV-004', 'EV-005', 'EV-006', 'EV-007', 'EV-008', 'EV-010'],
};

export const scientistConversation = {
  message: 'Based on the environmental state analysis, I observe a reinforcing degradation pattern between water limitation, soil carbon depletion, and habitat simplification. Before I can fully distinguish between water-stress-driven biodiversity loss and fragmentation-driven effects, I need one additional variable.',
  question: 'What is the current irrigation condition for this agricultural system?',
  options: [
    { value: 'rain-fed', label: 'Rain-fed only' },
    { value: 'limited', label: 'Limited irrigation' },
    { value: 'reliable', label: 'Reliable irrigation' },
  ],
};
