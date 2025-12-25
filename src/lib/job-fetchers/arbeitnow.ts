import { Job } from '@/types';

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
  links: {
    next: string | null;
  };
}

export async function fetchArbeitnowJobs(): Promise<Job[]> {
  try {
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!response.ok) {
      throw new Error(`Arbeitnow API error: ${response.status}`);
    }

    const data: ArbeitnowResponse = await response.json();

    return data.data.map((job): Job => ({
      title: job.title,
      company: job.company_name,
      location: job.location || 'Remote',
      type: job.remote ? 'remote' : 'onsite',
      description: job.description || '',
      techTags: job.tags || [],
      source: 'arbeitnow',
      sourceUrl: job.url,
      sourceId: job.slug,
      postedAt: new Date(job.created_at * 1000),
      fetchedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching Arbeitnow jobs:', error);
    return [];
  }
}
