import { Job } from '@/types';

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  jobIndustry: string[];
  jobType: string[];
  jobGeo: string;
  jobLevel: string;
  jobExcerpt: string;
  pubDate: string;
  annualSalaryMin?: string;
  annualSalaryMax?: string;
  salaryCurrency?: string;
}

interface JobicyResponse {
  apiVersion: string;
  documentationUrl: string;
  jobs: JobicyJob[];
  jobCount: number;
}

export async function fetchJobicyJobs(): Promise<Job[]> {
  try {
    // Jobicy API is completely free with no rate limits
    const response = await fetch('https://jobicy.com/api/v2/remote-jobs?count=100&industry=dev', {
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!response.ok) {
      throw new Error(`Jobicy API error: ${response.status}`);
    }

    const data: JobicyResponse = await response.json();

    if (!data.jobs) {
      return [];
    }

    return data.jobs.map((job): Job => ({
      title: job.jobTitle,
      company: job.companyName,
      location: job.jobGeo || 'Remote',
      type: 'remote', // Jobicy is remote-only
      description: job.jobExcerpt || '',
      techTags: job.jobIndustry || [],
      salary: job.annualSalaryMin ? {
        min: parseInt(job.annualSalaryMin.replace(/[^0-9]/g, '')) || 0,
        max: parseInt(job.annualSalaryMax?.replace(/[^0-9]/g, '') || job.annualSalaryMin.replace(/[^0-9]/g, '')) || 0,
        currency: job.salaryCurrency || 'USD',
      } : undefined,
      source: 'jobicy',
      sourceUrl: job.url,
      sourceId: job.id.toString(),
      companyLogo: job.companyLogo,
      postedAt: new Date(job.pubDate),
      fetchedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching Jobicy jobs:', error);
    return [];
  }
}
