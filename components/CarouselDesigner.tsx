
import React, { useState, useEffect, useRef } from 'react';
import { generateCarouselDesignerContent } from '../services/geminiService';
import SBLMockupView from './SBLMockupView';
import { 
  Sparkles, 
  Layers, 
  Zap, 
  Loader2, 
  Wand2, 
  MessageSquare, 
  Smartphone, 
  Save,
  Check,
  Target,
  User,
  AtSign,
  Upload,
  X,
  Languages,
  Layout
} from 'lucide-react';
import VoiceInput from './VoiceInput';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Chinese', 'Japanese', 'Arabic'
];

const CarouselDesigner: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [ctaKeyword, setCtaKeyword] = useState('AI LAUNCH');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<string[]>([]);
  
  // Profile data state
  const [profile, setProfile] = useState({
      name: 'James Shizha',
      handle: '@GreenNova',
      profileImage: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Load Session Data
  useEffect(() => {
      // Load general profile data from LaunchPad for consistency
      const savedLaunchpad = localStorage.getItem('sbl_autosave_launchpad_v4');
      if (savedLaunchpad) {
          try {
              const p = JSON.parse(savedLaunchpad);
              setProfile({
                  name: p.displayName || 'James Shizha',
                  handle: p.brandHandle || '@GreenNova',
                  profileImage: p.profileImage?.url || ''
              });
          } catch(e) {}
      }

      // Load specific Carousel Designer state
      const savedCarousel = localStorage.getItem('sbl_autosave_carousel_designer');
      if (savedCarousel) {
          try {
              const data = JSON.parse(savedCarousel);
              if (data.idea) setIdea(data.idea);
              if (data.ctaKeyword) setCtaKeyword(data.ctaKeyword);
              if (data.language) setLanguage(data.language);
              if (data.slides) setSlides(data.slides);
              if (data.profile) setProfile(data.profile);
          } catch (e) {
              console.error("Failed to restore carousel session", e);
          }
      }
  }, []);

  // Auto-Save Session Data
  useEffect(() => {
      const dataToSave = { idea, ctaKeyword, language, slides, profile };
      try {
          localStorage.setItem('sbl_autosave_carousel_designer', JSON.stringify(dataToSave));
      } catch (e) {
          console.warn("Carousel auto-save failed (storage limit)", e);
      }
  }, [idea, ctaKeyword, language, slides, profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setProfile(prev => ({ ...prev, profileImage: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDesign = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const result = await generateCarouselDesignerContent(idea, ctaKeyword, language);
      setSlides(result);
    } catch (e) {
      console.error(e);
      alert("Failed to architect carousel. Check API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleMetaMagic = () => {
      setIdea("Meta's forced data choice proves it: the old ad game is dead. Stop relying on big tech and build your OWN AI-powered sales engine that runs 24/7.");
      setCtaKeyword("SYSTEM");
      window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Meta Strategy Loaded', type: 'info' } 
      }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
            <Layers className="text-brand-500" />
            Carousel Designer
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Turn one idea into a high-status viral carousel sequence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Architect Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-card rounded-3xl border border-gray-800 p-8 shadow-premium space-y-6 relative overflow-hidden">
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
             
             {/* Profile Customization Section */}
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest ml-1">Profile Persona</label>
                    <button onClick={handleMetaMagic} className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 transition-all group">
                        <Sparkles size={10} className="group-hover:rotate-12" /> Meta Strategy
                    </button>
                </div>
                <div className="bg-[#0B1425] p-5 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex items-center gap-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-14 h-14 rounded-full border-2 border-dashed border-gray-700 hover:border-brand-500 flex items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden bg-gray-900 shadow-inner group"
                        >
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt="P" className="w-full h-full object-cover" />
                            ) : (
                                <Upload size={14} className="text-gray-600 group-hover:text-brand-500" />
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="relative">
                                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                                <input 
                                    value={profile.name} 
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    placeholder="Full Name" 
                                    className="w-full bg-transparent border-b border-gray-800 py-1 text-xs text-white focus:border-brand-500 outline-none font-bold" 
                                />
                            </div>
                            <div className="relative">
                                <AtSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                                <input 
                                    value={profile.handle} 
                                    onChange={(e) => setProfile({...profile, handle: e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value})}
                                    placeholder="@handle" 
                                    className="w-full bg-transparent border-b border-gray-800 py-1 text-[10px] text-gray-400 focus:border-brand-500 outline-none" 
                                />
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Languages size={10} /> Target Language</label>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-input border border-gray-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">The Core Idea</label>
                <div className="relative">
                    <textarea 
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="e.g. How to use AI to generate 30 days of video content in 1 hour..."
                        className="w-full p-4 pr-12 bg-dark-input border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 h-40 resize-none font-medium leading-relaxed"
                    />
                    <div className="absolute right-3 bottom-3">
                        <VoiceInput onTranscript={(text) => setIdea(prev => prev ? prev + ' ' + text : text)} className="w-8 h-8" />
                    </div>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CTA Keyword</label>
                <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        value={ctaKeyword}
                        onChange={(e) => setCtaKeyword(e.target.value)}
                        className="w-full pl-11 p-3.5 bg-dark-input border border-gray-700 rounded-xl text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="e.g. ACTION"
                    />
                </div>
             </div>

             <button 
                onClick={handleDesign}
                disabled={loading || !idea}
                className={`w-full py-5 rounded-2xl font-black text-white shadow-glow transition-all flex items-center justify-center gap-3 border-2 border-transparent uppercase tracking-widest text-sm
                    ${loading || !idea ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 active:scale-95 shadow-brand-900/20'}`}
             >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                {loading ? 'Synthesizing...' : 'Design Carousel'}
             </button>

             <div className="p-4 bg-brand-500/5 rounded-2xl border border-brand-500/10 flex items-center gap-4">
                <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500">
                    <Target size={16} />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                    Strategy: Notification patterns disrupt the scroll by triggering social validation instincts.
                </p>
             </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8">
            {loading ? (
                <div className="h-[700px] bg-dark-card border border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 shadow-premium">
                    <div className="relative w-24 h-24 mb-8">
                        <Loader2 className="w-24 h-24 text-brand-500 animate-spin absolute inset-0 opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-10 h-10 text-brand-500 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Synthesizing Visual Flow</h3>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">AI is architecting 7 slides including automated video scripts, viral hook logic, and monetization strategies in {language}.</p>
                </div>
            ) : slides.length > 0 ? (
                <div className="h-full">
                    <SBLMockupView 
                        slides={slides} 
                        displayName={profile.name} 
                        brandHandle={profile.handle} 
                        profileImage={profile.profileImage}
                        ctaKeyword={ctaKeyword}
                        onSlidesChange={(newSlides) => setSlides(newSlides)}
                    />
                </div>
            ) : (
                <div className="h-[700px] border-2 border-dashed border-gray-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 text-gray-600">
                    <Smartphone className="w-20 h-20 mb-6 opacity-10" />
                    <h3 className="text-xl font-bold text-gray-500 mb-2">Architectural Canvas Empty</h3>
                    <p className="text-sm max-w-xs mx-auto">Input one idea to generate your high-converting notification carousel sequence.</p>
                    <button onClick={handleMetaMagic} className="mt-8 px-6 py-3 bg-brand-900/40 hover:bg-brand-900/60 border border-brand-500/30 rounded-xl text-xs font-black text-brand-400 uppercase tracking-widest flex items-center gap-2 transition-all">
                        <Layout size={14} /> Recreate reference mockup
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CarouselDesigner;
