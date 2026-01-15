
import React, { useState, useEffect, useRef } from 'react';
import { generateViralBlog, ViralPostParams } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { 
  Loader2, FileText, Copy, Check, Bookmark, 
  Edit2, Save, X, RefreshCw, Sparkles, 
  Zap, ArrowRight, Info, Languages, 
  Target, Target as TargetIcon, User, 
  AtSign, ExternalLink, Globe, Layout, 
  History, RotateCcw, Linkedin
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import VoiceInput from './VoiceInput';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Chinese', 'Japanese', 'Arabic'
];

const TONES = [
  { id: 'High-Status Architect', label: 'Architect', desc: 'Authoritative & Strategic' },
  { id: 'The Visionary Sage', label: 'Sage', desc: 'Educational & Deep' },
  { id: 'Raw Industry Hacker', label: 'Hustler', desc: 'Fast-paced & Direct' },
];

const STORAGE_KEY = 'sbl_autosave_blog_v1';

const BlogArchitect: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [blogContent, setBlogContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saved, setSaved] = useState(false);

  // Form States
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [industry, setIndustry] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [ctaKeyword, setCtaKeyword] = useState('INFO');
  const [language, setLanguage] = useState('English');
  const [brandTone, setBrandTone] = useState('High-Status Architect');
  const [useDeepResearch, setUseDeepResearch] = useState(false);

  // Persisted Offer context
  const [offerName, setOfferName] = useState('');
  const [offerUrl, setOfferUrl] = useState('');

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing session or auto-trigger from Niche Explorer
    const savedData = localStorage.getItem(STORAGE_KEY);
    const globalOffer = localStorage.getItem('sbl_global_offer');
    
    if (globalOffer) {
        try {
            const o = JSON.parse(globalOffer);
            setOfferName(o.name || '');
            setOfferUrl(o.link || '');
            if (o.ctaKeyword) setCtaKeyword(o.ctaKeyword);
        } catch(e) {}
    }

    if (savedData) {
        try {
            const p = JSON.parse(savedData);
            if (p.niche) setNiche(p.niche);
            if (p.audience) setAudience(p.audience);
            if (p.industry) setIndustry(p.industry);
            if (p.painPoints) setPainPoints(p.painPoints);
            if (p.ctaKeyword) setCtaKeyword(p.ctaKeyword);
            if (p.language) setLanguage(p.language);
            if (p.brandTone) setBrandTone(p.brandTone);
            if (p.blogContent) setBlogContent(p.blogContent);
        } catch(e) {}
    }

    // Auto-Trigger from Explorer
    const blogTrigger = localStorage.getItem('sbl_blog_generate_trigger');
    if (blogTrigger === 'true') {
        localStorage.removeItem('sbl_blog_generate_trigger');
        const explorerData = JSON.parse(localStorage.getItem('sbl_autosave_launchpad_v11') || '{}');
        if (explorerData.nicheTopic) setNiche(explorerData.nicheTopic);
        if (explorerData.targetAudience) setAudience(explorerData.targetAudience);
        
        // Short delay to ensure state is set before firing
        setTimeout(() => {
            handleGenerate();
        }, 300);
    }
  }, []);

  useEffect(() => {
      const state = { niche, audience, industry, painPoints, ctaKeyword, language, brandTone, blogContent };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [niche, audience, industry, painPoints, ctaKeyword, language, brandTone, blogContent]);

  const handleGenerate = async () => {
    if (!niche || !audience) {
        window.dispatchEvent(new CustomEvent('sbl-toast', { 
            detail: { message: 'Niche and Audience are mandatory.', type: 'error' } 
        }));
        return;
    }

    setLoading(true);
    setSaved(false);
    try {
      const result = await generateViralBlog({
          style: 'Blog',
          platform: 'Blog',
          offerName,
          offerLink: offerUrl || "https://greennovaailaunchpad.com",
          offerDescription: "",
          ctaKeyword,
          targetAudience: audience,
          topics: [niche],
          industry,
          painPoints,
          hookType: "Authority Anchor",
          language,
          brandTone,
          useDeepResearch
      });
      setBlogContent(result);
      trackEvent('post_generated');
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Synthesis failed. Check API Key.', type: 'error' } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blogContent);
    setCopied(true);
    window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Blog copied to clipboard', type: 'success' } }));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToLinkedIn = () => {
    navigator.clipboard.writeText(blogContent);
    window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Blog copied! Opening LinkedIn feed...', type: 'info', title: 'DISTRIBUTING ASSET' } 
    }));
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
  };

  const handleSave = () => {
    const success = saveItem({
        type: 'Post',
        content: blogContent,
        title: `Blog: ${niche.substring(0, 20)}...`
    });
    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  const startEdit = () => {
      setEditValue(blogContent);
      setEditing(true);
  };

  const saveEdit = () => {
      setBlogContent(editValue);
      setEditing(false);
  };

  const cancelEditing = () => {
      setEditing(false);
  };

  const charCount = blogContent.length;
  const isOptimalLength = charCount >= 1500 && charCount <= 3000;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Config Column */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-dark-card rounded-[2.5rem] border border-gray-800 p-8 shadow-premium sticky top-6">
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-brand-500" size={24} /> Blog Architect
                    </h2>
                    <button 
                        onClick={() => {
                            if(confirm("Clear current workspace?")) {
                                setBlogContent('');
                                setNiche('');
                                setAudience('');
                                setPainPoints('');
                                setIndustry('');
                            }
                        }}
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                    >
                        <RotateCcw size={12} className="inline mr-1" /> Reset
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest ml-1">Architectural Tone</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TONES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setBrandTone(t.id)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 text-center ${brandTone === t.id ? 'bg-brand-900/20 border-brand-500 text-white' : 'bg-dark-input border-gray-700 text-gray-500 hover:border-gray-600'}`}
                                >
                                    <span className="text-[10px] font-black uppercase whitespace-nowrap">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">The Core Subject</label>
                        <div className="relative">
                            <input 
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                placeholder="e.g. AI-Driven Email Marketing"
                                className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 px-5 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none font-bold placeholder:text-gray-600"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <VoiceInput onTranscript={setNiche} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Audience</label>
                        <div className="relative">
                            <TargetIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input 
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                placeholder="e.g. Solo-founders scaling to $10k"
                                className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Industry Context</label>
                        <input 
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="e.g. Digital Marketing / SaaS"
                            className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 px-5 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none font-bold"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CTA Action Keyword</label>
                        <input 
                            value={ctaKeyword}
                            onChange={(e) => setCtaKeyword(e.target.value)}
                            className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 px-5 text-sm text-white font-black focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-2 py-3 bg-brand-500/5 rounded-xl border border-brand-500/20">
                        <input 
                            type="checkbox" 
                            id="deep-res" 
                            checked={useDeepResearch} 
                            onChange={(e) => setUseDeepResearch(e.target.checked)} 
                            className="w-4 h-4 rounded border-gray-700 text-brand-500 focus:ring-brand-500 bg-dark-input"
                        />
                        <label htmlFor="deep-res" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none">Perform Deep Niche Research</label>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-2 border-transparent shadow-glow
                            ${loading ? 'bg-gray-800 text-gray-500' : 'bg-brand-900 hover:bg-brand-800 text-white active:scale-95'}`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-yellow-400" size={18} />}
                        {loading ? 'Synthesizing Narrative...' : 'Architect Blog Post'}
                    </button>
                </div>
            </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 bg-dark-card rounded-[2.5rem] border border-gray-800 shadow-premium flex flex-col min-h-[900px] overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-dark-card/30 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-900/40 rounded-2xl">
                        <FileText size={20} className="text-brand-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest leading-none">Viral Blog Artifact</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isOptimalLength ? 'bg-green-900/40 text-green-400 border border-green-500/20' : 'bg-orange-900/40 text-orange-400 border border-orange-500/20'}`}>
                                {charCount} Characters
                            </span>
                            {isOptimalLength && <Check size={12} className="text-green-500" />}
                        </div>
                    </div>
                </div>

                {blogContent && !loading && (
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSave}
                            className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 shadow-sm flex items-center gap-2 text-[10px] font-black uppercase"
                        >
                            {saved ? <Check size={14} className="text-green-400" /> : <Bookmark size={14} />} 
                            {saved ? 'Saved' : 'Library'}
                        </button>
                        {!editing && (
                            <button 
                                onClick={startEdit}
                                className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 shadow-sm flex items-center gap-2 text-[10px] font-black uppercase"
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                        )}
                        <button 
                            onClick={handleShareToLinkedIn}
                            className="p-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl transition-all shadow-glow flex items-center gap-2 text-[10px] font-black uppercase"
                        >
                            <Linkedin size={14} /> Share
                        </button>
                        <button 
                            onClick={handleCopy}
                            className="p-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl transition-all shadow-glow flex items-center gap-2 text-[10px] font-black uppercase"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />} 
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Loader2 size={64} className="animate-spin text-brand-500 mb-8 opacity-40" />
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Architecting Your Authority</h3>
                        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed uppercase tracking-widest text-[10px] font-bold">Reverse-engineering high-retention narrative structures for {niche}...</p>
                    </div>
                ) : blogContent ? (
                    <div className="max-w-3xl mx-auto">
                        {editing ? (
                            <div className="space-y-6">
                                <textarea 
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full min-h-[700px] bg-black/40 border border-brand-500/30 rounded-3xl p-10 text-white text-lg leading-relaxed outline-none font-mono"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-3">
                                    <button onClick={cancelEditing} className="px-6 py-3 text-gray-500 font-bold hover:text-white uppercase tracking-widest text-xs">Cancel</button>
                                    <button onClick={saveEdit} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-glow">
                                        <Save size={16} /> Update Blog
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-lg max-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-headings:text-brand-400 prose-strong:text-white prose-p:leading-relaxed prose-p:text-gray-300">
                                <ReactMarkdown>{blogContent}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full border-2 border-dashed border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-16 text-gray-700 group hover:border-brand-900/30 transition-colors">
                        <div className="bg-gray-900/50 p-6 rounded-full mb-8 shadow-inner group-hover:bg-brand-900/5 transition-colors">
                            <Layout className="w-16 h-16 opacity-10 group-hover:opacity-30 group-hover:text-brand-500 transition-all" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-500 mb-3 uppercase tracking-widest">Architectural Canvas Empty</h3>
                        <p className="text-sm max-w-xs mx-auto leading-relaxed">Fill the configuration on the left to generate a 1500–3000 character professional viral blog post bridged to your offer.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArchitect;
