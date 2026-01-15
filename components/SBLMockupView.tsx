import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Palette, 
  Bell, 
  MessageCircle, 
  ThumbsUp, 
  Share2, 
  Search,
  Smartphone,
  Sparkles,
  BarChart3,
  Loader2,
  Rocket,
  Settings,
  TrendingUp,
  Edit2,
  Save,
  X,
  Cpu,
  Terminal as TerminalIcon,
  BookOpen,
  Layers as LayersIcon,
  Zap,
  Crown,
  DraftingCompass,
  Award,
  Hash,
  Move
} from 'lucide-react';

interface SBLMockupViewProps {
  slides: string[];
  displayName: string;
  brandHandle: string;
  profileImage?: string;
  ctaKeyword: string;
  onSlidesChange?: (newSlides: string[]) => void;
}

type MockupStyle = 
    | 'Viral Dark' 
    | 'Glassmorphism' 
    | 'Neural Banner'
    | 'Hyper-Brutalist'
    | 'Technical Blueprint'
    | 'Swiss Modern'
    | 'Paper'
    | 'Minimalist' 
    | 'Editorial' 
    | 'Holographic';

const THEMES = [
    { name: 'Aura', bg: 'from-teal-400/40 via-purple-500/40 to-orange-400/40', accent: 'bg-brand-500' },
    { name: 'SBL Navy', bg: 'from-[#0A192F] via-[#112240] to-[#020C1B]', accent: 'bg-brand-500' },
    { name: 'Solar', bg: 'from-orange-500 to-red-600', accent: 'bg-orange-500' },
    { name: 'Ocean', bg: 'from-cyan-500 to-blue-600', accent: 'bg-cyan-500' },
    { name: 'Forest', bg: 'from-emerald-600 to-green-800', accent: 'bg-emerald-500' },
];

const SBLMockupView: React.FC<SBLMockupViewProps> = ({ 
  slides: initialSlides, 
  displayName, 
  brandHandle, 
  profileImage,
  ctaKeyword,
  onSlidesChange
}) => {
  const [slides, setSlides] = useState(initialSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeStyle, setActiveStyle] = useState<MockupStyle>('Viral Dark');
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isExporting, setIsExporting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setSlides(initialSlides);
  }, [initialSlides]);

  const handleExport = async () => {
    if (mockupRef.current === null) return;
    setIsExporting(true);
    try {
        const dataUrl = await toPng(mockupRef.current, { 
          cacheBust: true, 
          pixelRatio: 2,
          filter: (node) => {
            // Filter out external sheets that might throw security errors if access is restricted
            if (node instanceof HTMLLinkElement && node.href.includes('fonts.googleapis.com')) return false;
            return true;
          }
        });
        const link = document.createElement('a');
        link.download = `sbl-viral-mockup-slide-${activeSlide + 1}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Export failed', err);
        window.dispatchEvent(new CustomEvent('sbl-toast', { 
            detail: { message: 'Image export failed. Check browser security settings.', type: 'error' } 
        }));
    } finally {
        setIsExporting(false);
    }
  };

  const nextSlide = () => { setActiveSlide((prev) => (prev + 1) % slides.length); cancelEditing(); };
  const prevSlide = () => { setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length); cancelEditing(); };

  const startEditing = () => {
      setIsEditing(true);
      setEditValue(slides[activeSlide]?.replace(/SLIDE \d:?/i, '').trim() || '');
  };

  const cancelEditing = () => {
      setIsEditing(false);
      setEditValue('');
  };

  const saveEdit = () => {
      const newSlides = [...slides];
      newSlides[activeSlide] = editValue;
      setSlides(newSlides);
      if (onSlidesChange) onSlidesChange(newSlides);
      setIsEditing(false);
      setEditValue('');
  };

  const renderMockup = () => {
    const content = slides[activeSlide] || "Architecting your next viral win...";
    const cleanContent = content.replace(/SLIDE \d:?/i, '').trim();

    if (activeStyle === 'Viral Dark') {
        return (
            <div className="w-full h-full bg-black p-10 flex flex-col justify-between text-white relative font-sans">
                <div className="space-y-6">
                    {/* Header: Name and Handle */}
                    <div className="flex flex-col">
                        <p className="text-lg font-bold leading-none">{displayName}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">{brandHandle}</p>
                    </div>

                    {/* Headline and Profile Pic on Right */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-4">
                            {isEditing ? (
                                <textarea 
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-lg font-black text-white outline-none resize-none h-24"
                                    autoFocus
                                />
                            ) : (
                                <h2 className="text-[22px] font-black leading-tight tracking-tight text-white uppercase italic">
                                    {activeSlide === 0 ? cleanContent : `PHASE 0${activeSlide}: ${cleanContent.split('\n')[0]}`}
                                </h2>
                            )}
                            <p className="text-[#3b82f6] font-bold text-sm tracking-wide">#AIBusiness</p>
                        </div>
                        
                        <div className="w-40 h-40 rounded-full border-4 border-gray-800 overflow-hidden shrink-0 shadow-2xl">
                           {profileImage ? (
                               <img src={profileImage} className="w-full h-full object-cover" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-800 font-black text-4xl text-gray-600">{displayName[0]}</div>
                           )}
                        </div>
                    </div>

                    {/* Body Text */}
                    <div className="space-y-6 text-[15px] leading-relaxed text-gray-300 font-medium max-w-[85%]">
                        <p>{cleanContent.includes('\n') ? cleanContent.split('\n').slice(1).join('\n') : "The real power is in building systems that scale alone. A wake call for every entrepreneur. When tech changes, your system remains stable."}</p>
                    </div>
                </div>

                {/* Footer Center Handle */}
                <div className="pb-4 text-center">
                    <p className="text-xl font-bold tracking-tight text-white opacity-80">{brandHandle}</p>
                </div>
            </div>
        );
    }

    if (activeStyle === 'Glassmorphism') {
        return (
            <div className={`w-full h-full bg-gradient-to-br ${activeTheme.bg} p-8 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-[40px]`}>
                {/* Visual Blurs */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-400/20 rounded-full blur-[100px]"></div>

                <div className="w-full max-w-sm space-y-5 relative z-10">
                    {/* 1. TOP NOTIFICATION CARD */}
                    <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-[1.8rem] p-4 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                         <div className="w-12 h-12 rounded-full overflow-hidden border border-white/40">
                            {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">{displayName[0]}</div>}
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className="text-xs font-black text-gray-900 leading-tight">New Message from {brandHandle}</p>
                             <div className="h-1 w-24 bg-black/10 rounded-full mt-1.5"></div>
                         </div>
                         <Bell className="text-gray-900/40 w-5 h-5" />
                    </div>

                    {/* 2. MIDDLE MAIN CARD */}
                    <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-[2.2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)] space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-brand-500 rounded-lg shadow-glow-sm">
                                    <Rocket className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">GreenNova AI LaunchPad</p>
                                    <p className="text-[8px] font-bold text-gray-900/40 uppercase tracking-widest leading-none">@greenovasystems</p>
                                </div>
                            </div>
                        </div>
                        <div className="min-h-[60px]">
                            <p className="text-gray-900 text-sm font-black leading-snug">
                                {cleanContent.split('\n')[0].substring(0, 100)}...
                            </p>
                            <p className="text-blue-600 text-[10px] font-black mt-2">#AIBusiness</p>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <Search className="text-gray-900/20 w-4 h-4" />
                        </div>
                    </div>

                    {/* 3. BOTTOM DETAIL CARD */}
                    <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-[1.8rem] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                         <div className="flex justify-between items-start mb-2">
                            <div className="w-1 h-1 rounded-full bg-black/40"></div>
                            <Settings className="text-gray-900/20 w-3.5 h-3.5" />
                         </div>
                         <p className="text-[11px] font-bold text-gray-900/70 leading-relaxed line-clamp-3">
                             {cleanContent.includes('\n') ? cleanContent.split('\n').slice(1).join(' ') : "Meta's move is a wake-up call. When platforms tighten control, your own system is your safety net. Build AI tools you own."}
                         </p>
                         <div className="mt-3 pt-3 border-t border-black/5 flex justify-end">
                            <TrendingUp className="text-brand-600/40 w-4 h-4" />
                         </div>
                    </div>
                </div>

                {/* Floating Large Profile Bottom Right */}
                <div className="absolute bottom-10 right-10">
                     <div className="w-24 h-24 rounded-full border-4 border-white/40 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-xl">
                        {profileImage ? (
                            <img src={profileImage} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-gray-800 text-3xl">{displayName[0]}</div>
                        )}
                     </div>
                </div>
            </div>
        );
    }

    if (activeStyle === 'Neural Banner') {
        return (
            <div className="w-full h-full bg-[#020C1B] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden font-sans">
                {/* Neural Mesh Background Mock */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1e1b4b] via-[#020C1B] to-[#4c1d95] opacity-60"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,255,0.05)_0%,_transparent_70%)]"></div>

                <div className="relative z-10 space-y-6">
                    <div className="flex justify-center mb-4">
                         <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                             <Zap className="text-[#00ffff] w-5 h-5 animate-pulse" />
                             <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">GreenNova AI LaunchPad</span>
                         </div>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-black text-[#00ffff] drop-shadow-[0_0_20px_rgba(0,255,255,0.8)] tracking-tighter uppercase italic leading-[0.9]">
                        {cleanContent.split('\n')[0].substring(0, 50)}
                    </h2>
                    
                    <p className="text-2xl font-bold text-white max-w-xl mx-auto leading-tight drop-shadow-lg">
                        {cleanContent.includes('\n') ? cleanContent.split('\n')[1] : "you can monetize your business!"}
                    </p>
                </div>

                {/* Bottom Left Handle */}
                <div className="absolute bottom-12 left-12">
                    <p className="text-xl font-bold text-white/60 tracking-tight italic">{brandHandle.toLowerCase().replace('@','')}</p>
                </div>

                {/* Logo top right */}
                <div className="absolute top-12 right-12 flex items-center gap-3">
                     <div className="text-right">
                         <p className="text-sm font-black text-white leading-none">GRENOVA AI</p>
                         <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">LaunchPad</p>
                     </div>
                     <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#00ffff] to-[#3b82f6] flex items-center justify-center p-2 shadow-glow">
                        <Rocket className="text-white w-full h-full" />
                     </div>
                </div>
            </div>
        );
    }

    if (activeStyle === 'Hyper-Brutalist') {
        return (
            <div className="w-full h-full bg-yellow-400 p-10 flex flex-col justify-between text-black border-[16px] border-black relative overflow-hidden font-anton">
                <div className="absolute -rotate-45 -left-20 top-10 bg-black text-yellow-400 px-20 py-2 font-black text-xl uppercase tracking-tighter">
                    URGENT
                </div>
                <div className="flex justify-between items-start pt-10">
                    <div className="bg-black text-white px-4 py-2 text-2xl font-black italic tracking-tighter uppercase">SBL_SYSTEM</div>
                    <Move className="text-black w-10 h-10" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-6xl font-black leading-[0.8] uppercase tracking-tighter italic">NO BRAINER</h2>
                    <p className="text-3xl font-black leading-none uppercase tracking-tight max-w-xs">{cleanContent}</p>
                </div>
                <div className="flex justify-between items-center border-t-8 border-black pt-6">
                    <p className="text-2xl font-black uppercase tracking-tighter">{brandHandle}</p>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 bg-black rounded-full"></div>
                        <div className="w-8 h-8 border-4 border-black rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeStyle === 'Technical Blueprint') {
        return (
            <div className="w-full h-full bg-[#0047AB] p-10 flex flex-col font-mono text-white relative overflow-hidden border-[8px] border-white/20">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="flex justify-between items-start relative z-10 border-b-2 border-white/30 pb-4 mb-8">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest">SBL Architecture</p>
                        <p className="text-[10px] opacity-60">BUILD_LOG: v2.4.0</p>
                    </div>
                    <DraftingCompass size={32} className="opacity-40" />
                </div>
                <div className="flex-1 space-y-8 relative z-10">
                    <div className="inline-block px-3 py-1 border-2 border-white text-xs font-black uppercase tracking-tighter">SECTION {activeSlide + 1}.0</div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none border-l-8 border-white pl-6">
                        {cleanContent.split('\n')[0].substring(0, 30)}
                    </h2>
                    <p className="text-lg leading-relaxed font-bold opacity-90 max-w-sm">[LOG]: {cleanContent.substring(0, 150)}</p>
                </div>
                <div className="mt-8 flex justify-between items-end border-t-2 border-white/30 pt-6">
                    <div className="text-[9px] uppercase font-black opacity-50"><p>Approved: {displayName}</p></div>
                    <div className="text-[10px] font-black border-2 border-white px-2 py-1">VERIFIED_SBL</div>
                </div>
            </div>
        );
    }

    if (activeStyle === 'Paper') {
        return (
            <div className="w-full h-full bg-[#FDFCF0] p-12 flex flex-col items-center justify-center text-gray-900 relative">
                <div className="absolute top-10 inset-x-0 text-center">
                    <p className="text-xl font-bold font-serif tracking-tight">{brandHandle}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{displayName}</p>
                </div>
                <div className="max-w-md w-full text-center space-y-8 mt-12">
                    <h2 className="text-3xl font-bold text-gray-800 font-serif leading-tight italic">"{cleanContent.split('\n')[0]}"</h2>
                    <div className="h-px w-32 bg-gray-900 mx-auto opacity-10"></div>
                    <p className="text-xl font-serif leading-relaxed italic text-gray-700 opacity-80">{cleanContent.substring(0, 200)}</p>
                </div>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
                     <div className="w-20 h-20 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-white">
                        {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-black">{displayName[0]}</div>}
                     </div>
                </div>
            </div>
        );
    }

    // Default Fallback
    return (
        <div className="w-full h-full bg-white p-16 flex flex-col justify-center items-center text-center text-gray-900 relative border-4 border-gray-100">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">{displayName}</h2>
            <p className="text-xl font-bold max-w-sm leading-tight uppercase">{cleanContent}</p>
            <div className="mt-12 text-sm font-black text-gray-400 uppercase tracking-widest">{brandHandle}</div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-8 animate-fade-in">
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative group max-w-md w-full">
                <div 
                    ref={mockupRef}
                    className="aspect-[4/5] w-full rounded-[3.5rem] shadow-premium overflow-hidden border border-white/10 ring-1 ring-white/5"
                >
                    {renderMockup()}
                </div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                        <>
                            <button onClick={saveEdit} className="p-3 bg-brand-500 text-white rounded-2xl shadow-xl hover:bg-brand-400 transition-all flex items-center gap-2 font-bold text-xs">
                                <Save size={16} /> Save
                            </button>
                            <button onClick={cancelEditing} className="p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-400 transition-all flex items-center gap-2 font-bold text-xs">
                                <X size={16} /> Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={startEditing} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-2xl shadow-xl hover:bg-black/80 transition-all flex items-center gap-2 font-bold text-xs border border-white/10">
                            <Edit2 size={16} /> Edit Slide Text
                        </button>
                    )}
                </div>

                <button onClick={prevSlide} className="absolute -left-8 top-1/2 -translate-y-1/2 p-4 bg-gray-800/90 backdrop-blur-md text-white rounded-2xl border border-gray-700 shadow-2xl hover:bg-brand-600 transition-all active:scale-90 z-20 group-hover:-translate-x-2">
                    <ChevronLeft />
                </button>
                <button onClick={nextSlide} className="absolute -right-8 top-1/2 -translate-y-1/2 p-4 bg-gray-800/90 backdrop-blur-md text-white rounded-2xl border border-gray-700 shadow-2xl hover:bg-brand-600 transition-all active:scale-90 z-20 group-hover:translate-x-2">
                    <ChevronRight />
                </button>

                <div className="absolute -bottom-8 inset-x-0 flex justify-center gap-2 z-20">
                    {slides.map((_, i) => (
                        <button 
                          key={i} 
                          className={`h-2 rounded-full transition-all duration-300 ${activeSlide === i ? 'bg-brand-500 w-12 shadow-glow' : 'bg-gray-700 w-4 hover:bg-gray-600'}`} 
                          onClick={() => { setActiveSlide(i); cancelEditing(); }}
                        />
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-dark-card border border-gray-800 p-8 rounded-[2.5rem] shadow-premium space-y-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Palette size={14} /> Authority Style Engine
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            'Viral Dark', 'Glassmorphism', 'Neural Banner', 'Hyper-Brutalist', 
                            'Technical Blueprint', 'Swiss Modern', 'Paper', 'Minimalist', 
                            'Editorial', 'Holographic'
                        ].map(style => (
                            <button 
                                key={style}
                                onClick={() => setActiveStyle(style as MockupStyle)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black border transition-all uppercase tracking-widest ${activeStyle === style ? 'bg-brand-500 text-white border-brand-500 shadow-glow' : 'bg-dark-input border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Atmospheric Mood
                        </label>
                        <div className="flex gap-3">
                            {THEMES.map(theme => (
                                <button 
                                    key={theme.name}
                                    onClick={() => setActiveTheme(theme)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${activeTheme.name === theme.name ? 'border-white scale-125 shadow-xl ring-4 ring-brand-500/20' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-110'} bg-gradient-to-br ${theme.bg}`}
                                    title={theme.name}
                                />
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-gray-900 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all active:scale-95 shadow-xl border-b-4 border-gray-300"
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        {isExporting ? 'Generating PNG...' : 'Architect PNG'}
                    </button>
                </div>
            </div>
            
            <div className="p-5 bg-brand-500/5 rounded-2xl border border-brand-500/10 flex items-center gap-5">
                <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
                    <Smartphone size={20} />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                    SBL Engine: "Viral Dark" uses psychological contrast and pattern disruption by placing your authority circle in the hook area. "Neural Banner" establishes technical dominance. "Glassmorphism" replicates the highest-status mobile UI interactions to force a scroll-stop.
                </p>
            </div>
        </div>
    </div>
  );
};

export default SBLMockupView;