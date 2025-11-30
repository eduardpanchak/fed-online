export interface Document {
  id: string;
  title: string;
  icon: string;
  whatYouNeed: string[];
  steps: string[];
  expectedTime: string;
  warnings: string[];
}

export const documentsData: Document[] = [
  {
    id: 'nin',
    title: 'National Insurance Number',
    icon: '🔢',
    whatYouNeed: [
      'Proof of identity (passport)',
      'Proof of address (utility bill or tenancy agreement)',
      'Proof of right to work in the UK (visa/BRP)'
    ],
    steps: [
      'Call the NIN application line: 0800 141 2075',
      'Answer questions about your identity and work status',
      'Book a phone or face-to-face appointment if required',
      'Receive your NIN by post within 3 weeks'
    ],
    expectedTime: '2-3 weeks',
    warnings: [
      'You can start work before receiving your NIN',
      'Keep your NIN safe - you\'ll need it for life',
      'Don\'t share your NIN with anyone except official bodies'
    ]
  },
  {
    id: 'bank',
    title: 'Bank Account',
    icon: '🏦',
    whatYouNeed: [
      'Passport or driving licence',
      'Proof of address (less than 3 months old)',
      'BRP card or visa documents'
    ],
    steps: [
      'Choose a bank (Lloyds, HSBC, Barclays, Monzo, Revolut)',
      'Book an appointment or apply online',
      'Bring your documents to the branch/upload online',
      'Wait 5-10 days for your card to arrive'
    ],
    expectedTime: '1-2 weeks',
    warnings: [
      'Some banks require proof of address, which can be difficult initially',
      'Consider digital banks (Monzo, Revolut) for faster setup',
      'You may need a NIN for some accounts'
    ]
  },
  {
    id: 'brp',
    title: 'BRP / Visa Status',
    icon: '🪪',
    whatYouNeed: [
      'Your passport',
      'Decision letter from Home Office',
      'Collection appointment confirmation'
    ],
    steps: [
      'Check your visa decision letter for collection details',
      'Visit the Post Office or collection point within 10 days',
      'Bring your passport and decision letter',
      'Collect your BRP card and check all details are correct'
    ],
    expectedTime: 'Within 10 days of arrival',
    warnings: [
      'You must collect your BRP within 10 days',
      'Check all details on the card immediately',
      'Report any errors to the Home Office within 10 days',
      'Keep your BRP safe - replacements cost £56'
    ]
  },
  {
    id: 'gp',
    title: 'GP Registration',
    icon: '🏥',
    whatYouNeed: [
      'Proof of address',
      'Passport or ID',
      'NHS number (if you have one)'
    ],
    steps: [
      'Find a GP surgery near you on nhs.uk',
      'Visit the surgery or register online',
      'Fill in the registration form (GMS1)',
      'Wait for confirmation and your NHS number'
    ],
    expectedTime: '1-2 weeks',
    warnings: [
      'Registration is free regardless of visa status',
      'You can use NHS services while waiting for registration',
      'Emergency treatment is always free'
    ]
  },
  {
    id: 'council-tax',
    title: 'Council Tax',
    icon: '🏘️',
    whatYouNeed: [
      'Tenancy agreement',
      'Proof of occupancy',
      'Details of other adults living with you'
    ],
    steps: [
      'Find your local council on gov.uk',
      'Register within 2 weeks of moving in',
      'Check if you qualify for discounts (students, single occupancy)',
      'Set up payment method (usually monthly direct debit)'
    ],
    expectedTime: 'Register within 2 weeks',
    warnings: [
      'Full-time students are exempt from council tax',
      'Single occupants get 25% discount',
      'Not registering can lead to fines'
    ]
  },
  {
    id: 'driving-licence',
    title: 'Driving Licence',
    icon: '🚗',
    whatYouNeed: [
      'Valid passport',
      'Proof of UK address',
      'Current driving licence (if exchanging)',
      'Fee payment (£43)'
    ],
    steps: [
      'Check if you can exchange your licence on gov.uk',
      'Apply online at gov.uk/apply-first-provisional-driving-licence',
      'Send your documents by post',
      'Wait for your UK licence (usually 3 weeks)'
    ],
    expectedTime: '3-4 weeks',
    warnings: [
      'You can drive on some foreign licences for 12 months',
      'Ukrainian licences can be exchanged without retaking tests',
      'EU licences can no longer be exchanged - must take UK test',
      'Keep your receipt as proof while waiting'
    ]
  }
];
