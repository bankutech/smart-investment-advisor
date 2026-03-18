import React from 'react';
import { ShieldCheck, LineChart, Sliders, Database, PieChart, RefreshCcw, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, userProfile, onOpenProfiler }) {
  const tabs = [
    { id: 'recommendations', label: 'Asset Allocation', icon: PieChart },
    { id: 'simulator', label: 'Wealth Simulator', icon: LineChart },
    { id: 'rebalance', label: 'Rebalance Engine', icon: RefreshCcw },
    { id: 'schema', label: 'Relational Schema', icon: Database }
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0B0D14]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('recommendations')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 glow-cyan">
              <div className="w-full h-full bg-[#090A0F] rounded-[10px] flex items-center justify-center text-cyan-400">
                <LineChart className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-xl tracking-tight text-white">SmartAdvisor</span>
                <span className="text-[10px] font-mono uppercase tracking-widest bg-cyan-950/80 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded-md">
                  3NF Relational
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">Automated Robo-Advisory &amp; Asset Allocation</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#121520] p-1.5 rounded-xl border border-slate-800">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Telemetry & Profiler Trigger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenProfiler}
              className="flex items-center space-x-2 bg-[#121520] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-mono transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Score: <strong className="text-cyan-400">{userProfile?.risk_score || 78.5}</strong></span>
              <span className="hidden lg:inline text-slate-500">|</span>
              <span className="hidden lg:inline text-emerald-400">{userProfile?.category_name || 'Long Term'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
