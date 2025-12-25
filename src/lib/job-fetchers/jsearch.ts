import { Job } from '@/types';

interface JSearchJob {
  job_id: string;
  employer_name: string;
  employer_logo: string;
  job_title: string;
  job_description: string;
  job_city: string;
  job_country: string;
  job_is_remote: boolean;
  job_posted_at_timestamp: number;
  job_apply_link: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_required_skills?: string[];
}

interface JSearchResponse {
  status: string;
  data: JSearchJob[];
}

export async function fetchJSearchJobs(): Promise<Job[]> {
  const apiKey = process.env.JSEARCH_API_KEY;

  if (!apiKey) {
    console.warn('JSearch API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      'https://jsearch.p.rapidapi.com/search?query=developer&num_pages=1&remote_jobs_only=true',
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
        next: { revalidate: 21600 }, // 6 hours
      }
    );

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status}`);
    }

    const data: JSearchResponse = await response.json();

    if (!data.data) {
      return [];
    }

    return data.data.map((job): Job => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_is_remote
        ? 'Remote'
        : [job.job_city, job.job_country].filter(Boolean).join(', ') || 'Remote',
      type: job.job_is_remote ? 'remote' : 'onsite',
      description: job.job_description || '',
      techTags: job.job_required_skills || [],
      salary: job.job_min_salary ? {
        min: job.job_min_salary,
        max: job.job_max_salary || job.job_min_salary,
        currency: job.job_salary_currency || 'USD',
      } : undefined,
      source: 'jsearch',
      sourceUrl: job.job_apply_link,
      sourceId: job.job_id,
      companyLogo: job.employer_logo,
      postedAt: new Date(job.job_posted_at_timestamp * 1000),
      fetchedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching JSearch jobs:', error);
    return [];
  }
}
