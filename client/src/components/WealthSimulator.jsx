import React, { useState, useEffect } from 'react';
import { LineChart, DollarSign, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';

export default function WealthSimulator() {
  const [initialCapital, setInitialCapital] = useState(10000);
  const [monthlySip, setMonthlySip] = useState(600);
  const [years, setYears] = useState(12);
  const [baseCagr, setBaseCagr] = useState(14.5);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [initialCapital, monthlySip, years, baseCagr]);

  async function runSimulation() {
    setLoading(true);
    try {
      const data = await api.simulateGrowth(initialCapital, monthlySip, years, baseCagr);
      setSimulationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const finalSummary = simulationResult?.finalSummary || {
    totalInvested: 96400,
    expectedWealth: 248900,
    expectedGains: 152500,
    wealthMultiplier: '2.58'
  };

  const timeline = simulationResult?.timeline || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Monte Carlo &amp; Compound Mathematical Engine
            </span>
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">
              Wealth Projection &amp; SIP Compound Simulator
            </h2>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            Formula: <span className="text-cyan-400">FV = P(1+r/12)^12t + PMT[((1+r/12)^12t - 1)/(r/12)]</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Initial Deposit (P):</span>
              <span className="text-white font-bold">${initialCapital.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={initialCapital}
              onChange={e => setInitialCapital(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly SIP (PMT):</span>
              <span className="text-white font-bold">${monthlySip.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={monthlySip}
              onChange={e => setMonthlySip(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Horizon Duration (t):</span>
              <span className="text-white font-bold">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={e => setYears(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Expected CAGR (r):</span>
              <span className="text-emerald-400 font-bold">{baseCagr}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              value={baseCagr}
              onChange={e => setBaseCagr(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-[#161B2B] p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Principal Invested</span>
            <span className="font-mono text-2xl font-bold text-white mt-1 block">
              ${finalSummary.totalInvested?.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Capital out-of-pocket</span>
          </div>

          <div className="bg-[#161B2B] p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Projected Portfolio Value</span>
            <span className="font-mono text-2xl font-bold text-cyan-400 mt-1 block">
              ${finalSummary.expectedWealth?.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
              {finalSummary.wealthMultiplier}x Multiplier
            </span>
          </div>

          <div className="bg-[#161B2B] p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Compound Earnings</span>
            <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">
              +${finalSummary.expectedGains?.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Pure interest &amp; capital gains</span>
          </div>

          <div className="bg-[#161B2B] p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Optimistic Band (+3%)</span>
            <span className="font-mono text-2xl font-bold text-purple-400 mt-1 block">
              ${timeline[timeline.length - 1]?.optimisticFv?.toLocaleString() || '---'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Bull market tailwind</span>
          </div>
        </div>
      </div>

      {/* Projection Timeline Table */}
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-display text-xl text-white font-bold">Year-by-Year Compounding Runway</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#161B2B] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Year</th>
                <th className="p-3 text-right">Cumulative Principal</th>
                <th className="p-3 text-right">Conservative (r-3%)</th>
                <th className="p-3 text-right text-cyan-300">Expected Base Model</th>
                <th className="p-3 text-right text-emerald-400">Compound Returns</th>
                <th className="p-3 text-right text-purple-400">Optimistic (r+3%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {timeline.map(row => (
                <tr key={row.year} className="hover:bg-slate-800/30">
                  <td className="p-3 text-white font-bold">Year {row.year}</td>
                  <td className="p-3 text-right text-slate-300">${row.totalInvested.toLocaleString()}</td>
                  <td className="p-3 text-right text-slate-400">${row.conservativeFv.toLocaleString()}</td>
                  <td className="p-3 text-right text-cyan-300 font-bold">${row.expectedFv.toLocaleString()}</td>
                  <td className="p-3 text-right text-emerald-400 font-bold">+${row.expectedReturns.toLocaleString()}</td>
                  <td className="p-3 text-right text-purple-400">${row.optimisticFv.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
