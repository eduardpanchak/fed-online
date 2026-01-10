export interface Document {
  id: string;
  titleKey: string;
  icon: string;
  whatYouNeedKeys: string[];
  stepsKeys: string[];
  expectedTimeKey: string;
  warningsKeys: string[];
}

export const documentsData: Document[] = [
  {
    id: 'nin',
    titleKey: 'documents.nin.title',
    icon: '🔢',
    whatYouNeedKeys: [
      'documents.nin.need1',
      'documents.nin.need2',
      'documents.nin.need3'
    ],
    stepsKeys: [
      'documents.nin.step1',
      'documents.nin.step2',
      'documents.nin.step3',
      'documents.nin.step4'
    ],
    expectedTimeKey: 'documents.nin.expectedTime',
    warningsKeys: [
      'documents.nin.warning1',
      'documents.nin.warning2',
      'documents.nin.warning3'
    ]
  },
  {
    id: 'bank',
    titleKey: 'documents.bank.title',
    icon: '🏦',
    whatYouNeedKeys: [
      'documents.bank.need1',
      'documents.bank.need2',
      'documents.bank.need3'
    ],
    stepsKeys: [
      'documents.bank.step1',
      'documents.bank.step2',
      'documents.bank.step3',
      'documents.bank.step4'
    ],
    expectedTimeKey: 'documents.bank.expectedTime',
    warningsKeys: [
      'documents.bank.warning1',
      'documents.bank.warning2',
      'documents.bank.warning3'
    ]
  },
  {
    id: 'brp',
    titleKey: 'documents.brp.title',
    icon: '🪪',
    whatYouNeedKeys: [
      'documents.brp.need1',
      'documents.brp.need2',
      'documents.brp.need3'
    ],
    stepsKeys: [
      'documents.brp.step1',
      'documents.brp.step2',
      'documents.brp.step3',
      'documents.brp.step4'
    ],
    expectedTimeKey: 'documents.brp.expectedTime',
    warningsKeys: [
      'documents.brp.warning1',
      'documents.brp.warning2',
      'documents.brp.warning3',
      'documents.brp.warning4'
    ]
  },
  {
    id: 'gp',
    titleKey: 'documents.gp.title',
    icon: '🏥',
    whatYouNeedKeys: [
      'documents.gp.need1',
      'documents.gp.need2',
      'documents.gp.need3'
    ],
    stepsKeys: [
      'documents.gp.step1',
      'documents.gp.step2',
      'documents.gp.step3',
      'documents.gp.step4'
    ],
    expectedTimeKey: 'documents.gp.expectedTime',
    warningsKeys: [
      'documents.gp.warning1',
      'documents.gp.warning2',
      'documents.gp.warning3'
    ]
  },
  {
    id: 'council-tax',
    titleKey: 'documents.councilTax.title',
    icon: '🏘️',
    whatYouNeedKeys: [
      'documents.councilTax.need1',
      'documents.councilTax.need2',
      'documents.councilTax.need3'
    ],
    stepsKeys: [
      'documents.councilTax.step1',
      'documents.councilTax.step2',
      'documents.councilTax.step3',
      'documents.councilTax.step4'
    ],
    expectedTimeKey: 'documents.councilTax.expectedTime',
    warningsKeys: [
      'documents.councilTax.warning1',
      'documents.councilTax.warning2',
      'documents.councilTax.warning3'
    ]
  },
  {
    id: 'driving-licence',
    titleKey: 'documents.drivingLicence.title',
    icon: '🚗',
    whatYouNeedKeys: [
      'documents.drivingLicence.need1',
      'documents.drivingLicence.need2',
      'documents.drivingLicence.need3',
      'documents.drivingLicence.need4'
    ],
    stepsKeys: [
      'documents.drivingLicence.step1',
      'documents.drivingLicence.step2',
      'documents.drivingLicence.step3',
      'documents.drivingLicence.step4'
    ],
    expectedTimeKey: 'documents.drivingLicence.expectedTime',
    warningsKeys: [
      'documents.drivingLicence.warning1',
      'documents.drivingLicence.warning2',
      'documents.drivingLicence.warning3',
      'documents.drivingLicence.warning4'
    ]
  }
];

