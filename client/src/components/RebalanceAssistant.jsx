import React, { useState, useEffect } from 'react';
import { RefreshCcw, TrendingUp, TrendingDown, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';

export default function RebalanceAssistant() {
  const [rebalanceData, setRebalanceData] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [reb, port] = await Promise.all([
        api.getRebalance('usr_01'),
        api.getPortfolio('usr_01')
      ]);
      setRebalanceData(reb);
      setPortfolio(port);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const actions = rebalanceData?.rebalanceActions || [];
  const totalVal = rebalanceData?.total_portfolio_value || 45810;

  return (
    <div className="space-y-6">
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
            Dynamic Asset Drift Detector
          </span>
          <h2 className="font-display text-3xl font-bold text-white tracking-tight">
            Portfolio Rebalancing Engine
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Total Monitored Portfolio: <span className="text-cyan-300 font-bold">${totalVal.toLocaleString()}</span>
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-3 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-2xl text-slate-300 hover:text-white transition-colors flex items-center space-x-2 text-xs font-mono"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Refresh Drift Analysis</span>
        </button>
      </div>

      {/* Action Table */}
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-display text-xl text-white font-bold">Current vs. Target Weight Allocation</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#161B2B] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Asset / Ticker</th>
                <th className="p-3.5">Asset Class</th>
                <th className="p-3.5 text-right">Actual Weight</th>
                <th className="p-3.5 text-right">Target Weight</th>
                <th className="p-3.5 text-right">Weight Drift</th>
                <th className="p-3.5 text-center">Suggested Action</th>
                <th className="p-3.5 text-right">Rebalance Capital</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {actions.map(act => {
                const isTrim = act.action.includes('SELL');
                const isBuy = act.action.includes('BUY');
                return (
                  <tr key={act.asset_id} className="hover:bg-slate-800/30">
                    <td className="p-3.5">
                      <span className="font-bold text-white block">{act.ticker}</span>
                      <span className="text-[11px] text-slate-400 font-sans">{act.asset_name}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{act.asset_class}</td>
                    <td className="p-3.5 text-right font-bold text-white">{act.actual_weight_pct}%</td>
                    <td className="p-3.5 text-right text-cyan-300 font-bold">{act.target_weight_pct}%</td>
                    <td className="p-3.5 text-right font-bold">
                      <span className={act.weight_drift_pct > 0 ? 'text-purple-400' : act.weight_drift_pct < 0 ? 'text-amber-400' : 'text-slate-400'}>
                        {act.weight_drift_pct > 0 ? `+${act.weight_drift_pct}` : act.weight_drift_pct}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        isTrim ? 'bg-purple-950/80 text-purple-300 border-purple-800' :
                        isBuy ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800' :
                        'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}>
                        {act.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold">
                      <span className={act.delta_value > 0 ? 'text-cyan-300' : act.delta_value < 0 ? 'text-purple-300' : 'text-slate-400'}>
                        {act.delta_value > 0 ? `+` : ''}${act.delta_value.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
