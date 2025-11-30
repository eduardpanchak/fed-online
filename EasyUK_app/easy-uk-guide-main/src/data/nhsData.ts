export interface NHSInfo {
  id: string;
  title: string;
  icon: string;
  content: string[];
  steps?: string[];
}

export const nhsData: NHSInfo[] = [
  {
    id: 'find-gp',
    title: 'How to Find a GP',
    icon: '🔍',
    content: [
      'A GP (General Practitioner) is your main doctor in the UK.',
      'You need to register with a GP surgery near your home.',
      'All NHS services start with your GP - they refer you to specialists.'
    ],
    steps: [
      'Go to nhs.uk and use the "Find a GP" tool',
      'Enter your postcode to see nearby surgeries',
      'Check if they are accepting new patients',
      'Visit the surgery or register online',
      'Bring proof of address and ID'
    ]
  },
  {
    id: 'register',
    title: 'How to Register',
    icon: '📋',
    content: [
      'Registration is FREE for everyone, regardless of visa status.',
      'You don\'t need proof of address or ID, but it helps.',
      'You can register even if you\'re homeless or an asylum seeker.'
    ],
    steps: [
      'Visit your chosen GP surgery',
      'Ask for form GMS1 (or fill it online)',
      'Provide ID and address if possible',
      'Submit the form',
      'Wait for confirmation letter with your NHS number'
    ]
  },
  {
    id: 'free',
    title: 'What is Free',
    icon: '💚',
    content: [
      '✅ GP appointments',
      '✅ Emergency treatment (A&E)',
      '✅ Treatment for certain infectious diseases',
      '✅ Family planning services',
      '❌ Prescriptions (£9.90 per item in England)',
      '❌ Dental treatment (unless exempt)',
      '❌ Eye tests (unless exempt)',
      '',
      'If you paid the Immigration Health Surcharge (IHS), you get full NHS access.'
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency / Urgent Care',
    icon: '🚨',
    content: [
      '🚑 999 - Life-threatening emergencies only',
      '🏥 A&E (Accident & Emergency) - Serious injuries or sudden illness',
      '🩺 111 - Non-emergency medical advice (24/7)',
      '⚕️ Walk-in centres - Minor injuries and illnesses',
      '💊 Pharmacies - Free advice and some treatments'
    ]
  },
  {
    id: 'nhs-number',
    title: 'NHS Number',
    icon: '🔢',
    content: [
      'Your NHS number is a unique 10-digit number.',
      'You get it when you register with a GP.',
      'You\'ll need it for appointments, prescriptions, and hospital visits.',
      '',
      'Find your NHS number on:',
      '• GP registration letter',
      '• Prescriptions',
      '• Hospital appointment letters',
      '• NHS app'
    ]
  }
];
