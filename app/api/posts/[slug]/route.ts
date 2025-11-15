import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'data', 'posts');

// GET single post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = path.join(POSTS_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const post = JSON.parse(content);

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT update post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const updatedPost = await req.json();
    const filePath = path.join(POSTS_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If slug changed, rename file
    if (updatedPost.slug !== slug) {
      const newFilePath = path.join(POSTS_DIR, `${updatedPost.slug}.json`);

      // Check if new slug already exists
      if (fs.existsSync(newFilePath)) {
        return NextResponse.json(
          { error: 'A post with the new slug already exists' },
          { status: 409 }
        );
      }

      // Write to new file and delete old
      fs.writeFileSync(newFilePath, JSON.stringify(updatedPost, null, 2));
      fs.unlinkSync(filePath);
    } else {
      // Just update existing file
      fs.writeFileSync(filePath, JSON.stringify(updatedPost, null, 2));
    }

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = path.join(POSTS_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
