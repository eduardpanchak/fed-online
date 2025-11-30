export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
}

export const mainChecklist: ChecklistItem[] = [
  {
    id: 'accommodation',
    title: 'Find Temporary Accommodation',
    description: 'Book a hotel, Airbnb, or hostel for your first days. Consider locations near public transport.',
    category: 'arrival'
  },
  {
    id: 'sim',
    title: 'Get a UK SIM Card',
    description: 'Buy a pay-as-you-go SIM from supermarkets (Tesco, Sainsbury\'s) or phone shops (EE, Vodafone, O2, Three). Popular budget option: Giffgaff.',
    category: 'arrival'
  },
  {
    id: 'bank',
    title: 'Open a Bank Account',
    description: 'Apply to banks like Lloyds, HSBC, or digital banks (Monzo, Revolut). Bring passport and proof of address.',
    category: 'week1'
  },
  {
    id: 'nin',
    title: 'Apply for National Insurance Number',
    description: 'Call 0800 141 2075 to start your application. You can work while waiting.',
    category: 'week1'
  },
  {
    id: 'gp',
    title: 'Register with a GP',
    description: 'Find a nearby GP surgery on nhs.uk and register. This is free for everyone.',
    category: 'week1'
  },
  {
    id: 'transport',
    title: 'Set Up Transport',
    description: 'Get an Oyster card (London) or contactless payment card. Consider railcards for discounts.',
    category: 'week1'
  },
  {
    id: 'council-tax',
    title: 'Register for Council Tax',
    description: 'Contact your local council within 2 weeks of moving in. Check for exemptions (students) or discounts (single occupancy).',
    category: 'week2'
  },
  {
    id: 'universal-credit',
    title: 'Check Universal Credit Eligibility',
    description: 'If eligible, apply on gov.uk. This is the UK\'s main benefits system for those on low income.',
    category: 'week2'
  },
  {
    id: 'cv',
    title: 'Prepare UK-Style CV',
    description: 'Update your CV to UK format: 2 pages max, no photo, focus on recent experience and achievements.',
    category: 'week2'
  },
  {
    id: 'job-search',
    title: 'Start Job Search',
    description: 'Register on Indeed, LinkedIn, Reed. Consider recruitment agencies. Tailor each application.',
    category: 'ongoing'
  }
];

export const rentingChecklist: ChecklistItem[] = [
  {
    id: 'rent-budget',
    title: 'Set Your Budget',
    description: 'Calculate how much you can afford. Include rent + bills + council tax. Aim for max 30-35% of income.',
    category: 'planning'
  },
  {
    id: 'rent-search',
    title: 'Search for Properties',
    description: 'Use Rightmove, Zoopla, SpareRoom. Check location, transport links, and local amenities.',
    category: 'searching'
  },
  {
    id: 'rent-viewing',
    title: 'Attend Viewings',
    description: 'Check for damp, heating, water pressure. Ask about bills, deposit, and notice period.',
    category: 'searching'
  },
  {
    id: 'rent-deposit',
    title: 'Pay Deposit',
    description: 'Usually 5 weeks\' rent. Must be protected in a deposit protection scheme (TDS, DPS, MyDeposits).',
    category: 'moving'
  }
];

export const healthcareChecklist: ChecklistItem[] = [
  {
    id: 'health-gp',
    title: 'Register with GP',
    description: 'Find and register with a local GP surgery. Free for everyone.',
    category: 'essential'
  },
  {
    id: 'health-dentist',
    title: 'Find an NHS Dentist',
    description: 'Search on nhs.uk for dentists accepting NHS patients. Book a check-up.',
    category: 'essential'
  },
  {
    id: 'health-prescriptions',
    title: 'Understand Prescriptions',
    description: 'Each prescription costs £9.90. Consider a prepayment certificate if you need regular medication.',
    category: 'ongoing'
  }
];
