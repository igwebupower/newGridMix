import fs from 'fs';
import path from 'path';
import { Insight } from './types';

const POSTS_DIR = path.join(process.cwd(), 'data', 'posts');

function loadPostsFromJSON(): Insight[] {
  try {
    // Check if directory exists
    if (!fs.existsSync(POSTS_DIR)) {
      console.warn('Posts directory not found, returning empty array');
      return [];
    }

    const files = fs.readdirSync(POSTS_DIR);
    const posts: Insight[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(POSTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const post = JSON.parse(content);
        posts.push(post);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error loading posts from JSON:', error);
    return [];
  }
}

export function getAllInsights(): Insight[] {
  const posts = loadPostsFromJSON();
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getFeaturedInsights(): Insight[] {
  const posts = loadPostsFromJSON();
  return posts
    .filter(i => i.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getInsightBySlug(slug: string): Insight | undefined {
  const posts = loadPostsFromJSON();
  return posts.find(i => i.slug === slug);
}

export function getInsightsByCategory(category: Insight['category']): Insight[] {
  const posts = loadPostsFromJSON();
  return posts
    .filter(i => i.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
