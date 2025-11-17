// Post Management Utilities
// Handles CRUD operations for blog posts with status management

import { Insight } from './types';
import fs from 'fs/promises';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'data', 'posts');

/**
 * Ensure posts directory exists
 */
async function ensurePostsDir() {
  try {
    await fs.mkdir(POSTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating posts directory:', error);
  }
}

/**
 * Save a post to disk
 */
export async function savePost(post: Insight): Promise<void> {
  await ensurePostsDir();

  const filename = `${post.slug}.json`;
  const filepath = path.join(POSTS_DIR, filename);

  await fs.writeFile(filepath, JSON.stringify(post, null, 2), 'utf-8');
  console.log(`Post saved: ${filepath}`);
}

/**
 * Load a post by slug
 */
export async function loadPost(slug: string): Promise<Insight | null> {
  try {
    const filepath = path.join(POSTS_DIR, `${slug}.json`);
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content) as Insight;
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}

/**
 * Load all posts
 */
export async function loadAllPosts(): Promise<Insight[]> {
  await ensurePostsDir();

  try {
    const files = await fs.readdir(POSTS_DIR);
    const posts: Insight[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(POSTS_DIR, file);
        const content = await fs.readFile(filepath, 'utf-8');
        posts.push(JSON.parse(content) as Insight);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error loading posts:', error);
    return [];
  }
}

/**
 * Load posts by status
 */
export async function loadPostsByStatus(status: 'draft' | 'review' | 'approved' | 'published'): Promise<Insight[]> {
  const allPosts = await loadAllPosts();

  // If status is 'published', include posts without status field (legacy posts)
  if (status === 'published') {
    return allPosts.filter(post => !post.status || post.status === 'published');
  }

  return allPosts.filter(post => post.status === status);
}

/**
 * Update post status
 */
export async function updatePostStatus(
  slug: string,
  status: 'draft' | 'review' | 'approved' | 'published',
  reviewNotes?: string
): Promise<Insight | null> {
  const post = await loadPost(slug);

  if (!post) {
    return null;
  }

  post.status = status;

  if (reviewNotes) {
    post.review_notes = reviewNotes;
  }

  // Update date when publishing
  if (status === 'published') {
    post.date = new Date().toISOString().split('T')[0];
  }

  await savePost(post);
  return post;
}

/**
 * Delete a post
 */
export async function deletePost(slug: string): Promise<boolean> {
  try {
    const filepath = path.join(POSTS_DIR, `${slug}.json`);
    await fs.unlink(filepath);
    console.log(`Post deleted: ${slug}`);
    return true;
  } catch (error) {
    console.error(`Error deleting post ${slug}:`, error);
    return false;
  }
}

/**
 * Update post content (for editing)
 */
export async function updatePost(slug: string, updates: Partial<Insight>): Promise<Insight | null> {
  const post = await loadPost(slug);

  if (!post) {
    return null;
  }

  // Merge updates
  Object.assign(post, updates);

  await savePost(post);
  return post;
}

/**
 * Get posts count by status
 */
export async function getPostsCountByStatus(): Promise<Record<string, number>> {
  const allPosts = await loadAllPosts();

  const counts = {
    draft: 0,
    review: 0,
    approved: 0,
    published: 0,
  };

  for (const post of allPosts) {
    const status = post.status || 'published';
    counts[status]++;
  }

  return counts;
}

/**
 * Get recent drafts (for notifications)
 */
export async function getRecentDrafts(limit: number = 5): Promise<Insight[]> {
  const drafts = await loadPostsByStatus('draft');

  // Sort by date (newest first)
  drafts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return drafts.slice(0, limit);
}

/**
 * Check if slug already exists
 */
export async function slugExists(slug: string): Promise<boolean> {
  const post = await loadPost(slug);
  return post !== null;
}

/**
 * Generate unique slug
 */
export async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
