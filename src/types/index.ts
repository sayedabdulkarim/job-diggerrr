// Job Types
export interface Job {
  _id?: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  description: string;
  techTags: string[];
  yoeRequired?: {
    min: number;
    max: number;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  source: 'remoteok' | 'arbeitnow' | 'himalayas' | 'jsearch' | 'adzuna' | 'jobicy' | 'remotive' | 'workingnomads';
  sourceUrl: string;
  sourceId: string;
  companyLogo?: string;
  postedAt: Date;
  fetchedAt: Date;
}

// User Types
export interface User {
  _id?: string;
  email: string;
  name: string;
  avatar?: string;
  techStack: string[];
  yearsOfExperience: number;
  locationPreference: 'remote' | 'onsite' | 'hybrid' | 'any';
  resumeUrl?: string;
  resumeParsedData?: {
    skills: string[];
    experience: string[];
    education: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// User Job Interaction Types
export interface UserJobInteraction {
  _id?: string;
  userId: string;
  jobId: string;
  clicked: boolean;
  clickedAt?: Date;
  applied: boolean;
  appliedAt?: Date;
  savedForLater: boolean;
  coverLetterGenerated: boolean;
}

// API Response Types
export interface JobsApiResponse {
  success: boolean;
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

// Filter Types
export interface JobFilters {
  techStack?: string[];
  yoe?: number;
  type?: 'remote' | 'onsite' | 'hybrid' | 'any';
  timeRange?: '6h' | '24h' | '7d' | '30d' | 'all';
  search?: string;
  sources?: Array<'remoteok' | 'arbeitnow' | 'himalayas' | 'jsearch' | 'adzuna' | 'jobicy' | 'remotive' | 'workingnomads'>;
  limit?: number;
  offset?: number;
}

// Tech Stack Options
export const TECH_STACKS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'Python',
  'Django',
  'FastAPI',
  'Java',
  'Spring Boot',
  'Go',
  'Rust',
  'Vue.js',
  'Angular',
  'Svelte',
  'React Native',
  'Flutter',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'REST API',
  'DevOps',
  'Machine Learning',
  'Data Science',
] as const;

// YOE Options
export const YOE_OPTIONS = [
  { label: 'Any Experience', value: 'any' },
  { label: 'Fresher (0-1 years)', value: '0' },
  { label: '1-2 years', value: '1' },
  { label: '2-4 years', value: '2' },
  { label: '4-6 years', value: '4' },
  { label: '6-10 years', value: '6' },
  { label: '10+ years', value: '10' },
] as const;
