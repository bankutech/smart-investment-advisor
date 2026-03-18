import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, Sparkles, Award, ArrowRight, Info, CheckCircle2, PieChart, Layers, Clock, Code2 } from 'lucide-react';
import { api } from '../services/api.js';

export default function RecommendationView({ recommendations, categories, onSelectCategory, onOpenProfiler }) {
  const [timeframe, setTimeframe] = useState('1Y'); // '1M' | '1Y' | '3Y' | '5Y'
  const [slide14Result, setSlide14Result] = useState(null);
  const [runningSlide14, setRunningSlide14] = useState(false);

  const currentCategoryId = recommendations?.category_id || 'cat_long';
  const suggestions = recommendations?.suggestions || [];
  const sectorBreakdown = recommendations?.sectorBreakdown || [];

  const currentCategory = categories.find(c => c.category_id === currentCategoryId) || {
    category_name: 'Long Term Horizon',
    target_horizon: '5 to 15 Years',
    expected_return_cagr: 14.5,
    description: 'Aggressive capital expansion leveraging diversified index ETFs, blue-chip technology innovators, and emerging market leaders.'
  };

  const handleRunSlide14Query = async () => {
    setRunningSlide14(true);
    try {
      const res = await api.runSlide14Query(currentCategoryId);
      setSlide14Result(res);
    } catch (err) {
      console.error('Slide 14 query error:', err);
    } finally {
      setRunningSlide14(false);
    }
  };

  const getReturnForTimeframe = (sug) => {
    switch (timeframe) {
      case '1M':
        return { label: '1-Month Return', value: sug.return_1_month ?? 1.8 };
      case '1Y':
        return { label: '1-Year Return', value: sug.return_1_year ?? 18.4 };
      case '3Y':
        return { label: '3-Year Return', value: sug.return_3_years ?? 15.6 };
      case '5Y':
      default:
        return { label: '5-Year CAGR', value: sug.cagr_5yr ?? 14.2 };
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Selection & Expected Returns Banner */}
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Horizon Model: {currentCategory.target_horizon}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {currentCategory.category_name}
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              {currentCategory.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:text-right">
            <div className="bg-[#161B2B] border border-slate-800 p-4 rounded-2xl min-w-44">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Expected Return</span>
              <span className="font-mono text-3xl font-bold text-cyan-400">
                {currentCategory.expected_return_cagr}% <span className="text-xs text-slate-400 font-normal">CAGR</span>
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Historical 5Y Model</span>
            </div>

            <button
              onClick={onOpenProfiler}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-mono text-xs font-bold hover:opacity-90 transition-opacity glow-cyan"
            >
              Recalibrate Risk Profiler
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-500 mr-2">Investment Horizon:</span>
          {categories.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => onSelectCategory(cat.category_id)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all ${
                cat.category_id === currentCategoryId
                  ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      </div>

      {/* Slide 9 & 14: Detailed Sector Breakdown */}
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-xl text-white font-bold">
                Detailed Market Sector Breakdown (Slide 9 &amp; 14)
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Diversified multi-asset tiering introspected from MARKET_SECTOR and CATEGORY_SUGGESTION tables
              </p>
            </div>
          </div>
        </div>

        {/* Visual Allocation Stack Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Portfolio Sector Weight Allocation (100% Normalized)</span>
            <span>{sectorBreakdown.length} Active Market Sectors</span>
          </div>
          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
            {sectorBreakdown.map((sec, i) => {
              const colors = [
                'bg-cyan-500',
                'bg-emerald-500',
                'bg-amber-500',
                'bg-indigo-500',
                'bg-rose-500',
                'bg-purple-500'
              ];
              const color = colors[i % colors.length];
              return (
                <div
                  key={sec.sector_id}
                  style={{ width: `${sec.total_allocation_pct}%` }}
                  className={`${color} h-full transition-all`}
                  title={`${sec.sector_name}: ${sec.total_allocation_pct}%`}
                ></div>
              );
            })}
          </div>
        </div>

        {/* Sector Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {sectorBreakdown.map((sec, i) => (
            <div
              key={sec.sector_id}
              className="bg-[#151827] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">{sec.asset_count} Instrument(s)</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sec.risk_tier === 'High'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : sec.risk_tier === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {sec.risk_tier} Risk
                  </span>
                </div>
                <h4 className="font-display text-base font-semibold text-white">{sec.sector_name}</h4>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Weight:</span>
                  <span className="text-cyan-300 font-bold text-sm">{sec.total_allocation_pct}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">3Y / 5Y Avg:</span>
                  <span className="text-emerald-400">+{sec.avg_return_3_years}% / +{sec.avg_cagr_5yr}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Allocation Cards Grid with Timeframe Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-white font-bold">Suggested Asset Allocation</h3>
            <span className="text-xs font-mono text-slate-400">{suggestions.length} Normalized Relational Assets</span>
          </div>

          {/* Slide 14: Historical Return Timeframe Buttons */}
          <div className="flex items-center space-x-1.5 bg-[#161B2B] p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 px-2 text-[11px] font-medium hidden sm:inline">Timeframe:</span>
            {[
              { id: '1M', label: '1 Month' },
              { id: '1Y', label: '1 Year' },
              { id: '3Y', label: '3 Years' },
              { id: '5Y', label: '5 Years' }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  timeframe === tf.id
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suggestions.map((sug, idx) => {
            const tfReturn = getReturnForTimeframe(sug);
            return (
              <div
                key={sug.asset_id || idx}
                className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 font-bold">
                      {sug.ticker}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">WEIGHT</span>
                      <span className="font-mono text-lg font-bold text-white">
                        {sug.allocation_weight_pct}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display text-xl text-white font-medium">{sug.asset_name}</h4>
                    <p className="text-xs font-mono text-slate-400">{sug.asset_class} • {sug.sector_name}</p>
                  </div>

                  {/* Active Selected Timeframe Highlight */}
                  <div className="p-3 bg-[#151929] rounded-2xl border border-slate-800 flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                      <span>{tfReturn.label}</span>
                    </span>
                    <span className={`text-base font-bold ${tfReturn.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tfReturn.value >= 0 ? `+${tfReturn.value}%` : `${tfReturn.value}%`}
                    </span>
                  </div>

                  {/* Complete Historical Return Timeframes Matrix */}
                  <div className="grid grid-cols-4 gap-1 py-2 border-y border-slate-800/80 font-mono text-center text-xs">
                    <div className="p-1 rounded bg-slate-900/40">
                      <span className="text-[9px] text-slate-500 block">1M Return</span>
                      <span className="text-slate-300 text-[11px] font-semibold">
                        {sug.return_1_month !== undefined ? `+${sug.return_1_month}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-slate-900/40">
                      <span className="text-[9px] text-slate-500 block">1Y Return</span>
                      <span className="text-emerald-400 text-[11px] font-semibold">
                        {sug.return_1_year !== undefined ? `+${sug.return_1_year}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-slate-900/40">
                      <span className="text-[9px] text-slate-500 block">3Y CAGR</span>
                      <span className="text-emerald-400 text-[11px] font-semibold">
                        {sug.return_3_years !== undefined ? `+${sug.return_3_years}%` : `${sug.cagr_3yr}%`}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-slate-900/40">
                      <span className="text-[9px] text-slate-500 block">Sharpe</span>
                      <span className="text-cyan-300 text-[11px] font-semibold">{sug.sharpe_ratio || 1.45}</span>
                    </div>
                  </div>

                  {/* Explainability Rationale */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      DBMS Mapping Rationale
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sug.investment_rationale || sug.rationale}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                  <span>Priority Rank #{sug.priority || sug.priority_rank || idx + 1}</span>
                  <span className="text-emerald-400">● Active Rule</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide 14 SQL Query Live Workbench */}
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold">
              <Code2 className="w-4 h-4" />
              <span>Slide 14 Query: Retrieve Recommendations Engine</span>
            </div>
            <h4 className="font-display text-lg text-white font-semibold">
              Live SQL Join: CATEGORY_SUGGESTION ⨝ ASSET ⨝ ASSET_PERFORMANCE
            </h4>
          </div>

          <button
            onClick={handleRunSlide14Query}
            disabled={runningSlide14}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            {runningSlide14 ? 'Executing SQL...' : 'Run Slide 14 Query'}
          </button>
        </div>

        <div className="bg-[#090A0F] border border-slate-800/90 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
          <code>
            {`SELECT a.asset_name, a.asset_type, ms.sector_name, ap.historical_return, 
       ap.return_1_month, ap.return_1_year, ap.return_3_years, cs.rationale, cs.rank_order
FROM CATEGORY_SUGGESTION cs
JOIN ASSET a ON a.asset_id = cs.asset_id
JOIN MARKET_SECTOR ms ON a.sector_id = ms.sector_id
JOIN ASSET_PERFORMANCE ap ON ap.asset_id = a.asset_id
WHERE cs.category_id = '${currentCategoryId}'
ORDER BY cs.rank_order ASC;`}
          </code>
        </div>

        {slide14Result && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Returned {slide14Result.rowCount} rows in {slide14Result.executionTimeMs} ms</span>
              <span className="text-cyan-400">Direct SQLite Introspection</span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left font-mono text-xs text-slate-300">
                <thead className="bg-[#141828] text-slate-400 text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">1M Return</th>
                    <th className="p-3">1Y Return</th>
                    <th className="p-3">3Y Return</th>
                    <th className="p-3">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0E101A]">
                  {slide14Result.data.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{r.asset_name}</td>
                      <td className="p-3 text-slate-400">{r.asset_type}</td>
                      <td className="p-3 text-cyan-300">{r.sector}</td>
                      <td className="p-3 text-emerald-400">+{r.return_1_month}%</td>
                      <td className="p-3 text-emerald-400">+{r.return_1_year}%</td>
                      <td className="p-3 text-emerald-400">+{r.return_3_years}%</td>
                      <td className="p-3 text-white font-bold">#{r.rank_order}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
