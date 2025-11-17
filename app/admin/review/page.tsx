'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate, getCategoryLabel } from '@/lib/helpers';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: number;
  category: string;
  tags: string[];
  featured: boolean;
  status?: 'draft' | 'review' | 'approved' | 'published';
  generated_by?: 'human' | 'ai' | 'hybrid';
  data_snapshot?: string;
  review_notes?: string;
}

type StatusFilter = 'all' | 'draft' | 'review' | 'approved';

export default function ReviewDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('draft');
  const [counts, setCounts] = useState({ draft: 0, review: 0, approved: 0 });
  const router = useRouter();

  useEffect(() => {
    fetchCounts();
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [statusFilter, posts]);

  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/admin/drafts');
      const data = await res.json();

      if (res.ok && data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.posts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    if (statusFilter === 'all') {
      setFilteredPosts(posts.filter(p => p.status && p.status !== 'published'));
    } else {
      setFilteredPosts(posts.filter(p => p.status === statusFilter));
    }
  };

  const updateStatus = async (slug: string, newStatus: 'draft' | 'review' | 'approved' | 'published') => {
    try {
      const res = await fetch(`/api/admin/drafts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      // Refresh posts
      await fetchPosts();
      await fetchCounts();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleApprove = (slug: string) => {
    updateStatus(slug, 'approved');
  };

  const handlePublish = (slug: string) => {
    if (confirm('Publish this post? It will be visible to all users.')) {
      updateStatus(slug, 'published');
    }
  };

  const handleReject = (slug: string) => {
    if (confirm('Move this post back to draft status?')) {
      updateStatus(slug, 'draft');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/drafts/${slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete post');
      }

      await fetchPosts();
      await fetchCounts();
    } catch (err: any) {
      alert('Error deleting post: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Review Queue
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Review and approve AI-generated draft reports
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 font-medium transition ${
                statusFilter === 'draft'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Drafts ({counts.draft})
            </button>
            <button
              onClick={() => setStatusFilter('review')}
              className={`px-4 py-2 font-medium transition ${
                statusFilter === 'review'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              In Review ({counts.review})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 font-medium transition ${
                statusFilter === 'approved'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 font-medium transition ${
                statusFilter === 'all'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Drafts
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No posts in {statusFilter} status
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.slug}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {post.title}
                      </h2>
                      {post.generated_by === 'ai' && (
                        <span className="px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                          AI Generated
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{getCategoryLabel(post.category)}</span>
                      <span>•</span>
                      <span>{formatDate(post.date)}</span>
                      <span>•</span>
                      <span>{post.readTime} min read</span>
                      {post.data_snapshot && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-xs">{post.data_snapshot}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/admin/editor/${post.slug}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </Link>

                  {post.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleApprove(post.slug)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(post.slug, 'review')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm"
                      >
                        Move to Review
                      </button>
                    </>
                  )}

                  {post.status === 'review' && (
                    <>
                      <button
                        onClick={() => handleApprove(post.slug)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(post.slug)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                      >
                        Back to Draft
                      </button>
                    </>
                  )}

                  {post.status === 'approved' && (
                    <button
                      onClick={() => handlePublish(post.slug)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                    >
                      Publish Now
                    </button>
                  )}

                  <Link
                    href={`/insights/${post.slug}`}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
                    target="_blank"
                  >
                    Preview
                  </Link>

                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>

                {post.review_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Review Notes:</strong> {post.review_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
