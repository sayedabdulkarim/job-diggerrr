import { Job, JobFilters } from '@/types';
import { fetchAllJobs, deduplicateJobs, filterJobsByTechStack } from '@/lib/job-fetchers';

const MONGODB_URI = process.env.MONGODB_URI;

// In-memory cache for when MongoDB is not available
let inMemoryCache: { jobs: Job[]; fetchedAt: Date | null } = {
  jobs: [],
  fetchedAt: null,
};

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Check if MongoDB is available
 */
function isMongoDBAvailable(): boolean {
  return !!MONGODB_URI;
}

/**
 * Get jobs with optional filtering
 * Works with or without MongoDB
 */
export async function getJobs(filters?: JobFilters): Promise<Job[]> {
  let jobs: Job[];

  if (isMongoDBAvailable()) {
    // Use MongoDB
    const dbConnect = (await import('@/lib/db/mongoose')).default;
    const JobModel = (await import('@/models/Job')).default;

    await dbConnect();

    // Check if we need to refresh
    const latestJob = await JobModel.findOne().sort({ fetchedAt: -1 }).lean();
    const needsRefresh = !latestJob ||
      (Date.now() - new Date(latestJob.fetchedAt).getTime() > CACHE_DURATION_MS);

    if (needsRefresh) {
      console.log('Cache stale, refreshing jobs from APIs...');
      await refreshJobsFromAPIs();
    }

    // Build MongoDB query
    const query: Record<string, unknown> = {};

    if (filters?.type && filters.type !== 'any') {
      query.type = filters.type;
    }

    if (filters?.sources?.length) {
      query.source = { $in: filters.sources };
    }

    jobs = await JobModel.find(query)
      .sort({ postedAt: -1 })
      .lean<Job[]>();

    // Apply pagination if specified
    if (filters?.limit) {
      const offset = filters?.offset || 0;
      jobs = jobs.slice(offset, offset + filters.limit);
    }
  } else {
    // Use in-memory cache (no MongoDB)
    const needsRefresh = !inMemoryCache.fetchedAt ||
      (Date.now() - inMemoryCache.fetchedAt.getTime() > CACHE_DURATION_MS);

    if (needsRefresh || inMemoryCache.jobs.length === 0) {
      console.log('Fetching jobs directly from APIs (no MongoDB)...');
      const fetchedJobs = await fetchAllJobs();
      inMemoryCache = {
        jobs: deduplicateJobs(fetchedJobs),
        fetchedAt: new Date(),
      };
      console.log(`Cached ${inMemoryCache.jobs.length} jobs in memory`);
    }

    jobs = [...inMemoryCache.jobs];

    // Apply filters
    if (filters?.type && filters.type !== 'any') {
      jobs = jobs.filter((j) => j.type === filters.type);
    }

    if (filters?.sources?.length) {
      jobs = jobs.filter((j) => filters.sources!.includes(j.source));
    }

    // Apply pagination only if limit specified
    if (filters?.limit) {
      const offset = filters?.offset || 0;
      jobs = jobs.slice(offset, offset + filters.limit);
    }
  }

  // Apply tech stack filter
  if (filters?.techStack?.length) {
    return filterJobsByTechStack(jobs, filters.techStack);
  }

  return jobs;
}

/**
 * Refresh jobs from all API sources and store in MongoDB
 */
export async function refreshJobsFromAPIs(): Promise<number> {
  console.log('Fetching jobs from all APIs...');
  const jobs = await fetchAllJobs();

  if (jobs.length === 0) {
    console.log('No jobs fetched from APIs');
    return 0;
  }

  const uniqueJobs = deduplicateJobs(jobs);
  console.log(`Fetched ${jobs.length} jobs, ${uniqueJobs.length} unique`);

  if (!isMongoDBAvailable()) {
    // Just update in-memory cache
    inMemoryCache = { jobs: uniqueJobs, fetchedAt: new Date() };
    return uniqueJobs.length;
  }

  const dbConnect = (await import('@/lib/db/mongoose')).default;
  const JobModel = (await import('@/models/Job')).default;

  await dbConnect();

  // Upsert jobs
  let upsertedCount = 0;

  for (const job of uniqueJobs) {
    try {
      await JobModel.findOneAndUpdate(
        { source: job.source, sourceId: job.sourceId },
        { ...job, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
      upsertedCount++;
    } catch (error) {
      if ((error as Error).message?.includes('duplicate key')) continue;
      console.error('Error upserting job:', error);
    }
  }

  console.log(`Upserted ${upsertedCount} jobs to database`);
  return upsertedCount;
}

/**
 * Get a single job by ID
 */
export async function getJobById(id: string): Promise<Job | null> {
  if (!isMongoDBAvailable()) {
    return inMemoryCache.jobs.find((j) => j._id === id || j.sourceId === id) || null;
  }

  const dbConnect = (await import('@/lib/db/mongoose')).default;
  const JobModel = (await import('@/models/Job')).default;

  await dbConnect();
  return await JobModel.findById(id).lean<Job>();
}

/**
 * Search jobs by text query
 */
export async function searchJobs(query: string, limit = 50): Promise<Job[]> {
  const queryLower = query.toLowerCase();

  if (!isMongoDBAvailable()) {
    return inMemoryCache.jobs
      .filter((j) =>
        j.title.toLowerCase().includes(queryLower) ||
        j.company.toLowerCase().includes(queryLower) ||
        j.description.toLowerCase().includes(queryLower) ||
        j.techTags.some((t) => t.toLowerCase().includes(queryLower))
      )
      .slice(0, limit);
  }

  const dbConnect = (await import('@/lib/db/mongoose')).default;
  const JobModel = (await import('@/models/Job')).default;

  await dbConnect();

  return await JobModel.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean<Job[]>();
}

/**
 * Get job statistics
 */
export async function getJobStats(): Promise<{
  total: number;
  bySource: Record<string, number>;
  byType: Record<string, number>;
  lastFetched: Date | null;
}> {
  if (!isMongoDBAvailable()) {
    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};

    inMemoryCache.jobs.forEach((job) => {
      bySource[job.source] = (bySource[job.source] || 0) + 1;
      byType[job.type] = (byType[job.type] || 0) + 1;
    });

    return {
      total: inMemoryCache.jobs.length,
      bySource,
      byType,
      lastFetched: inMemoryCache.fetchedAt,
    };
  }

  const dbConnect = (await import('@/lib/db/mongoose')).default;
  const JobModel = (await import('@/models/Job')).default;

  await dbConnect();

  const [total, bySource, byType, lastJob] = await Promise.all([
    JobModel.countDocuments(),
    JobModel.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    JobModel.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    JobModel.findOne().sort({ fetchedAt: -1 }).lean(),
  ]);

  return {
    total,
    bySource: Object.fromEntries(bySource.map((s) => [s._id, s.count])),
    byType: Object.fromEntries(byType.map((t) => [t._id, t.count])),
    lastFetched: lastJob ? new Date(lastJob.fetchedAt) : null,
  };
}
