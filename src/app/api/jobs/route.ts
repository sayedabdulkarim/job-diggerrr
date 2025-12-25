import { NextRequest, NextResponse } from 'next/server';
import { getJobs, getJobStats } from '@/lib/services/job-service';
import { JobFilters } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: JobFilters = {};

    const techStack = searchParams.get('techStack');
    if (techStack) {
      filters.techStack = techStack.split(',').map((t) => t.trim());
    }

    const type = searchParams.get('type');
    if (type && ['remote', 'onsite', 'hybrid', 'any'].includes(type)) {
      filters.type = type as JobFilters['type'];
    }

    const sources = searchParams.get('sources');
    if (sources) {
      filters.sources = sources.split(',') as JobFilters['sources'];
    }

    const limit = searchParams.get('limit');
    if (limit) {
      filters.limit = parseInt(limit);
    }

    const offset = searchParams.get('offset');
    if (offset) {
      filters.offset = parseInt(offset);
    }

    // Check if stats requested
    if (searchParams.get('stats') === 'true') {
      const stats = await getJobStats();
      return NextResponse.json({ stats });
    }

    const jobs = await getJobs(filters);

    return NextResponse.json({
      jobs,
      count: jobs.length,
      filters,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
