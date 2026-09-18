export interface AssessmentInput {
  location: {
    region: string;
    latitude: string;
    longitude: string;
    ecosystemType: string;
  };
  soil: {
    ph: string;
    organicCarbon: string;
    moisture: string;
    nitrogen: string;
    phosphorus: string;
  };
  climate: {
    rainfall: string;
    temperature: string;
    seasonality: string;
  };
  land: {
    landUse: string;
    crop: string;
    habitatDiversity: string;
    fragmentation: string;
  };
  biodiversity: {
    speciesRichness: string;
    pollinatorPresence: string;
    nativeVegetation: string;
  };
}

export const defaultAssessment: AssessmentInput = {
  location: {
    region: '',
    latitude: '',
    longitude: '',
    ecosystemType: '',
  },
  soil: {
    ph: '',
    organicCarbon: '',
    moisture: '',
    nitrogen: '',
    phosphorus: '',
  },
  climate: {
    rainfall: '',
    temperature: '',
    seasonality: '',
  },
  land: {
    landUse: '',
    crop: '',
    habitatDiversity: '',
    fragmentation: '',
  },
  biodiversity: {
    speciesRichness: '',
    pollinatorPresence: '',
    nativeVegetation: '',
  },
};

export const demoAssessment: AssessmentInput = {
  location: {
    region: 'Maharashtra, India',
    latitude: '19.0760',
    longitude: '72.8777',
    ecosystemType: 'semi-arid-agricultural',
  },
  soil: {
    ph: '6.2',
    organicCarbon: '0.30',
    moisture: 'low',
    nitrogen: '180',
    phosphorus: '12',
  },
  climate: {
    rainfall: '680',
    temperature: '31.4',
    seasonality: 'high',
  },
  land: {
    landUse: 'agriculture',
    crop: 'Wheat',
    habitatDiversity: 'low',
    fragmentation: 'high',
  },
  biodiversity: {
    speciesRichness: 'low',
    pollinatorPresence: 'limited',
    nativeVegetation: '15',
  },
};

export const ecosystemTypes = [
  { value: 'tropical-forest', label: 'Tropical Forest' },
  { value: 'temperate-forest', label: 'Temperate Forest' },
  { value: 'semi-arid-agricultural', label: 'Semi-arid Agricultural' },
  { value: 'arid-desert', label: 'Arid / Desert' },
  { value: 'wetland', label: 'Wetland' },
  { value: 'grassland-savanna', label: 'Grassland / Savanna' },
  { value: 'coastal', label: 'Coastal' },
  { value: 'montane', label: 'Montane' },
  { value: 'urban-periurban', label: 'Urban / Peri-urban' },
];

export const landUseTypes = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'forestry', label: 'Forestry' },
  { value: 'pastoral', label: 'Pastoral / Grazing' },
  { value: 'mixed', label: 'Mixed Use' },
  { value: 'conservation', label: 'Conservation' },
  { value: 'urban', label: 'Urban' },
  { value: 'degraded', label: 'Degraded Land' },
];

export const analysisSteps = [
  { label: 'Parsing environmental state', duration: 800 },
  { label: 'Retrieving scientific evidence', duration: 1400 },
  { label: 'Mapping ecological relationships', duration: 1100 },
  { label: 'Evaluating environmental interactions', duration: 1200 },
  { label: 'Generating interventions', duration: 900 },
  { label: 'Validating evidence', duration: 700 },
];
