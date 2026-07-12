// AI-Powered Report Generator
// Generates draft reports from data snapshots using OpenAI GPT-4

import { DataSnapshot, Insight } from './types';
import { Enprompta } from '@enprompta/sdk';
import fs from 'fs/promises';
import path from 'path';

// Enprompta client for tracing report-generation LLM calls. Same manual-record
// approach as lib/watt-conversation.ts: Next's bundler breaks global init()
// auto-instrumentation, and callOpenAI() talks to OpenAI over fetch() (not the
// openai SDK) so tracedOpenAI() can't wrap it either. traces.record() is a plain
// method call — bundler-proof — and is fail-silent, so an unset key just means
// no trace, never a thrown error in the report pipeline.
const enprompta = new Enprompta({ apiKey: process.env.ENPROMPTA_API_KEY! });

const REPORT_SYSTEM_PROMPT =
  'You are an expert energy analyst and technical writer specializing in UK electricity grid data. You write clear, accurate, data-driven content that is both informative and engaging. You always cite sources and use specific data to support your analysis.';

interface ReportTemplate {
  type: string;
  title_pattern: string;
  category: 'grid-tech' | 'renewables' | 'policy' | 'analysis' | 'innovation';
  tags: string[];
  target_length: number;
  tone: string;
  sections: Array<{
    heading: string;
    purpose: string;
    data_points: string[];
    format: string;
  }>;
  required_elements: {
    citations: boolean;
    data_sources: boolean;
    publish_date: boolean;
    author: string;
  };
  ai_instructions: {
    style: string;
    focus: string;
    avoid: string;
    structure: string;
  };
}

const TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');

/**
 * Load a report template
 */
export async function loadTemplate(templateName: string): Promise<ReportTemplate> {
  const filepath = path.join(TEMPLATES_DIR, `${templateName}.json`);
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content) as ReportTemplate;
}

/**
 * Build the AI prompt from template and data
 */
function buildPrompt(snapshot: DataSnapshot, template: ReportTemplate): string {
  const dateRange = `${new Date(snapshot.period_start).toLocaleDateString('en-GB')} to ${new Date(snapshot.period_end).toLocaleDateString('en-GB')}`;

  const prompt = `You are an expert energy analyst writing for GridMix, a UK grid data platform. Generate a comprehensive, well-researched report based on the following data.

REPORT TYPE: ${template.type}
TARGET LENGTH: ${template.target_length} words
TONE: ${template.tone}

DATA SNAPSHOT:
Period: ${dateRange}
Average Carbon Intensity: ${snapshot.summary.avgCarbonIntensity} gCO2/kWh
Peak Renewable Percentage: ${snapshot.summary.peakRenewable}%
Total Demand: ${snapshot.summary.totalDemand.toLocaleString()} MWh

${snapshot.records.lowestCarbon ? `RECORD: Lowest Carbon Intensity - ${snapshot.records.lowestCarbon.value} gCO2/kWh at ${new Date(snapshot.records.lowestCarbon.timestamp).toLocaleString('en-GB')}` : ''}

${snapshot.records.peakDemand ? `RECORD: Peak Demand - ${snapshot.records.peakDemand.value.toLocaleString()} MW at ${new Date(snapshot.records.peakDemand.timestamp).toLocaleString('en-GB')}` : ''}

${snapshot.notable_events.length > 0 ? `Notable Events:\n${snapshot.notable_events.map(e => `- ${e}`).join('\n')}` : ''}

STRUCTURE REQUIREMENTS:
${template.sections.map((section, idx) => `
${idx + 1}. ${section.heading}
   Purpose: ${section.purpose}
   Include: ${section.data_points.join(', ')}
   Format: ${section.format}
`).join('\n')}

WRITING GUIDELINES:
Style: ${template.ai_instructions.style}
Focus: ${template.ai_instructions.focus}
Avoid: ${template.ai_instructions.avoid}
Structure: ${template.ai_instructions.structure}

REQUIRED ELEMENTS:
- Include proper citations for all data points
- Reference data sources: ${snapshot.sources.join(', ')}
- Write in markdown format with proper headings (##, ###)
- Use British English spelling
- Include specific numbers and percentages from the data
- Make it engaging and informative for both professionals and general readers

Generate the complete article now in markdown format:`;

  return prompt;
}

/**
 * Call OpenAI API to generate content
 */
async function callOpenAI(prompt: string, reportType: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const model = 'gpt-4o-mini';
  const temperature = 0.7;
  const maxTokens = 2500;
  const startedAt = Date.now();
  const metadata = { reportType, source: 'report-generator' };

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: REPORT_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });
  } catch (error) {
    // Network-level failure before we ever got a response.
    await enprompta.traces.record({
      provider: 'openai',
      model,
      input: prompt,
      output: '',
      systemPrompt: REPORT_SYSTEM_PROMPT,
      temperature,
      maxTokens,
      latencyMs: Date.now() - startedAt,
      status: 'ERROR',
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata,
    });
    throw error;
  }

  if (!response.ok) {
    const error = await response.json();
    const message = `OpenAI API error: ${JSON.stringify(error)}`;
    await enprompta.traces.record({
      provider: 'openai',
      model,
      input: prompt,
      output: '',
      systemPrompt: REPORT_SYSTEM_PROMPT,
      temperature,
      maxTokens,
      latencyMs: Date.now() - startedAt,
      status: 'ERROR',
      errorMessage: message,
      metadata,
    });
    throw new Error(message);
  }

  const data = await response.json();
  const content: string = data.choices[0].message.content;

  await enprompta.traces.record({
    provider: 'openai',
    model,
    input: prompt,
    output: content,
    systemPrompt: REPORT_SYSTEM_PROMPT,
    temperature,
    maxTokens,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
    latencyMs: Date.now() - startedAt,
    finishReason: data.choices[0].finish_reason,
    metadata,
  });

  return content;
}

/**
 * Generate title from template pattern and data
 */
function generateTitle(template: ReportTemplate, snapshot: DataSnapshot): string {
  const weekStart = new Date(snapshot.period_start).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const weekEnd = new Date(snapshot.period_end).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return template.title_pattern
    .replace('{week_start}', weekStart)
    .replace('{week_end}', weekEnd);
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Extract excerpt from content (first paragraph or first 200 chars)
 */
function extractExcerpt(content: string): string {
  // Remove markdown headings
  const withoutHeadings = content.replace(/^#+\s+.+$/gm, '').trim();

  // Get first paragraph
  const firstParagraph = withoutHeadings.split('\n\n')[0];

  // Limit to 200 characters
  if (firstParagraph.length > 200) {
    return firstParagraph.substring(0, 197) + '...';
  }

  return firstParagraph;
}

/**
 * Estimate read time (words per minute = 200)
 */
function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

/**
 * Generate next available post ID
 */
async function generateNextId(): Promise<string> {
  const postsDir = path.join(process.cwd(), 'data', 'posts');

  try {
    const files = await fs.readdir(postsDir);
    const ids = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const content = require(path.join(postsDir, f));
        return parseInt(content.id) || 0;
      });

    const maxId = Math.max(0, ...ids);
    return String(maxId + 1);
  } catch (error) {
    return '1';
  }
}

/**
 * Main function: Generate a report from a data snapshot
 */
export async function generateWeeklyReport(snapshot: DataSnapshot): Promise<Insight> {
  console.log('Loading template...');
  const template = await loadTemplate('weekly-summary');

  console.log('Building AI prompt...');
  const prompt = buildPrompt(snapshot, template);

  console.log('Calling OpenAI API...');
  const content = await callOpenAI(prompt, 'weekly-summary');

  console.log('Formatting report...');
  const title = generateTitle(template, snapshot);
  const slug = generateSlug(title);
  const excerpt = extractExcerpt(content);
  const readTime = estimateReadTime(content);
  const id = await generateNextId();

  // Add citations footer
  const contentWithCitations = `${content}

---

## Data Sources

This analysis is based on data from:
- **Elexon BMRS** (Balancing Mechanism Reporting Service): Real-time and historical grid generation data
- **Sheffield Solar PVLive**: Solar generation data
- **National Grid ESO**: Grid frequency and system data

*Data collected for the period ${new Date(snapshot.period_start).toLocaleDateString('en-GB')} to ${new Date(snapshot.period_end).toLocaleDateString('en-GB')}.*`;

  const report: Insight = {
    id,
    slug,
    title,
    excerpt,
    content: contentWithCitations,
    author: template.required_elements.author,
    date: new Date().toISOString().split('T')[0],
    readTime,
    category: template.category,
    tags: template.tags,
    featured: false,
    // Automated reporting fields
    status: 'draft',
    generated_by: 'ai',
    data_snapshot: snapshot.id,
  };

  console.log('Report generated successfully:', title);
  return report;
}

/**
 * Generate a record event report
 */
export async function generateRecordEventReport(
  snapshot: DataSnapshot,
  recordType: string,
  recordValue: number
): Promise<Insight | null> {
  // Only generate if this is truly notable
  if (recordType === 'carbon_low' && recordValue >= 50) {
    return null; // Not low enough to be newsworthy
  }

  console.log('Loading record event template...');
  const template = await loadTemplate('record-event');

  // Build custom prompt for record event
  const prompt = `You are an expert energy analyst writing for GridMix. A significant grid record has been achieved.

RECORD ACHIEVED: ${recordType === 'carbon_low' ? 'Lowest Carbon Intensity' : 'Peak Renewable Generation'}
VALUE: ${recordValue} ${recordType === 'carbon_low' ? 'gCO2/kWh' : '%'}
DATE: ${new Date(snapshot.period_end).toLocaleDateString('en-GB')}

Write a newsworthy article (${template.target_length} words) announcing this achievement.

STRUCTURE:
1. Lead with the record - what was achieved and when
2. Explain what made this possible (weather, generation mix, grid conditions)
3. Put it in context - why this matters for the UK's energy transition
4. Look ahead - what this means for future progress

TONE: ${template.tone}

Include specific data points and cite sources (Elexon BMRS, Sheffield Solar).
Write in markdown format with proper headings.
Use British English spelling.`;

  const content = await callOpenAI(prompt, 'record-event');

  const title = recordType === 'carbon_low'
    ? `UK Grid Achieves Record Low Carbon Intensity: ${recordValue}g CO2/kWh`
    : `Record Renewable Generation: ${recordValue}% of UK Electricity`;

  const slug = generateSlug(title);
  const excerpt = extractExcerpt(content);
  const readTime = estimateReadTime(content);
  const id = await generateNextId();

  const report: Insight = {
    id,
    slug,
    title,
    excerpt,
    content: content + '\n\n*Data source: Elexon BMRS, Sheffield Solar PVLive*',
    author: template.required_elements.author,
    date: new Date().toISOString().split('T')[0],
    readTime,
    category: template.category,
    tags: [...template.tags, recordType === 'carbon_low' ? 'carbon-intensity' : 'renewables'],
    featured: true, // Records are always featured
    status: 'draft',
    generated_by: 'ai',
    data_snapshot: snapshot.id,
  };

  return report;
}

/**
 * Check if snapshot contains record-worthy events
 */
export function checkForRecords(snapshot: DataSnapshot): Array<{ type: string; value: number }> {
  const records: Array<{ type: string; value: number }> = [];

  // Check for low carbon record
  if (snapshot.records.lowestCarbon && snapshot.records.lowestCarbon.value < 50) {
    records.push({
      type: 'carbon_low',
      value: snapshot.records.lowestCarbon.value,
    });
  }

  // Check for high renewable percentage
  if (snapshot.summary.peakRenewable > 75) {
    records.push({
      type: 'renewable_high',
      value: snapshot.summary.peakRenewable,
    });
  }

  return records;
}
