import { Job } from '@/types';

interface WorkingNomadsJob {
  url: string;
  title: string;
  description: string;
  company_name: string;
  category_name: string;
  tags: string;
  location: string;
  pub_date: string;
}

export async function fetchWorkingNomadsJobs(): Promise<Job[]> {
  try {
    const response = await fetch('https://www.workingnomads.com/api/exposed_jobs/', {
      headers: {
        'User-Agent': 'JobDiggerrr/1.0',
      },
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!response.ok) {
      throw new Error(`Working Nomads API error: ${response.status}`);
    }

    const jobs: WorkingNomadsJob[] = await response.json();

    return jobs.map((job): Job => {
      // Tags come as comma-separated string
      const techTags = job.tags ? job.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      return {
        title: job.title,
        company: job.company_name || 'Unknown',
        location: job.location || 'Remote',
        type: 'remote',
        description: job.description || '',
        techTags,
        source: 'workingnomads',
        sourceUrl: job.url,
        sourceId: job.url, // No ID field, use URL
        postedAt: new Date(job.pub_date),
        fetchedAt: new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching Working Nomads jobs:', error);
    return [];
  }
}
