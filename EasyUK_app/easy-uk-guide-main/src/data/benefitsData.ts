export interface BenefitGuide {
  id: string;
  title: string;
  icon: string;
  content: string[];
  eligibility?: string[];
}

export const benefitsData: BenefitGuide[] = [
  {
    id: 'universal-credit',
    title: 'Universal Credit',
    icon: '💷',
    content: [
      '**What is Universal Credit?**',
      'Universal Credit is a monthly payment to help with living costs if you\'re on low income or out of work.',
      '',
      '**What it includes:**',
      '• Standard allowance (basic amount)',
      '• Extra for children',
      '• Extra for housing costs',
      '• Extra if you have a disability or health condition',
      '• Extra if you\'re a carer',
      '',
      '**How much you get:**',
      '• Single under 25: £292.11/month',
      '• Single 25+: £368.74/month',
      '• Couple both under 25: £458.51/month',
      '• Couple (one or both 25+): £578.82/month',
      '+ Additional amounts for housing, children, disabilities',
      '',
      '**How to apply:**',
      '1. Apply online at gov.uk/apply-universal-credit',
      '2. You\'ll need: email, bank details, NIN, rent/housing info',
      '3. Wait 5 weeks for first payment',
      '4. Advances available if struggling (paid back from future UC)'
    ],
    eligibility: [
      '✅ You live in the UK',
      '✅ You\'re 18+ (some exceptions for 16-17)',
      '✅ You\'re on low income or out of work',
      '✅ You have less than £16,000 in savings',
      '⚠️ Check your visa allows claiming benefits (most work visas do NOT)'
    ]
  },
  {
    id: 'child-benefit',
    title: 'Child Benefit',
    icon: '👶',
    content: [
      '**What is Child Benefit?**',
      'A payment to help with the cost of raising children.',
      '',
      '**How much:**',
      '• £25.60/week for eldest/only child',
      '• £16.95/week for each additional child',
      '',
      '**Eligibility:**',
      '• You\'re responsible for a child under 16',
      '• (Under 20 if in approved education/training)',
      '• Child lives with you in the UK',
      '',
      '**High Income Child Benefit Charge:**',
      'If you or your partner earn over £60,000/year:',
      '• You pay back 1% for every £100 over £60,000',
      '• Fully repaid if earning £80,000+',
      '• But still worth claiming for NI credits',
      '',
      '**How to apply:**',
      'Apply online at gov.uk/child-benefit or by post.',
      'You have 3 months from birth to backdate.'
    ],
    eligibility: [
      '✅ Child under 16 (or under 20 in education)',
      '✅ You live in the UK',
      '⚠️ Visa restrictions may apply - check with Home Office'
    ]
  },
  {
    id: 'jobseekers',
    title: 'Jobseeker\'s Allowance',
    icon: '🔍',
    content: [
      '**What is JSA?**',
      'Payment if you\'re unemployed and looking for work.',
      '',
      '**Two Types:**',
      '',
      '**1. Contribution-based JSA**',
      '• Based on your NI contributions',
      '• Don\'t need to meet income conditions',
      '• Paid for up to 182 days (26 weeks)',
      '• Currently £67.20/week (under 25) or £84.80/week (25+)',
      '',
      '**2. Income-based JSA**',
      '• Based on income and savings',
      '• Must have less than £16,000 savings',
      '• No time limit',
      '• Amount depends on circumstances',
      '',
      '**Requirements:**',
      '• Actively looking for work',
      '• Attend Jobcentre appointments',
      '• Available to start work immediately',
      '• Update "work search" regularly',
      '',
      '**Note:** Most people now claim Universal Credit instead of JSA.'
    ]
  },
  {
    id: 'free-services',
    title: 'Free Services & Support',
    icon: '🆓',
    content: [
      '**Citizens Advice**',
      '• Free, confidential advice on rights, benefits, housing, debt',
      '• Visit: citizensadvice.org.uk or local office',
      '• Phone: 0800 144 8848',
      '',
      '**Food Banks**',
      '• Free food parcels if in financial crisis',
      '• Get referral from GP, social worker, or Citizens Advice',
      '• Find local food bank: trusselltrust.org',
      '',
      '**Free School Meals**',
      '• If on Universal Credit or other benefits',
      '• Apply through your child\'s school',
      '',
      '**Help with Utilities**',
      '• Winter Fuel Payment (pensioners)',
      '• Warm Home Discount (low income)',
      '• Energy company grants',
      '',
      '**Free Prescriptions**',
      '• Universal Credit recipients',
      '• Under 16 or over 60',
      '• Pregnant or new mothers',
      '• Certain medical conditions',
      '',
      '**Council Support**',
      '• Discretionary Housing Payments',
      '• Council Tax Reduction',
      '• Crisis loans'
    ]
  }
];
