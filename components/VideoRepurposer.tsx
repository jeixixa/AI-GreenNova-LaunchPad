
import React, { useState, useEffect } from 'react';
import { repurposeVideoFromUrl, GroundingSource } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { 
  Loader2, Youtube, Copy, Check, Bookmark, Sparkles, Wand2, Globe, ArrowRight, MessageSquare, FileText, ImageIcon, RefreshCw, ExternalLink, Target, Share2, Smartphone, Monitor, Twitter, Linkedin, LayoutList, Languages, Edit2, Save, X, Brain, ShieldAlert, MonitorPlay, Activity
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type RepurposeTab = 'intelligence' | 'titles' | 'script' | 'comment-ladder' | 'x-thread' | 'linkedin' | 'thumbnail' | 'menu';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Chinese', 'Japanese', 'Arabic'
];

const VideoRepurposer: React.FC = () => {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [offerName, setOfferName] = useState('AI-Powered Business Launch System');
  const [ctaKeyword, setCtaKeyword] = useState('AI LAUNCH SYSTEM');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<{title: string, content: string}[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<RepurposeTab>('intelligence');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const loadGlobalOffer = (showToast = true) => {
    const stored = localStorage.getItem('sbl_global_offer');
    if (stored) {
        try {
            const offer = JSON.parse(stored);
            if (offer.name) setOfferName(offer.name);
            if (offer.ctaKeyword) setCtaKeyword(offer.ctaKeyword);
            if (showToast) {
              window.dispatchEvent(new CustomEvent('sbl-toast', { 
                detail: { message: 'Synced with Global Primary Offer', type: 'info', title: 'OFFER LOADED' } 
              }));
            }
        } catch(e) {}
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sbl_autosave_repurposer_v2');
    let hasLoadedSaved = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.url) setUrl(parsed.url);
        if (parsed.sections) setSections(parsed.sections);
        if (parsed.sources) setSources(parsed.sources);
        if (parsed.language) setLanguage(parsed.language);
        hasLoadedSaved = true;
      } catch (e) {}
    }

    if (!hasLoadedSaved) {
        loadGlobalOffer(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sbl_autosave_repurposer_v2', JSON.stringify({ url, sections, sources, language }));
  }, [url, sections, sources, language]);

  const parseSections = (text: string) => {
    const markers = [
      "## SECTION 0: VIDEO INTELLIGENCE & FORENSICS",
      "## SECTION 1: SEO-OPTIMIZED VIRAL TITLES",
      "## SECTION 2: HIGH-RETENTION SHORT SCRIPT",
      "## SECTION 3: SBL 1+8 COMMENT LADDER",
      "## SECTION 4: X (TWITTER) VIRAL THREAD",
      "## SECTION 5: LINKEDIN AUTHORITY POST",
      "## SECTION 6: THUMBNAIL CREATIVE BRIEF",
      "## SECTION 7: 13-OPTION POST MENU"
    ];

    const results: {title: string, content: string}[] = [];
    
    markers.forEach((marker, idx) => {
        const start = text.indexOf(marker);
        if (start === -1) return;
        
        const contentStart = start + marker.length;
        let contentEnd = text.length;
        
        for (let j = idx + 1; j < markers.length; j++) {
            const nextM = text.indexOf(markers[j]);
            if (nextM !== -1) {
                contentEnd = nextM;
                break;
            }
        }
        
        results.push({
            title: marker.replace(/## SECTION \d+: /i, '').trim(),
            content: text.substring(contentStart, contentEnd).trim()
        });
    });

    if (results.length === 0) return [{ title: 'Overview', content: text }];
    return results;
  };

  const handleProcess = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setSections([]);
    setSources([]);
    try {
      const response = await repurposeVideoFromUrl(url, offerName, ctaKeyword, language);
      const parsed = parseSections(response.text);
      setSections(parsed);
      setSources(response.sources);
      trackEvent('post_generated');
      setActivePreview('intelligence');
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Ensure the URL is valid and API key is set.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
      setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      setOfferName('AI-Powered Business Launch System');
      setCtaKeyword('AI LAUNCH SYSTEM');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Asset copied to clipboard', type: 'success' } }));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToLinkedIn = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\*/g, '').trim());
    window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Post copied! Opening LinkedIn feed...', type: 'info', title: 'DISTRIBUTING ASSET' } 
    }));
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
  };

  const startEditing = (id: string, value: string) => {
      setEditingId(id);
      setEditValue(value);
  };

  const cancelEditing = () => {
      setEditingId(null);
      setEditValue('');
  };

  const saveEdit = (sectionMarker: string, newValue: string, subIndex?: number) => {
      const newSections = sections.map(s => {
          if (s.title.toUpperCase().includes(sectionMarker.toUpperCase())) {
              if (subIndex === undefined) {
                  return { ...s, content: newValue };
              } else if (sectionMarker === 'TITLES') {
                  const titles = parseTitlesToList(s.content);
                  titles[subIndex] = newValue;
                  return { ...s, content: titles.map((t, i) => `${i + 1}. ${t}`).join('\n') };
              }
          }
          return s;
      });
      setSections(newSections);
      setEditingId(null);
      setEditValue('');
      window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Changes saved', type: 'success' } }));
  };

  const getSectionContent = (key: string) => {
      const match = sections.find(s => s.title.toUpperCase().includes(key.toUpperCase()));
      return match?.content || "";
  };

  const parseTitlesToList = (markdown: string) => {
    return markdown
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('**'))
      .map(line => line.replace(/^(\d+\.|-|\*)\s+/, ''))
      .filter(line => line.length > 3);
  };

  const TABS: { id: RepurposeTab; label: string; icon: any }[] = [
    { id: 'intelligence', label: 'Intelligence', icon: Brain },
    { id: 'titles', label: 'Titles', icon: FileText },
    { id: 'script', label: 'Script', icon: Smartphone },
    { id: 'comment-ladder', label: 'Ladder', icon: MessageSquare },
    { id: 'x-thread', label: 'X Thread', icon: Twitter },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { id: 'thumbnail', label: 'Thumbnail', icon: ImageIcon },
    { id: 'menu', label: 'Menu', icon: LayoutList },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Viral Video Repurposer</h1>
          <p className="text-gray-400 mt-2 text-lg">Convert YouTube, TikTok, or Reels into a high-converting SBL Viral Suite.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-dark-card rounded-3xl border border-gray-800 p-8 shadow-premium space-y-6 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-black text-brand-500 uppercase tracking-widest ml-1">Analysis Target</label>
                        <button onClick={loadExample} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">
                            Load Demo Video
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MonitorPlay className="h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                        </div>
                        <input 
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste YouTube/TikTok/Reels URL..."
                            className="block w-full pl-12 pr-4 py-4 bg-dark-input border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 shadow-inner"
                        />
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">Supports: YouTube, TikTok, IG Reels, Shorts</p>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Languages size={10} /> Target Language</label>
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-4 bg-dark-input border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Bridge to Offer</label>
                        <button onClick={() => loadGlobalOffer()} className="text-[10px] font-black text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                            <RefreshCw size={10} /> Sync Global
                        </button>
                    </div>
                    <div className="relative">
                         <Target className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
                         <textarea 
                            value={offerName}
                            onChange={(e) => setOfferName(e.target.value)}
                            placeholder="e.g. High-Ticket Coaching Program"
                            className="block w-full pl-12 pr-4 py-4 bg-dark-input border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 h-24 resize-none"
                         />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1">CTA Keyword</label>
                    <input 
                        value={ctaKeyword}
                        onChange={(e) => setCtaKeyword(e.target.value)}
                        placeholder="e.g. REPURPOSE"
                        className="block w-full px-4 py-4 bg-dark-input border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600"
                    />
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !url.trim()}
                    className={`w-full py-4 rounded-2xl font-black text-white shadow-glow transition-all flex items-center justify-center gap-3 border-2 border-transparent uppercase tracking-widest text-sm
                        ${loading || !url.trim() ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 active:scale-95 shadow-brand-900/20'}`}
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    {loading ? 'Synthesizing...' : 'Analyze & Repurpose'}
                </button>
            </div>

            {/* Strategy Insight Widget */}
            <div className="bg-[#0B1425] border border-brand-900/20 p-8 rounded-3xl space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500">
                        <Brain size={18} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Strategy Logic</h3>
                 </div>
                 <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    The SBL protocol doesn't just "summarize"—it extracts the psychological "DNA" of the video and bridges it to your specific offer using high-status linguistic patterns.
                 </p>
            </div>

            {sources.length > 0 && (
                <div className="bg-dark-card rounded-3xl border border-gray-800 p-8 shadow-premium">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Globe size={12} /> Intelligence Feed
                    </h4>
                    <div className="space-y-3">
                        {sources.map((source, i) => (
                            <a 
                                key={i} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3.5 bg-dark-input hover:bg-dark-input/80 border border-gray-800 rounded-xl text-[11px] text-gray-400 hover:text-white transition-all group"
                            >
                                <div className="p-1.5 bg-blue-900/20 rounded-lg group-hover:bg-blue-900/40 transition-colors">
                                    <Globe size={12} className="text-blue-500" />
                                </div>
                                <span className="truncate flex-1 font-bold">{source.title}</span>
                                <ExternalLink size={10} className="shrink-0 opacity-40 group-hover:opacity-100" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 flex flex-col min-h-[700px]">
            {loading ? (
                <div className="flex-1 bg-dark-card border border-gray-800 rounded-[2rem] flex flex-col items-center justify-center text-center p-12 shadow-premium relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
                    <div className="relative w-20 h-20 mb-8">
                        <Loader2 className="w-20 h-20 text-brand-500 animate-spin absolute inset-0 opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles size={12} className="text-brand-500 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Intelligence Deep-Dive Active</h3>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed relative z-10">Scanning source content forensics and architecting your conversion sequence in {language}.</p>
                </div>
            ) : sections.length > 0 ? (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Navigation Tabs */}
                    <div className="flex bg-dark-card border border-gray-800 p-1.5 rounded-2xl w-full overflow-x-auto custom-scrollbar shrink-0">
                        {TABS.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => { setActivePreview(tab.id); cancelEditing(); }}
                                className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activePreview === tab.id ? 'bg-brand-500 text-white shadow-glow' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Display */}
                    <div className="flex-1 bg-dark-card border border-gray-800 rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-dark-card/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-900/40 rounded-2xl">
                                    {TABS.find(t => t.id === activePreview)?.icon({ size: 20, className: "text-brand-400" })}
                                </div>
                                <h3 className="text-lg font-black text-white uppercase tracking-widest">
                                    {activePreview.replace('-', ' ').toUpperCase()}
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => saveItem({ type: 'Post', content: getSectionContent(activePreview), title: `Repurpose: ${activePreview} (${url.substring(0, 15)}...)` })}
                                    className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700"
                                    title="Save to Library"
                                >
                                    <Bookmark size={18} />
                                </button>
                                {activePreview === 'linkedin' && (
                                    <button 
                                        onClick={() => handleShareToLinkedIn(getSectionContent(activePreview))}
                                        className="p-3 bg-[#0a66c2] rounded-xl text-white hover:bg-[#004182] transition-colors border border-[#0a66c2]/20 shadow-md"
                                        title="Share to LinkedIn"
                                    >
                                        <Linkedin size={18} />
                                    </button>
                                )}
                                {activePreview !== 'titles' && editingId !== 'section-edit' && (
                                    <button 
                                        onClick={() => startEditing('section-edit', getSectionContent(activePreview))}
                                        className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700"
                                        title="Edit Section"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => copyToClipboard(getSectionContent(activePreview), activePreview)}
                                    className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow active:scale-95 flex items-center gap-2"
                                >
                                    {copiedId === activePreview ? <Check size={14} /> : <Copy size={14} />}
                                    {copiedId === activePreview ? 'Copied' : 'Copy All'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                             {editingId === 'section-edit' ? (
                                 <div className="space-y-4">
                                     <textarea 
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full p-8 bg-gray-900/50 border border-brand-500/30 rounded-3xl text-white text-lg leading-relaxed h-[500px] outline-none font-mono resize-none shadow-inner"
                                        autoFocus
                                     />
                                     <div className="flex justify-end gap-3">
                                         <button onClick={cancelEditing} className="px-5 py-2.5 text-gray-400 font-bold hover:text-white uppercase text-xs tracking-widest">Cancel</button>
                                         <button onClick={() => saveEdit(activePreview.replace('-', ' '), editValue)} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-glow">
                                             <Save size={16} /> Save Changes
                                         </button>
                                     </div>
                                 </div>
                             ) : activePreview === 'intelligence' ? (
                                 <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
                                      <div className="bg-brand-500/5 border border-brand-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                         <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
                                                <Activity size={24} />
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Video Forensics</h3>
                                         </div>
                                         <div className="prose prose-invert prose-lg max-w-none prose-strong:text-brand-400 prose-p:leading-relaxed">
                                            <ReactMarkdown>{getSectionContent('INTELLIGENCE')}</ReactMarkdown>
                                         </div>
                                      </div>
                                 </div>
                             ) : activePreview === 'script' ? (
                                 <div className="max-w-md mx-auto bg-black rounded-[3.5rem] border-[12px] border-gray-800 shadow-2xl overflow-hidden aspect-[9/19] flex flex-col relative scale-[0.95]">
                                     <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-10 text-[10px] text-gray-500 font-bold z-10 pt-6">
                                         <span>9:41</span>
                                         <div className="flex gap-2"><div className="w-4 h-4 bg-gray-700/50 rounded-full flex items-center justify-center"><Smartphone size={8} /></div></div>
                                     </div>
                                     <div className="flex-1 p-8 pt-20 flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900">
                                         <div className="flex-1 overflow-y-auto custom-scrollbar-hide prose prose-invert prose-sm prose-p:leading-relaxed">
                                             <ReactMarkdown>{getSectionContent('SCRIPT')}</ReactMarkdown>
                                         </div>
                                         <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-black text-xs shadow-glow-sm">SBL</div>
                                             <div className="flex-1 space-y-1"><div className="h-2 w-24 bg-white/20 rounded-full"></div><div className="h-2 w-16 bg-white/10 rounded-full"></div></div>
                                             <Share2 size={18} className="text-white/40" />
                                         </div>
                                     </div>
                                 </div>
                             ) : activePreview === 'titles' ? (
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {parseTitlesToList(getSectionContent('TITLES')).map((titleText, idx) => {
                                        const isEditing = editingId === `title-edit-${idx}`;
                                        return (
                                            <div key={idx} className="group bg-dark-input/50 border border-gray-800 hover:border-brand-500/50 p-6 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-md">
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1 opacity-50">Viral Title 0{idx + 1}</div>
                                                    {isEditing ? (
                                                        <div className="space-y-3 mt-1">
                                                            <input 
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-full bg-gray-900/50 border border-brand-500/30 rounded-lg p-3 text-white outline-none font-bold"
                                                                autoFocus
                                                            />
                                                            <div className="flex justify-end gap-3">
                                                                <button onClick={cancelEditing} className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Cancel</button>
                                                                <button onClick={() => saveEdit('TITLES', editValue, idx)} className="text-[10px] font-black uppercase text-brand-500 tracking-widest">Save</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-white font-bold text-xl leading-snug">"{titleText}"</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    {!isEditing && (
                                                        <button onClick={() => startEditing(`title-edit-${idx}`, titleText)} className="p-3 bg-gray-800/50 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 opacity-0 group-hover:opacity-100 shadow-sm">
                                                            <Edit2 size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => copyToClipboard(titleText, `t-${idx}`)} className="p-3 bg-gray-800/50 hover:bg-brand-500/20 text-gray-400 hover:text-brand-500 rounded-xl transition-all border border-gray-700 shadow-sm">
                                                        {copiedId === `t-${idx}` ? <Check size={18} /> : <Copy size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             ) : activePreview === 'comment-ladder' ? (
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-8 rounded-r-[2rem] mb-10 shadow-xl">
                                        <h4 className="text-emerald-400 font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                                            <MessageSquare size={16} /> 1+8 High-Status Ladder
                                        </h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">This sequence establishes deep authority and creates a high-tension bridge to your keyword CTA: <strong>{ctaKeyword}</strong>.</p>
                                    </div>
                                    <div className="prose prose-invert prose-lg max-none prose-strong:text-brand-400 prose-p:leading-relaxed">
                                        <ReactMarkdown>{getSectionContent('LADDER')}</ReactMarkdown>
                                    </div>
                                </div>
                             ) : (
                                 <div className="prose prose-invert prose-lg max-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-headings:text-brand-400 prose-strong:text-white leading-relaxed font-medium">
                                     <ReactMarkdown>{getSectionContent(activePreview.replace('-', ' '))}</ReactMarkdown>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 border-2 border-dashed border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-16 text-gray-600 group hover:border-red-900/30 transition-colors">
                    <div className="bg-gray-900/50 p-6 rounded-full mb-8 shadow-inner group-hover:bg-red-900/5 transition-colors">
                        <MonitorPlay className="w-16 h-16 opacity-10 group-hover:opacity-30 group-hover:text-red-500 transition-all" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-500 mb-3 uppercase tracking-widest">Repurpose Engine Idle</h3>
                    <p className="text-sm max-w-xs mx-auto leading-relaxed">Enter a video URL (YouTube, TikTok, or Reels) above to generate a full-suite viral redistribution strategy.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoRepurposer;
