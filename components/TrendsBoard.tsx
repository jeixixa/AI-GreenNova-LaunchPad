
import React, { useState, useEffect } from 'react';
import { generateTrendsForNiche, TrendAnalysis } from '../services/geminiService';
import { 
  Zap, 
  TrendingUp, 
  Flame, 
  Target, 
  Search, 
  Loader2, 
  ArrowRight, 
  Clock, 
  BarChart3, 
  RefreshCw, 
  Info,
  Sparkles,
  ChevronRight,
  MonitorPlay,
  Globe
} from 'lucide-react';
import { View } from '../types';

interface TrendsBoardProps {
  onNavigate: (view: View) => void;
}

const STORAGE_KEY = 'sbl_trends_cache_v2';

const TrendsBoard: React.FC<TrendsBoardProps> = ({ onNavigate }) => {
  const [niche, setNiche] = useState('AI Automation');
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load cache on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const p = JSON.parse(saved);
            if (p.niche) setNiche(p.niche);
            if (p.trends) setTrends(p.trends);
            if (p.lastUpdated) setLastUpdated(p.lastUpdated);
        } catch (e) {}
    } else {
        fetchTrends(); // Initial default fetch if no cache
    }
  }, []);

  // Save cache on data change
  useEffect(() => {
    if (!loading && (trends.length > 0 || niche)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ niche, trends, lastUpdated }));
    }
  }, [niche, trends, lastUpdated, loading]);

  const fetchTrends = async (targetNiche: string = niche) => {
    if (!targetNiche.trim()) return;
    setLoading(true);
    try {
        const data = await generateTrendsForNiche(targetNiche);
        setTrends(data);
        setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
        console.error(e);
        window.dispatchEvent(new CustomEvent('sbl-toast', { 
            detail: { message: 'Pattern analysis failed. Check API configuration.', type: 'error' } 
        }));
    } finally {
        setLoading(false);
    }
  };

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'Exploding': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Rising': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Evergreen': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
            <Zap className="text-brand-500" />
            Viral Intelligence Hub
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Real-time pattern discovery and trending DNA across any niche.</p>
        </div>
        <div className="flex items-center gap-4">
             {lastUpdated && (
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest bg-dark-card border border-gray-800 px-3 py-1.5 rounded-full">
                    <Clock size={12} /> Last Synth: {lastUpdated}
                </div>
             )}
             <button 
                onClick={() => fetchTrends()}
                disabled={loading}
                className="p-3 bg-brand-900/40 text-brand-400 border border-brand-500/30 rounded-xl hover:bg-brand-900/60 transition-all disabled:opacity-30"
             >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
        </div>
      </div>

      {/* Discovery Input */}
      <div className="bg-dark-card border border-gray-800 rounded-[2.5rem] p-8 shadow-premium relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="flex flex-col md:flex-row gap-4 relative z-10">
            <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text" 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Enter Niche (e.g. Sustainable Fashion)..."
                    className="w-full bg-dark-input border border-gray-700 rounded-2xl py-5 pl-14 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 text-lg shadow-inner font-bold"
                    onKeyDown={(e) => e.key === 'Enter' && fetchTrends()}
                />
            </div>
            <button 
                onClick={() => fetchTrends()}
                disabled={loading || !niche.trim()}
                className={`px-10 py-5 rounded-2xl font-black text-white flex items-center justify-center transition-all border-2 border-transparent uppercase tracking-widest text-sm shadow-xl active:scale-95 ${loading || !niche.trim() ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-500 hover:bg-brand-400 shadow-brand-900/20'}`}
            >
                {loading ? <Loader2 className="animate-spin w-6 h-6 mr-2" /> : <Sparkles className="w-6 h-6 mr-2" />}
                Analyze Patterns
            </button>
         </div>
      </div>

      {/* Trends Grid */}
      {loading ? (
          <div className="h-[500px] flex flex-col items-center justify-center text-center">
              <div className="relative w-20 h-20 mb-8">
                  <Loader2 className="w-20 h-20 text-brand-500 animate-spin absolute inset-0 opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="w-10 h-10 text-brand-500 animate-bounce" />
                  </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Scanning Industry DNA</h3>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">AI is parsing current social signals and pattern interruptions for "{niche}".</p>
          </div>
      ) : trends.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trends.map((trend, i) => (
                  <div 
                    key={i} 
                    className="bg-dark-card border border-gray-800 rounded-[2.5rem] p-8 shadow-premium hover:border-brand-500/30 transition-all group relative overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                          <Flame size={150} />
                      </div>

                      <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border mb-3 w-fit ${getVelocityColor(trend.velocity)}`}>
                                {trend.velocity} Velocity
                            </span>
                            <h3 className="text-2xl font-black text-white leading-tight group-hover:text-brand-400 transition-colors">{trend.topic}</h3>
                          </div>
                          <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Opportunity Score</span>
                              <div className="flex items-center gap-2">
                                  <div className="text-2xl font-black text-brand-500">{trend.opportunity_score}</div>
                                  <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-brand-500" style={{ width: `${trend.opportunity_score}%` }}></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium italic group-hover:text-gray-300">
                          {trend.description}
                      </p>

                      <div className="bg-dark-input/50 border border-gray-700/50 rounded-2xl p-6 mb-8 relative">
                          <div className="absolute -top-3 left-4 bg-brand-900 border border-brand-500/30 px-2 py-0.5 rounded text-[8px] font-black text-brand-400 uppercase tracking-widest">
                            Hook DNA Template
                          </div>
                          <p className="text-sm font-mono text-brand-200/80 leading-relaxed">
                            "{trend.viral_hook_dna}"
                          </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={() => {
                                const currentLaunchpadString = localStorage.getItem('sbl_autosave_launchpad_v11');
                                let currentLaunchpad = {};
                                try {
                                    currentLaunchpad = currentLaunchpadString ? JSON.parse(currentLaunchpadString) : {};
                                } catch (e) {}
                                
                                localStorage.setItem('sbl_autosave_launchpad_v11', JSON.stringify({ 
                                    ...currentLaunchpad,
                                    nicheTopic: trend.topic,
                                    generatedContent: '' 
                                }));
                                onNavigate(View.VIRAL_GENERATOR);
                            }}
                            className="flex-1 py-4 bg-brand-900/40 hover:bg-brand-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-brand-500/30 group-hover:shadow-glow-sm flex items-center justify-center gap-2"
                          >
                            <MonitorPlay size={14} /> Architect Content Suite
                          </button>
                          <button 
                            onClick={() => {
                                onNavigate(View.VIRAL_SEARCH);
                            }}
                            className="px-6 py-4 bg-gray-800/40 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-gray-700 flex items-center justify-center gap-2"
                          >
                            Deep Pattern Research <ChevronRight size={14} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          <div className="h-[400px] border-2 border-dashed border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 text-gray-600">
                <Globe className="w-20 h-20 mb-6 opacity-10" />
                <h3 className="text-xl font-bold text-gray-500 mb-2 uppercase tracking-widest">Intelligence Feed Idle</h3>
                <p className="text-sm max-w-xs mx-auto leading-relaxed">Input your industry above to discover high-velocity trending patterns and hook DNA templates.</p>
          </div>
      )}

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B1425] border border-brand-500/10 p-6 rounded-2xl space-y-3">
                <div className="p-3 bg-brand-500/10 rounded-xl w-fit text-brand-500">
                    <BarChart3 size={20} />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Velocity Tracking</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    We track 'Rising' topics before they peak, giving you a 48-72 hour head start on the majority of creators in your niche.
                </p>
          </div>
          <div className="bg-[#0B1425] border border-blue-500/10 p-6 rounded-2xl space-y-3">
                <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-500">
                    <Target size={20} />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Opportunity Scores</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Scores are calculated based on high engagement-to-follower ratios, identifying "under-served" content gaps in your field.
                </p>
          </div>
          <div className="bg-[#0B1425] border border-orange-500/10 p-6 rounded-2xl space-y-3">
                <div className="p-3 bg-orange-500/10 rounded-xl w-fit text-orange-500">
                    <Flame size={20} />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Viral DNA Extraction</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    AI doesn't just copy—it extracts the linguistic markers and psychological triggers that forced the algorithm to push a piece of content.
                </p>
          </div>
      </div>
    </div>
  );
};

export default TrendsBoard;
