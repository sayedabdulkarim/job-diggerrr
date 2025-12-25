import { Job } from '@/types';

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  category: {
    tag: string;
    label: string;
  };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

export async function fetchAdzunaJobs(): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    console.warn('Adzuna API credentials not configured');
    return [];
  }

  try {
    // Fetch IT/Tech jobs from US
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=50&category=it-jobs&what=developer`,
      {
        next: { revalidate: 21600 }, // 6 hours
      }
    );

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data: AdzunaResponse = await response.json();

    return data.results.map((job): Job => ({
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote',
      type: job.location?.display_name?.toLowerCase().includes('remote') ? 'remote' : 'onsite',
      description: job.description || '',
      techTags: job.category ? [job.category.label] : [],
      salary: job.salary_min ? {
        min: job.salary_min,
        max: job.salary_max || job.salary_min,
        currency: 'USD',
      } : undefined,
      source: 'adzuna',
      sourceUrl: job.redirect_url,
      sourceId: job.id,
      postedAt: new Date(job.created),
      fetchedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching Adzuna jobs:', error);
    return [];
  }
}
