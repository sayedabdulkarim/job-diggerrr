import { Job } from '@/types';

interface RemoteOKJob {
  id: string;
  epoch: number;
  date: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
}

export async function fetchRemoteOKJobs(): Promise<Job[]> {
  try {
    const response = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'JobDiggerrr/1.0',
      },
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!response.ok) {
      throw new Error(`RemoteOK API error: ${response.status}`);
    }

    const data: RemoteOKJob[] = await response.json();

    // First item is usually metadata, skip it
    const jobs = data.slice(1);

    return jobs.map((job): Job => ({
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      type: 'remote',
      description: job.description || '',
      techTags: job.tags || [],
      salary: job.salary_min ? {
        min: job.salary_min,
        max: job.salary_max || job.salary_min,
        currency: 'USD',
      } : undefined,
      source: 'remoteok',
      sourceUrl: job.url,
      sourceId: job.id,
      companyLogo: job.company_logo,
      postedAt: new Date(job.epoch * 1000),
      fetchedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching RemoteOK jobs:', error);
    return [];
  }
}
