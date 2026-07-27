import type { UserConfig } from '@/types';

/**
 * Pre-filled profile for Sandesh Kale based on LinkedIn export + conversation history.
 * User can override via the dashboard or config.json.
 */
export const SANDESH_DEFAULT_CONFIG: UserConfig = {
  fullName: 'Sandesh Kale',
  headline:
    'Enterprise AI that actually works in BFSI | LLM integration · Cloud architecture · 10 yrs BFSI | Singapore',
  resumePath: './data/Sandesh_Kale_Resume.pdf', // user must place their PDF here
  linkedinSearchQueries: [
    'Lead Backend Engineer',
    'Backend Engineer LLM',
    'GenAI Solutions Architect',
    'Staff Software Engineer Backend',
    'Principal Engineer BFSI',
    'AI Platform Engineer',
  ],
  naukriSearchQueries: [
    'Lead Backend Engineer',
    'Senior Java Spring Boot',
    'Architect GenAI',
    'Technical Lead Microservices',
  ],
  location: ['Singapore', 'Remote', 'Bengaluru', 'Pune', 'Hyderabad'],
  experienceYears: 10,
  skills: [
    'Java',
    'Spring Boot',
    'Microservices',
    'IBM BAW',
    'IBM BPM',
    'Kafka',
    'AWS',
    'Azure',
    'Kubernetes',
    'AKS',
    'Python',
    'LLM',
    'Prompt Engineering',
    'OpenAI API',
    'Node.js',
    'React',
    'SQL',
    'High Availability',
    'System Design',
  ],
  preferredTitles: [
    'Lead Backend Engineer',
    'Staff Backend Engineer',
    'Principal Engineer',
    'GenAI Solutions Architect',
    'AI Platform Engineer',
    'Senior Software Engineer',
    'Technical Lead',
    'Engineering Manager Backend',
  ],
  excludedCompanies: [],
  preferredCompanies: [
    'Prudential',
    'DBS',
    'OCBC',
    'UOB',
    'Grab',
    'Sea',
    'Shopee',
    'Google',
    'Microsoft',
    'Amazon',
    'Stripe',
    'Wise',
  ],
  expectedCtcLpa: undefined, // Singapore market uses SGD; leave open
  currentCtcLpa: undefined,
  noticePeriodDays: 60,
  visaSponsorship: false, // already in Singapore
  maxDailyApplications: 10,
  linkedinQuota: 7,
  naukriQuota: 3,
  delays: {
    actionMin: 8,
    actionMax: 25,
    betweenApplicationsMin: 45,
    betweenApplicationsMax: 120,
    longBreakEveryN: 3,
    longBreakMin: 180,
    longBreakMax: 360,
  },
  profileAnswers: {
    'years of experience':
      'I have 10 years of professional experience building production backend systems in BFSI.',
    'notice period': '60 days',
    'willing to relocate':
      'Based in Singapore and open to hybrid/remote roles across APAC. Selective on full relocation.',
    'current location': 'Singapore',
    'are you authorized to work':
      'Yes — currently working in Singapore with valid work authorization.',
    'why do you want to join':
      'I am excited about the technical challenges in regulated environments and the opportunity to bring practical LLM integration experience into production workflows.',
    'leadership experience':
      'Yes — currently Lead Backend Engineer managing delivery, vendors, and product ownership for underwriting systems.',
  },
  profileSummary: `Lead Backend Engineer (Manager) at Prudential Assurance Singapore with ~10 years in enterprise backend systems, distributed architectures, and AI-enabled engineering across BFSI. Core stack: Java/Spring Boot, IBM BAW/BPM, Kafka, AWS/Azure/GCP, Kubernetes, LLM integration. Previously at GS Lab (coreless accounting / BaaS) and Principal Global Services. Education: B.E. Computer Engineering, Savitribai Phule Pune University. Certifications: Kafka with Confluent Cloud, Generative AI for Software Development (DeepLearning.AI).`,
  browser: {
    mode: 'real',
    chromeProfileDirectory: 'Default',
    headless: false,
  },
};
