export interface AssessmentRecord {
  id: string;
  name: string;
  region: string;
  ecosystem: string;
  created: string;
  status: 'analysed' | 'draft' | 'in-progress';
}

export const assessmentHistory: AssessmentRecord[] = [
  {
    id: 'ASM-001',
    name: 'Maharashtra Farm Assessment',
    region: 'Maharashtra, India',
    ecosystem: 'Semi-arid Agricultural',
    created: '18 Sep 2026',
    status: 'analysed',
  },
  {
    id: 'ASM-002',
    name: 'Western Ghats Biodiversity',
    region: 'Karnataka, India',
    ecosystem: 'Tropical Forest',
    created: '12 Sep 2026',
    status: 'analysed',
  },
  {
    id: 'ASM-003',
    name: 'Rajasthan Arid Zone',
    region: 'Rajasthan, India',
    ecosystem: 'Arid / Desert',
    created: '05 Sep 2026',
    status: 'analysed',
  },
  {
    id: 'ASM-004',
    name: 'Sundarbans Wetland Survey',
    region: 'West Bengal, India',
    ecosystem: 'Wetland',
    created: '28 Aug 2026',
    status: 'draft',
  },
  {
    id: 'ASM-005',
    name: 'Punjab Agricultural Belt',
    region: 'Punjab, India',
    ecosystem: 'Semi-arid Agricultural',
    created: '15 Aug 2026',
    status: 'analysed',
  },
];
