import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/lib/services/job-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const limit = searchParams.get('limit');
    const jobs = await searchJobs(query, limit ? parseInt(limit) : 50);

    return NextResponse.json({
      jobs,
      count: jobs.length,
      query,
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}
