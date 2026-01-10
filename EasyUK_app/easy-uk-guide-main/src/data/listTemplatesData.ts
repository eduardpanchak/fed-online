export interface ListTemplate {
  key: string;
  titleKey: string;
  descriptionKey: string;
  items: { textKey: string }[];
}

export const listTemplates: ListTemplate[] = [
  {
    key: 'first_days',
    titleKey: 'lists.templates.firstDays.title',
    descriptionKey: 'lists.templates.firstDays.description',
    items: [
      { textKey: 'lists.templates.firstDays.items.accommodation' },
      { textKey: 'lists.templates.firstDays.items.simCard' },
      { textKey: 'lists.templates.firstDays.items.bankAccount' },
      { textKey: 'lists.templates.firstDays.items.nin' },
      { textKey: 'lists.templates.firstDays.items.gpRegister' },
      { textKey: 'lists.templates.firstDays.items.transport' },
    ],
  },
  {
    key: 'documents',
    titleKey: 'lists.templates.documents.title',
    descriptionKey: 'lists.templates.documents.description',
    items: [
      { textKey: 'lists.templates.documents.items.passport' },
      { textKey: 'lists.templates.documents.items.brp' },
      { textKey: 'lists.templates.documents.items.nin' },
      { textKey: 'lists.templates.documents.items.proofOfAddress' },
      { textKey: 'lists.templates.documents.items.bankStatements' },
    ],
  },
  {
    key: 'housing',
    titleKey: 'lists.templates.housing.title',
    descriptionKey: 'lists.templates.housing.description',
    items: [
      { textKey: 'lists.templates.housing.items.budget' },
      { textKey: 'lists.templates.housing.items.search' },
      { textKey: 'lists.templates.housing.items.viewing' },
      { textKey: 'lists.templates.housing.items.deposit' },
      { textKey: 'lists.templates.housing.items.utilities' },
    ],
  },
  {
    key: 'job_search',
    titleKey: 'lists.templates.jobSearch.title',
    descriptionKey: 'lists.templates.jobSearch.description',
    items: [
      { textKey: 'lists.templates.jobSearch.items.cv' },
      { textKey: 'lists.templates.jobSearch.items.linkedin' },
      { textKey: 'lists.templates.jobSearch.items.jobSites' },
      { textKey: 'lists.templates.jobSearch.items.applications' },
      { textKey: 'lists.templates.jobSearch.items.interview' },
    ],
  },
  {
    key: 'healthcare',
    titleKey: 'lists.templates.healthcare.title',
    descriptionKey: 'lists.templates.healthcare.description',
    items: [
      { textKey: 'lists.templates.healthcare.items.gp' },
      { textKey: 'lists.templates.healthcare.items.dentist' },
      { textKey: 'lists.templates.healthcare.items.prescriptions' },
      { textKey: 'lists.templates.healthcare.items.optician' },
    ],
  },
];
