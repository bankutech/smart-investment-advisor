import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import RecommendationView from './components/RecommendationView.jsx';
import RiskProfilerModal from './components/RiskProfilerModal.jsx';
import WealthSimulator from './components/WealthSimulator.jsx';
import RebalanceAssistant from './components/RebalanceAssistant.jsx';
import SchemaInspector from './components/SchemaInspector.jsx';
import { api } from './services/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [isProfilerOpen, setIsProfilerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [prof, cats, recs] = await Promise.all([
        api.getProfile('usr_01'),
        api.getCategories(),
        api.getRecommendations('usr_01')
      ]);
      setProfile(prof);
      setCategories(cats);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectCategory = async (catId) => {
    try {
      const recs = await api.getRecommendations('usr_01', catId);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdated = (newProfile) => {
    setProfile(newProfile);
    loadInitialData();
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#E2E8F0]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={profile}
        onOpenProfiler={() => setIsProfilerOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'recommendations' && (
          <RecommendationView
            recommendations={recommendations}
            categories={categories}
            onSelectCategory={handleSelectCategory}
            onOpenProfiler={() => setIsProfilerOpen(true)}
          />
        )}

        {activeTab === 'simulator' && (
          <WealthSimulator />
        )}

        {activeTab === 'rebalance' && (
          <RebalanceAssistant />
        )}

        {activeTab === 'schema' && (
          <SchemaInspector />
        )}
      </main>

      {/* Profiler Modal */}
      <RiskProfilerModal
        isOpen={isProfilerOpen}
        onClose={() => setIsProfilerOpen(false)}
        currentProfile={profile}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-900 py-8 bg-[#07080C] text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Smart Investment Advisor — Advanced SQL / DBMS Foundation</p>
          <p>Algorithmic Robo-Advisory &amp; Normalized 3NF Relational Architecture</p>
        </div>
      </footer>
    </div>
  );
}
