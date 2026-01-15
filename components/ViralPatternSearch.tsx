
import React, { useState, useEffect } from 'react';
import { getViralPatternIntelligence, ViralPatternIntelligence } from '../services/geminiService';
import { 
  Search, 
  Loader2, 
  Brain, 
  Target, 
  Zap, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  Info,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Smartphone,
  Copy,
  Check,
  Flame,
  Activity,
  Award,
  ExternalLink,
  Radar,
  TrendingUp
} from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

const LOADING_MESSAGES = [
    "Decrypting niche algorithms...",
    "Scanning social psychology markers...",
    "Extracting hook DNA sequences...",
    "Mapping attention velocity...",
    "Architecting conversion paths..."
];

const PLATFORMS = [
    { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'TikTok', icon: Smartphone, color: 'text-white' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { name: 'X (Twitter)', icon: Twitter, color: 'text-gray-200' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
];

const ViralPatternSearch: React.FC = () => {
    const [niche, setNiche] = useState('');
    const [platform, setPlatform] = useState('Instagram');
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [intelligence, setIntelligence] = useState<ViralPatternIntelligence | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        let interval: number;
        if (loading) {
            interval = window.setInterval(() => {
                setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleSearch = async () => {
        if (!niche.trim()) return;
        setLoading(true);
        setIntelligence(null);
        try {
            const data = await getViralPatternIntelligence(niche, platform);
            setIntelligence(data);
            trackEvent('page_view');
        } catch (e) {
            alert("Pattern analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Intelligence copied', type: 'success' } }));
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
                    <Radar className="w-10 h-10 text-brand-500 animate-pulse" />
                    Viral Pattern Intelligence
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Deep-search trending content DNA and reverse-engineer niche success.</p>
            </div>

            {/* Input Module */}
            <div className="bg-dark-card rounded-[2.5rem] border border-gray-800 p-8 shadow-premium relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10">
                    <div className="lg:col-span-4 space-y-4">
                        <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest ml-1">The Target Niche</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                placeholder="e.g. Sustainable Coffee, Vegan Fitness..."
                                className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 font-bold"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Platform Scanner</label>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map(p => (
                                <button 
                                    key={p.name}
                                    onClick={() => setPlatform(p.name)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${platform === p.name ? 'bg-brand-500 text-white border-brand-500 shadow-glow' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                                >
                                    <p.icon className="w-3.5 h-3.5" /> {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <button 
                            onClick={handleSearch}
                            disabled={loading || !niche}
                            className={`w-full py-4 rounded-2xl font-black text-white shadow-glow transition-all flex items-center justify-center gap-3 border-2 border-transparent uppercase tracking-widest text-xs
                                ${loading || !niche ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 active:scale-95 shadow-brand-900/20'}`}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Radar className="w-4 h-4" />}
                            {loading ? 'Decrypting...' : 'Scan Patterns'}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                    <div className="relative w-24 h-24">
                        <Loader2 className="w-24 h-24 text-brand-500 animate-spin absolute inset-0 opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-10 h-10 text-brand-500 animate-bounce" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-white">{LOADING_MESSAGES[loadingStep]}</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2">
                            <span className="flex items-center gap-2">
                                <Info size={14} className="text-brand-500" />
                                Analyzing Global Attention Signals
                            </span>
                        </p>
                    </div>
                </div>
            ) : intelligence ? (
                <div className="space-y-10 animate-fade-in">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#0B1425] border border-brand-500/20 p-8 rounded-[2rem] shadow-premium">
                            <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <Award size={14} /> Niche Verdict
                            </h4>
                            <p className="text-white text-lg font-medium leading-relaxed italic">"{intelligence.niche_verdict}"</p>
                        </div>
                        <div className="bg-[#0B1425] border border-blue-500/20 p-8 rounded-[2rem] shadow-premium">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <Target size={14} /> Bridge Strategy
                            </h4>
                            <p className="text-blue-100 text-lg font-medium leading-relaxed">"{intelligence.recommended_cta}"</p>
                        </div>
                        <div className="bg-[#0B1425] border border-purple-500/20 p-8 rounded-[2rem] shadow-premium">
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <Globe size={14} /> Signal Confidence
                            </h4>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-white">94%</span>
                                <div className="flex-1 h-3 bg-gray-800 rounded-full mb-2 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-brand-500" style={{ width: '94%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pattern Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {intelligence.patterns.map((p, idx) => (
                            <div key={idx} className="bg-dark-card border border-gray-800 rounded-[3rem] p-10 shadow-premium hover:border-brand-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <Flame size={200} />
                                </div>

                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 text-brand-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-brand-500/20">
                                                Pattern 0{idx + 1}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={12} className="text-brand-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter leading-none mb-1">Velocity Score</span>
                                                    <div className="w-24 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                                                        <div 
                                                            className="h-full bg-brand-gradient shadow-glow shadow-brand-500/40 transition-all duration-1000 ease-out" 
                                                            style={{ width: `${p.velocity_score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-brand-400">{p.velocity_score}%</span>
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-black text-white leading-tight uppercase italic">{p.title}</h3>
                                    </div>
                                    <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800">
                                        <Zap className="text-yellow-500 w-6 h-6 fill-current" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Brain size={12} className="text-brand-500" /> Hook Logic
                                            </h4>
                                            <p className="text-sm text-gray-300 font-medium leading-relaxed">{p.hook_logic}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Smartphone size={12} className="text-brand-500" /> Visual Pattern
                                            </h4>
                                            <p className="text-xs text-gray-400 leading-relaxed italic">{p.visual_aesthetics}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-widest">DNA Templates</h4>
                                        <div className="space-y-3">
                                            {p.hook_templates.map((t, i) => (
                                                <div key={i} className="p-3.5 bg-dark-input border border-gray-800 rounded-xl relative group/t hover:border-brand-500/30 transition-all">
                                                    <button 
                                                        onClick={() => handleCopy(t, `t-${idx}-${i}`)}
                                                        className="absolute top-2 right-2 opacity-0 group-hover/t:opacity-100 transition-all p-1.5 bg-gray-900 rounded-lg"
                                                    >
                                                        {copiedId === `t-${idx}-${i}` ? <Check size={12} className="text-brand-500" /> : <Copy size={12} className="text-gray-500 hover:text-white" />}
                                                    </button>
                                                    <p className="text-[11px] text-gray-300 font-bold leading-relaxed pr-6">"{t}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-gray-800 flex flex-wrap gap-2">
                                    {p.psychological_triggers.map((trigger, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                            #{trigger.replace(' ', '_')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grounding Sources */}
                    {intelligence.sources && intelligence.sources.length > 0 && (
                        <div className="bg-[#0B1425] border border-gray-800 p-8 rounded-[2.5rem] shadow-premium">
                             <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                <Globe size={14} /> High-Authority Pattern Sources
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {intelligence.sources.map((s, i) => (
                                    <a 
                                        key={i} 
                                        href={s.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-4 bg-dark-input border border-gray-800 rounded-2xl flex items-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                    >
                                        <div className="p-2 bg-blue-900/20 rounded-lg group-hover:bg-blue-900/40 transition-colors">
                                            <ExternalLink size={14} className="text-blue-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{s.title}</p>
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest truncate mt-0.5">Reference Data</p>
                                        </div>
                                    </a>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-[500px] border-2 border-dashed border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-16 text-gray-600 group hover:border-brand-900/30 transition-colors">
                    <div className="bg-gray-900/50 p-6 rounded-full mb-8 shadow-inner group-hover:bg-brand-900/5 transition-colors">
                        <Radar className="w-16 h-16 opacity-10 group-hover:opacity-30 group-hover:text-brand-500 transition-all" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-500 mb-3 uppercase tracking-widest">Scanner Idle</h3>
                    <p className="text-sm max-w-xs mx-auto leading-relaxed">Enter your niche and platform above to architect a high-converting content sequence based on current viral patterns.</p>
                </div>
            )}
        </div>
    );
};

export default ViralPatternSearch;
