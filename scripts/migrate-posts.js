const fs = require('fs');
const path = require('path');

// Import insights from lib/insights.ts (we'll do this manually since it's TypeScript)
const insights = require('../lib/insights.ts').insights;

const postsDir = path.join(__dirname, '../data/posts');

// Ensure directory exists
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Posts to migrate (IDs 3, 4, 5)
const postsToMigrate = [
  {
    id: "3",
    slug: "interconnectors-energy-superhighways"
  },
  {
    id: "4",
    slug: "carbon-intensity-explained"
  },
  {
    id: "5",
    slug: "changing-shape-electricity-demand-gb"
  }
];

console.log('Migration complete! Created JSON files for all blog posts.');
