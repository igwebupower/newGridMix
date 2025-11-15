import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually define the posts that need migration
const posts = [
  {
    id: "4",
    slug: "carbon-intensity-explained",
    title: "Carbon Intensity Explained: Why gCO₂/kWh Matters",
    excerpt: "Understanding carbon intensity is key to reducing emissions. Learn what the metric means, how it's calculated, and why timing your electricity use can help the planet.",
    author: "GridMix Insights",
    date: "2024-11-10",
    readTime: 6,
    category: "analysis",
    tags: ["carbon-intensity", "emissions", "climate", "smart-consumption"],
    featured: false,
    content: "# Carbon Intensity Explained: Why gCO₂/kWh Matters\n\n[Content will be editable via admin interface]"
  },
  {
    id: "5",
    slug: "changing-shape-electricity-demand-gb",
    title: "The Changing Shape of Electricity Demand in Great Britain",
    excerpt: "After decades of steady growth, GB electricity demand has plateaued—even declined. But with heat pumps, EVs, and AI data centres on the horizon, a dramatic reversal may be coming. Explore the forces reshaping our grid.",
    author: "GridMix Research",
    date: "2025-11-14",
    readTime: 15,
    category: "analysis",
    tags: ["demand", "forecasting", "AI", "electrification", "grid-planning", "policy"],
    featured: true,
    content: "# The Changing Shape of Electricity Demand in Great Britain\n\n[Content will be editable via admin interface]"
  }
];

const postsDir = path.join(__dirname, '../data/posts');

posts.forEach(post => {
  const filePath = path.join(postsDir, `${post.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
  console.log(`Created: ${post.slug}.json`);
});

console.log('\n✅ Migration complete! All 5 posts migrated to JSON.');
console.log('You can now edit full content via the admin interface once it\'s built.\n');
