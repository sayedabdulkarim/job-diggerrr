import { Job } from '@/types';

interface HimalayasJob {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string;
  location: string[];
  description: string;
  skills: string[];
  pubDate: string;
  applicationLink: string;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
}

interface HimalayasResponse {
  jobs: HimalayasJob[];
}

export async function fetchHimalayasJobs(): Promise<Job[]> {
  try {
    const response = await fetch('https://himalayas.app/jobs/api', {
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!response.ok) {
      throw new Error(`Himalayas API error: ${response.status}`);
    }

    const data: HimalayasResponse = await response.json();

    return data.jobs.map((job): Job => ({
      title: job.title,
      company: job.companyName,
      location: job.location?.join(', ') || 'Remote',
      type: 'remote',
      description: job.description || '',
      techTags: job.skills || [],
      salary: job.minSalary ? {
        min: job.minSalary,
        max: job.maxSalary || job.minSalary,
        currency: job.salaryCurrency || 'USD',
      } : undefined,
      source: 'himalayas',
      sourceUrl: job.applicationLink,
      sourceId: job.id,
      companyLogo: job.companyLogo,
      postedAt: new Date(job.pubDate),
      fetchedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching Himalayas jobs:', error);
    return [];
  }
}
