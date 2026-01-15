
import React, { useState, useEffect } from 'react';
import { exploreSubNiches, NicheExplorerResponse, SubNiche } from '../services/geminiService';
import { 
  Search, 
  Loader2, 
  Target, 
  Zap, 
  ArrowRight, 
  Info, 
  Trophy, 
  TrendingUp, 
  Rocket, 
  Users, 
  Globe, 
  Hash,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ZapOff,
  Flame,
  MonitorPlay,
  Settings,
  FileText
} from 'lucide-react';
import { View } from '../types';

interface NicheExplorerProps {
  onNavigate: (view: View) => void;
}

const STORAGE_KEY = 'sbl_niche_explorer_v1';

const NicheExplorer: React.FC<NicheExplorerProps> = ({ onNavigate }) => {
  const [broadNiche, setBroadNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NicheExplorerResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.broadNiche) setBroadNiche(parsed.broadNiche);
        if (parsed.results) setResults(parsed.results);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (results || broadNiche) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ broadNiche, results }));
    }
  }, [results, broadNiche]);

  const handleExplore = async () => {
    if (!broadNiche.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const data = await exploreSubNiches(broadNiche);
      setResults(data);
    } catch (e) {
      alert("Niche exploration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const launchNiche = (sub: SubNiche, targetView: View, autoGenerate = false) => {
      // Pre-fill context
      const currentLaunchpadString = localStorage.getItem('sbl_autosave_launchpad_v11');
      let currentLaunchpad = {};
      try {
          currentLaunchpad = currentLaunchpadString ? JSON.parse(currentLaunchpadString) : {};
      } catch (e) {}
      
      const updatedContext = {
          ...currentLaunchpad,
          nicheTopic: sub.name,
          targetAudience: sub.audience,
          generatedContent: '' 
      };
      
      localStorage.setItem('sbl_autosave_launchpad_v11', JSON.stringify(updatedContext));

      if (autoGenerate) {
          if (targetView === View.VIRAL_GENERATOR) {
            localStorage.setItem('sbl_auto_generate_trigger', 'true');
          } else if (targetView === View.BLOG_ARCHITECT) {
            localStorage.setItem('sbl_blog_generate_trigger', 'true');
          }
      }
      
      window.dispatchEvent(new CustomEvent('sbl-toast', { 
          detail: { 
              message: autoGenerate ? `Architecting content for ${sub.name}...` : `Context loaded for ${sub.name}`, 
              title: autoGenerate ? 'AUTO-SYNTHESIS' : 'CONTEXT SAVED', 
              type: 'success' 
          } 
      }));
      
      onNavigate(targetView);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
          <Target className="w-10 h-10 text-brand-500" />
          Sub-Niche & Keyword Explorer
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Stop competing in crowded markets. Find your "Blue Ocean" sub-niche instantly.</p>
      </div>

      <div className="bg-dark-card rounded-[2.5rem] border border-gray-800 p-8 shadow-premium relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              value={broadNiche}
              onChange={(e) => setBroadNiche(e.target.value)}
              placeholder="Enter broad niche (e.g. Health, Coffee, Real Estate)..."
              className="w-full bg-dark-input border border-gray-700 rounded-2xl py-5 pl-14 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 text-lg shadow-inner font-bold"
              onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
            />
          </div>
          <button 
            onClick={handleExplore}
            disabled={loading || !broadNiche}
            className={`px-10 py-5 rounded-2xl font-black text-white flex items-center justify-center transition-all border-2 border-transparent uppercase tracking-widest text-sm shadow-xl active:scale-95 ${loading || !broadNiche ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 shadow-brand-900/20'}`}
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6 mr-2" /> : <Sparkles className="w-6 h-6 mr-2" />}
            Explore Blue Oceans
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative w-20 h-20">
            <Loader2 className="w-20 h-20 text-brand-500 animate-spin absolute inset-0 opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-10 h-10 text-brand-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Analyzing Global Market Trends...</h3>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Scanning for high-profitability low-competition segments</p>
          </div>
        </div>
      ) : results ? (
        <div className="space-y-10 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.sub_niches.map((sub, idx) => (
              <div key={idx} className="bg-dark-card border border-gray-800 rounded-[2.5rem] p-8 shadow-premium hover:border-brand-500/30 transition-all group relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Trophy size={150} />
                </div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <TrendingUp size={10} /> Sub-Niche 0{idx + 1}
                        </span>
                        <h3 className="text-2xl font-black text-white leading-tight uppercase group-hover:text-brand-400 transition-colors">{sub.name}</h3>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter leading-none mb-1">Profitability</span>
                        <span className="text-xl font-black text-white">{sub.profitability_score}%</span>
                    </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium italic relative z-10">
                    {sub.description}
                </p>

                <div className="space-y-4 mb-8 flex-1 relative z-10">
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Users size={12} className="text-brand-500" /> Target Audience
                        </h4>
                        <p className="text-xs text-gray-300 font-bold">{sub.audience}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Hash size={12} className="text-brand-500" /> Trending Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {sub.keywords.map((kw, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleCopy(kw, `kw-${idx}-${i}`)}
                                    className="px-2.5 py-1.5 bg-dark-input hover:bg-brand-900/40 border border-gray-800 hover:border-brand-500/50 rounded-lg text-[9px] font-bold text-gray-400 hover:text-white transition-all flex items-center gap-1"
                                >
                                    {copiedId === `kw-${idx}-${i}` ? <Check size={10} className="text-brand-500" /> : <Hash size={10} className="opacity-40" />}
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                    <button 
                        onClick={() => launchNiche(sub, View.VIRAL_GENERATOR, true)}
                        className="w-full py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-glow flex items-center justify-center gap-2 active:scale-95"
                    >
                        <MonitorPlay size={14} /> Architect Viral Suite
                    </button>
                    <button 
                        onClick={() => launchNiche(sub, View.BLOG_ARCHITECT, true)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-glow flex items-center justify-center gap-2 active:scale-95"
                    >
                        <FileText size={14} /> Architect Viral Blog
                    </button>
                    <button 
                        onClick={() => launchNiche(sub, View.VIRAL_GENERATOR)}
                        className="w-full py-3 bg-dark-input hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-gray-700 flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Settings size={12} /> Setup Workspace
                    </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-[2.5rem] flex items-center gap-6">
              <div className="p-4 bg-brand-500/10 rounded-2xl text-brand-500 shadow-glow-sm">
                  <Zap size={24} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-lg font-black text-white uppercase tracking-widest italic">The Blue Ocean Strategy</h4>
                  <p className="text-sm text-gray-500 font-medium">
                      Compete in niches with high profitability but specific focus. Broad niches are expensive; sub-niches are lucrative. Architect your brand around one of these segments for maximum conversion velocity.
                  </p>
              </div>
          </div>
        </div>
      ) : (
        <div className="h-[400px] border-2 border-dashed border-gray-800 rounded-[3.5rem] flex flex-col items-center justify-center text-center p-16 text-gray-600 group hover:border-brand-900/30 transition-all duration-500">
            <div className="bg-gray-900/50 p-8 rounded-full mb-8 shadow-inner group-hover:bg-brand-900/5 transition-all">
                <Search className="w-16 h-16 opacity-10 group-hover:opacity-40 group-hover:text-brand-500 transition-all" />
            </div>
            <h3 className="text-2xl font-bold text-gray-500 mb-3 uppercase tracking-widest">Awaiting Analysis</h3>
            <p className="text-sm max-w-xs mx-auto leading-relaxed">Enter a broad industry keyword to discover hidden sub-niches with high monetization potential.</p>
        </div>
      )}
    </div>
  );
};

export default NicheExplorer;
