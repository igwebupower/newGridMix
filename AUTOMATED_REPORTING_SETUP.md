# GridMix Automated Reporting System - Setup Guide

## Phase 1: Foundation ✅ COMPLETED

The foundation for automated report generation has been implemented. Here's what's been set up:

### Files Created/Modified

#### 1. Type Definitions (`lib/types.ts`)
- Enhanced `Insight` interface with:
  - `status`: draft | review | approved | published
  - `generated_by`: human | ai | hybrid
  - `data_snapshot`: Reference to data used for generation
  - `review_notes`: Admin feedback
  - `scheduled_publish`: Auto-publish date
- Created `DataSnapshot` interface for storing aggregated data

#### 2. Data Aggregation Service (`lib/data-aggregator.ts`)
Core functions for collecting and analyzing grid data:
- `aggregateWeeklyData()`: Collects 7 days of historical data
- `aggregateMonthlyData()`: Collects monthly data
- `saveDataSnapshot()`: Persists snapshots to disk
- `loadDataSnapshot()`: Retrieves saved snapshots
- `validateReportData()`: Quality checks before report generation

Data collected includes:
- Average carbon intensity
- Peak renewable percentage
- Total demand
- Record events (lowest carbon, peak demand)
- Notable events and anomalies

#### 3. Cron Job Endpoint (`app/api/cron/collect-weekly-data/route.ts`)
- Runs every Monday at 2 AM (UK time)
- Protected by `CRON_SECRET` authentication
- Collects previous week's data
- Validates and saves snapshots
- Returns summary of collected data

#### 4. Vercel Configuration (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/cron/collect-weekly-data",
    "schedule": "0 2 * * 1"  // Every Monday at 2 AM
  }]
}
```

#### 5. Report Templates (`data/templates/`)
Two template types created:
- **`weekly-summary.json`**: For weekly grid performance reviews (1500 words)
- **`record-event.json`**: For milestone/record announcements (800 words)

Templates include:
- Section structure
- Data points to include
- AI writing instructions
- Tone and style guidelines

#### 6. Environment Variables
- `.env.example`: Complete documentation
- `.env.local`: Updated with new required variables

---

## Next Steps to Complete Setup

### Step 1: Configure Environment Variables

Open `.env.local` and set these required values:

```bash
# 1. Generate CRON_SECRET
# Run this in terminal:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copy the output to .env.local:
CRON_SECRET=<paste_generated_value>

# 2. Get OpenAI API Key
# - Sign up at https://platform.openai.com/
# - Create API key at https://platform.openai.com/api-keys
# - Copy to .env.local:
OPENAI_API_KEY=sk-...

# 3. Set admin email
ADMIN_EMAIL=your-email@gridmix.co.uk
```

### Step 2: Test Data Collection (Local)

You can test the data aggregation without deploying:

```bash
# Create a test script
node --eval "
import('./lib/data-aggregator.js').then(async (m) => {
  const snapshot = await m.aggregateWeeklyData();
  console.log(JSON.stringify(snapshot, null, 2));
});
"
```

### Step 3: Deploy to Vercel

The cron job will only work when deployed to Vercel:

```bash
# 1. Add CRON_SECRET to Vercel environment variables
vercel env add CRON_SECRET

# Paste your generated secret when prompted

# 2. Add OPENAI_API_KEY
vercel env add OPENAI_API_KEY

# 3. Deploy
vercel --prod
```

### Step 4: Configure Vercel Environment Variables

In Vercel dashboard (https://vercel.com):
1. Go to your project → Settings → Environment Variables
2. Add all variables from `.env.local`:
   - `CRON_SECRET` (Production + Preview)
   - `OPENAI_API_KEY` (Production only)
   - `ADMIN_EMAIL` (Production + Preview)
3. Redeploy if needed

### Step 5: Verify Cron Job

After deployment:

1. **Check Vercel Cron Dashboard**:
   - Go to your project in Vercel
   - Click "Cron Jobs" in sidebar
   - You should see `/api/cron/collect-weekly-data` scheduled

2. **Manually trigger for testing**:
   ```bash
   # Get your CRON_SECRET from .env.local
   curl -X GET \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.vercel.app/api/cron/collect-weekly-data
   ```

3. **Check logs**:
   - Vercel dashboard → Deployments → Latest → Functions
   - Look for `/api/cron/collect-weekly-data` executions

---

## What Happens Now

### Automatic Data Collection

Every Monday at 2 AM (UTC):
1. Cron job triggers `/api/cron/collect-weekly-data`
2. Fetches previous 7 days of grid data from BMRS
3. Calculates:
   - Average carbon intensity
   - Peak renewable percentage
   - Demand statistics
   - Record events
4. Saves snapshot to `data/snapshots/weekly-YYYY-MM-DD.json`

### Data Snapshot Example

```json
{
  "id": "weekly-2024-11-11",
  "period_start": "2024-11-11T00:00:00.000Z",
  "period_end": "2024-11-17T23:59:59.999Z",
  "type": "weekly",
  "summary": {
    "avgCarbonIntensity": 142,
    "peakRenewable": 68.5,
    "totalDemand": 245680,
    "avgFrequency": 50.0,
    "interconnectorFlow": 0
  },
  "records": {
    "lowestCarbon": {
      "value": 48,
      "timestamp": "2024-11-14T13:30:00Z"
    }
  },
  "notable_events": [
    "Record low carbon intensity: 48g CO2/kWh"
  ],
  "sources": ["Elexon BMRS", "Sheffield Solar PVLive"],
  "created_at": "2024-11-18T02:00:00.000Z"
}
```

---

## Phase 2: AI Report Generation (Coming Next)

Once Phase 1 is verified working, we'll implement:

1. **AI Report Generator** (`lib/report-generator.ts`)
   - Reads data snapshots
   - Uses templates to structure content
   - Calls OpenAI/Claude API
   - Generates draft reports with citations

2. **Automated Draft Creation**
   - Cron job enhancement to generate reports after data collection
   - Saves as draft with `status: 'draft'`
   - Stores in `data/posts/` with `generated_by: 'ai'`

3. **Admin Review Dashboard**
   - Filter posts by status
   - Review queue showing drafts
   - One-click approve/reject
   - Edit before publishing

4. **Email Notifications**
   - Alert when new draft ready
   - Link to review in admin panel

---

## Testing Checklist

Before going live with automated reports:

- [ ] Environment variables set correctly
- [ ] Data collection cron job runs successfully
- [ ] Data snapshots saved to `data/snapshots/`
- [ ] Snapshot data quality validated
- [ ] Manual test of aggregation functions
- [ ] Cron job authentication working
- [ ] Vercel cron dashboard shows scheduled job

---

## Troubleshooting

### Cron job not running
- Check Vercel dashboard → Cron Jobs for status
- Verify `vercel.json` is committed and deployed
- Check function logs for errors

### Authentication errors
- Ensure `CRON_SECRET` matches in:
  - Vercel environment variables
  - Cron job request headers

### No data collected
- Check BMRS API availability
- Verify historical data endpoint working
- Check function execution time (may timeout)

### Data validation failing
- Check API response format hasn't changed
- Review validation logic in `validateReportData()`
- Check for realistic value ranges

---

## Directory Structure

```
NewGridMix/
├── app/
│   └── api/
│       └── cron/
│           └── collect-weekly-data/
│               └── route.ts           # Cron endpoint
├── data/
│   ├── posts/                         # Published & draft posts
│   ├── snapshots/                     # Data snapshots (created automatically)
│   │   └── weekly-YYYY-MM-DD.json
│   └── templates/                     # Report templates
│       ├── weekly-summary.json
│       └── record-event.json
├── lib/
│   ├── data-aggregator.ts            # Data collection logic
│   └── types.ts                       # TypeScript interfaces
├── .env.local                         # Local environment variables
├── .env.example                       # Template with documentation
└── vercel.json                        # Vercel configuration
```

---

## Cost Estimate

**Monthly Operating Costs** (assuming 4 weekly reports + 1 monthly):

- **Vercel Cron Jobs**: Free (included in all plans)
- **BMRS API**: Free (UK government data)
- **OpenAI GPT-4**: ~$0.15/month (5 reports × $0.03 each)
- **Email notifications** (Resend): Free tier (100 emails/day)

**Total: ~$0.15/month**

---

## Support & Next Actions

To proceed to Phase 2 (AI Report Generation), complete:
1. ✅ All items in Testing Checklist
2. ✅ Verify first data snapshot created successfully
3. ✅ Configure production environment variables

Then we can implement:
- AI content generation with OpenAI/Claude
- Draft review workflow in admin panel
- Email notifications
- Auto-publishing approved reports

---

**Questions?** Check the code comments in:
- `lib/data-aggregator.ts` - Data collection logic
- `app/api/cron/collect-weekly-data/route.ts` - Cron endpoint
- `data/templates/*.json` - Report template examples
