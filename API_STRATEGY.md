# GridMix REST API Strategy & Implementation

## 🎯 Business Opportunity Analysis

### Market Demand
**Who Needs UK Energy Data APIs?**

1. **Energy Startups** (High Value - £100-500/month)
   - Smart home energy management apps
   - EV charging optimization platforms
   - Energy trading platforms
   - Consumer energy dashboards

2. **Enterprise/Utilities** (Very High Value - £500-5,000/month)
   - Energy suppliers (tariff optimization)
   - Grid operators (monitoring tools)
   - Consultancies (client reporting)
   - ESG platforms (carbon tracking)

3. **Developers/Researchers** (Medium Value - £10-50/month)
   - Academic research
   - Personal projects
   - Open-source tools
   - Data analysis

4. **IoT/Hardware** (High Value - £100-1,000/month)
   - Smart thermostats
   - EV chargers
   - Home batteries
   - Industrial energy management

### Revenue Potential

**Conservative Estimate (Year 1)**:
- 10 free tier users (£0)
- 20 developer tier (£10/month) = £200/month
- 5 startup tier (£100/month) = £500/month
- 2 enterprise tier (£500/month) = £1,000/month
**Total: £1,700/month = £20,400/year**

**Aggressive Estimate (Year 2)**:
- 100 free tier users
- 50 developer tier (£10/month) = £500/month
- 20 startup tier (£100/month) = £2,000/month
- 5 enterprise tier (£1,000/month) = £5,000/month
**Total: £7,500/month = £90,000/year**

### Competitive Landscape

**Existing UK Energy APIs**:
1. **Elexon BMRS API** - Raw data, complex, hard to use
2. **National Grid ESO API** - Limited public access
3. **Carbon Intensity API** - Carbon only, no generation mix
4. **Sheffield Solar API** - Solar only, CORS restrictions (we solved this!)

**GridMix API Advantages**:
✅ Unified API (all data in one place)
✅ Clean, developer-friendly JSON
✅ Real-time + historical + forecast
✅ Better documentation
✅ Predictable pricing
✅ Higher rate limits
✅ Solar data included (with CORS fix)

---

## 🏗️ API Architecture

### API Tiers

#### **Free Tier** (Rate Limited)
- 100 requests/hour
- 1,000 requests/day
- Current data only
- 7 days historical data
- No commercial use
- Attribution required

#### **Developer Tier** (£10/month)
- 1,000 requests/hour
- 10,000 requests/day
- 30 days historical data
- Forecast data included
- Personal/commercial use
- Email support

#### **Startup Tier** (£100/month)
- 5,000 requests/hour
- 50,000 requests/day
- 1 year historical data
- All features
- Priority support
- Webhook notifications
- Custom rate limits negotiable

#### **Enterprise Tier** (£500+/month - Custom)
- Unlimited requests (fair use)
- Unlimited historical data
- Dedicated support
- SLA guarantees (99.9% uptime)
- Custom endpoints
- White-label options
- Direct database access (optional)

---

## 📡 API Endpoints Design

### Base URL
```
https://api.gridmix.co.uk/v1
```

### Authentication
```bash
# API Key in header (preferred)
Authorization: Bearer YOUR_API_KEY

# Or query parameter (less secure)
?api_key=YOUR_API_KEY
```

---

### **1. Current Grid Data**

#### `GET /current`
Get current UK grid data snapshot

**Response**:
```json
{
  "timestamp": "2025-11-14T12:30:00Z",
  "demand": {
    "total_mw": 38240,
    "national_mw": 35890,
    "exports_mw": 2350
  },
  "generation": {
    "total_mw": 38240,
    "mix": [
      {
        "fuel": "wind",
        "mw": 12500,
        "percentage": 32.7
      },
      {
        "fuel": "gas",
        "mw": 10200,
        "percentage": 26.7
      },
      {
        "fuel": "nuclear",
        "mw": 6800,
        "percentage": 17.8
      },
      {
        "fuel": "solar",
        "mw": 3100,
        "percentage": 8.1
      }
    ]
  },
  "carbon_intensity": {
    "actual": 145,
    "forecast": 148,
    "level": "moderate"
  },
  "frequency": {
    "hz": 49.987,
    "status": "stable"
  },
  "interconnectors": [
    {
      "name": "France",
      "flow_mw": 1200,
      "capacity_mw": 4000,
      "direction": "import"
    }
  ],
  "solar": {
    "generation_mw": 3100,
    "capacity_percent": 19.4,
    "peak_today_mw": 4500,
    "peak_time": "12:45"
  }
}
```

**Rate Limit**:
- Free: 100/hour
- Developer: 1,000/hour
- Startup: 5,000/hour

---

### **2. Historical Data**

#### `GET /historical`
Get historical grid data

**Query Parameters**:
- `start` (required): ISO 8601 datetime
- `end` (required): ISO 8601 datetime
- `interval` (optional): `30min` (default), `hour`, `day`
- `fields` (optional): Comma-separated fields

**Example Request**:
```bash
GET /historical?start=2025-11-13T00:00:00Z&end=2025-11-14T00:00:00Z&interval=hour
```

**Response**:
```json
{
  "start": "2025-11-13T00:00:00Z",
  "end": "2025-11-14T00:00:00Z",
  "interval": "hour",
  "data_points": 24,
  "data": [
    {
      "timestamp": "2025-11-13T00:00:00Z",
      "demand_mw": 32400,
      "generation_mix": {...},
      "carbon_intensity": 165
    },
    ...
  ]
}
```

**Access**:
- Free: 7 days
- Developer: 30 days
- Startup: 1 year
- Enterprise: All time

---

### **3. Forecast Data**

#### `GET /forecast`
Get forecast data for demand and carbon intensity

**Query Parameters**:
- `hours` (optional): Forecast hours ahead (default: 48, max: 168)
- `type` (optional): `demand`, `carbon`, `renewable`, `all` (default)

**Example Request**:
```bash
GET /forecast?hours=72&type=carbon
```

**Response**:
```json
{
  "generated_at": "2025-11-14T12:30:00Z",
  "forecast_hours": 72,
  "data": [
    {
      "timestamp": "2025-11-14T13:00:00Z",
      "carbon_intensity": {
        "forecast": 142,
        "confidence": 0.89
      },
      "demand_mw": {
        "forecast": 39500,
        "confidence": 0.92
      }
    },
    ...
  ]
}
```

---

### **4. Solar Data**

#### `GET /solar/current`
Current solar generation

**Response**:
```json
{
  "timestamp": "2025-11-14T12:30:00Z",
  "generation_mw": 3100,
  "capacity_percent": 19.4,
  "installed_capacity_mw": 16000,
  "today_peak": {
    "mw": 4500,
    "time": "12:45"
  }
}
```

#### `GET /solar/intraday`
Today's solar generation curve

**Query Parameters**:
- `date` (optional): ISO date (default: today)

**Response**:
```json
{
  "date": "2025-11-14",
  "data_points": 48,
  "data": [
    {
      "time": "00:00",
      "generation_mw": 0
    },
    {
      "time": "12:30",
      "generation_mw": 3100
    },
    ...
  ]
}
```

---

### **5. Statistics & Aggregations**

#### `GET /stats/daily`
Daily aggregated statistics

**Query Parameters**:
- `date` (required): ISO date

**Response**:
```json
{
  "date": "2025-11-14",
  "demand": {
    "average_mw": 37200,
    "peak_mw": 42100,
    "peak_time": "18:30",
    "minimum_mw": 28500,
    "minimum_time": "04:00"
  },
  "generation": {
    "total_gwh": 892,
    "by_fuel": {
      "wind": {"gwh": 310, "percentage": 34.8},
      "gas": {"gwh": 245, "percentage": 27.5},
      "nuclear": {"gwh": 165, "percentage": 18.5},
      "solar": {"gwh": 87, "percentage": 9.8}
    }
  },
  "carbon_intensity": {
    "average": 152,
    "peak": 198,
    "minimum": 89
  },
  "renewable_percentage": {
    "average": 58.2,
    "peak": 87.5,
    "minimum": 32.1
  }
}
```

#### `GET /stats/records`
All-time records

**Response**:
```json
{
  "records": {
    "lowest_carbon_intensity": {
      "value": 12,
      "date": "2025-05-15T14:30:00Z"
    },
    "highest_renewable_percentage": {
      "value": 94.3,
      "date": "2025-06-21T13:00:00Z"
    },
    "highest_wind_generation": {
      "value_mw": 22670,
      "date": "2025-11-08T03:15:00Z"
    }
  }
}
```

---

### **6. Alerts & Webhooks** (Startup+ only)

#### `POST /webhooks`
Create webhook subscription

**Request Body**:
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["low_carbon", "high_renewable", "frequency_alert"],
  "filters": {
    "carbon_intensity_below": 100,
    "renewable_percentage_above": 80
  }
}
```

**Webhook Payload**:
```json
{
  "event": "low_carbon",
  "timestamp": "2025-11-14T12:30:00Z",
  "data": {
    "carbon_intensity": 89,
    "renewable_percentage": 78.5
  }
}
```

---

### **7. Regional Data** (Future)

#### `GET /regional/{region_id}`
Get regional grid data

**Regions**: scotland, northern, midlands, southwest, southeast, etc.

---

## 🔧 Implementation Guide

### Step 1: API Route Structure

```
app/
  api/
    v1/
      current/
        route.ts
      historical/
        route.ts
      forecast/
        route.ts
      solar/
        current/
          route.ts
        intraday/
          route.ts
      stats/
        daily/
          route.ts
        records/
          route.ts
      webhooks/
        route.ts
```

### Step 2: Authentication Middleware

Create `lib/api-auth.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface RateLimit {
  requestsPerHour: number;
  requestsPerDay: number;
}

const TIERS: Record<string, RateLimit> = {
  free: { requestsPerHour: 100, requestsPerDay: 1000 },
  developer: { requestsPerHour: 1000, requestsPerDay: 10000 },
  startup: { requestsPerHour: 5000, requestsPerDay: 50000 },
  enterprise: { requestsPerHour: 999999, requestsPerDay: 999999 },
};

export async function authenticateRequest(req: NextRequest) {
  const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '') ||
                 req.nextUrl.searchParams.get('api_key');

  if (!apiKey) {
    return {
      error: 'API key required',
      status: 401,
    };
  }

  // Verify API key (check database)
  const user = await verifyApiKey(apiKey);

  if (!user) {
    return {
      error: 'Invalid API key',
      status: 401,
    };
  }

  // Check rate limits
  const rateLimitOk = await checkRateLimit(user.id, user.tier);

  if (!rateLimitOk) {
    return {
      error: 'Rate limit exceeded',
      status: 429,
    };
  }

  return { user, status: 200 };
}

async function verifyApiKey(apiKey: string) {
  // TODO: Check database for API key
  // For now, mock implementation
  return {
    id: 'user-123',
    tier: 'developer',
    email: 'user@example.com',
  };
}

async function checkRateLimit(userId: string, tier: string): Promise<boolean> {
  // TODO: Implement Redis-based rate limiting
  // For now, always return true
  return true;
}
```

### Step 3: Example API Route

Create `app/api/v1/current/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { getCurrentGridData } from '@/lib/api';

export async function GET(req: NextRequest) {
  // Authenticate
  const auth = await authenticateRequest(req);

  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    // Fetch data
    const gridData = await getCurrentGridData();

    // Format response
    const response = {
      timestamp: gridData.to,
      demand: {
        total_mw: gridData.totalGeneration,
        national_mw: gridData.totalGeneration - gridData.totalExports,
        exports_mw: gridData.totalExports,
      },
      generation: {
        total_mw: gridData.totalGeneration,
        mix: gridData.generationmix.map(item => ({
          fuel: item.fuel,
          mw: item.mw,
          percentage: item.perc,
        })),
      },
      carbon_intensity: {
        actual: gridData.intensity.actual,
        forecast: gridData.intensity.forecast,
        level: gridData.intensity.index.toLowerCase(),
      },
      interconnectors: gridData.interconnectors?.map(ic => ({
        name: ic.name,
        flow_mw: ic.flow,
        capacity_mw: ic.capacity,
        direction: ic.flow > 0 ? 'import' : 'export',
      })),
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 💾 Database Schema for API Management

```sql
-- Users table
CREATE TABLE api_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  tier VARCHAR(20) NOT NULL, -- free, developer, startup, enterprise
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- API usage tracking
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES api_users(id),
  endpoint VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  response_time_ms INTEGER,
  status_code INTEGER
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES api_users(id),
  url VARCHAR(500) NOT NULL,
  events JSON NOT NULL,
  filters JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_api_usage_user_timestamp ON api_usage(user_id, timestamp);
CREATE INDEX idx_api_users_api_key ON api_users(api_key);
```

---

## 📚 API Documentation

Use **Swagger/OpenAPI** for interactive documentation.

Install:
```bash
npm install swagger-ui-react swagger-jsdoc
```

Create `app/api/docs/route.ts` for API documentation page.

---

## 🚀 Go-to-Market Strategy

### Phase 1: Soft Launch (Month 1)
- Launch API in beta
- Free tier only
- 10-20 beta testers
- Gather feedback

### Phase 2: Public Launch (Month 2)
- Full tier structure
- Product Hunt launch
- Developer outreach
- Documentation site

### Phase 3: Growth (Month 3-6)
- Partnerships with energy startups
- University research programs
- Conference presentations
- Developer tutorials

### Phase 4: Enterprise (Month 6+)
- Enterprise sales team
- Custom integrations
- White-label offerings
- SLA guarantees

---

## 💰 Monetization Models

### 1. Subscription Tiers (Primary)
- Recurring revenue
- Predictable income
- Scales with usage

### 2. Pay-as-you-go (Alternative)
- £0.001 per request
- No monthly fee
- Good for sporadic use

### 3. Enterprise Contracts (High Value)
- Custom pricing
- Volume discounts
- Dedicated support

---

## 📊 Success Metrics

### Technical
- API uptime: >99.5%
- Response time: <200ms p95
- Error rate: <0.1%

### Business
- API users: 50 in Month 3
- Paying customers: 10 in Month 3
- MRR: £1,000 in Month 6
- Churn rate: <5%

---

**Recommendation**: Start with implementing the core endpoints (`/current`, `/historical`, `/forecast`, `/solar`) and free tier authentication. Launch in beta to gather feedback before adding payment processing.

**Estimated Implementation Time**: 2-3 weeks for MVP API with authentication and rate limiting.
