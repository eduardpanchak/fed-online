export interface JobGuide {
  id: string;
  title: string;
  icon: string;
  content: string[];
  tips?: string[];
}

export const jobsData: JobGuide[] = [
  {
    id: 'cv-writing',
    title: 'UK CV Writing',
    icon: '📝',
    content: [
      '**UK CV Format:**',
      '• Maximum 2 pages',
      '• No photo or personal details (age, marital status)',
      '• Start with personal statement (2-3 sentences)',
      '• List experience in reverse chronological order',
      '• Focus on achievements, not just duties',
      '• Include relevant skills and qualifications',
      '',
      '**What to Include:**',
      '✅ Full name and contact details',
      '✅ Personal statement',
      '✅ Work experience (with achievements)',
      '✅ Education and qualifications',
      '✅ Skills (technical and soft skills)',
      '✅ References (or "Available upon request")',
      '',
      '❌ Photo, date of birth, marital status',
      '❌ National Insurance Number',
      '❌ Long paragraphs (use bullet points)'
    ],
    tips: [
      'Tailor your CV for each job application',
      'Use action verbs: achieved, managed, developed',
      'Quantify achievements with numbers where possible',
      'Check spelling and grammar carefully',
      'Save as PDF with clear filename: FirstName_LastName_CV.pdf'
    ]
  },
  {
    id: 'job-search',
    title: 'Where to Find Jobs',
    icon: '🔍',
    content: [
      '**Online Job Boards:**',
      '• Indeed.co.uk - Largest UK job site',
      '• Reed.co.uk - Wide range of sectors',
      '• TotalJobs.co.uk - All industries',
      '• CV-Library.co.uk - Upload CV, get matches',
      '• LinkedIn - Professional networking',
      '',
      '**Recruitment Agencies:**',
      '• Hays, Reed, Manpower, Adecco',
      '• Specialist agencies for your industry',
      '• Many offer temporary-to-permanent roles',
      '',
      '**Company Websites:**',
      '• Apply directly through company career pages',
      '• Often better response rates',
      '• Shows genuine interest in the company'
    ],
    tips: [
      'Set up job alerts on multiple sites',
      'Apply within 48 hours of job posting',
      'Follow up after 1 week if no response',
      'Network on LinkedIn with UK professionals',
      'Attend job fairs and networking events'
    ]
  },
  {
    id: 'interviews',
    title: 'Job Interviews',
    icon: '🤝',
    content: [
      '**Types of Interviews:**',
      '• Phone screening (15-30 mins)',
      '• Video interview (Teams/Zoom)',
      '• Face-to-face interview',
      '• Assessment centre (group tasks)',
      '',
      '**Common Questions:**',
      '• Tell me about yourself',
      '• Why do you want this job?',
      '• What are your strengths/weaknesses?',
      '• Describe a challenging situation you handled',
      '• Where do you see yourself in 5 years?',
      '',
      '**STAR Method:**',
      'Use this to answer behavioral questions:',
      '**S**ituation - Set the scene',
      '**T**ask - Explain your responsibility',
      '**A**ction - Describe what you did',
      '**R**esult - Share the outcome'
    ],
    tips: [
      'Research the company thoroughly',
      'Prepare 3-5 questions to ask the interviewer',
      'Dress smartly (business or business casual)',
      'Arrive 10-15 minutes early',
      'Send a thank-you email within 24 hours',
      'Practice answers but don\'t memorize word-for-word'
    ]
  },
  {
    id: 'rights',
    title: 'Worker Rights',
    icon: '⚖️',
    content: [
      '**Minimum Rights in the UK:**',
      '✅ National Minimum Wage (currently £11.44/hour for 21+)',
      '✅ 5.6 weeks paid holiday per year (28 days for full-time)',
      '✅ Rest breaks (20 mins for 6+ hour shifts)',
      '✅ Protection from discrimination',
      '✅ Safe working environment',
      '✅ Payslips showing deductions',
      '',
      '**Employment Contract:**',
      '• Must be provided within 2 months',
      '• Should include: job title, salary, hours, holiday',
      '• Read carefully before signing',
      '',
      '**Notice Periods:**',
      '• Minimum 1 week after 1 month of employment',
      '• Longer if stated in contract',
      '• You must also give notice when leaving'
    ],
    tips: [
      'Keep copies of all employment documents',
      'Check your payslips match your contract',
      'Join a union for additional protection',
      'Report issues to ACAS (free advice service)',
      'Know your visa work restrictions if applicable'
    ]
  }
];
