# Watt — Project Initiation Document & Build Strategy

## 🎯 What Watt Is

**Watt** is a natural-language Q&A layer over GridMix's own data: live grid mix, carbon intensity, solar, frequency, system price, interconnectors, the 25-year historical dataset, and the insights archive. Users ask plain-English questions ("when was the last 100% renewable day?", "is now a good time to charge my EV?") and get an answer grounded in real fetched numbers, with a citation (timestamp + data source) attached.

Inspired by Modo Energy's **Ko** (an AI analyst over their benchmarks/forecasts/research), scaled down from institutional-grade to consumer-grade: no FCA-style certification, no scenario modelling — just fast, trustworthy answers over data GridMix already serves.

**Tie-in to existing roadmap**: this replaces and concretizes `COMPETITIVE_STRATEGY.md` Phase 3 item #9 ("AI-Powered Insights"), which was previously unscoped and low-priority. Watt gives it a name, an architecture, and a sequence.

---

## 🧭 Objectives

1. Make GridMix's data answerable, not just visualizable — lower the floor for casual users who don't want to read four charts to answer one question.
2. Directly counter the "data reliability" criticism GridMix levelled at Gridwatch in its own competitive analysis — every Watt answer must cite its source and timestamp.
3. Create a free-to-premium lever (unlimited/priority Watt queries) consistent with the Premium Tier already planned in `COMPETITIVE_STRATEGY.md`.
4. Open a second distribution channel (MCP server) so GridMix data can be queried from inside Claude/ChatGPT directly — proven viable by Ko.

## Success Criteria (90 days post-launch)

| Metric | Target |
|---|---|
| % of dashboard sessions that open Watt | 15%+ |
| Median answer latency | < 4s |
| Answers with a valid citation | 100% (no uncited claims) |
| Free-tier daily query cap hit rate | < 20% of users (signal for premium upsell, not a wall) |
| Cost per query | < £0.01 |
| Sampled answer accuracy (human-reviewed) | 95%+ |

---

## 🚫 Scope

**In scope (v1):**
- Chat UI answering questions over live/24h/48h data already exposed via `lib/api.ts` and `/api/v1/*`.
- Source + timestamp citation on every answer.
- Refusal behavior when a question can't be grounded in available data (no general-knowledge fallback).
- Basic per-IP rate limiting reusing `lib/rate-limit.ts`.

**In scope (v2+):**
- Multi-year historical queries against `data/historical/uk-electricity-2000-2026.json`.
- Citing/retrieving from the Sanity insights archive (`lib/sanity-posts.ts`).
- Public `/api/v1/watt` endpoint for developers.
- MCP server exposing GridMix's data tools to Claude/ChatGPT.

**Explicitly out of scope:**
- Investment-grade modelling, scenario analysis, regulatory certification (Ko's institutional turf — not GridMix's market).
- Freeform/general-knowledge chat unrelated to grid data.
- Voice interface, SMS.

---

## 🏗️ Technical Architecture

**Pattern: tool-calling, not freeform generation.** The LLM never answers from its own knowledge of UK energy facts — it only reports what a tool call returned. This is the core mitigation against hallucination and is non-negotiable given the trust positioning.

```
User question
   → LLM (tool-use/function-calling mode)
   → selects + calls one or more tools
   → tools wrap existing lib/api.ts functions (no new data layer)
   → LLM composes answer strictly from tool output, attaches citation
   → response rendered in chat UI with "data as of <timestamp>, source: <X>"
```

**Tool list for v1** (each a thin wrapper around an existing function — no new data plumbing needed):

| Tool | Wraps | Returns |
|---|---|---|
| `get_current_mix` | `getCurrentGridData()` | live generation mix, intensity |
| `get_stats` | `getGridStats()` | renewable/fossil/nuclear %, demand |
| `get_intensity_history` | `getHistoricalIntensity(hours)` | last N hours of carbon intensity |
| `get_intensity_forecast` | `getIntensityForecast(hours)` | next N hours forecast |
| `get_solar` | `getCurrentSolarData()`, `getTodaySolarCurve()`, `getYesterdaySolarCurve()` | solar generation + curves |
| `get_frequency` | `getCurrentFrequency()` | grid frequency + stability status |
| `get_price` | `getCurrentSystemPrice()` | system price |
| `get_health_score` | `calculateGridHealthScore()` | composite 0–100 score |

v2 adds `query_historical_archive` (over the 25-year dataset) and `search_insights` (over `getAllSanityPosts`/`getSanityPostsByCategory`).

**Model choice:** Claude (Anthropic API), tool-use mode. Use a fast/cheap tier (Haiku-class) for tool selection + answer composition — these are short, structured tasks, not open-ended reasoning, so the cheapest model that reliably calls tools and doesn't hallucinate numbers is correct. Reserve a larger model only if v1 accuracy testing shows the small model fabricating figures.

**No new dependency exists yet** — `package.json` has no AI SDK today. Adding `@anthropic-ai/sdk` is a new, explicit dependency decision, not an extension of existing infra.

**Rate limiting & cost control:**
- Reuse `lib/rate-limit.ts` per-IP, e.g. 15 queries/day free tier, higher for logged-in/premium.
- Cache identical/near-identical questions for short windows (the underlying data refreshes every 30s–5min anyway, matching existing SWR intervals in `app/page.tsx`).
- Hard per-IP cost ceiling alarm (not just a soft rate limit) — a single scraping bot must not be able to run an unbounded LLM bill.

**UI surface:** A docked chat panel on the dashboard (not a separate page) — keeps it discoverable next to the charts it's explaining, consistent with GridMix's existing "progressive disclosure" design principle from `COMPETITIVE_STRATEGY.md`.

---

## 🗺️ Phased Roadmap

### Phase 0 — Foundations (Week 1)
- Pick LLM SDK, write the 8 v1 tool wrappers, design citation format.
- Decide chat UI placement and component shape (likely `components/Watt.tsx` + `app/api/watt/route.ts`).
- Define refusal copy for ungroundable questions.

### Phase 1 — MVP (Weeks 2–3)
- Ship chat panel on dashboard, live/24h/48h questions only.
- Per-IP rate limiting, cost ceiling alarm.
- Log every Q&A pair (question, tool calls, answer, citation) for manual accuracy review — no analytics vendor needed yet, just structured logging.
- Internal dogfooding + accuracy sampling before public launch.

### Phase 2 — Depth (Weeks 4–6)
- Historical archive tool (25-year dataset) and insights-article citation.
- Public `/api/v1/watt` endpoint, documented alongside existing `/api/v1/*` docs.
- Embeddable widget version (ties into the existing Embeddable Widgets roadmap item).

### Phase 3 — Distribution (Weeks 7–9)
- MCP server exposing the same tool set, so Watt is queryable from inside Claude/ChatGPT directly.
- Gate unlimited/priority queries behind the Premium Tier already planned in `COMPETITIVE_STRATEGY.md`.
- Proactive surfacing: e.g. a Watt-generated one-liner under the dashboard header ("Good time to charge — 78% renewable right now").

### Phase 4 — Iteration (Month 3+)
- Feedback loop (thumbs up/down per answer feeding the accuracy log).
- Personalization (region, saved questions) once user accounts exist.
- Revisit model tier based on real accuracy data, not assumption.

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Hallucinated grid facts undermine trust | Tool-grounded answers only; refuse rather than guess; citation mandatory on every response |
| LLM API cost runs away on a free product | Cheap model tier, per-IP rate limit + hard cost ceiling, cache repeat queries |
| Latency makes chat feel sluggish | Keep tool calls thin (reuse already-cached data paths), stream the response |
| Scraping/abuse drives up bill | Reuse `lib/rate-limit.ts`, add stricter anonymous-IP ceiling than the existing API routes |
| Scope creep toward Ko's institutional turf | Explicit out-of-scope list above; revisit only if a B2B tier is independently justified |
| Answers look authoritative but data source (BMRS/PVLive) itself has gaps | Surface the same caveats the dashboard already implies (e.g. solar capacity estimate) in the citation, don't overstate certainty |

---

## 📌 Open Decisions (need your call before Phase 0 starts)

1. Confirm Anthropic API as the LLM provider (vs. OpenAI) — affects SDK choice and MCP story (Anthropic is the native MCP ecosystem).
2. Confirm free-tier daily query cap (suggested: 15/day) before launch.
3. Confirm chat panel lives on the main dashboard vs. a dedicated `/watt` page — recommendation above is dashboard-docked for discoverability.

---

**Status**: Draft — awaiting sign-off on open decisions before Phase 0.
**Owner**: GridMix Product Team
