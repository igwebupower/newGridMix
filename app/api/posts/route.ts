import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'data', 'posts');

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: number;
  category: 'grid-tech' | 'renewables' | 'policy' | 'analysis' | 'innovation';
  tags: string[];
  featured: boolean;
}

// GET all posts
export async function GET() {
  try {
    // Ensure posts directory exists
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
      return NextResponse.json({ posts: [] });
    }

    const files = fs.readdirSync(POSTS_DIR);
    const posts: BlogPost[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(POSTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const post = JSON.parse(content);
        posts.push(post);
      }
    }

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST create new post
export async function POST(req: NextRequest) {
  try {
    const post: BlogPost = await req.json();

    // Validate required fields
    if (!post.slug || !post.title || !post.content) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, content' },
        { status: 400 }
      );
    }

    // Ensure posts directory exists
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    const filePath = path.join(POSTS_DIR, `${post.slug}.json`);

    // Check if post already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 409 }
      );
    }

    // Write post to file
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
