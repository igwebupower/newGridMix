// Cron Job: Weekly Data Collection & Report Generation
// Runs every Monday at 2 AM to collect and aggregate the previous week's grid data
// Then automatically generates AI-powered draft reports
// This endpoint should only be called by Vercel Cron

import { NextRequest, NextResponse } from 'next/server';
import { aggregateWeeklyData, saveDataSnapshot, validateReportData } from '@/lib/data-aggregator';
import { generateWeeklyReport, checkForRecords, generateRecordEventReport } from '@/lib/report-generator';
import { savePost, generateUniqueSlug } from '@/lib/post-manager';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution time: 60 seconds

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('=== Starting weekly data collection & report generation ===');

    // Step 1: Collect and aggregate data
    console.log('[1/4] Collecting weekly data...');
    const snapshot = await aggregateWeeklyData();

    // Step 2: Validate data quality
    console.log('[2/4] Validating data quality...');
    const isValid = await validateReportData(snapshot);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Data validation failed',
          snapshot_id: snapshot.id,
        },
        { status: 400 }
      );
    }

    // Step 3: Save snapshot to disk
    console.log('[3/4] Saving data snapshot...');
    await saveDataSnapshot(snapshot);

    // Step 4: Generate AI reports
    console.log('[4/4] Generating AI-powered reports...');
    const generatedReports: string[] = [];

    try {
      // Generate weekly summary report
      console.log('Generating weekly summary report...');
      const weeklyReport = await generateWeeklyReport(snapshot);

      // Ensure unique slug
      weeklyReport.slug = await generateUniqueSlug(weeklyReport.slug);

      // Save as draft
      await savePost(weeklyReport);
      generatedReports.push(`Weekly Summary: "${weeklyReport.title}"`);

      console.log(`✓ Weekly report saved as draft: ${weeklyReport.slug}`);

      // Check for record-worthy events
      const records = checkForRecords(snapshot);

      if (records.length > 0) {
        console.log(`Found ${records.length} record event(s), generating report(s)...`);

        for (const record of records) {
          const recordReport = await generateRecordEventReport(
            snapshot,
            record.type,
            record.value
          );

          if (recordReport) {
            recordReport.slug = await generateUniqueSlug(recordReport.slug);
            await savePost(recordReport);
            generatedReports.push(`Record Event: "${recordReport.title}"`);
            console.log(`✓ Record report saved as draft: ${recordReport.slug}`);
          }
        }
      }

      console.log('=== Report generation completed successfully ===');
    } catch (aiError) {
      console.error('AI report generation error:', aiError);
      // Continue even if AI generation fails - we still have the data snapshot
    }

    return NextResponse.json(
      {
        success: true,
        snapshot: {
          id: snapshot.id,
          period: `${snapshot.period_start} to ${snapshot.period_end}`,
          summary: snapshot.summary,
          records: snapshot.records,
          notable_events: snapshot.notable_events,
        },
        reports_generated: generatedReports.length,
        reports: generatedReports,
        next_step: 'Review drafts in admin panel at /admin/review',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job error:', error);

    return NextResponse.json(
      {
        error: 'Failed to collect weekly data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Prevent caching
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
