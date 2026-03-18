import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';

export default function RiskProfilerModal({ isOpen, onClose, currentProfile, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    age: currentProfile?.age || 26,
    annual_income: currentProfile?.annual_income || 95000,
    monthly_savings: currentProfile?.monthly_savings || 2500,
    target_duration_years: currentProfile?.target_duration_years || 10,
    risk_tolerance: 4 // 1 to 5 scale
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const annualIncome = parseFloat(formData.annual_income) || 0;
    const monthlySavings = parseFloat(formData.monthly_savings) || 0;
    if (monthlySavings * 12 > annualIncome) {
      if (!window.confirm(`Notice: Annualized savings ($${(monthlySavings * 12).toLocaleString()}) exceed stated annual income ($${annualIncome.toLocaleString()}). Proceed with this financial profile?`)) {
        return;
      }
    }
    setSubmitting(true);
    try {
      const updated = await api.assessProfile(formData);
      if (onProfileUpdated) onProfileUpdated(updated);
      onClose();
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#10131F] border border-slate-700 max-w-xl w-full rounded-3xl glow-cyan overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Algorithmic Risk Scoring</span>
              <h3 className="font-display text-2xl text-white font-bold">Investor Profiling Model</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 font-mono text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Investor Age</label>
              <input
                type="number"
                min="18"
                max="85"
                required
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-[#161B2B] border border-slate-700 p-2.5 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Horizon (Years)</label>
              <input
                type="number"
                min="1"
                max="40"
                required
                value={formData.target_duration_years}
                onChange={e => setFormData({ ...formData, target_duration_years: e.target.value })}
                className="w-full bg-[#161B2B] border border-slate-700 p-2.5 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Annual Income ($)</label>
              <input
                type="number"
                step="1000"
                required
                value={formData.annual_income}
                onChange={e => setFormData({ ...formData, annual_income: e.target.value })}
                className="w-full bg-[#161B2B] border border-slate-700 p-2.5 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Monthly Savings ($)</label>
              <input
                type="number"
                step="100"
                required
                value={formData.monthly_savings}
                onChange={e => setFormData({ ...formData, monthly_savings: e.target.value })}
                className="w-full bg-[#161B2B] border border-slate-700 p-2.5 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 uppercase text-[10px]">Market Drawdown Volatility Tolerance</label>
              <span className="text-cyan-400 font-bold">Level {formData.risk_tolerance} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.risk_tolerance}
              onChange={e => setFormData({ ...formData, risk_tolerance: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Conservative (&lt;5% dip)</span>
              <span>Moderate (15% dip)</span>
              <span>Aggressive (&gt;30% dip)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Scoring...' : 'Recalculate & Classify User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
