// Admin API: Update Draft Status
// Approve, reject, or update status of individual posts

import { NextRequest, NextResponse } from 'next/server';
import { updatePostStatus, loadPost, deletePost } from '@/lib/post-manager';
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

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Verify authentication
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const post = await loadPost(params.slug);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Verify authentication
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, review_notes } = body;

    // Validate status
    const validStatuses = ['draft', 'review', 'approved', 'published'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedPost = await updatePostStatus(params.slug, status, review_notes);

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: `Post status updated to: ${status}`,
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    return NextResponse.json(
      { error: 'Failed to update post status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Verify authentication
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const success = await deletePost(params.slug);

    if (!success) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
