
import React, { useState, useEffect } from 'react';
import { generateWhatsAppSequences } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  Target, 
  User, 
  Link as LinkIcon, 
  QrCode,
  Zap,
  ArrowRight,
  Bookmark,
  Sparkles,
  ShieldAlert,
  Radio,
  Users
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import VoiceInput from './VoiceInput';

const TONES = ['Professional', 'Casual', 'Urgent', 'Elite'];
const MODES = [
    { id: 'Opener', label: 'Pattern Interrupt', icon: Zap, desc: 'Stop the scroll and force a reply.' },
    { id: 'FollowUp', label: 'Nudge Sequence', icon: RefreshCw, desc: 'Re-engage ghosted leads gracefully.' },
    { id: 'ObjectionKiller', label: 'Objection Reframer', icon: ShieldAlert, desc: 'Handle price or time resistance.' },
    { id: 'StatusHook', label: '24h Status Story', icon: Radio, desc: 'Driven hooks for WhatsApp status.' },
    { id: 'GroupProtocol', label: 'Group Contribution', icon: Users, desc: 'Establish authority in group chats.' }
];

const STORAGE_KEY = 'sbl_whatsapp_bridge_cache_v1';

const WhatsAppBridge: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sequence, setSequence] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Form State
  const [leadName, setLeadName] = useState('');
  const [niche, setNiche] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [offer, setOffer] = useState('');
  const [ctaKeyword, setCtaKeyword] = useState('ACTION');
  const [tone, setTone] = useState('Professional');
  const [mode, setMode] = useState<string>('Opener');

  // Load existing session data
  useEffect(() => {
    // 1. Try to load specific WhatsApp tool cache
    const savedToolData = localStorage.getItem(STORAGE_KEY);
    let hasLoadedSpecific = false;
    
    if (savedToolData) {
        try {
            const p = JSON.parse(savedToolData);
            if (p.leadName) setLeadName(p.leadName);
            if (p.niche) setNiche(p.niche);
            if (p.painPoint) setPainPoint(p.painPoint);
            if (p.offer) setOffer(p.offer);
            if (p.ctaKeyword) setCtaKeyword(p.ctaKeyword);
            if (p.tone) setTone(p.tone);
            if (p.mode) setMode(p.mode);
            if (p.sequence) setSequence(p.sequence);
            hasLoadedSpecific = true;
        } catch(e) {}
    }

    // 2. If no specific cache, fallback to global strategic context
    if (!hasLoadedSpecific) {
        const savedLaunchpad = localStorage.getItem('sbl_autosave_launchpad_v11');
        const globalOffer = localStorage.getItem('sbl_global_offer');
        
        if (savedLaunchpad) {
            try {
                const p = JSON.parse(savedLaunchpad);
                if (p.nicheTopic) setNiche(p.nicheTopic);
                if (p.painPoints) setPainPoint(p.painPoints);
            } catch(e) {}
        }
        if (globalOffer) {
            try {
                const o = JSON.parse(globalOffer);
                if (o.name) setOffer(o.name);
                if (o.ctaKeyword) setCtaKeyword(o.ctaKeyword);
            } catch(e) {}
        }
    }
  }, []);

  // Save tool data on every change for "Remember Anything" functionality
  useEffect(() => {
      const timer = setTimeout(() => {
          const state = { leadName, niche, painPoint, offer, ctaKeyword, tone, mode, sequence };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }, 500);
      return () => clearTimeout(timer);
  }, [leadName, niche, painPoint, offer, ctaKeyword, tone, mode, sequence]);

  const handleGenerate = async () => {
    if (!niche || !offer) {
        alert("Niche and Offer are required for synthesis.");
        return;
    }
    setLoading(true);
    setSaved(false);
    try {
      const result = await generateWhatsAppSequences({ 
          leadName, niche, painPoint, offer, ctaKeyword, tone, mode: mode as any 
      });
      setSequence(result);
    } catch (e) {
      alert("Synthesis failed. Check API configuration.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateDirectLink = () => {
      const msg = `Hi! I saw your strategy for ${niche} and I'd like to say ${ctaKeyword}.`;
      return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const openWhatsAppLink = () => {
      window.open(generateDirectLink(), '_blank');
  };

  const resetForm = () => {
      if (confirm("Reset current sequence architect?")) {
          setLeadName('');
          setNiche('');
          setPainPoint('');
          setOffer('');
          setCtaKeyword('ACTION');
          setSequence('');
          localStorage.removeItem(STORAGE_KEY);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-10 h-10 text-[#25D366]" />
            WhatsApp Automation Suite
            </h1>
            <p className="text-gray-400 mt-2 text-lg font-medium">Architect high-status closing scripts and viral status sequences.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={resetForm}
                className="flex items-center gap-2 bg-gray-800 text-gray-400 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-gray-700 transition-all hover:text-white"
            >
                <RefreshCw size={14} /> Reset
            </button>
            <button 
                onClick={() => copyToClipboard(generateDirectLink(), 'link')}
                className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-[#25D366]/30 transition-all hover:bg-[#25D366]/20"
            >
                <LinkIcon size={14} />
                {copiedId === 'link' ? 'Link Copied' : 'Copy Direct-to-WA Link'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Architect Panel */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-dark-card rounded-[2.5rem] border border-gray-800 p-8 shadow-premium space-y-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#25D366]/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest ml-1">Engagement Protocol</label>
                    <div className="grid grid-cols-1 gap-2">
                        {MODES.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group ${mode === m.id ? 'bg-brand-900/30 border-brand-500 text-white shadow-glow-sm' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                            >
                                <div className={`p-2 rounded-lg ${mode === m.id ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-600 group-hover:text-gray-400'}`}>
                                    <m.icon size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{m.label}</p>
                                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest leading-none">{m.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-800">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contextual Intelligence</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input 
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            placeholder="Lead Persona (Optional)"
                            className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold"
                        />
                    </div>
                    <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input 
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder="Niche (e.g. AI Consulting)"
                            className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold"
                        />
                    </div>
                    <div className="relative">
                        <textarea 
                            value={painPoint}
                            onChange={(e) => setPainPoint(e.target.value)}
                            placeholder="Primary Resistance / Pain Point..."
                            className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                        />
                        <div className="absolute right-2 bottom-2">
                            <VoiceInput onTranscript={(t) => setPainPoint(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-800">
                    <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1">Offer & Action</label>
                    <input 
                        value={offer}
                        onChange={(e) => setOffer(e.target.value)}
                        placeholder="Primary Offer Name"
                        className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold"
                    />
                    <input 
                        value={ctaKeyword}
                        onChange={(e) => setCtaKeyword(e.target.value)}
                        placeholder="CTA Keyword"
                        className="w-full bg-dark-input border border-gray-700 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-black uppercase"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1">Linguistic Tone</label>
                    <div className="flex flex-wrap gap-2">
                        {TONES.map(t => (
                            <button 
                                key={t}
                                onClick={() => setTone(t)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tone === t ? 'bg-brand-500 text-white border-brand-500' : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-5 bg-brand-900 hover:bg-brand-800 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-glow transition-all flex items-center justify-center gap-3 border-2 border-brand-700 active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="text-yellow-400" />}
                    {loading ? 'Synthesizing...' : `Architect ${MODES.find(m => m.id === mode)?.label}`}
                </button>
            </div>

            <div className="bg-[#0B1425] border border-brand-900/20 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <QrCode className="text-[#25D366]" size={20} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Growth Analytics</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-xl font-black text-white">4.2x</p>
                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">More Replies</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-xl font-black text-white">92%</p>
                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Close Rate</p>
                    </div>
                </div>
                <button 
                    onClick={openWhatsAppLink}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                    <Send size={14} className="text-[#25D366]" /> Launch To WhatsApp
                </button>
            </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 flex flex-col min-h-[700px]">
            {loading ? (
                <div className="flex-1 bg-dark-card border border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 shadow-premium relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
                    <Loader2 className="w-16 h-16 text-brand-500 animate-spin mb-6 opacity-40" />
                    <h3 className="text-2xl font-bold text-white mb-2 italic uppercase tracking-tighter">Neural Bridge Syncing</h3>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed uppercase tracking-widest text-[10px] font-bold">Reverse-engineering high-status conversion scripts for {mode} mode...</p>
                </div>
            ) : sequence ? (
                <div className="flex-1 bg-dark-card border border-gray-800 rounded-[3rem] shadow-premium overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-dark-card/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500 shadow-glow-sm">
                                {MODES.find(m => m.id === mode)?.icon({ size: 18 })}
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">The Automation DNA</h3>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                    saveItem({ type: 'Post', content: sequence, title: `WhatsApp ${mode}: ${leadName || niche}` });
                                    setSaved(true);
                                }}
                                className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700"
                            >
                                {saved ? <Check size={18} className="text-green-500" /> : <Bookmark size={18} />}
                            </button>
                            <button 
                                onClick={() => copyToClipboard(sequence, 'seq')}
                                className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow active:scale-95 flex items-center gap-2"
                            >
                                {copiedId === 'seq' ? <Check size={14} /> : <Copy size={14} />}
                                {copiedId === 'seq' ? 'Copied' : 'Copy All'}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:text-brand-400 prose-strong:text-white leading-relaxed">
                            <ReactMarkdown>{sequence}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 border-2 border-dashed border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-16 text-gray-600 group hover:border-[#25D366]/30 transition-colors">
                    <div className="bg-gray-900/50 p-8 rounded-full mb-8 shadow-inner group-hover:bg-[#25D366]/5 transition-all">
                        <MessageCircle className="w-16 h-16 opacity-10 group-hover:opacity-40 group-hover:text-[#25D366] transition-all" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-500 mb-3 uppercase tracking-widest">WhatsApp Engine Offline</h3>
                    <p className="text-sm max-w-xs mx-auto leading-relaxed">Input your target intelligence on the left to architect your next high-status DM sequence or status story.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppBridge;
