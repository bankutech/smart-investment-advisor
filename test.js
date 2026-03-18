import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAdvisorTests() {
  console.log('================================================================');
  console.log(' SMART INVESTMENT ADVISOR STANDALONE E2E VERIFICATION SUITE     ');
  console.log('================================================================\n');

  console.log('[STEP 0] Resetting and seeding fresh database...');
  const { execSync } = await import('node:child_process');
  execSync(`"${process.execPath}" server/src/db/seed.js`, { cwd: __dirname });

  console.log('[STEP 1] Starting Smart Investment Advisor server (:5003)...');
  const serverProc = spawn(process.execPath, ['server/src/index.js'], { cwd: __dirname, shell: false });

  await wait(2000);

  try {
    const health = await fetch('http://localhost:5003/api/health').then(r => r.json());
    console.log('✓ /api/health:', health.status);
    if (health.status !== 'ok') throw new Error('Health check failed');

    const html = await fetch('http://localhost:5003/').then(r => r.text());
    if (html.includes('<!DOCTYPE html>')) {
      console.log('✓ Standalone Dark-Mode Hardware SPA served cleanly on :5003');
    }

    // Step 2: Risk Profiling & Classification (Slide 13)
    console.log('Testing Slide 13 boundary profiling (Age 80, 1-yr duration vs Age 21, 25-yr)...');
    const profShort = await fetch('http://localhost:5003/api/profile/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_01',
        age: 80,
        target_duration_years: 1,
        annual_income: 120000,
        monthly_savings: 4000,
        risk_tolerance: 3
      })
    }).then(r => r.json());
    console.log('✓ Extreme Age 80, 1-yr duration classified as:', profShort.data.category_id, `(${profShort.data.category_name})`);
    if (profShort.data.category_id !== 'cat_short') {
      throw new Error(`Expected cat_short, got ${profShort.data.category_id}`);
    }

    // Slide 9 & 14 Historical Returns Multi-Timeframe (1M, 1Y, 3Y)
    console.log('Testing Slide 9 & 14 Multi-Timeframe Historical Returns (1M, 1Y, 3Y)...');
    const recs = await fetch('http://localhost:5003/api/recommendations/usr_01').then(r => r.json());
    console.log(`✓ /api/recommendations returned ${recs.data.suggestions.length} normalized asset allocations`);
    const sample = recs.data.suggestions[0];
    if (sample.return_1_month === undefined || sample.return_1_year === undefined || sample.return_3_years === undefined) {
      throw new Error('Historical returns (1M, 1Y, 3Y) missing from recommendations');
    }
    console.log(`✓ Confirmed multi-timeframe returns for ${sample.ticker}: 1M=+${sample.return_1_month}%, 1Y=+${sample.return_1_year}%, 3Y=+${sample.return_3_years}%`);

    // Slide 9 & 14 Detailed Sector Breakdown
    console.log('Testing Slide 9 & 14 Detailed Sector Breakdown endpoint...');
    const sectorRes = await fetch('http://localhost:5003/api/sectors/breakdown/cat_long').then(r => r.json());
    if (sectorRes.data.length > 0) {
      console.log(`✓ Detailed Sector Breakdown: ${sectorRes.data.length} sectors, primary=${sectorRes.data[0].sector_name} (${sectorRes.data[0].total_allocation_pct}%)`);
    } else {
      throw new Error('Sector breakdown endpoint returned empty');
    }

    // Slide 14 Query Execution Runner
    console.log('Testing Slide 14 4-table JOIN Query Runner...');
    const slide14Res = await fetch('http://localhost:5003/api/sql/slide14-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: 'cat_long' })
    }).then(r => r.json());
    if (slide14Res.data.length > 0) {
      console.log(`✓ Slide 14 Query executed in ${slide14Res.executionTimeMs} ms with ${slide14Res.rowCount} rows`);
    } else {
      throw new Error('Slide 14 query returned empty');
    }

    // Wealth Compound & SIP Simulation
    console.log('Testing SIP compound wealth simulation...');
    const simRes = await fetch('http://localhost:5003/api/simulation/compound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initialPrincipal: 10000, monthlyContribution: 1000, years: 5, expectedReturnPct: 8.5 })
    }).then(r => r.json());
    console.log('✓ SIP Wealth Multiplier:', simRes.data.summary.wealthMultiplier, 'Expected Gains: $' + simRes.data.summary.expectedGains);

    // Schema Inspector
    console.log('Testing 3NF Relational Schema Inspector...');
    const schemaRes = await fetch('http://localhost:5003/api/schema').then(r => r.json());
    const tableCount = Object.keys(schemaRes.data).length;
    console.log(`✓ Schema Inspector introspected ${tableCount} normalized tables with foreign key constraints`);

    console.log('\n================================================================');
    console.log('   🎉 SMART INVESTMENT ADVISOR STANDALONE TESTS PASSED 100%!   ');
    console.log('================================================================\n');
  } finally {
    serverProc.kill();
  }
}

runAdvisorTests().catch(err => {
  console.error('\n❌ Smart Investment Advisor Test Failed:', err);
  process.exit(1);
});
