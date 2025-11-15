import { Insight } from './types';

export function getCategoryLabel(category: Insight['category']): string {
  const labels: Record<Insight['category'], string> = {
    'grid-tech': 'Grid Technology',
    'renewables': 'Renewables',
    'policy': 'Policy & Regulation',
    'analysis': 'Analysis',
    'innovation': 'Innovation',
  };
  return labels[category];
}

export function getCategoryColor(category: Insight['category']): string {
  const colors: Record<Insight['category'], string> = {
    'grid-tech': 'blue',
    'renewables': 'green',
    'policy': 'purple',
    'analysis': 'orange',
    'innovation': 'pink',
  };
  return colors[category];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
