import { Job } from '@/types';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

export async function fetchRemotiveJobs(): Promise<Job[]> {
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs', {
      headers: {
        'User-Agent': 'JobDiggerrr/1.0',
      },
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!response.ok) {
      throw new Error(`Remotive API error: ${response.status}`);
    }

    const data: RemotiveResponse = await response.json();

    return data.jobs.map((job): Job => {
      // Parse salary string like "$60,000 - $80,000"
      let salary: Job['salary'] = undefined;
      if (job.salary) {
        const salaryMatch = job.salary.match(/\$?([\d,]+)\s*-?\s*\$?([\d,]+)?/);
        if (salaryMatch) {
          const min = parseInt(salaryMatch[1].replace(/,/g, ''), 10);
          const max = salaryMatch[2] ? parseInt(salaryMatch[2].replace(/,/g, ''), 10) : min;
          salary = { min, max, currency: 'USD' };
        }
      }

      return {
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        type: 'remote',
        description: job.description || '',
        techTags: job.tags || [],
        salary,
        source: 'remotive',
        sourceUrl: job.url,
        sourceId: String(job.id),
        companyLogo: job.company_logo,
        postedAt: new Date(job.publication_date),
        fetchedAt: new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching Remotive jobs:', error);
    return [];
  }
}
