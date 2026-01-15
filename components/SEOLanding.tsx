import React from 'react';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  BarChart3, 
  CheckCircle2, 
  Rocket, 
  ChevronRight, 
  ShieldCheck, 
  Globe, 
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';

interface SEOLandingProps {
  onStart: () => void;
}

const SEOLanding: React.FC<SEOLandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#020C1B] text-white selection:bg-brand-500 selection:text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 bg-brand-500/10 rounded-2xl border border-brand-500/20 backdrop-blur-xl group-hover:border-brand-500/50 transition-all shadow-glow-sm">
            <GreenNovaLogo className="w-10 h-10 text-brand-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-xl italic uppercase leading-none">GreenNova <span className="text-transparent bg-clip-text bg-brand-gradient">AI Launchpad</span></span>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Sustainable Growth Platform</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
            {['About', 'Features', 'Blog', 'Contact'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">{link}</a>
            ))}
            <button 
                onClick={onStart}
                className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-glow active:scale-95"
            >
                Launch App
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-500/10 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-brand-500/20 mb-10 animate-fade-in">
            <Sparkles size={12} className="fill-current text-yellow-400" /> AI-Powered Business Architect
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.9] mb-8 animate-slide-up">
            GreenNova <span className="text-transparent bg-clip-text bg-brand-gradient drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">AI Launchpad</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-14 animate-slide-up delay-100 font-medium leading-relaxed">
            The AI-Powered Sustainable Business Launch System for automating marketing, boosting conversions, and scaling brands worldwide. Build your digital empire with zero friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-glow active:scale-95 transition-all flex items-center justify-center gap-3"
            >
                Start Your Free Trial <ArrowRight size={20} />
            </button>
            <a href="#features" className="w-full sm:w-auto px-10 py-6 text-gray-500 hover:text-white font-black text-sm uppercase tracking-widest transition-all">Explore Features</a>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 bg-dark-card/30 border-y border-gray-800 relative">
        <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-24 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Enterprise-Grade <span className="text-brand-500">Automation</span></h2>
                <p className="text-gray-500 font-medium max-w-xl mx-auto">Everything you need to move from "Operator" to "Architect".</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { title: "AI Marketing Automation", desc: "Instantly architect 11-asset social media suites from a single niche idea.", icon: Zap, color: "text-yellow-400" },
                    { title: "Conversion Optimization", desc: "Neural engine that extracts high-retention patterns for maximum ROI.", icon: Target, color: "text-brand-500" },
                    { title: "Global Scaling Tools", desc: "Niche explorer and intelligence feeds to find blue oceans worldwide.", icon: Globe, color: "text-blue-400" },
                    { title: "Real-Time Analytics", desc: "Track velocity, opportunity scores, and growth intelligence in one view.", icon: BarChart3, color: "text-purple-400" },
                ].map((feature, i) => (
                    <div key={i} className="p-10 bg-dark-card border border-gray-800 rounded-[3rem] hover:border-brand-500/50 transition-all group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <feature.icon size={120} />
                        </div>
                        <div className={`p-4 ${feature.color} bg-white/5 rounded-2xl w-fit mb-8`}>
                            <feature.icon size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">{feature.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Benefits & How it Works */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
                <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Architected for <span className="text-blue-400">Results</span></h2>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">We don't just build software; we build revenue-generating systems.</p>
                </div>

                <div className="space-y-8">
                    {[
                        { title: "Save 20+ Hours Per Week", desc: "Automate your video scripts, hooks, and scheduler.", icon: Clock },
                        { title: "Increase Conversion Rates", desc: "Use psychological DNA extraction for scroll-stopping content.", icon: TrendingUp },
                        { title: "Scale Sustainably", desc: "Build a brand that converts without constant manual grind.", icon: ShieldCheck }
                    ].map((benefit, i) => (
                        <div key={i} className="flex gap-6 items-start">
                            <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500 shrink-0">
                                <benefit.icon size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-sm mb-1">{benefit.title}</h4>
                                <p className="text-gray-500 text-sm">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-dark-card border border-gray-800 rounded-[3rem] p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-10">How It Works</h3>
                
                <div className="space-y-10">
                    {[
                        { step: "01", title: "Define Your Niche", desc: "Specify your industry and audience goals." },
                        { step: "02", title: "AI Synthesis", desc: "Generate full-funnel content suites in seconds." },
                        { step: "03", title: "Deploy & Monetize", desc: "Schedule assets and track conversions in real-time." }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-6 relative">
                            {i < 2 && <div className="absolute left-6 top-10 bottom-[-40px] w-px bg-gray-800"></div>}
                            <div className="w-12 h-12 bg-dark-input border border-gray-700 rounded-2xl flex items-center justify-center shrink-0 z-10">
                                <span className="text-brand-500 font-black text-xs">{step.step}</span>
                            </div>
                            <div className="pt-2">
                                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-1">{step.title}</h4>
                                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={onStart}
                    className="mt-12 w-full py-5 bg-white text-gray-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-500 hover:text-white transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2"
                >
                    Launch Your System <Rocket size={16} />
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-gray-800 bg-[#020C1B]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
                <GreenNovaLogo className="w-8 h-8 text-brand-500 opacity-50" />
                <div className="flex flex-col">
                    <span className="font-black text-gray-400 uppercase text-xs tracking-tighter italic">GreenNova AI</span>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">© 2025 SBL Protocol</span>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {['About', 'Features', 'Blog', 'Contact', 'Privacy Policy'].map(link => (
                    <a key={link} href="#" className="hover:text-brand-400 transition-colors">{link}</a>
                ))}
            </div>
        </div>
      </footer>
    </div>
  );
};

export default SEOLanding;