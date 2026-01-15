import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp, 
  Mail, 
  Play, 
  Sparkles, 
  Rocket, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  Globe, 
  User, 
  Key, 
  X as XIcon, 
  Info, 
  CreditCard, 
  Crown, 
  Smartphone, 
  Activity, 
  Target, 
  Flame, 
  Cpu,
  Lightbulb,
  MousePointer2,
  Trophy,
  History,
  Facebook,
  FileCheck,
  Quote,
  BadgeCheck,
  Youtube,
  PlayCircle,
  Twitter,
  Linkedin,
  Instagram,
  Link as LinkIcon,
  BellRing
} from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';
import { trackEvent } from '../services/analyticsService';

interface LandingPageProps {
  onEnterApp: () => void;
}

const TESTIMONIALS = [
  {
    name: "Marcus Rivera",
    role: "Agency Founder",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    text: "The SBL System took me from manual DMing to 15 qualified leads a day. AI architecting is a genuine cheat code for growth.",
    rating: 5,
    tag: "Verified Architect"
  },
  {
    name: "Sarah Lindholm",
    role: "E-com Director",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    text: "I was skeptical, but the Viral LaunchPad produces better hooks than my expensive copywriter ever did. Engagement is up 400%.",
    rating: 5,
    tag: "Beta Member"
  },
  {
    name: "David K.",
    role: "Content Strategist",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    text: "The Repurposer alone saves me 10 hours a week. I turn one long-form podcast into 11 viral assets in minutes. Total game changer.",
    rating: 5,
    tag: "Elite User"
  },
  {
    name: "Elena Moretti",
    role: "Fitness Coach",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
    text: "Finally, a system that understands niche psychology. My conversion rate has doubled since implementing the Comment Ladder protocol.",
    rating: 5,
    tag: "Success Story"
  },
  {
    name: "Jason Thorne",
    role: "SaaS Founder",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    text: "The Authority Studio makes my brand look like a multi-million dollar company. High-status visuals are the key to premium prices.",
    rating: 5,
    tag: "Power User"
  },
  {
    name: "Monica Peters",
    role: "Digital Consultant",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    text: "Sustainable growth is finally possible. SBL gave me the systems to step back from the grind and start acting like an Architect.",
    rating: 5,
    tag: "Verified Owner"
  },
  {
    name: "Robert Sterling",
    role: "Serial Entrepreneur",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
    text: "This isn't just another AI wrapper. The SBL Protocol is a complete business transformation framework. Best ROI of 2025.",
    rating: 5,
    tag: "Legacy Member"
  },
  {
    name: "Linda Hernandez",
    role: "Real Estate Broker",
    image: "https://images.unsplash.com/photo-1567532939604-b6c5b0ad2eba?w=100&h=100&fit=crop",
    text: "I closed my first client from Facebook using the scripts from this app in just 4 days. The automation actually feels human.",
    rating: 5,
    tag: "New Launch"
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [appLogo, setAppLogo] = useState<string | null>(() => localStorage.getItem('sbl_app_logo'));

  const YOUTUBE_URL = "https://youtube.com/channel/UCN5cxymUeykhheJHWFiuSeg?sub_confirmation=";

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  useEffect(() => {
    const handleStorage = () => setAppLogo(localStorage.getItem('sbl_app_logo'));
    window.addEventListener('storage', handleStorage);
    
    const storedForm = localStorage.getItem('sbl_landing_form_cache');
    const lastSession = localStorage.getItem('sbl_last_user_hint');

    if (storedForm) {
      try {
        const { name, mail, protocol } = JSON.parse(storedForm);
        if (name) setFullName(name);
        if (mail) setEmail(mail);
        if (protocol) setSelectedProtocol(protocol);
      } catch (e) {}
    } else if (lastSession) {
      try {
          const { name, mail } = JSON.parse(lastSession);
          if (name) setFullName(name);
          if (mail) setEmail(mail);
      } catch (e) {}
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        localStorage.setItem('sbl_landing_form_cache', JSON.stringify({ 
            name: fullName, 
            mail: email,
            protocol: selectedProtocol 
        }));
    }, 500);
    return () => clearTimeout(timer);
  }, [fullName, email, selectedProtocol]);

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!validateEmail(email)) { setError('Please enter a valid business email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }

    completeLogin(fullName, email, password);
  };

  const completeLogin = (name: string, userEmail: string, userPass: string) => {
    const sessionData = {
        name,
        email: userEmail,
        password: userPass,
        createdAt: Date.now(),
        subscriptionStatus: 'Inactive'
    };

    localStorage.setItem('sbl_user_session', JSON.stringify(sessionData));
    localStorage.setItem('sbl_user_email', userEmail); 
    localStorage.setItem('sbl_last_user_hint', JSON.stringify({ name, mail: userEmail }));
    
    if (selectedProtocol) {
        const existing = localStorage.getItem('sbl_autosave_launchpad_v11');
        if (!existing || JSON.parse(existing).nicheTopic === '') {
            localStorage.setItem('sbl_autosave_launchpad_v11', JSON.stringify({
                nicheTopic: selectedProtocol,
                generatedContent: '' 
            }));
        }
    }

    trackEvent('lead_captured');
    onEnterApp();
  };

  const quickSuggestions = [
    { title: "SaaS Launch", icon: Zap, color: "text-blue-400", border: "border-blue-500/50", bg: "bg-blue-500/10", glow: "shadow-blue-500/40" },
    { title: "Real Estate", icon: Target, color: "text-yellow-400", border: "border-yellow-500/50", bg: "bg-yellow-500/10", glow: "shadow-yellow-500/40" },
    { title: "Personal Brand", icon: Flame, color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/40" },
    { title: "Digital Agency", icon: Cpu, color: "text-blue-500", border: "border-blue-600/50", bg: "bg-blue-600/10", glow: "shadow-blue-600/40" }
  ];

  const strategies = [
    { name: "The Architecture Protocol", color: "text-blue-500", icon: Cpu, desc: "System-first scaling for complex services." },
    { name: "Viral Hook DNA", color: "text-yellow-500", icon: Zap, desc: "High-velocity reach for e-commerce." },
    { name: "Blue Ocean Niche", color: "text-emerald-500", icon: Globe, desc: "Dominating underserved market segments." },
    { name: "Monetized Influence", color: "text-pink-500", icon: Crown, desc: "Direct sales for personal brands." }
  ];

  const viralRankings = [
    { rank: "01", title: "Architect vs. Operator", desc: "Definitive system for scaling past the manual grind.", volume: "2.4M searches", color: "text-blue-500" },
    { rank: "02", title: "30-Day Zero to $10k", desc: "Sequential AI blueprint for solo founders.", volume: "1.8M searches", color: "text-yellow-500" },
    { rank: "03", title: "Viral Hook DNA", desc: "Psychological markers of shared posts.", volume: "1.5M searches", color: "text-emerald-500" },
    { rank: "04", title: "Niche Dominance", desc: "Finding Blue Ocean markets.", volume: "940K searches", color: "text-blue-400" },
    { rank: "05", title: "Comment Ladder", desc: "Turn reach into qualified leads.", volume: "820K searches", color: "text-yellow-400" },
    { rank: "06", title: "AI Video Forensics", desc: "Reverse-engineering high-retention video content.", volume: "750K searches", color: "text-pink-500" },
    { rank: "07", title: "Authority Visual Studio", desc: "Designing high-status visuals without a designer.", volume: "680K searches", color: "text-cyan-500" },
    { rank: "08", title: "Automated Revenue Engines", desc: "Building digital assets that work while you sleep.", volume: "590K searches", color: "text-indigo-500" },
    { rank: "09", title: "Repurposing Protocol", desc: "Turning 1 long-form asset into 11 viral pieces.", volume: "450K searches", color: "text-purple-500" },
    { rank: "10", title: "Sustainable Empire Framework", desc: "Long-term scaling logic for professional brands.", volume: "310K searches", color: "text-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-[#020C1B] text-white selection:bg-brand-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* YouTube Masterclass Compact Floating Bar - FAR LEFT, SHORT, 90 DEGREE CORNERS */}
      <div className="fixed top-4 left-4 z-[200] pointer-events-none flex justify-start">
        <a 
          href={YOUTUBE_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-none transition-all group relative overflow-hidden shadow-2xl border border-red-500/30"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <p className="text-white text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Youtube size={12} /> 
            Free Masterclass Live — <span className="underline decoration-1 underline-offset-2">Subscribe</span>
            <BellRing size={10} className="animate-bounce" />
          </p>
        </a>
      </div>

      {/* Suggestion "Pop-up" Modal */}
      {showSuggestionModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
              <div className="max-w-2xl w-full bg-dark-card border border-gray-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-emerald-500 animate-pulse"></div>
                  <button onClick={() => setShowSuggestionModal(false)} className="absolute top-8 right-8 p-2 text-gray-500 hover:text-white transition-colors"><XIcon size={24} /></button>
                  
                  <div className="p-10 space-y-8">
                      <div className="space-y-2">
                          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">System <span className="text-brand-500">Suggestions</span></h2>
                          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Choose a pre-architected starting point for your empire.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {strategies.map((s, i) => (
                              <button 
                                key={i}
                                onClick={() => { setSelectedProtocol(s.name); setShowSuggestionModal(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="group p-6 bg-[#0B1425] border border-gray-800 rounded-2xl hover:border-brand-500 transition-all text-left flex items-start gap-5 relative overflow-hidden"
                              >
                                  <div className="p-3 bg-brand-500/10 rounded-xl group-hover:scale-110 transition-transform"><s.icon className={`${s.color}`} size={24} /></div>
                                  <div>
                                      <h3 className={`font-black uppercase tracking-tight text-lg mb-1 ${s.color}`}>{s.name}</h3>
                                      <p className="text-xs text-gray-500 leading-relaxed font-bold">{s.desc}</p>
                                  </div>
                                  <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity"><s.icon size={80} /></div>
                              </button>
                          ))}
                      </div>

                      <div className="p-6 bg-brand-500/5 rounded-2xl border border-brand-500/10 flex items-center gap-4">
                          <Info size={20} className="text-brand-400 shrink-0" />
                          <p className="text-[10px] text-gray-500 uppercase font-black leading-relaxed tracking-widest">Selected strategy will automatically configure your AI agents within the LaunchPad.</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Top Left Logo Nav */}
      <nav className="max-w-7xl mx-auto px-8 py-8 pt-20 flex items-center justify-between relative z-[100]">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="p-2 bg-brand-500/10 rounded-2xl border border-brand-500/20 backdrop-blur-xl group-hover:border-brand-500/50 transition-all shadow-glow-sm">
            {appLogo ? <img src={appLogo} alt="Logo" className="w-10 h-10 object-contain" /> : <GreenNovaLogo className="w-10 h-10 text-brand-500" />}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-black tracking-tighter text-xl italic uppercase leading-none">SBL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SYSTEM</span></span>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">AI Launchpad v2.4</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSuggestionModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-brand-500/30 backdrop-blur-md"
          >
            <Lightbulb size={12} className="text-yellow-400" /> Choose Strategy
          </button>
        </div>
      </nav>

      {/* Forgot Password Modal */}
      {showForgotModal && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="max-md w-full bg-dark-card border border-gray-800 rounded-[2.5rem] shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
                  <button onClick={() => setShowForgotModal(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"><XIcon size={20} /></button>
                  <div className="p-10 space-y-6 text-center">
                      <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mx-auto mb-2"><Key size={32} /></div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">Access Recovery</h3>
                      <input type="email" placeholder="Enter your business email" className="w-full bg-[#020C1B] border border-gray-700 rounded-2xl py-5 px-6 text-white outline-none focus:ring-2 focus:ring-brand-500 font-bold" />
                      <button className="w-full py-5 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-glow">Send Reset Link</button>
                  </div>
              </div>
          </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-30 scale-105 blur-[2px] grayscale">
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020C1B] via-transparent to-[#020C1B] opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-500/10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-400 rounded-full text-xs font-black uppercase tracking-[0.3em] border border-brand-500/20 mb-10 animate-fade-in">
            <Zap size={14} className="fill-current text-yellow-400" /> SBL Protocol v2.4 Active
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter italic uppercase leading-[0.9] mb-8 animate-slide-up">
            <span className="text-white">AI-Powered</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-300 to-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">Sustainable Business</span> <br /> 
            <span className="text-white">Launch System</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-14 animate-slide-up delay-100 font-medium leading-relaxed">
            The world's first niche-agnostic <span className="text-emerald-400 font-black">content-to-cash engine</span>. Stop guessing what goes viral and start architecting scalable growth with <span className="text-blue-400 font-bold">automated video scripts</span>, <span className="text-yellow-400 font-bold underline decoration-yellow-500 underline-offset-4">psychological DNA</span>, and high-status visuals.
          </p>

          <div className="max-w-2xl mx-auto animate-slide-up delay-200">
            <form onSubmit={handleAuth} className="relative group space-y-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-emerald-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-[#0A192F]/80 backdrop-blur-md p-2 rounded-[2.5rem] border border-gray-800 space-y-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input type="text" required placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#020C1B] border border-gray-700 rounded-2xl py-5 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 font-bold" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input type="email" required placeholder="Business Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#020C1B] border border-gray-700 rounded-2xl py-5 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 font-bold" />
                    </div>
                </div>

                <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input type="password" required placeholder="Access Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#020C1B] border border-gray-700 rounded-2xl py-5 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 font-bold" />
                </div>

                {/* Pop Suggestions Taps */}
                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Quick Protocol Selection</p>
                        <button type="button" onClick={() => setShowSuggestionModal(true)} className="text-[10px] font-black text-brand-500 hover:underline uppercase tracking-widest flex items-center gap-1">
                             More Pop-ups <ChevronRight size={10} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickSuggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedProtocol(s.title)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group/btn shadow-xl active:scale-95 ${selectedProtocol === s.title ? `${s.bg} ${s.border} ${s.glow} ring-2 ring-brand-500/20` : 'bg-[#020C1B] border-gray-800 hover:border-gray-600'}`}
                            >
                                <s.icon className={`w-6 h-6 ${selectedProtocol === s.title ? s.color : 'text-gray-600 group-hover/btn:text-white'} transition-colors`} />
                                <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${selectedProtocol === s.title ? 'text-white' : 'text-gray-500 group-hover/btn:text-gray-300'}`}>{s.title}</span>
                                {selectedProtocol === s.title && <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${s.bg.replace('bg-', 'bg-').split(' ')[0]} animate-ping`}></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 animate-bounce">
                        <Shield size={14} /> {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button type="submit" className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-glow active:scale-95 transition-all flex items-center justify-center gap-3 whitespace-nowrap">
                        Launch Your <span className="font-bold underline">{selectedProtocol || 'System'}</span> <ArrowRight size={20} />
                    </button>
                    <button type="button" onClick={() => setShowForgotModal(false)} className="text-[11px] font-black text-gray-500 hover:text-brand-400 uppercase tracking-widest transition-colors py-2">Account Recovery Protocol</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-brand-500 via-yellow-400 to-transparent"></div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-[#0A192F] border-y border-gray-800 py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-30">
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter italic"><Globe size={28} className="text-blue-500" /> FORBES</div>
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter italic"><TrendingUp size={28} className="text-yellow-500" /> FAST COMPANY</div>
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter italic"><ShieldCheck size={28} className="text-emerald-500" /> WIRED</div>
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter italic"><Zap size={28} className="text-blue-500" /> TECHCRUNCH</div>
        </div>
      </section>

      {/* Verified Results: Entrepreneur Success Stories */}
      <section className="py-32 bg-[#020C1B] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-20 space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-yellow-500/20">
                      <Star size={12} className="fill-current" /> Peer Reviewed Protocol
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
                    Trusted by Leading <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Business Architects</span> Globally
                  </h2>
                  <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">Verified Results: Join 400+ architects who have replaced manual grind with AI systems.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {TESTIMONIALS.map((t, i) => (
                      <div key={i} className="bg-dark-card border border-gray-800 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-yellow-500/30 transition-all group shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                              <Quote size={80} />
                          </div>
                          <div>
                              <div className="flex gap-1 mb-6">
                                  {[...Array(t.rating)].map((_, i) => (
                                      <Star key={i} size={14} className="text-yellow-400 fill-current" />
                                  ))}
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed font-medium italic mb-8">
                                  "{t.text}"
                              </p>
                          </div>
                          <div className="flex items-center gap-4 pt-6 border-t border-gray-800/50">
                              <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 overflow-hidden shrink-0 shadow-lg">
                                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                  <h4 className="text-white font-bold text-xs truncate flex items-center gap-1.5">
                                      {t.name} <BadgeCheck size={12} className="text-blue-400" />
                                  </h4>
                                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{t.role}</p>
                              </div>
                          </div>
                          <div className="absolute top-6 right-6">
                              <span className="text-[8px] font-black text-gray-600 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800 uppercase tracking-widest">{t.tag}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Strategic Mastery: SBL Training Section */}
      <section className="py-24 bg-[#050B16] relative overflow-hidden border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20 mb-8">
                <Youtube size={12} /> Strategic Mastery
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-tight mb-6">
              Watch The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">SBL Deep-Dives</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              We break down the world's most successful sustainable business models. Learn the exact architecture behind 7-figure launches.
            </p>
            
            <div className="w-full max-w-4xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-dark-card border border-gray-800 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 shadow-2xl">
                    <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] border border-red-500/20 flex items-center justify-center text-red-500 shadow-glow-sm shrink-0">
                        <PlayCircle size={48} />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Please Subscribe</h3>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Join 10k+ entrepreneurs architecting their future on YouTube.</p>
                    </div>
                    <div className="shrink-0">
                        <a 
                            href={YOUTUBE_URL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 group/btn"
                        >
                            <Youtube size={18} /> SUBSCRIBE NOW <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Clickable Suggestions Section */}
      <section className="py-32 bg-[#020C1B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24 space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
                <Activity size={12} /> Live Market Analytics
             </div>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
               Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-300 to-emerald-400">Viral Search</span> Rankings
             </h2>
             <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">Click any ranking to automatically architect your campaign around that pattern.</p>
          </div>

          <div className="space-y-5">
            {viralRankings.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => { setSelectedProtocol(item.title); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full group bg-dark-card border border-gray-800 rounded-3xl p-8 hover:border-brand-500/50 transition-all flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden text-left active:scale-[0.99]"
              >
                <div className={`absolute left-0 top-0 w-2 h-full ${item.color.replace('text-', 'bg-')} opacity-50`}></div>
                
                <div className={`text-4xl md:text-5xl font-black ${item.color} italic shrink-0 opacity-80 group-hover:scale-110 transition-transform`}>
                  #{item.rank}
                </div>
                
                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic flex items-center gap-3">
                      {item.title}
                      {idx === 0 && <span className="px-2 py-0.5 bg-brand-500 text-white text-[8px] rounded-md animate-pulse">MOST ACTIVE</span>}
                  </h3>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{item.desc}</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1">
                  <div className="flex items-center gap-1.5 text-brand-400 font-black text-[10px] uppercase tracking-widest bg-brand-900/40 px-4 py-2 rounded-full border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <TrendingUp size={12} /> ARCHITECT NOW
                  </div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                    {item.volume}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-center gap-12">
             <button onClick={() => setShowSuggestionModal(true)} className="flex items-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-xl active:scale-95 group">
                Explore More Strategies <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>

             {/* Facebook Social Proof Section */}
             <div className="w-full max-w-4xl space-y-8 animate-fade-in pt-12 border-t border-gray-800">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
                        <Facebook size={14} /> Proven Performance
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">System <span className="text-transparent bg-clip-text bg-blue-500">Live Feedback</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="https://www.facebook.com/james.shizha.96" target="_blank" rel="noopener noreferrer" className="rounded-[2.5rem] overflow-hidden border border-gray-800 shadow-2xl group cursor-pointer hover:border-blue-500/50 transition-all">
                        <img src="input_file_0.png" alt="Facebook Proof 1" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </a>
                    <a href="https://www.facebook.com/james.shizha.96" target="_blank" rel="noopener noreferrer" className="rounded-[2.5rem] overflow-hidden border border-gray-800 shadow-2xl group cursor-pointer hover:border-blue-500/50 transition-all">
                        <img src="input_file_1.png" alt="Facebook Proof 2" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </a>
                </div>

                <div className="flex justify-center">
                    <a 
                        href="https://www.facebook.com/james.shizha.96" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-8 py-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                        <Facebook size={18} /> Connect with James on Facebook <ArrowRight size={16} />
                    </a>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Board */}
      <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 bg-dark-card border border-gray-800 rounded-[3rem] text-center space-y-4 hover:border-blue-500/50 transition-all">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4 shadow-glow-sm"><Activity size={32} /></div>
                  <h3 className="text-4xl font-black text-white">479+</h3>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Architects Launched</p>
              </div>
              <div className="p-10 bg-dark-card border border-gray-800 rounded-[3rem] text-center space-y-4 hover:border-yellow-500/50 transition-all">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 mx-auto mb-4 shadow-glow-sm"><History size={32} /></div>
                  <h3 className="text-4xl font-black text-white">2.4M</h3>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Assets Generated</p>
              </div>
              <div className="p-10 bg-dark-card border border-gray-800 rounded-[3rem] text-center space-y-4 hover:border-emerald-500/50 transition-all">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-glow-sm"><Trophy size={32} /></div>
                  <h3 className="text-4xl font-black text-white">12.8K</h3>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Conversion Events</p>
              </div>
          </div>
      </section>

      {/* Checklist CTA Section */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-900/40 to-[#020C1B] border border-emerald-500/30 rounded-[3.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl group">
            <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <FileCheck size={300} className="text-emerald-500" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-glow-sm shrink-0">
                 <FileCheck size={48} />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20">
                   <Star size={12} className="fill-current" /> High Value Asset
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-tight text-white">
                  Claim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Strategic Edge</span>
                </h2>
                <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                  Get the 8-Figure Sustainable Business Launch Checklist for <span className="text-emerald-400 font-black underline underline-offset-4">FREE</span>. Stop guessing and start following a proven path to profitability.
                </p>
              </div>
              
              <div className="shrink-0">
                <a 
                  href="https://linkedaffiliatehour.systeme.io/free-checklist" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-glow active:scale-95 transition-all group/btn"
                >
                  Download FREE Checklist <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Middle Logo Footer */}
      <footer className="py-24 border-t border-gray-800 text-center relative bg-dark-bg">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-500/20 rounded-full blur-[80px]"></div>
        </div>
        <div className="flex flex-col items-center gap-10 relative z-10">
          <div className="flex flex-col items-center gap-4 group">
            <div className="p-5 bg-brand-500/5 rounded-[2rem] border border-brand-500/10 group-hover:border-brand-500/40 transition-all duration-500 shadow-glow-sm">
                {appLogo ? <img src={appLogo} alt="Logo" className="w-14 h-14 object-contain" /> : <GreenNovaLogo className="w-14 h-14 text-brand-500" />}
            </div>
            <div className="flex flex-col items-center">
                <span className="font-black tracking-[0.5em] uppercase text-[10px] text-brand-500 mb-1">SUSTAINABLE</span>
                <span className="font-black tracking-[0.1em] uppercase text-2xl text-white italic">SBL SYSTEM</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://www.x.com/jamesshizha" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all border border-white/10"
                title="Follow on X.com"
              >
                  <Twitter size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/in/james-shizha-a81748248" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-[#0a66c2]/10 text-[#0a66c2] rounded-xl hover:bg-[#0a66c2] hover:text-white transition-all border border-[#0a66c2]/20"
                title="Connect on LinkedIn"
              >
                  <Linkedin size={20} />
              </a>
              <a 
                href="https://www.instagram.com/greennovasystems" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-pink-600/10 text-pink-500 rounded-xl hover:bg-pink-600 hover:text-white transition-all border border-pink-500/20"
                title="Follow on Instagram"
              >
                  <Instagram size={20} />
              </a>
              <a 
                href={YOUTUBE_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
                title="Subscribe on YouTube"
              >
                  <Youtube size={20} />
              </a>
              <a 
                href="https://www.facebook.com/james.shizha.96" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                title="Follow on Facebook"
              >
                  <Facebook size={20} />
              </a>
              <a 
                href="https://www.greennovaailaunchpad.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20"
                title="Visit Website"
              >
                  <Globe size={20} />
              </a>
          </div>

          <div className="space-y-6">
             <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">© 2025 Sustainable Business Launch System • All Rights Reserved</p>
             <div className="flex justify-center gap-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-brand-400 transition-colors">Support Protocol</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;