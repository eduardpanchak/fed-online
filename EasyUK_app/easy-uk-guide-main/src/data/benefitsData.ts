export interface BenefitGuide {
  id: string;
  titleKey: string;
  icon: string;
  contentKeys: string[];
  eligibilityKeys?: string[];
}

export const benefitsData: BenefitGuide[] = [
  {
    id: 'universal-credit',
    titleKey: 'benefits.universalCredit.title',
    icon: '💷',
    contentKeys: [
      'benefits.universalCredit.content1',
      'benefits.universalCredit.content2',
      'benefits.universalCredit.content3',
      'benefits.universalCredit.content4',
      'benefits.universalCredit.content5',
      'benefits.universalCredit.content6',
      'benefits.universalCredit.content7',
      'benefits.universalCredit.content8',
      'benefits.universalCredit.content9',
      'benefits.universalCredit.content10',
      'benefits.universalCredit.content11',
      'benefits.universalCredit.content12',
      'benefits.universalCredit.content13',
      'benefits.universalCredit.content14',
      'benefits.universalCredit.content15',
      'benefits.universalCredit.content16',
      'benefits.universalCredit.content17',
      'benefits.universalCredit.content18',
      'benefits.universalCredit.content19'
    ],
    eligibilityKeys: [
      'benefits.universalCredit.eligibility1',
      'benefits.universalCredit.eligibility2',
      'benefits.universalCredit.eligibility3',
      'benefits.universalCredit.eligibility4',
      'benefits.universalCredit.eligibility5'
    ]
  },
  {
    id: 'child-benefit',
    titleKey: 'benefits.childBenefit.title',
    icon: '👶',
    contentKeys: [
      'benefits.childBenefit.content1',
      'benefits.childBenefit.content2',
      'benefits.childBenefit.content3',
      'benefits.childBenefit.content4',
      'benefits.childBenefit.content5',
      'benefits.childBenefit.content6',
      'benefits.childBenefit.content7',
      'benefits.childBenefit.content8',
      'benefits.childBenefit.content9',
      'benefits.childBenefit.content10',
      'benefits.childBenefit.content11',
      'benefits.childBenefit.content12',
      'benefits.childBenefit.content13',
      'benefits.childBenefit.content14',
      'benefits.childBenefit.content15'
    ],
    eligibilityKeys: [
      'benefits.childBenefit.eligibility1',
      'benefits.childBenefit.eligibility2',
      'benefits.childBenefit.eligibility3'
    ]
  },
  {
    id: 'jobseekers',
    titleKey: 'benefits.jobseekers.title',
    icon: '🔍',
    contentKeys: [
      'benefits.jobseekers.content1',
      'benefits.jobseekers.content2',
      'benefits.jobseekers.content3',
      'benefits.jobseekers.content4',
      'benefits.jobseekers.content5',
      'benefits.jobseekers.content6',
      'benefits.jobseekers.content7',
      'benefits.jobseekers.content8',
      'benefits.jobseekers.content9',
      'benefits.jobseekers.content10',
      'benefits.jobseekers.content11',
      'benefits.jobseekers.content12',
      'benefits.jobseekers.content13',
      'benefits.jobseekers.content14',
      'benefits.jobseekers.content15',
      'benefits.jobseekers.content16',
      'benefits.jobseekers.content17',
      'benefits.jobseekers.content18'
    ]
  },
  {
    id: 'free-services',
    titleKey: 'benefits.freeServices.title',
    icon: '🆓',
    contentKeys: [
      'benefits.freeServices.content1',
      'benefits.freeServices.content2',
      'benefits.freeServices.content3',
      'benefits.freeServices.content4',
      'benefits.freeServices.content5',
      'benefits.freeServices.content6',
      'benefits.freeServices.content7',
      'benefits.freeServices.content8',
      'benefits.freeServices.content9',
      'benefits.freeServices.content10',
      'benefits.freeServices.content11',
      'benefits.freeServices.content12',
      'benefits.freeServices.content13',
      'benefits.freeServices.content14',
      'benefits.freeServices.content15',
      'benefits.freeServices.content16',
      'benefits.freeServices.content17',
      'benefits.freeServices.content18',
      'benefits.freeServices.content19',
      'benefits.freeServices.content20',
      'benefits.freeServices.content21',
      'benefits.freeServices.content22',
      'benefits.freeServices.content23',
      'benefits.freeServices.content24',
      'benefits.freeServices.content25',
      'benefits.freeServices.content26',
      'benefits.freeServices.content27',
      'benefits.freeServices.content28',
      'benefits.freeServices.content29',
      'benefits.freeServices.content30'
    ]
  }
];

