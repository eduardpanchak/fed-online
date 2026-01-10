export interface NHSInfo {
  id: string;
  titleKey: string;
  icon: string;
  contentKeys: string[];
  stepsKeys?: string[];
}

export const nhsData: NHSInfo[] = [
  {
    id: 'find-gp',
    titleKey: 'nhs.findGp.title',
    icon: '🔍',
    contentKeys: [
      'nhs.findGp.content1',
      'nhs.findGp.content2',
      'nhs.findGp.content3'
    ],
    stepsKeys: [
      'nhs.findGp.step1',
      'nhs.findGp.step2',
      'nhs.findGp.step3',
      'nhs.findGp.step4',
      'nhs.findGp.step5'
    ]
  },
  {
    id: 'register',
    titleKey: 'nhs.register.title',
    icon: '📋',
    contentKeys: [
      'nhs.register.content1',
      'nhs.register.content2',
      'nhs.register.content3'
    ],
    stepsKeys: [
      'nhs.register.step1',
      'nhs.register.step2',
      'nhs.register.step3',
      'nhs.register.step4',
      'nhs.register.step5'
    ]
  },
  {
    id: 'free',
    titleKey: 'nhs.free.title',
    icon: '💚',
    contentKeys: [
      'nhs.free.content1',
      'nhs.free.content2',
      'nhs.free.content3',
      'nhs.free.content4',
      'nhs.free.content5',
      'nhs.free.content6',
      'nhs.free.content7',
      'nhs.free.content8',
      'nhs.free.content9'
    ]
  },
  {
    id: 'emergency',
    titleKey: 'nhs.emergency.title',
    icon: '🚨',
    contentKeys: [
      'nhs.emergency.content1',
      'nhs.emergency.content2',
      'nhs.emergency.content3',
      'nhs.emergency.content4',
      'nhs.emergency.content5'
    ]
  },
  {
    id: 'nhs-number',
    titleKey: 'nhs.nhsNumber.title',
    icon: '🔢',
    contentKeys: [
      'nhs.nhsNumber.content1',
      'nhs.nhsNumber.content2',
      'nhs.nhsNumber.content3',
      'nhs.nhsNumber.content4',
      'nhs.nhsNumber.content5',
      'nhs.nhsNumber.content6',
      'nhs.nhsNumber.content7',
      'nhs.nhsNumber.content8'
    ]
  }
];
