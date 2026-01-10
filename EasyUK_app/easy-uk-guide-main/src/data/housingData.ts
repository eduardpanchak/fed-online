export interface HousingGuide {
  id: string;
  titleKey: string;
  icon: string;
  contentKeys: string[];
  warningsKeys?: string[];
}

export const housingData: HousingGuide[] = [
  {
    id: 'finding-accommodation',
    titleKey: 'housing.findingAccommodation.title',
    icon: '🏠',
    contentKeys: [
      'housing.findingAccommodation.content1',
      'housing.findingAccommodation.content2',
      'housing.findingAccommodation.content3',
      'housing.findingAccommodation.content4',
      'housing.findingAccommodation.content5',
      'housing.findingAccommodation.content6',
      'housing.findingAccommodation.content7',
      'housing.findingAccommodation.content8',
      'housing.findingAccommodation.content9',
      'housing.findingAccommodation.content10',
      'housing.findingAccommodation.content11',
      'housing.findingAccommodation.content12',
      'housing.findingAccommodation.content13',
      'housing.findingAccommodation.content14',
      'housing.findingAccommodation.content15',
      'housing.findingAccommodation.content16',
      'housing.findingAccommodation.content17',
      'housing.findingAccommodation.content18',
      'housing.findingAccommodation.content19'
    ],
    warningsKeys: [
      'housing.findingAccommodation.warning1',
      'housing.findingAccommodation.warning2',
      'housing.findingAccommodation.warning3',
      'housing.findingAccommodation.warning4'
    ]
  },
  {
    id: 'rental-costs',
    titleKey: 'housing.rentalCosts.title',
    icon: '💰',
    contentKeys: [
      'housing.rentalCosts.content1',
      'housing.rentalCosts.content2',
      'housing.rentalCosts.content3',
      'housing.rentalCosts.content4',
      'housing.rentalCosts.content5',
      'housing.rentalCosts.content6',
      'housing.rentalCosts.content7',
      'housing.rentalCosts.content8',
      'housing.rentalCosts.content9',
      'housing.rentalCosts.content10',
      'housing.rentalCosts.content11',
      'housing.rentalCosts.content12',
      'housing.rentalCosts.content13',
      'housing.rentalCosts.content14',
      'housing.rentalCosts.content15',
      'housing.rentalCosts.content16',
      'housing.rentalCosts.content17',
      'housing.rentalCosts.content18'
    ],
    warningsKeys: [
      'housing.rentalCosts.warning1',
      'housing.rentalCosts.warning2',
      'housing.rentalCosts.warning3',
      'housing.rentalCosts.warning4'
    ]
  },
  {
    id: 'tenant-rights',
    titleKey: 'housing.tenantRights.title',
    icon: '🛡️',
    contentKeys: [
      'housing.tenantRights.content1',
      'housing.tenantRights.content2',
      'housing.tenantRights.content3',
      'housing.tenantRights.content4',
      'housing.tenantRights.content5',
      'housing.tenantRights.content6',
      'housing.tenantRights.content7',
      'housing.tenantRights.content8',
      'housing.tenantRights.content9',
      'housing.tenantRights.content10',
      'housing.tenantRights.content11',
      'housing.tenantRights.content12',
      'housing.tenantRights.content13',
      'housing.tenantRights.content14',
      'housing.tenantRights.content15',
      'housing.tenantRights.content16',
      'housing.tenantRights.content17',
      'housing.tenantRights.content18',
      'housing.tenantRights.content19',
      'housing.tenantRights.content20'
    ],
    warningsKeys: [
      'housing.tenantRights.warning1',
      'housing.tenantRights.warning2',
      'housing.tenantRights.warning3',
      'housing.tenantRights.warning4'
    ]
  },
  {
    id: 'bills-utilities',
    titleKey: 'housing.billsUtilities.title',
    icon: '💡',
    contentKeys: [
      'housing.billsUtilities.content1',
      'housing.billsUtilities.content2',
      'housing.billsUtilities.content3',
      'housing.billsUtilities.content4',
      'housing.billsUtilities.content5',
      'housing.billsUtilities.content6',
      'housing.billsUtilities.content7',
      'housing.billsUtilities.content8',
      'housing.billsUtilities.content9',
      'housing.billsUtilities.content10',
      'housing.billsUtilities.content11',
      'housing.billsUtilities.content12',
      'housing.billsUtilities.content13',
      'housing.billsUtilities.content14',
      'housing.billsUtilities.content15',
      'housing.billsUtilities.content16',
      'housing.billsUtilities.content17',
      'housing.billsUtilities.content18',
      'housing.billsUtilities.content19',
      'housing.billsUtilities.content20',
      'housing.billsUtilities.content21',
      'housing.billsUtilities.content22',
      'housing.billsUtilities.content23'
    ]
  }
];

