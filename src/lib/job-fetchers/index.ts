import { Job } from '@/types';
import { fetchRemoteOKJobs } from './remoteok';
import { fetchArbeitnowJobs } from './arbeitnow';
import { fetchHimalayasJobs } from './himalayas';
import { fetchJSearchJobs } from './jsearch';
import { fetchAdzunaJobs } from './adzuna';
import { fetchJobicyJobs } from './jobicy';
import { fetchRemotiveJobs } from './remotive';
import { fetchWorkingNomadsJobs } from './workingnomads';
import { jobMatchesTech, extractTechTags } from '../tech-extractor';

export {
  fetchRemoteOKJobs,
  fetchArbeitnowJobs,
  fetchHimalayasJobs,
  fetchJSearchJobs,
  fetchAdzunaJobs,
  fetchJobicyJobs,
  fetchRemotiveJobs,
  fetchWorkingNomadsJobs,
};

export type JobSource = 'remoteok' | 'arbeitnow' | 'himalayas' | 'jsearch' | 'adzuna' | 'jobicy' | 'remotive' | 'workingnomads';

export interface FetchResult {
  source: JobSource;
  jobs: Job[];
  error?: string;
}

/**
 * Fetch jobs from all sources in parallel
 * Returns aggregated jobs with source information
 */
export async function fetchAllJobs(): Promise<Job[]> {
  const fetchers: Array<{ source: JobSource; fetcher: () => Promise<Job[]> }> = [
    { source: 'remoteok', fetcher: fetchRemoteOKJobs },
    { source: 'arbeitnow', fetcher: fetchArbeitnowJobs },
    { source: 'himalayas', fetcher: fetchHimalayasJobs },
    { source: 'jsearch', fetcher: fetchJSearchJobs },
    { source: 'adzuna', fetcher: fetchAdzunaJobs },
    { source: 'jobicy', fetcher: fetchJobicyJobs },
    { source: 'remotive', fetcher: fetchRemotiveJobs },
    { source: 'workingnomads', fetcher: fetchWorkingNomadsJobs },
  ];

  const results = await Promise.allSettled(
    fetchers.map(async ({ source, fetcher }) => {
      try {
        const jobs = await fetcher();
        console.log(`Fetched ${jobs.length} jobs from ${source}`);
        return jobs;
      } catch (error) {
        console.error(`Error fetching from ${source}:`, error);
        return [];
      }
    })
  );

  const allJobs: Job[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    }
  });

  // Enrich jobs with extracted tech tags and sort by posted date
  const enrichedJobs = allJobs.map(enrichJobWithTechTags);
  enrichedJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return enrichedJobs;
}

/**
 * Fetch jobs from specific sources only
 */
export async function fetchJobsFromSources(sources: JobSource[]): Promise<Job[]> {
  const sourceFetchers: Record<JobSource, () => Promise<Job[]>> = {
    remoteok: fetchRemoteOKJobs,
    arbeitnow: fetchArbeitnowJobs,
    himalayas: fetchHimalayasJobs,
    jsearch: fetchJSearchJobs,
    adzuna: fetchAdzunaJobs,
    jobicy: fetchJobicyJobs,
    remotive: fetchRemotiveJobs,
    workingnomads: fetchWorkingNomadsJobs,
  };

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const fetcher = sourceFetchers[source];
      if (!fetcher) {
        console.warn(`Unknown source: ${source}`);
        return [];
      }
      return fetcher();
    })
  );

  const allJobs: Job[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    }
  });

  return allJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

/**
 * Filter jobs by tech stack keywords
 * Uses smart extraction from title + description
 */
export function filterJobsByTechStack(jobs: Job[], techStack: string[]): Job[] {
  if (!techStack.length) return jobs;

  return jobs.filter((job) =>
    jobMatchesTech(job.title, job.description, job.techTags, techStack)
  );
}

/**
 * Enrich job with extracted tech tags from description
 */
export function enrichJobWithTechTags(job: Job): Job {
  const extracted = extractTechTags(`${job.title} ${job.description}`);
  const allTags = [...new Set([...extracted, ...job.techTags])];

  return {
    ...job,
    techTags: allTags.slice(0, 10), // Limit to 10 tags
  };
}

/**
 * Deduplicate jobs based on title + company
 */
export function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();

  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
