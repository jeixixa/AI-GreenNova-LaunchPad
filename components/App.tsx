
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ContentCreator from './ContentCreator';
import BlogArchitect from './BlogArchitect';
import ImageStudio from './ImageStudio';
import AudioStudio from './AudioStudio';
import VideoMaker from './VideoMaker';
import SavedPosts from './SavedPosts';
import PostTemplates from './PostTemplates';
import StudioJames from './StudioJames';
import LandingPage from './LandingPage';
import SEOLanding from './SEOLanding';
import Account from './Account';
import ViralSearch from './ViralSearch';
import TrendsBoard from './TrendsBoard';
import ViralPatternSearch from './ViralPatternSearch';
import NicheExplorer from './NicheExplorer';
import VideoRepurposer from './VideoRepurposer';
import Scheduler from './Scheduler';
import Settings from './Settings';
import FaceFusion from './FaceFusion';
import AuthorityGenerator from './AuthorityGenerator';
import FreeVideoGenerator from './FreeVideoGenerator';
import AdminDashboard from './AdminDashboard';
import Masterclass from './Masterclass';
import SBLMockupView from './SBLMockupView';
import CarouselDesigner from './CarouselDesigner';
import Onboarding from './Onboarding';
import AccessGate from './AccessGate';
import ChatAssistant from './ChatAssistant';
import WhatsAppBridge from './WhatsAppBridge';
import LeadCRM from './LeadCRM';
import NeuralCommand from './NeuralCommand';
import { View } from '../types';
import { Menu, X, Smartphone, CheckCircle2, Info, AlertCircle, Sparkles } from 'lucide-react';

interface ToastData {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error';
    title?: string;
}

interface UserSession {
    name: string;
    email: string;
    createdAt: number;
    subscriptionStatus: 'Active' | 'Inactive';
}

function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const stored = localStorage.getItem('sbl_user_session');
    return stored ? JSON.parse(stored) : null;
  });

  const [showSEOLanding, setShowSEOLanding] = useState(() => !session);
  const [showLandingPage, setShowLandingPage] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(() => {
      const completed = localStorage.getItem('sbl_onboarding_completed');
      return !!session && completed !== 'true';
  });
  
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  
  const [mockupSlides, setMockupSlides] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({ name: 'James Shizha', handle: '@GreenNova', profileImage: '', ctaKeyword: 'AI LAUNCH SYSTEM' });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('sbl_theme');
          if (saved === 'light' || saved === 'dark') return saved;
      }
      return 'dark';
  });

  const isTrialValid = () => {
    if (!session) return false;
    if (session.subscriptionStatus === 'Active') return true;
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;
    return (Date.now() - session.createdAt) < fifteenDays;
  };

  const isAccessBlocked = !!session && !isTrialValid();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') { root.classList.add('dark'); } 
    else { root.classList.remove('dark'); }
    localStorage.setItem('sbl_theme', theme);

    const handleStorage = () => {
        const updated = localStorage.getItem('sbl_user_session');
        if (updated) setSession(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorage);

    const saved = localStorage.getItem('sbl_autosave_launchpad_v11');
    if (saved) {
        try {
            const p = JSON.parse(saved);
            if (p.generatedContent) {
                const sections = p.generatedContent.split(/### (?:\\d️⃣ )?([A-Z\s\(\)-]+)/gi);
                const mockupIndex = sections.findIndex((s: string) => s.includes('MOCKUP SLIDES'));
                if (mockupIndex !== -1) {
                  const slideBlocks = (sections[mockupIndex + 1] || "").split(/SLIDE \d:?/gi).filter((s: string) => s.trim().length > 5);
                  setMockupSlides(slideBlocks.map((s: string) => s.trim()));
                }
            }
            setProfileData({
                name: p.profileName || session?.name || 'James Shizha',
                handle: p.profileHandle || '@GreenNova',
                profileImage: p.profileImage || '',
                ctaKeyword: p.ctaKeyword || 'AI LAUNCH SYSTEM'
            });
        } catch(e) {}
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, [theme, currentView, session]);

  useEffect(() => {
    const handleToast = (event: any) => {
        const { message, type, title } = event.detail;
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, title }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    window.addEventListener('sbl-toast', handleToast);
    return () => window.removeEventListener('sbl-toast', handleToast);
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('sbl_user_session');
      localStorage.removeItem('sbl_user_email');
      localStorage.removeItem('sbl_admin_auth');
      localStorage.removeItem('sbl_onboarding_completed');
      setSession(null);
      setShowSEOLanding(true);
      setShowLandingPage(false);
  };

  const completeOnboarding = () => {
      localStorage.setItem('sbl_onboarding_completed', 'true');
      setShowOnboarding(false);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard onNavigate={(view) => setCurrentView(view as unknown as View)} />;
      case View.NEURAL_COMMAND: return <NeuralCommand />;
      case View.MASTERCLASS: return <Masterclass />;
      case View.VIRAL_GENERATOR: return <ContentCreator />;
      case View.BLOG_ARCHITECT: return <BlogArchitect />;
      case View.VIRAL_SEARCH: return <ViralSearch onNavigate={(view) => setCurrentView(view)} />;
      case View.TRENDS_BOARD: return <TrendsBoard onNavigate={(view) => setCurrentView(view)} />;
      case View.VIRAL_PATTERNS: return <ViralPatternSearch />;
      case View.NICHE_EXPLORER: return <NicheExplorer onNavigate={(view) => setCurrentView(view)} />;
      case View.WHATSAPP_BRIDGE: return <WhatsAppBridge />;
      case View.LEAD_CRM: return <LeadCRM />;
      case View.CAROUSEL_DESIGNER: return <CarouselDesigner />;
      case View.VIRAL_MOCKUPS:
        return (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-white">Viral Mockup Studio</h1>
                    <p className="text-gray-400">Design high-status notification and paper authority carousels.</p>
                </div>
                {mockupSlides.length > 0 ? (
                    <SBLMockupView slides={mockupSlides} displayName={profileData.name} brandHandle={profileData.handle} profileImage={profileData.profileImage} ctaKeyword={profileData.ctaKeyword} />
                ) : (
                    <div className="flex-1 border-2 border-dashed border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
                        <Smartphone className="w-16 h-16 text-gray-700 mb-4" />
                        <p className="text-gray-500 max-w-xs mx-auto">Generate a suite in the Viral LaunchPad first to populate your mockups.</p>
                        <button onClick={() => setCurrentView(View.VIRAL_GENERATOR)} className="mt-6 px-8 py-3 bg-brand-600 text-white rounded-xl font-bold transition-all hover:bg-brand-500">Go to LaunchPad</button>
                    </div>
                )}
            </div>
        );
      case View.VIDEO_REPURPOSER: return <VideoRepurposer />;
      case View.POST_TEMPLATES: return <PostTemplates />;
      case View.STUDIO_JAMES: return <StudioJames />;
      case View.IMAGE_GENERATOR: return <ImageStudio />;
      case View.SHORTS_GENERATOR: return <AudioStudio />;
      case View.VIDEO_MAKER: return <VideoMaker />;
      case View.FREE_VIDEO_GENERATOR: return <FreeVideoGenerator />;
      case View.AUTHORITY_GENERATOR: return <AuthorityGenerator />;
      case View.FACE_FUSION: return <FaceFusion />;
      case View.SAVED_POSTS: return <SavedPosts />;
      case View.SCHEDULER: return <Scheduler />;
      case View.ACCOUNT: return <Account onNavigate={(view) => setCurrentView(view)} onLogout={handleLogout} />;
      case View.SETTINGS: return <Settings theme={theme} setTheme={setTheme} />;
      case View.ADMIN: return <AdminDashboard />;
      default: return <Dashboard onNavigate={(view) => setCurrentView(view as unknown as View)} />;
    }
  };

  if (showSEOLanding) { return <SEOLanding onStart={() => { setShowSEOLanding(false); if (!session) setShowLandingPage(true); }} />; }
  if (showLandingPage && !session) { return <LandingPage onEnterApp={() => { const s = localStorage.getItem('sbl_user_session'); if (s) setSession(JSON.parse(s)); setShowLandingPage(false); setShowOnboarding(true); }} />; }

  return (
    <div className="flex h-screen bg-dark-bg transition-colors duration-200 overflow-hidden relative">
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      {isAccessBlocked && <AccessGate onNavigateToBilling={() => setCurrentView(View.ACCOUNT)} />}
      <Sidebar currentView={currentView} onNavigate={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} isMobileMenuOpen={isMobileMenuOpen} onLogout={handleLogout} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between p-4 bg-dark-card border-b border-gray-800 shrink-0">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-brand-500 transition-colors"><Menu className="w-6 h-6" /></button>
          <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest leading-none">AI-POWERED</span>
              <span className="text-xs font-black text-white leading-none">SBL SYSTEM</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-xs font-bold text-white border border-brand-700">
             {session?.name ? session.name.split(' ').map(n => n[0]).join('') : 'JS'}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">{renderView()}</div>
      </main>
      <ChatAssistant />
      <div className="fixed bottom-6 right-6 z-[400] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
          {toasts.map(toast => (
              <div key={toast.id} className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-4 animate-slide-up backdrop-blur-xl ${toast.type === 'success' ? 'bg-green-900/80 border-green-500/50' : toast.type === 'error' ? 'bg-red-900/80 border-red-500/50' : 'bg-brand-900/80 border-brand-500/50'}`}>
                  <div className={`mt-0.5 rounded-full p-1 ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-brand-500/20 text-brand-400'}`}>
                      {toast.type === 'success' ? <CheckCircle2 size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
                  </div>
                  <div className="flex-1">
                      {toast.title && <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">{toast.title}</h4>}
                      <p className="text-white/80 text-sm font-medium leading-relaxed">{toast.message}</p>
                  </div>
                  <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
              </div>
          ))}
      </div>
    </div>
  );
}

export default App;
