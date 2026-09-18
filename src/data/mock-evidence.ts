export interface EvidenceSource {
  id: string;
  source: string;
  title: string;
  year: number;
  topic: string;
  variables: string[];
  relevance: number;
  evidenceType: 'meta-analysis' | 'field-study' | 'review' | 'model' | 'observational';
  abstract: string;
  category: 'soil' | 'climate' | 'biodiversity' | 'land' | 'human-impact';
}

export const evidenceSources: EvidenceSource[] = [
  {
    id: 'EV-001',
    source: 'FAO',
    title: 'Soil Organic Carbon and Sustainable Land Management',
    year: 2024,
    topic: 'Soil Health',
    variables: ['Soil carbon', 'Moisture', 'Biodiversity'],
    relevance: 92,
    evidenceType: 'review',
    abstract: 'Comprehensive review of soil organic carbon dynamics under various land management practices in semi-arid regions. Establishes quantitative relationships between SOC levels and ecosystem service provision.',
    category: 'soil',
  },
  {
    id: 'EV-002',
    source: 'IPCC',
    title: 'Climate Change and Land: Land–Climate Interactions',
    year: 2023,
    topic: 'Climate Adaptation',
    variables: ['Temperature', 'Rainfall', 'Land degradation'],
    relevance: 88,
    evidenceType: 'meta-analysis',
    abstract: 'Assessment of bidirectional interactions between land surface processes and climate variables. Quantifies feedback mechanisms between land degradation and regional climate patterns.',
    category: 'climate',
  },
  {
    id: 'EV-003',
    source: 'UNEP-WCMC',
    title: 'Biodiversity Indicators for Agricultural Landscapes',
    year: 2024,
    topic: 'Biodiversity Assessment',
    variables: ['Species richness', 'Habitat diversity', 'Pollinator presence'],
    relevance: 95,
    evidenceType: 'field-study',
    abstract: 'Field-validated indicators for measuring biodiversity outcomes in agricultural landscapes. Provides threshold values for species richness under different land-use intensities.',
    category: 'biodiversity',
  },
  {
    id: 'EV-004',
    source: 'Nature Sustainability',
    title: 'Crop Diversification and Ecosystem Services in Semi-arid Systems',
    year: 2023,
    topic: 'Land Management',
    variables: ['Crop diversity', 'Soil health', 'Water retention'],
    relevance: 91,
    evidenceType: 'field-study',
    abstract: 'Multi-year field study demonstrating that diversified cropping systems increase soil organic carbon by 23-40% and improve water retention capacity in semi-arid agricultural ecosystems.',
    category: 'land',
  },
  {
    id: 'EV-005',
    source: 'Science',
    title: 'Pollinator Decline and Agricultural Productivity',
    year: 2024,
    topic: 'Pollination Services',
    variables: ['Pollinator abundance', 'Crop yield', 'Native vegetation'],
    relevance: 87,
    evidenceType: 'meta-analysis',
    abstract: 'Global meta-analysis of 89 studies showing that pollinator decline reduces crop yields by 12-31% depending on crop type, with strongest effects in monoculture systems.',
    category: 'biodiversity',
  },
  {
    id: 'EV-006',
    source: 'IUCN',
    title: 'Habitat Fragmentation Effects on Species Persistence',
    year: 2023,
    topic: 'Conservation Biology',
    variables: ['Fragmentation', 'Species richness', 'Connectivity'],
    relevance: 84,
    evidenceType: 'review',
    abstract: 'Systematic review of habitat fragmentation impacts on species persistence in agricultural landscapes. Identifies minimum habitat patch sizes and connectivity thresholds for various taxa.',
    category: 'biodiversity',
  },
  {
    id: 'EV-007',
    source: 'Geoderma',
    title: 'Soil Microbial Communities Under Water Stress',
    year: 2024,
    topic: 'Soil Microbiology',
    variables: ['Soil moisture', 'Microbial diversity', 'Nutrient cycling'],
    relevance: 89,
    evidenceType: 'field-study',
    abstract: 'Field investigation of soil microbial community shifts under varying moisture regimes. Documents 35-50% reduction in microbial functional diversity below critical moisture thresholds.',
    category: 'soil',
  },
  {
    id: 'EV-008',
    source: 'Global Change Biology',
    title: 'Vegetation Strips as Ecological Corridors in Farmland',
    year: 2023,
    topic: 'Landscape Ecology',
    variables: ['Native vegetation', 'Biodiversity', 'Pest regulation'],
    relevance: 93,
    evidenceType: 'field-study',
    abstract: 'Controlled study across 142 farms demonstrating that native vegetation strips of 3-6m width increase farmland biodiversity by 34% and improve natural pest regulation services.',
    category: 'land',
  },
  {
    id: 'EV-009',
    source: 'WMO',
    title: 'Rainfall Variability and Drought Frequency in South Asia',
    year: 2024,
    topic: 'Climate Risk',
    variables: ['Rainfall', 'Drought', 'Seasonality'],
    relevance: 82,
    evidenceType: 'observational',
    abstract: 'Analysis of 40-year rainfall records across South Asian agricultural regions showing increased inter-annual variability and 18% increase in drought frequency since 2000.',
    category: 'climate',
  },
  {
    id: 'EV-010',
    source: 'Ecological Applications',
    title: 'Integrated Soil–Biodiversity Assessment Framework',
    year: 2024,
    topic: 'Ecosystem Assessment',
    variables: ['Soil carbon', 'Biodiversity', 'Ecosystem resilience'],
    relevance: 90,
    evidenceType: 'model',
    abstract: 'Novel assessment framework integrating soil health metrics with biodiversity indicators to predict ecosystem resilience. Validated across 12 agro-ecological zones.',
    category: 'soil',
  },
];

export const retrievalQuery = 'soil carbon + semi-arid + biodiversity + monoculture impact';
