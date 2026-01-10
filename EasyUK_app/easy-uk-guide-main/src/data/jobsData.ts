export interface JobGuide {
  id: string;
  titleKey: string;
  icon: string;
  contentKeys: string[];
  tipsKeys?: string[];
}

export const jobsData: JobGuide[] = [
  {
    id: 'cv-writing',
    titleKey: 'jobs.cvWriting.title',
    icon: '📝',
    contentKeys: [
      'jobs.cvWriting.content1',
      'jobs.cvWriting.content2',
      'jobs.cvWriting.content3',
      'jobs.cvWriting.content4',
      'jobs.cvWriting.content5',
      'jobs.cvWriting.content6',
      'jobs.cvWriting.content7',
      'jobs.cvWriting.content8',
      'jobs.cvWriting.content9',
      'jobs.cvWriting.content10',
      'jobs.cvWriting.content11',
      'jobs.cvWriting.content12',
      'jobs.cvWriting.content13',
      'jobs.cvWriting.content14',
      'jobs.cvWriting.content15',
      'jobs.cvWriting.content16',
      'jobs.cvWriting.content17',
      'jobs.cvWriting.content18',
      'jobs.cvWriting.content19'
    ],
    tipsKeys: [
      'jobs.cvWriting.tip1',
      'jobs.cvWriting.tip2',
      'jobs.cvWriting.tip3',
      'jobs.cvWriting.tip4',
      'jobs.cvWriting.tip5'
    ]
  },
  {
    id: 'job-search',
    titleKey: 'jobs.jobSearch.title',
    icon: '🔍',
    contentKeys: [
      'jobs.jobSearch.content1',
      'jobs.jobSearch.content2',
      'jobs.jobSearch.content3',
      'jobs.jobSearch.content4',
      'jobs.jobSearch.content5',
      'jobs.jobSearch.content6',
      'jobs.jobSearch.content7',
      'jobs.jobSearch.content8',
      'jobs.jobSearch.content9',
      'jobs.jobSearch.content10',
      'jobs.jobSearch.content11',
      'jobs.jobSearch.content12',
      'jobs.jobSearch.content13',
      'jobs.jobSearch.content14',
      'jobs.jobSearch.content15'
    ],
    tipsKeys: [
      'jobs.jobSearch.tip1',
      'jobs.jobSearch.tip2',
      'jobs.jobSearch.tip3',
      'jobs.jobSearch.tip4',
      'jobs.jobSearch.tip5'
    ]
  },
  {
    id: 'interviews',
    titleKey: 'jobs.interviews.title',
    icon: '🤝',
    contentKeys: [
      'jobs.interviews.content1',
      'jobs.interviews.content2',
      'jobs.interviews.content3',
      'jobs.interviews.content4',
      'jobs.interviews.content5',
      'jobs.interviews.content6',
      'jobs.interviews.content7',
      'jobs.interviews.content8',
      'jobs.interviews.content9',
      'jobs.interviews.content10',
      'jobs.interviews.content11',
      'jobs.interviews.content12',
      'jobs.interviews.content13',
      'jobs.interviews.content14',
      'jobs.interviews.content15',
      'jobs.interviews.content16',
      'jobs.interviews.content17',
      'jobs.interviews.content18'
    ],
    tipsKeys: [
      'jobs.interviews.tip1',
      'jobs.interviews.tip2',
      'jobs.interviews.tip3',
      'jobs.interviews.tip4',
      'jobs.interviews.tip5',
      'jobs.interviews.tip6'
    ]
  },
  {
    id: 'rights',
    titleKey: 'jobs.rights.title',
    icon: '⚖️',
    contentKeys: [
      'jobs.rights.content1',
      'jobs.rights.content2',
      'jobs.rights.content3',
      'jobs.rights.content4',
      'jobs.rights.content5',
      'jobs.rights.content6',
      'jobs.rights.content7',
      'jobs.rights.content8',
      'jobs.rights.content9',
      'jobs.rights.content10',
      'jobs.rights.content11',
      'jobs.rights.content12',
      'jobs.rights.content13',
      'jobs.rights.content14',
      'jobs.rights.content15',
      'jobs.rights.content16'
    ],
    tipsKeys: [
      'jobs.rights.tip1',
      'jobs.rights.tip2',
      'jobs.rights.tip3',
      'jobs.rights.tip4',
      'jobs.rights.tip5'
    ]
  }
];
