// Admin API: Draft Management
// Get all drafts, update status, approve/reject

import { NextRequest, NextResponse } from 'next/server';
import { loadPostsByStatus, getPostsCountByStatus } from '@/lib/post-manager';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Verify admin authentication
async function verifyAuth(req: NextRequest): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');

    if (!token) {
      return false;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return false;
    }

    verify(token.value, jwtSecret);
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Verify authentication
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') as 'draft' | 'review' | 'approved' | 'published' | null;

    if (status) {
      // Get posts by specific status
      const posts = await loadPostsByStatus(status);
      return NextResponse.json({ posts, count: posts.length });
    } else {
      // Get counts for all statuses
      const counts = await getPostsCountByStatus();
      return NextResponse.json({ counts });
    }
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}
