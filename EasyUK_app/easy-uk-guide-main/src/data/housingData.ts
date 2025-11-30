export interface HousingGuide {
  id: string;
  title: string;
  icon: string;
  content: string[];
  warnings?: string[];
}

export const housingData: HousingGuide[] = [
  {
    id: 'finding-accommodation',
    title: 'Finding Accommodation',
    icon: '🏠',
    content: [
      '**Where to Search:**',
      '• Rightmove.co.uk - Largest property site',
      '• Zoopla.co.uk - Properties and area info',
      '• SpareRoom.co.uk - Room rentals and flatshares',
      '• OpenRent.com - Direct from landlords (lower fees)',
      '',
      '**Budget Planning:**',
      '• Aim for 30-35% of income on rent',
      '• Budget for: rent + bills + council tax + transport',
      '• London is significantly more expensive than other cities',
      '',
      '**Viewing Checklist:**',
      '✅ Check for damp, mold, and heating',
      '✅ Test water pressure and hot water',
      '✅ Check windows and door locks',
      '✅ Ask about bills (included or separate?)',
      '✅ Transport links and local amenities',
      '✅ Mobile phone signal',
      '✅ Previous tenant feedback if possible'
    ],
    warnings: [
      'Never pay money before viewing the property',
      'Avoid deals that seem too good to be true',
      'Check landlord is registered on TDS/DPS',
      'Get everything in writing before paying'
    ]
  },
  {
    id: 'rental-costs',
    title: 'Rental Costs & Deposits',
    icon: '💰',
    content: [
      '**Upfront Costs:**',
      '• Deposit: Usually 5 weeks\' rent (legally capped)',
      '• First month\'s rent in advance',
      '• Reference/credit check fee: £0-50',
      '• Possible holding deposit: 1 week\'s rent (deducted from final costs)',
      '',
      '**Ongoing Costs:**',
      '• Monthly rent',
      '• Council Tax (£100-300/month depending on area)',
      '• Utilities (gas, electricity, water): £100-150/month',
      '• Internet: £20-35/month',
      '• TV Licence: £169/year (if watching live TV)',
      '',
      '**Deposit Protection:**',
      'Your deposit MUST be protected in a government scheme:',
      '• TDS (Tenancy Deposit Scheme)',
      '• DPS (Deposit Protection Service)',
      '• MyDeposits',
      '',
      'Landlord must provide certificate within 30 days.'
    ],
    warnings: [
      'No letting agent fees for tenants (banned since 2019)',
      'Deposit must be returned within 10 days of end of tenancy',
      'Take photos of property condition on move-in day',
      'Check inventory document carefully'
    ]
  },
  {
    id: 'tenant-rights',
    title: 'Tenant Rights',
    icon: '🛡️',
    content: [
      '**Your Rights:**',
      '✅ Live in a safe, properly maintained property',
      '✅ Have repairs done in reasonable time',
      '✅ Get deposit back if property undamaged',
      '✅ Minimum 24 hours notice for landlord visits',
      '✅ Challenge unfair eviction',
      '✅ Not be discriminated against',
      '',
      '**Landlord Must Provide:**',
      '• Written tenancy agreement',
      '• Gas safety certificate (renewed annually)',
      '• Energy Performance Certificate (EPC)',
      '• "How to Rent" guide',
      '• Smoke alarms and carbon monoxide detectors',
      '',
      '**If Things Go Wrong:**',
      '1. Report issues to landlord in writing',
      '2. Keep records of all communication',
      '3. Contact Citizens Advice if unresolved',
      '4. Report to local council if serious disrepair',
      '5. Use deposit protection scheme for disputes'
    ],
    warnings: [
      'Section 21 "no-fault" evictions require 2 months notice',
      'Don\'t withhold rent - even if repairs needed',
      'Landlord cannot evict you without court order',
      'Get contents insurance for your belongings'
    ]
  },
  {
    id: 'bills-utilities',
    title: 'Bills & Utilities',
    icon: '💡',
    content: [
      '**Essential Bills:**',
      '',
      '**1. Council Tax** (£100-300/month)',
      '• Paid to local council for services',
      '• Discounts: 25% for single occupancy, 100% for full-time students',
      '• Register within 2 weeks of moving in',
      '',
      '**2. Gas & Electricity** (£80-120/month)',
      '• Compare suppliers on comparison sites',
      '• Take meter readings on move-in day',
      '• Consider fixed-rate tariffs',
      '',
      '**3. Water** (£30-40/month)',
      '• Often included in rent for flats',
      '• Usually billed by regional water company',
      '',
      '**4. Internet** (£20-35/month)',
      '• BT, Sky, Virgin Media, TalkTalk, Plusnet',
      '• Check what speed you need',
      '• Usually 12-24 month contract',
      '',
      '**5. TV Licence** (£169/year)',
      '• Required if watching live TV or BBC iPlayer',
      '• Not required for Netflix/YouTube only'
    ]
  }
];
