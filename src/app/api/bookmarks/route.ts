import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db/mongoose';
import Bookmark from '@/models/Bookmark';

export const dynamic = 'force-dynamic';

// GET - Fetch user's bookmarks
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ bookmarks: [] });
    }

    await dbConnect();

    const bookmarks = await Bookmark.find({ userId: session.user.email }).lean();
    const jobIds = bookmarks.map((b) => b.jobId);

    return NextResponse.json({ bookmarks: jobIds });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

// POST - Add bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    await dbConnect();

    await Bookmark.findOneAndUpdate(
      { userId: session.user.email, jobId },
      { userId: session.user.email, jobId },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Job bookmarked' });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json({ error: 'Failed to add bookmark' }, { status: 500 });
  }
}

// DELETE - Remove bookmark
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    await dbConnect();

    await Bookmark.deleteOne({ userId: session.user.email, jobId });

    return NextResponse.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
