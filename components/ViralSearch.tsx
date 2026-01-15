
import React, { useState, useEffect } from 'react';
import { findViralContent, ViralSearchResponse } from '../services/geminiService';
import { 
  Search, 
  Loader2, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Copy, 
  Check, 
  Info, 
  Brain, 
  Flame, 
  Palette, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  Smartphone,
  AlertTriangle,
  Globe,
  FileText,
  MonitorPlay,
  Edit2,
  Save,
  X,
  Trophy,
  BarChart3,
  Clock,
  Utensils,
  Home,
  Dumbbell,
  Rocket
} from 'lucide-react';
import { View } from '../types';
import VoiceInput from './VoiceInput';

interface ViralSearchProps {
    onNavigate: (view: View) => void;
}

const LOADING_MESSAGES = [
  "AI is scanning viral content in your niche…",
  "Analyzing hooks and engagement patterns…",
  "Identifying why industry leaders go viral…",
  "Crafting high-leverage content for you…"
];

const FEATURED_TRENDS = [
    { title: 'Healthy Meal Prepping', platform: 'TikTok', icon: Utensils, color: 'text-orange-400' },
    { title: 'Luxury Real Estate Tours', platform: 'Instagram', icon: Home, color: 'text-blue-400' },
    { title: 'SaaS Productivity Hacks', platform: 'LinkedIn', icon: Zap, color: 'text-yellow-400' },
    { title: 'Home Workout Routines', platform: 'YouTube', icon: Dumbbell, color: 'text-red-500' }
];

type SocialPlatform = 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'X (Twitter)' | 'LinkedIn';

const ViralSearch: React.FC<ViralSearchProps> = ({ onNavigate }) => {
  const [niche, setNiche] = useState('');
  const [results, setResults] = useState<ViralSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('Facebook');
  const [activeRepurposeTab, setActiveRepurposeTab] = useState<keyof ViralSearchResponse['repurposed_content'] | 'video-remix'>('facebook');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Rotating loading message logic
  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load Auto-Saved Data on Mount
  useEffect(() => {
    const savedData = localStorage.getItem('sbl_viral_search_v3');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.niche) setNiche(parsed.niche);
        if (parsed.results) setResults(parsed.results);
        if (parsed.selectedPlatform) setSelectedPlatform(parsed.selectedPlatform);
      } catch (e) { console.error("Failed to load viral search data", e); }
    }
  }, []);

  // Auto-Save Data
  useEffect(() => {
    const dataToSave = { niche, results, selectedPlatform };
    localStorage.setItem('sbl_viral_search_v3', JSON.stringify(dataToSave));
  }, [niche, results, selectedPlatform]);

  const handleSearch = async (overrideNiche?: string, overridePlatform?: SocialPlatform) => {
    const searchNiche = overrideNiche || niche;
    const searchPlatform = overridePlatform || selectedPlatform;
    
    if (!searchNiche.trim()) return;
    
    if (overrideNiche) setNiche(overrideNiche);
    if (overridePlatform) setSelectedPlatform(overridePlatform);

    setLoading(true);
    setResults(null);
    try {
      const data = await findViralContent(searchNiche, searchPlatform);
      setResults(data);
      if (data.viral_titles && data.viral_titles.length > 0) {
          setActiveRepurposeTab('video-remix');
      } else {
          setActiveRepurposeTab('facebook');
      }
    } catch (e) {
      alert("Failed to find viral content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const startEditing = (id: string, value: string) => {
    setEditingId(id);
    setEditValue(value);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = (newValue: string) => {
    if (!results) return;
    
    const newResults = { ...results };
    if (activeRepurposeTab === 'video-remix') {
      newResults.video_script = newValue;
    } else {
      newResults.repurposed_content = {
        ...newResults.repurposed_content,
        [activeRepurposeTab]: newValue
      };
    }
    
    setResults(newResults);
    setEditingId(null);
    setEditValue('');
    window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Remix updated', type: 'success' } }));
  };

  const architectCampaign = (topic?: string) => {
      const targetTopic = topic || niche;
      // Pre-fill the LaunchPad auto-save data
      const currentLaunchpad = JSON.parse(localStorage.getItem('sbl_autosave_launchpad_v8') || '{}');
      localStorage.setItem('sbl_autosave_launchpad_v8', JSON.stringify({
          ...currentLaunchpad,
          nicheTopic: targetTopic,
          generatedContent: '' // Force fresh generation
      }));
      
      window.dispatchEvent(new CustomEvent('sbl-toast', { 
          detail: { 
              message: 'Transferred to LaunchPad', 
              title: 'CAMPAIGN ARCHITECT', 
              type: 'info' 
          } 
      }));
      
      onNavigate(View.VIRAL_GENERATOR);
  };

  const isUrl = (str: string) => {
    try { return new URL(str).protocol.startsWith('http'); } catch { return false; }
  };

  const platforms: { name: SocialPlatform; icon: React.ElementType; color: string }[] = [
    { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'TikTok', icon: Smartphone, color: 'text-white' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { name: 'X (Twitter)', icon: Twitter, color: 'text-gray-200' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 animate-fade-in space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-brand-500" />
          Viral Search Engine
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">Discover what’s trending in your specific niche instantly and scale findings to 11-asset campaigns.</p>
      </div>

      <div className="bg-dark-card rounded-3xl p-8 border border-gray-800 shadow-premium space-y-10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block ml-1">Platform Filter</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {platforms.map((p) => (
              <button
                key={p.name}
                onClick={() => setSelectedPlatform(p.name)}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border transition-all font-bold text-xs ${
                  selectedPlatform === p.name
                    ? 'bg-brand-900/30 border-brand-500 text-white shadow-glow-sm scale-[1.02]'
                    : 'bg-dark-input border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <p.icon className={`w-4 h-4 ${selectedPlatform === p.name ? p.color : 'text-gray-600'}`} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    {isUrl(niche) ? <LinkIcon className="text-blue-500" /> : <Search className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />}
                </div>
                <input 
                    type="text" 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Topic (e.g. Cooking) or paste YouTube/TikTok link…"
                    className="w-full bg-dark-input border border-gray-700 rounded-2xl py-5 pl-14 pr-14 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 text-lg shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <VoiceInput onTranscript={setNiche} className="w-11 h-11" />
                </div>
            </div>
            <button 
                onClick={() => handleSearch()}
                disabled={loading || !niche}
                className={`px-10 py-5 rounded-2xl font-black text-white flex items-center justify-center transition-all border-2 border-transparent uppercase tracking-widest text-sm shadow-xl active:scale-95 ${loading || !niche ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-500 hover:bg-brand-400 shadow-brand-900/20'}`}
            >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (isUrl(niche) ? <RefreshCw className="w-6 h-6 mr-2" /> : <Zap className="w-6 h-6 mr-2" />)}
                {isUrl(niche) ? 'Repurpose Link' : 'Search Patterns'}
            </button>
        </div>

        {!results && !loading && (
            <div className="space-y-6">
                <label className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] block ml-1">Explore Niches</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {FEATURED_TRENDS.map((trend, i) => (
                        <button
                            key={i}
                            onClick={() => handleSearch(trend.title, trend.platform as SocialPlatform)}
                            className="bg-dark-input/50 border border-gray-800 p-6 rounded-[2rem] hover:border-brand-500/50 hover:bg-brand-500/5 transition-all text-left group relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <trend.icon size={80} />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <trend.icon size={16} className={trend.color} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{trend.platform}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm leading-tight group-hover:text-brand-400 transition-colors">"{trend.title}"</h4>
                            <div className="mt-4 flex items-center text-[10px] font-black text-brand-500 uppercase tracking-widest gap-2">
                                Explorer Patterns <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {loading && (
          <div className="py-20 text-center space-y-8 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
               <Loader2 className="w-24 h-24 text-brand-500 animate-spin absolute inset-0 opacity-20" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-brand-500 animate-bounce" />
               </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-black text-white animate-pulse">{LOADING_MESSAGES[loadingStep]}</h3>
              <p className="text-gray-500 text-sm font-bold flex items-center justify-center gap-2 tracking-wide uppercase">
                <Info size={16} className="text-brand-500" />
                Searching grounding sources...
              </p>
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#0B1425] rounded-3xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Flame size={14} className="fill-current" /> Viral Hook DNA
                  </h3>
                  <div className="space-y-4">
                    {results.viral_hooks.map((hook, i) => (
                      <div key={i} className="p-5 bg-dark-input border border-gray-800/50 rounded-2xl relative group/hook hover:border-orange-500/30 transition-all">
                        <button 
                          onClick={() => handleCopy(hook, `hook-${i}`)}
                          className="absolute top-3 right-3 opacity-0 group-hover/hook:opacity-100 transition-all p-2 bg-gray-900 rounded-xl hover:text-white"
                        >
                          {copiedKey === `hook-${i}` ? <Check size={14} className="text-brand-500" /> : <Copy size={14} className="text-gray-400" />}
                        </button>
                        <p className="text-[15px] text-gray-200 font-bold pr-8 leading-relaxed italic">"{hook}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0B1425] rounded-3xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
                  <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Brain size={14} className="fill-current" /> Pattern Logic
                  </h3>
                  <ul className="space-y-4">
                    {results.why_it_works.map((reason, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-gray-400 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0 shadow-glow shadow-brand-500/50" />
                        <span className="font-medium">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                    onClick={() => architectCampaign()}
                    className="w-full py-6 bg-brand-900/50 hover:bg-brand-500 text-white rounded-[2rem] border-2 border-brand-500/30 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-glow flex flex-col items-center justify-center gap-3"
                >
                    <Rocket className="w-6 h-6" />
                    <span>Architect Full Campaign</span>
                </button>

                {results.sources && results.sources.length > 0 && (
                  <div className="bg-[#0B1425] rounded-3xl border border-gray-800 p-8 shadow-2xl">
                     <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <LinkIcon size={14} /> Pattern Sources
                     </h3>
                     <div className="space-y-3">
                        {results.sources.map((source, i) => (
                            <a 
                                key={i} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3.5 bg-dark-input hover:bg-dark-input/80 border border-gray-800 rounded-xl text-xs text-gray-400 hover:text-white transition-all truncate"
                            >
                                <Globe size={14} className="shrink-0 text-blue-500" />
                                <span className="truncate flex-1 font-bold">{source.title}</span>
                                <ExternalLink size={12} className="shrink-0 opacity-40" />
                            </a>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 space-y-10">
                <div className="bg-[#0B1425] rounded-4xl border border-gray-800 shadow-premium overflow-hidden flex flex-col min-h-[600px]">
                  <div className="p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-dark-card/30">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500 shadow-glow-sm">
                            <RefreshCw size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-[0.1em]">Remix Studio</h3>
                    </div>
                    <div className="flex bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800/50 overflow-x-auto max-w-full">
                      {(results.viral_titles && results.viral_titles.length > 0) && (
                        <button
                            onClick={() => { setActiveRepurposeTab('video-remix'); cancelEditing(); }}
                            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap ${activeRepurposeTab === 'video-remix' ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            <MonitorPlay size={16} /> Video Remix
                        </button>
                      )}
                      {Object.keys(results.repurposed_content).map((plat) => (
                        <button
                          key={plat}
                          onClick={() => { setActiveRepurposeTab(plat as any); cancelEditing(); }}
                          className={`p-3 px-4 rounded-xl transition-all relative group/tab flex items-center gap-2 text-xs font-bold ${activeRepurposeTab === plat ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                          {plat === 'facebook' && <><Facebook size={16} /> Facebook</>}
                          {plat === 'instagram' && <><Instagram size={16} /> Instagram</>}
                          {plat === 'tiktok' && <><Smartphone size={16} /> TikTok</>}
                          {plat === 'x' && <><Twitter size={16} /> X (Twitter)</>}
                          {plat === 'linkedin' && <><Linkedin size={16} /> LinkedIn</>}
                          {activeRepurposeTab === plat && (
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-10 flex-1 flex flex-col">
                    {activeRepurposeTab === 'video-remix' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] ml-1">High-Retention Titles</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.viral_titles.map((title, i) => (
                                        <div key={i} className="p-4 bg-dark-input border border-gray-800 rounded-2xl flex justify-between items-center group/title hover:border-brand-500/40 transition-all">
                                            <span className="text-sm font-bold text-white pr-2">"{title}"</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => architectCampaign(title)} className="p-2 bg-brand-900/50 rounded-lg opacity-0 group-hover/title:opacity-100 transition-opacity hover:bg-brand-500 text-brand-400 hover:text-white" title="Launch as Campaign">
                                                    <Rocket size={14} />
                                                </button>
                                                <button onClick={() => handleCopy(title, `v-title-${i}`)} className="p-2 bg-gray-900 rounded-lg opacity-0 group-hover/title:opacity-100 transition-opacity hover:text-brand-500">
                                                    {copiedKey === `v-title-${i}` ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] ml-1">60s Short Script</h4>
                                    <div className="flex gap-4">
                                        {editingId !== 'script-edit' && (
                                            <button onClick={() => startEditing('script-edit', results.video_script)} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1">
                                                <Edit2 size={10} /> Edit Script
                                            </button>
                                        )}
                                        <button onClick={() => handleCopy(results.video_script, 'v-script')} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1">
                                            {copiedKey === 'v-script' ? <Check size={10} /> : <Copy size={10} />} Copy Full Script
                                        </button>
                                    </div>
                                </div>
                                {editingId === 'script-edit' ? (
                                    <div className="space-y-4">
                                        <textarea 
                                            value={editValue} 
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full h-[300px] bg-dark-input border border-brand-500/30 rounded-3xl p-6 text-white text-sm outline-none font-mono"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button onClick={cancelEditing} className="px-4 py-2 text-gray-400 font-bold hover:text-white">Cancel</button>
                                            <button onClick={() => saveEdit(editValue)} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold flex items-center gap-2">
                                                <Save size={16} /> Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-dark-input border border-gray-800 rounded-3xl text-sm text-gray-300 font-mono leading-relaxed h-[300px] overflow-y-auto custom-scrollbar whitespace-pre-wrap italic shadow-inner">
                                        {results.video_script}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-[#0A192F] rounded-3xl border border-gray-800 p-8 relative group/content shadow-inner">
                          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                            {editingId !== 'remix-edit' && (
                                <button 
                                    onClick={() => startEditing('remix-edit', results.repurposed_content[activeRepurposeTab as keyof ViralSearchResponse['repurposed_content']])}
                                    className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-black uppercase tracking-widest transition-all border border-gray-700"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                            )}
                            <button 
                                onClick={() => handleCopy(results.repurposed_content[activeRepurposeTab as keyof ViralSearchResponse['repurposed_content']], 'remix')}
                                className="bg-brand-500 hover:bg-brand-400 text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-black uppercase tracking-widest transition-all shadow-glow active:scale-95"
                            >
                                {copiedKey === 'remix' ? <Check size={14} /> : <Copy size={14} />}
                                {copiedKey === 'remix' ? 'Copied' : 'Copy Remix'}
                            </button>
                          </div>
                          <div className="prose prose-invert prose-lg max-w-none h-full pt-10">
                            {editingId === 'remix-edit' ? (
                                <div className="space-y-4 h-full flex flex-col">
                                    <textarea 
                                        value={editValue} 
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full flex-1 bg-transparent border-none text-gray-200 resize-none outline-none font-sans text-lg leading-relaxed h-[300px]"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-800">
                                        <button onClick={cancelEditing} className="px-4 py-2 text-gray-400 font-bold hover:text-white">Cancel</button>
                                        <button onClick={() => saveEdit(editValue)} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold flex items-center gap-2">
                                            <Save size={16} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    readOnly
                                    value={results.repurposed_content[activeRepurposeTab as keyof ViralSearchResponse['repurposed_content']]}
                                    className="w-full h-[320px] bg-transparent text-gray-200 resize-none outline-none font-sans text-lg leading-relaxed placeholder:text-gray-800"
                                    placeholder="Generated remix will appear here..."
                                />
                            )}
                          </div>
                        </div>
                    )}
                    
                    <div className="mt-8 space-y-4">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Pattern CTAs</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {results.cta_variations.map((cta, i) => (
                          <button
                            key={i}
                            onClick={() => handleCopy(cta, `cta-${i}`)}
                            className="text-left p-4 bg-dark-input border border-gray-800 rounded-2xl text-xs text-gray-400 hover:text-white hover:border-brand-500/50 transition-all flex items-center justify-between group/cta"
                          >
                            <span className="truncate pr-4 font-bold">"{cta}"</span>
                            {copiedKey === `cta-${i}` ? <Check size={12} className="text-brand-500 shrink-0" /> : <Copy size={12} className="text-gray-600 group-hover/cta:text-gray-300 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#0B1425] to-[#0A192F] rounded-4xl border border-brand-500/10 p-10 shadow-premium group relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Palette size={180} className="text-brand-500" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-[0.1em]">Visual Asset Prompt</h3>
                            <p className="text-xs text-gray-500 mt-1">High-status prompt for your niche</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => handleCopy(results.image_prompt, 'img-prompt')}
                      className="text-xs font-black uppercase tracking-widest text-brand-400 hover:text-brand-300 flex items-center gap-2 bg-brand-500/10 px-5 py-2.5 rounded-xl border border-brand-500/20 transition-all hover:bg-brand-500/20 active:scale-95 shadow-glow-sm"
                    >
                      {copiedKey === 'img-prompt' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === 'img-prompt' ? 'Prompt Copied' : 'Copy AI Prompt'}
                    </button>
                  </div>

                  <div className="bg-black/40 p-6 rounded-2xl border border-white/5 font-mono text-sm text-brand-200/80 leading-relaxed italic relative z-10 group-hover:text-white transition-colors">
                    "{results.image_prompt}"
                  </div>

                  <div className="mt-8 flex justify-end relative z-10">
                    <button 
                      onClick={() => {
                        localStorage.setItem('sbl_autosave_image_studio', JSON.stringify({ generatePrompt: results.image_prompt, mode: 'generate' }));
                        onNavigate(View.IMAGE_GENERATOR);
                      }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 flex items-center gap-2 group-hover:translate-x-2 transition-transform py-2"
                    >
                      Design Visual Now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViralSearch;
