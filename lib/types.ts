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
  // Automated reporting fields
  status?: 'draft' | 'review' | 'approved' | 'published';
  generated_by?: 'human' | 'ai' | 'hybrid';
  data_snapshot?: string; // Reference to data file used for generation
  review_notes?: string;
  scheduled_publish?: string; // ISO date string
}

export interface DataSnapshot {
  id: string;
  period_start: string; // ISO date
  period_end: string; // ISO date
  type: 'daily' | 'weekly' | 'monthly';
  summary: {
    avgCarbonIntensity: number;
    peakRenewable: number;
    totalDemand: number;
    avgFrequency: number;
    interconnectorFlow: number;
  };
  records: {
    lowestCarbon?: { value: number; timestamp: string };
    highestRenewable?: { value: number; timestamp: string };
    peakDemand?: { value: number; timestamp: string };
  };
  notable_events: string[];
  sources: string[];
  created_at: string;
}
