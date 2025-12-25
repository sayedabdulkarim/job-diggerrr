import { NextResponse } from 'next/server';
import { refreshJobsFromAPIs } from '@/lib/services/job-service';

export const dynamic = 'force-dynamic';

// Force refresh jobs from all APIs
export async function POST() {
  try {
    const count = await refreshJobsFromAPIs();

    return NextResponse.json({
      success: true,
      message: `Refreshed ${count} jobs from APIs`,
      count,
    });
  } catch (error) {
    console.error('Error refreshing jobs:', error);
    return NextResponse.json(
      { error: 'Failed to refresh jobs' },
      { status: 500 }
    );
  }
}
