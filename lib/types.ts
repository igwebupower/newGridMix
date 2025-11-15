export interface Insight {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: number; // minutes
  category: 'grid-tech' | 'renewables' | 'policy' | 'analysis' | 'innovation';
  tags: string[];
  featured: boolean;
}
