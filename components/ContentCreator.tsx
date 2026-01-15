
import React, { useState, useRef, useEffect } from 'react';
import { generateViralPost, generateQuickViralPost, GroundingSource } from '../services/geminiService';
import { trackEvent } from '../services/analyticsService';
import { saveItem, getSavedItems } from '../services/storageService';
import { SavedItem } from '../types';
import { toPng } from 'html-to-image';
import { 
  Loader2, Copy, Check, Zap, RotateCcw, 
  MessageSquare, Wand2, Target, User, 
  FileText, Sparkles, Twitter, 
  Instagram, Linkedin, Youtube, Smartphone, Facebook, Globe,
  Upload,
  ImageIcon,
  History,
  RefreshCw,
  Edit2,
  Save,
  X,
  Search,
  Bold,
  Italic,
  List,
  Type,
  Code,
  ArrowRight,
  Flame,
  Layout,
  MessageCircle,
  Info,
  Link as LinkIcon,
  AtSign,
  ChevronDown,
  Radar,
  ExternalLink,
  Activity,
  ArrowDown,
  Anchor,
  Download,
  Palette,
  Terminal,
  Compass,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Flag,
  UserCheck,
  Camera
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import VoiceInput from './VoiceInput';
import TwitterThreadTemplate from './TwitterThreadTemplate';

type PreviewTab = 'MAIN POST (TOP POST- WITH COLORED BACKGROUND)' | 'VIRAL HOOKS' | 'COMMENT LADDER' | 'POST MENU' | 'PROMOS' | 'VIRAL DNA' | 'FACEBOOK' | 'MOCKUP SLIDES' | 'VIRAL BLOG' | 'LINKEDIN' | 'INSTA CAROUSEL' | 'X THREAD' | 'MASTER PROMPTS';
type SocialPlatform = 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'TikTok' | 'YouTube' | 'Threads';
type PostStyle = 'Full-Suite' | 'Quick-Impact';

interface HookBlock {
    id: string;
    text: string;
    imagePrompt: string;
    copyButton: boolean;
    downloadImage: boolean;
}

const PLATFORMS: { name: SocialPlatform; icon: any; color: string }[] = [
    { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { name: 'Twitter', icon: Twitter, color: 'text-gray-200' },
    { name: 'TikTok', icon: Smartphone, color: 'text-white' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { name: 'Threads', icon: MessageSquare, color: 'text-white' },
];

const TABS: PreviewTab[] = [
  'MAIN POST (TOP POST- WITH COLORED BACKGROUND)', 'VIRAL HOOKS', 'COMMENT LADDER', 'POST MENU', 'PROMOS', 'VIRAL DNA', 'FACEBOOK', 'MOCKUP SLIDES', 'VIRAL BLOG', 'LINKEDIN', 'INSTA CAROUSEL', 'X THREAD', 'MASTER PROMPTS'
];

const TONES = [
  { id: 'High-Status SBL', label: 'Architect', desc: 'Authoritative & Direct' },
  { id: 'Educational Sage', label: 'Sage', desc: 'Helpful & Insightful' },
  { id: 'Casual Hacker', label: 'Hustler', desc: 'Raw & Fast-paced' },
  { id: 'Minimalist Elite', label: 'Elite', desc: 'Short & Impactful' },
];

const BG_STYLES = [
  { id: 'navy', from: 'from-[#0A192F]', to: 'to-[#020C1B]', text: 'text-white', border: 'border-white/10', dot: 'bg-[#0A192F]' },
  { id: 'emerald', from: 'from-brand-600', to: 'to-brand-900', text: 'text-white', border: 'border-white/10', dot: 'bg-brand-600' },
  { id: 'crimson', from: 'from-red-600', to: 'to-red-900', text: 'text-white', border: 'border-white/10', dot: 'bg-red-600' },
  { id: 'amber', from: 'from-amber-400', to: 'to-amber-500', text: 'text-gray-950', border: 'border-black/10', dot: 'bg-amber-400' },
  { id: 'clean', from: 'from-white', to: 'to-gray-100', text: 'text-gray-950', border: 'border-gray-200', dot: 'bg-white' },
];

const STORAGE_KEY = 'sbl_autosave_launchpad_v11';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Chinese', 'Japanese', 'Arabic'
];

const ContentCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [sections, setSections] = useState<{title: string, content: string}[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PreviewTab>('MAIN POST (TOP POST- WITH COLORED BACKGROUND)');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeBgIdx, setActiveBgIdx] = useState(0);
  const [individualHookStyles, setIndividualHookStyles] = useState<Record<string, number>>({});
  const [isExporting, setIsExporting] = useState<string | null>(null); // Track specific hook ID
  const [isContentVisible, setIsContentVisible] = useState(false);
  
  const hookRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Sub-editing state for the ladder
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubValue, setEditSubValue] = useState('');

  const [useDeepResearch, setUseDeepResearch] = useState(false);
  const [researchSources, setResearchSources] = useState<GroundingSource[]>([]);

  // Branding Persona States
  const [profileName, setProfileName] = useState('James Shizha');
  const [profileHandle, setProfileHandle] = useState('@GreenNova');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form States
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('Facebook');
  const [postStyle, setPostStyle] = useState<PostStyle>('Full-Suite');
  const [nicheTopic, setNicheTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [goals, setGoals] = useState('');
  const [language, setLanguage] = useState('English');
  const [offerName, setOfferName] = useState('');
  const [offerUrl, setOfferUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ctaKeyword, setCtaKeyword] = useState('INFO');
  const [sourceUrl, setSourceUrl] = useState('');
  const [brandTone, setBrandTone] = useState('High-Status SBL');

  // Handle intersection observer for generated content animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsContentVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [sections, activeTab]);
  
  const parseSections = (text: string) => {
    const markers = [
        'MAIN POST (TOP POST- WITH COLORED BACKGROUND)', 'MAIN POST', 'VIRAL HOOKS', 'COMMENT LADDER', 'POST MENU', 'PROMOS', 'VIRAL DNA', 'FACEBOOK', 'MOCKUP SLIDES', 'VIRAL BLOG', 'LINKEDIN', 'INSTA CAROUSEL', 'X THREAD', 'MASTER PROMPTS'
    ];
    const results: {title: string, content: string}[] = [];
    
    markers.forEach((marker) => {
        const regexMarker = new RegExp(`### (?:\\d️⃣ )?${marker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'gi');
        const altMarker = new RegExp(`\\*\\*${marker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\*\\*`, 'gi');
        
        const match = regexMarker.exec(text) || altMarker.exec(text);
        if (!match) return;

        const start = match.index + match[0].length;
        let end = text.length;

        markers.forEach(nextMarker => {
            const nextRegex = new RegExp(`### (?:\\d️⃣ )?${nextMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'gi');
            const nextAlt = new RegExp(`\\*\\*${nextMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\*\\*`, 'gi');
            
            const nextMatch = nextRegex.exec(text.substring(start)) || nextAlt.exec(text.substring(start));
            if (nextMatch) {
                const absoluteNext = start + nextMatch.index;
                if (absoluteNext < end) end = absoluteNext;
            }
        });

        const normalizedTitle = marker.includes('MAIN POST') ? 'MAIN POST (TOP POST- WITH COLORED BACKGROUND)' : marker;

        results.push({
            title: normalizedTitle as string,
            content: text.substring(start, end).trim()
        });
    });

    if (results.length === 0 && text.trim()) return [{ title: 'MAIN POST (TOP POST- WITH COLORED BACKGROUND)', content: text }];
    return results;
  };

  const parseHookBlocks = (content: string): HookBlock[] => {
      const blocks: HookBlock[] = [];
      const parts = content.split(/POST_ID:/gi).filter(p => p.trim());
      
      parts.forEach(part => {
          const idMatch = part.match(/^([^\n]+)/);
          const hookMatch = part.match(/HOOK_TEXT:\s*([\s\S]*?)(?=IMAGE_PROMPT:|$)/i);
          const promptMatch = part.match(/IMAGE_PROMPT:\s*([\s\S]*?)(?=EXPORT:|$)/i);
          const exportMatch = part.match(/EXPORT:\s*([\s\S]*?)(?=POST_ID:|$)/i);

          if (idMatch && hookMatch) {
              blocks.push({
                  id: idMatch[1].trim(),
                  text: hookMatch[1].trim(),
                  imagePrompt: promptMatch ? promptMatch[1].trim() : "",
                  copyButton: exportMatch ? exportMatch[1].includes('copy_button=true') : true,
                  downloadImage: exportMatch ? exportMatch[1].includes('download_image=true') : true
              });
          }
      });

      return blocks;
  };

  const parseThread = (content: string): string[] => {
      return content.split(/\[TWEET_SPLIT\]/gi).map(t => t.trim()).filter(t => t.length > 5);
  };

  const loadGlobalOffer = (showToast = true) => {
    const stored = localStorage.getItem('sbl_global_offer');
    if (stored) {
      try {
        const gOffer = JSON.parse(stored);
        if (gOffer.name) setOfferName(gOffer.name);
        if (gOffer.link) setOfferUrl(gOffer.link);
        if (gOffer.ctaKeyword) setCtaKeyword(gOffer.ctaKeyword);
        if (gOffer.targetAudience) setTargetAudience(gOffer.targetAudience);
        if (showToast) {
          window.dispatchEvent(new CustomEvent('sbl-toast', { 
            detail: { message: 'Synced with Global Primary Offer', type: 'info', title: 'OFFER LOADED' } 
          }));
        }
      } catch (e) {}
    }
  };

  const loadGlobalProfile = (showToast = true) => {
      const storedProfile = localStorage.getItem('sbl_user_profile');
      const storedOffer = localStorage.getItem('sbl_global_offer');
      
      if (storedProfile) {
          try {
              const p = JSON.parse(storedProfile);
              if (p.name) setProfileName(p.name);
              if (p.handle) setProfileHandle(p.handle.startsWith('@') ? p.handle : `@${p.handle}`);
              if (p.image) setProfileImage(p.image);
          } catch(e) {}
      } else if (storedOffer) {
          try {
              const o = JSON.parse(storedOffer);
              if (o.brandName) setProfileName(o.brandName);
              if (o.handle) setProfileHandle(o.handle.startsWith('@') ? o.handle : `@${o.handle}`);
              if (o.profileImage) setProfileImage(o.profileImage);
          } catch(e) {}
      }

      if (showToast) {
          window.dispatchEvent(new CustomEvent('sbl-toast', { 
              detail: { message: 'Branding Persona Loaded', type: 'info', title: 'PROFILE SYNCED' } 
          }));
      }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfileImage(reader.result as string);
              window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Profile handle image loaded', type: 'success' } }));
          };
          reader.readAsDataURL(file);
      }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let hasLoadedSaved = false;
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.nicheTopic !== undefined) setNicheTopic(p.nicheTopic);
        if (p.industry !== undefined) setIndustry(p.industry);
        if (p.painPoints !== undefined) setPainPoints(p.painPoints);
        if (p.goals !== undefined) setGoals(p.goals);
        if (p.offerName !== undefined) setOfferName(p.offerName);
        if (p.offerUrl !== undefined) setOfferUrl(p.offerUrl);
        if (p.targetAudience !== undefined) setTargetAudience(p.targetAudience);
        if (p.ctaKeyword !== undefined) setCtaKeyword(p.ctaKeyword);
        if (p.language !== undefined) setLanguage(p.language);
        if (p.sourceUrl !== undefined) setSourceUrl(p.sourceUrl);
        if (p.selectedPlatform !== undefined) setSelectedPlatform(p.selectedPlatform);
        if (p.postStyle !== undefined) setPostStyle(p.postStyle);
        if (p.brandTone !== undefined) setBrandTone(p.brandTone);
        if (p.useDeepResearch !== undefined) setUseDeepResearch(p.useDeepResearch);
        if (p.profileName) setProfileName(p.profileName);
        if (p.profileHandle) setProfileHandle(p.profileHandle);
        if (p.profileImage) setProfileImage(p.profileImage);
        if (p.individualHookStyles) setIndividualHookStyles(p.individualHookStyles);
        
        if (p.generatedContent) {
          setGeneratedContent(p.generatedContent);
          setSections(parseSections(p.generatedContent));
          setIsContentVisible(true);
        }
        hasLoadedSaved = true;
      } catch (e) {
          console.error("Autosave Restore Failed:", e);
      }
    }

    if (!hasLoadedSaved || (!offerName && !offerUrl)) {
        loadGlobalOffer(false);
        loadGlobalProfile(false);
    }

    // Auto-Generate Trigger Check
    const autoTrigger = localStorage.getItem('sbl_auto_generate_trigger');
    if (autoTrigger === 'true') {
        localStorage.removeItem('sbl_auto_generate_trigger');
        setTimeout(() => {
            handleGenerate();
        }, 300);
    }
  }, []);

  useEffect(() => {
    const state = { 
        nicheTopic, 
        industry,
        painPoints,
        goals,
        offerName, 
        offerUrl, 
        targetAudience, 
        ctaKeyword, 
        generatedContent, 
        language, 
        sourceUrl, 
        selectedPlatform,
        postStyle,
        brandTone,
        useDeepResearch,
        profileName,
        profileHandle,
        profileImage,
        individualHookStyles
    };
    const timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [
      nicheTopic, industry, painPoints, goals, offerName, offerUrl, targetAudience, ctaKeyword, 
      generatedContent, language, sourceUrl,
      selectedPlatform, postStyle, brandTone, useDeepResearch, profileName, profileHandle, profileImage,
      individualHookStyles
  ]);

  const handleGenerate = async () => {
    const effectiveOfferUrl = offerUrl || "https://greennovaailaunchpad.com";
    if (!targetAudience || !nicheTopic) {
        window.dispatchEvent(new CustomEvent('sbl-toast', { 
            detail: { message: 'Niche and Audience are mandatory.', type: 'error', title: 'FORM INCOMPLETE' } 
        }));
        return;
    }
    setLoading(true);
    setResearchSources([]);
    setIndividualHookStyles({});
    setIsContentVisible(false);
    try {
      let result = '';
      if (postStyle === 'Full-Suite') {
        result = await generateViralPost({
            style: 'Full-Suite',
            platform: selectedPlatform,
            offerName,
            offerLink: effectiveOfferUrl,
            offerDescription: "",
            ctaKeyword,
            targetAudience,
            topics: [nicheTopic],
            industry,
            painPoints,
            goals,
            hookType: "Curiosity Gap",
            language,
            brandTone,
            contentUrl: sourceUrl,
            useDeepResearch
          });
      } else {
        const quick = await generateQuickViralPost({
            style: 'Quick-Impact',
            platform: selectedPlatform,
            offerName,
            offerLink: effectiveOfferUrl,
            offerDescription: "",
            ctaKeyword,
            targetAudience,
            topics: [nicheTopic],
            industry,
            painPoints,
            goals,
            hookType: "Curiosity Gap",
            language,
            brandTone,
            useDeepResearch
        });
        result = `### MAIN POST (TOP POST- WITH COLORED BACKGROUND)\n${quick.post}\n\n### VIRAL DNA\n${quick.dna}`;
        if (quick.sources) setResearchSources(quick.sources);
      }
      
      setGeneratedContent(result);
      setSections(parseSections(result));
      trackEvent('post_generated');
      setActiveTab('MAIN POST (TOP POST- WITH COLORED BACKGROUND)');
      setIsContentVisible(true);
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Synthesis failed. Ensure API key is configured.', type: 'error' } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
      if (window.confirm("Clear all fields and reset the LaunchPad?")) {
          setNicheTopic('');
          setIndustry('');
          setPainPoints('');
          setGoals('');
          setTargetAudience('');
          setOfferName('');
          setOfferUrl('');
          setCtaKeyword('INFO');
          setSourceUrl('');
          setGeneratedContent('');
          setSections([]);
          setProfileImage(null);
          setIndividualHookStyles({});
          setIsContentVisible(false);
          localStorage.removeItem(STORAGE_KEY);
          window.dispatchEvent(new CustomEvent('sbl-toast', { 
            detail: { message: 'LaunchPad state reset.', type: 'info' } 
          }));
      }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\*/g, '').trim());
    setCopiedId(id);
    window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Asset copied to clipboard', type: 'success' } }));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToLinkedIn = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\*/g, '').trim());
    window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'LinkedIn post copied! Opening LinkedIn...', type: 'info', title: 'DISTRIBUTING ASSET' } 
    }));
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
  };

  const saveEdit = (title: string, val: string) => {
    const newSecs = sections.map(s => s.title === title ? { ...s, content: val } : s);
    setSections(newSecs);
    setGeneratedContent(newSecs.map(s => `**${s.title}**\n\n${s.content}`).join('\n\n'));
    setEditingId(null);
  };

  const saveSubEdit = (activeTabTitle: string, index: number, newValue: string) => {
      const sec = sections.find(s => s.title === activeTabTitle);
      if (!sec) return;
      
      const parts = activeTabTitle === 'X THREAD' ? parseThread(sec.content) : parseLadder(sec.content);
      parts[index] = newValue;
      
      const splitter = activeTabTitle === 'X THREAD' ? '\n\n[TWEET_SPLIT]\n\n' : '\n\n[THREAD_SPLIT]\n\n';
      const newContent = parts.join(splitter);
      saveEdit(activeTabTitle, newContent);
      setEditingSubId(null);
  };

  const parseLadder = (content: string) => {
      const split = content.includes('[THREAD_SPLIT]') 
        ? content.split(/\[THREAD_SPLIT\]/gi)
        : content.split(/\n(?=(?:\*\*Comment\s\d+\*\*|Comment\s\d+:|Strategy\s#\d+:|🎯\s?Here’s|FINAL\sOFFER|Comment\s\d+\s?-|\d+\s?-|\d+\s?[:.]))/gi);
      
      const items = split.map(s => s.trim()).filter(s => s.length > 5);
      return items;
  };

  const parseHooks = (content: string) => {
      return content.split('\n').map(s => s.trim()).filter(s => s && s.length > 5);
  };

  const handleExportHook = async (hookId: string) => {
    const el = hookRefs.current[hookId];
    if (!el) return;
    setIsExporting(hookId);
    try {
        const dataUrl = await toPng(el, { 
          cacheBust: true, 
          pixelRatio: 2,
          style: {
            fontFamily: 'Inter, sans-serif'
          },
          filter: (node) => {
            if (node instanceof HTMLLinkElement && node.href.includes('fonts.googleapis.com')) return false;
            return true;
          }
        });
        const link = document.createElement('a');
        link.download = `sbl-hook-${hookId}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Export failed', err);
    } finally {
        setIsExporting(null);
    }
  };

  const updateIndividualHookStyle = (hookId: string, styleIdx: number) => {
    setIndividualHookStyles(prev => ({
        ...prev,
        [hookId]: styleIdx
    }));
  };

  const getTabContent = () => {
    const sec = sections.find(s => s.title === activeTab);
    if (!sec) return (
        <div className="flex flex-col items-center justify-center h-full text-center opacity-20 py-20">
            <Layout size={80} className="mb-6" />
            <p className="text-xl font-black uppercase tracking-widest">Awaiting SBL Synthesis</p>
            <p className="text-sm mt-2">Fill the configuration on the left and click Architect.</p>
        </div>
    );

    const isEditing = editingId === activeTab;
    const globalStyle = BG_STYLES[activeBgIdx];

    if (activeTab === 'X THREAD' && !isEditing) {
        const tweets = parseThread(sec.content);
        return (
            <div className="animate-fade-in pb-20">
                <TwitterThreadTemplate 
                    name={profileName}
                    handle={profileHandle}
                    profileImage={profileImage || undefined}
                    isVerified={true}
                    tweets={tweets}
                />
            </div>
        );
    }

    if ((activeTab === 'MAIN POST (TOP POST- WITH COLORED BACKGROUND)' || activeTab === 'VIRAL HOOKS') && !isEditing) {
        const hookBlocks = parseHookBlocks(sec.content);
        
        let displayBlocks = hookBlocks;
        if (displayBlocks.length === 0) {
            const rawHooks = parseHooks(sec.content);
            displayBlocks = rawHooks.map((h, i) => ({
                id: activeTab === 'MAIN POST (TOP POST- WITH COLORED BACKGROUND)' && i === 0 ? 'MAIN-POST' : `HOOK-${i+1}`,
                text: h,
                imagePrompt: `Instagram square, premium dark background, bold white typography for: ${h}`,
                copyButton: true,
                downloadImage: true
            }));
        }

        return (
            <div className="space-y-12 animate-fade-in pb-20 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 px-4">
                    <div className="text-center md:text-left space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center justify-center md:justify-start gap-3">
                            <Flame className="text-orange-500" /> {activeTab === 'VIRAL HOOKS' ? 'Viral Hook Variations' : 'Main Viral Post'}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium">High-status curiosity gaps designed to force a scroll-stop.</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                         <button 
                            onClick={() => { setEditValue(sec.content); setEditingId(activeTab); }}
                            className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 flex items-center gap-2 text-xs font-bold"
                        >
                            <Edit2 size={14} /> Edit All
                        </button>
                        <button 
                            onClick={() => copyToClipboard(sec.content, activeTab)}
                            className="p-3 bg-brand-900/40 hover:bg-brand-500 text-brand-400 hover:text-white rounded-xl transition-all border border-brand-500/30 flex items-center gap-2 text-xs font-bold shadow-glow"
                        >
                            {copiedId === activeTab ? <Check size={14} /> : <Copy size={14} />} 
                            {copiedId === activeTab ? 'Copied' : 'Copy All'}
                        </button>
                    </div>
                </div>

                {displayBlocks.length === 0 ? (
                    <div className="bg-[#0B1425] border border-gray-800 rounded-[2rem] p-10 prose prose-invert max-w-none shadow-premium text-gray-200 leading-relaxed">
                        <ReactMarkdown>{sec.content}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {displayBlocks.map((hook) => {
                            const styleIdx = individualHookStyles[hook.id] ?? activeBgIdx;
                            const style = BG_STYLES[styleIdx];
                            const isMainPost = hook.id === 'MAIN-POST';
                            
                            return (
                                <div key={hook.id} className={`flex flex-col gap-6 group ${isMainPost ? 'md:col-span-2 max-w-2xl mx-auto w-full' : ''}`}>
                                    <div 
                                        ref={(el) => { hookRefs.current[hook.id] = el; }}
                                        className={`w-full aspect-square bg-gradient-to-br ${style.from} ${style.to} border ${style.border} rounded-[2.5rem] flex items-center justify-center p-12 text-center shadow-premium relative transition-all duration-500 group-hover:scale-[1.02]`}
                                    >
                                        <div className={`absolute top-6 left-6 ${style.text} opacity-30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.border}`}>
                                            {isMainPost ? 'PRIMARY ARCHITECTURE' : hook.id}
                                        </div>
                                        {isMainPost && (
                                            <div className="absolute top-6 right-6">
                                                 <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${style.border} ${style.text} opacity-60`}>
                                                     Chars: {hook.text.length}
                                                 </span>
                                            </div>
                                        )}
                                        <p className={`text-2xl md:text-3xl font-black ${style.text} leading-tight uppercase italic tracking-tighter drop-shadow-lg`}>
                                            {hook.text}
                                        </p>
                                    </div>

                                    <div className={`bg-dark-card border rounded-3xl p-6 space-y-4 shadow-xl transition-all ${isMainPost ? 'border-brand-500/50 bg-brand-900/10' : 'border-gray-800'}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Atmosphere</span>
                                                <div className="flex gap-2 p-1 bg-black/20 rounded-full w-fit">
                                                    {BG_STYLES.map((s, i) => (
                                                        <button 
                                                            key={s.id}
                                                            onClick={() => updateIndividualHookStyle(hook.id, i)}
                                                            className={`w-4 h-4 rounded-full border transition-all ${styleIdx === i ? 'border-brand-500 scale-125' : 'border-transparent opacity-40 hover:opacity-100'} ${s.dot}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {isMainPost && (
                                                    <button 
                                                        onClick={() => copyToClipboard(hook.text, `main-copy-post`)}
                                                        className="p-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl transition-all shadow-glow flex items-center gap-2 text-[10px] font-black uppercase ring-4 ring-brand-500/10"
                                                    >
                                                        {copiedId === `main-copy-post` ? <Check size={14} /> : <Zap size={14} />}
                                                        {copiedId === `main-copy-post` ? 'Copied' : 'Copy SBL Post'}
                                                    </button>
                                                )}
                                                {hook.copyButton && !isMainPost && (
                                                    <button 
                                                        onClick={() => copyToClipboard(hook.text, `hook-txt-${hook.id}`)}
                                                        className="p-2.5 bg-gray-800 hover:bg-brand-500/20 text-gray-400 hover:text-brand-500 rounded-xl transition-all border border-gray-700 flex items-center gap-2 text-[10px] font-black uppercase"
                                                        title="Copy Hook Text"
                                                    >
                                                        {copiedId === `hook-txt-${hook.id}` ? <Check size={12} /> : <Copy size={12} />}
                                                        {copiedId === `hook-txt-${hook.id}` ? 'Copied' : 'Text'}
                                                    </button>
                                                )}
                                                {hook.downloadImage && (
                                                    <button 
                                                        onClick={() => handleExportHook(hook.id)}
                                                        disabled={isExporting === hook.id}
                                                        className={`p-2.5 rounded-xl transition-all shadow-glow flex items-center gap-2 text-[10px] font-black uppercase ${isMainPost ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-brand-500 hover:bg-brand-400 text-white'}`}
                                                        title="Download Visual"
                                                    >
                                                        {isExporting === hook.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                                        PNG
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-brand-500 uppercase tracking-widest opacity-60">Neural Image Prompt</label>
                                            <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-gray-500 italic relative group/prompt">
                                                {hook.imagePrompt}
                                                <button 
                                                    onClick={() => copyToClipboard(hook.imagePrompt, `hook-prompt-${hook.id}`)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover/prompt:opacity-100 transition-opacity p-1.5 bg-gray-800 rounded-lg text-white"
                                                >
                                                    {copiedId === `hook-prompt-${hook.id}` ? <Check size={10} /> : <Copy size={10} />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-bold uppercase ${hook.text.length > 130 ? 'text-red-400' : 'text-gray-600'}`}>
                                                    Length: {hook.text.length}/130
                                                </span>
                                                {hook.text.length > 130 && <AlertCircle size={10} className="text-red-400" />}
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 shadow-glow shadow-green-500/50"></span>
                                                <span className="text-[9px] font-black text-gray-500 uppercase">System Ready</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 mt-10">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <Palette size={12} /> Global Atmosphere Reset
                    </label>
                    <div className="flex gap-4 p-2 bg-dark-card border border-gray-800 rounded-full shadow-lg">
                        {BG_STYLES.map((s, i) => (
                            <button 
                                key={s.id}
                                onClick={() => {
                                    setActiveBgIdx(i);
                                    // Optionally clear individual styles to match global reset
                                    setIndividualHookStyles({});
                                }}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${activeBgIdx === i ? 'border-brand-500 scale-125 ring-4 ring-brand-500/10' : 'border-transparent opacity-60 hover:opacity-100' } ${s.dot}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'COMMENT LADDER' && !isEditing) {
        const ladderParts = parseLadder(sec.content);

        return (
            <div className="space-y-12 animate-fade-in pb-20 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 px-4">
                    <div className="text-center md:text-left space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">SBL 8-Step Conversion Ladder</h3>
                        <p className="text-gray-500 text-sm font-medium">Deep-targeted content sequence bridged to your offer.</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                         <button 
                            onClick={() => { setEditValue(sec.content); setEditingId(activeTab); }}
                            className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 flex items-center gap-2 text-xs font-bold"
                        >
                            <Edit2 size={14} /> Edit All
                        </button>
                        <button 
                            onClick={() => copyToClipboard(sec.content, activeTab)}
                            className="p-3 bg-brand-900/40 hover:bg-brand-500 text-brand-400 hover:text-white rounded-xl transition-all border border-brand-500/30 flex items-center gap-2 text-xs font-bold shadow-glow"
                        >
                            {copiedId === activeTab ? <Check size={14} /> : <Copy size={14} />} 
                            {copiedId === activeTab ? 'Copied' : 'Copy All'}
                        </button>
                    </div>
                </div>

                {ladderParts.map((content, idx) => {
                    const isContext = idx === 0;
                    const isFinale = idx === ladderParts.length - 1;
                    const isStrategy = !isContext && !isFinale;
                    const isCurrentlyEditing = editingSubId === `ladder-${idx}`;
                    
                    let phaseLabel = `Phase 0${idx + 1}`;
                    let phaseTitle = isContext ? "Problem Deep-Dive" : isFinale ? "The System Reveal" : "Strategic Value Thread";
                    
                    return (
                        <div key={idx} className="space-y-4 relative">
                            {isStrategy && (
                                <div className="absolute left-[39px] -top-12 bottom-0 w-0.5 bg-gray-800/30 -z-10"></div>
                            )}
                            
                            <div className="flex justify-between items-end px-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isContext || isFinale ? 'text-brand-500' : 'text-gray-500'}`}>
                                    {phaseLabel}: {phaseTitle}
                                </span>
                            </div>

                            <div className={`
                                border transition-all relative group rounded-3xl p-8 
                                ${isCurrentlyEditing ? 'border-brand-500 bg-brand-900/5' : 'border-gray-800 bg-[#0B1425] hover:border-brand-500/20'}
                                ${isFinale ? 'bg-brand-900/10 border-brand-500/30 shadow-glow shadow-brand-500/5' : ''}
                            `}>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-100 group-hover:opacity-100 transition-opacity z-10">
                                    {!isCurrentlyEditing && (
                                        <>
                                            <button 
                                                onClick={() => { setEditSubValue(content); setEditingSubId(`ladder-${idx}`); }}
                                                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 shadow-sm flex items-center gap-2 text-[10px] font-black uppercase"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => copyToClipboard(content, `ladder-copy-${idx}`)}
                                                className="p-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl transition-all shadow-glow flex items-center gap-2 text-[10px] font-black uppercase"
                                            >
                                                {copiedId === `ladder-copy-${idx}` ? <Check size={12} /> : <Copy size={12} />} 
                                                {copiedId === `ladder-copy-${idx}` ? 'Copied' : 'Copy'}
                                            </button>
                                        </>
                                    )}
                                </div>

                                {isCurrentlyEditing ? (
                                    <div className="space-y-4">
                                        <textarea 
                                            value={editSubValue}
                                            onChange={(e) => setEditSubValue(e.target.value)}
                                            className="w-full bg-black/40 border border-brand-500/30 rounded-2xl p-6 text-white text-sm leading-relaxed min-h-[250px] outline-none font-mono"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setEditingSubId(null)} className="px-4 py-2 text-gray-500 font-bold hover:text-white text-xs uppercase tracking-widest">Cancel</button>
                                            <button onClick={() => saveSubEdit(activeTab, idx, editSubValue)} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-glow flex items-center gap-2">
                                                <Save size={14} /> Save Thread
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-lg max-w-none">
                                        <ReactMarkdown>{content}</ReactMarkdown>
                                    </div>
                                )}
                                
                                {isFinale && !isCurrentlyEditing && (
                                    <div className="mt-8 p-4 bg-brand-500/20 rounded-xl border border-brand-500/30 flex items-center gap-3">
                                        <Zap className="text-brand-400" size={20} />
                                        <p className="text-xs font-bold text-brand-300">Protocol complete. This sequence forces deep retention and bridges directly to your sales funnel.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (activeTab === 'LINKEDIN' && !isEditing) {
        return (
            <div className="space-y-6 animate-fade-in pb-20">
                <div className="flex justify-between items-center px-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LinkedIn Suite</span>
                        <h3 className="text-sm font-black text-brand-400 uppercase tracking-[0.2em]">Authority Artifact</h3>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setEditValue(sec.content); setEditingId(activeTab); }}
                            className="p-2.5 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all border border-gray-700 flex items-center gap-2 text-xs font-bold"
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                        <button 
                            onClick={() => handleShareToLinkedIn(sec.content)}
                            className="p-2.5 bg-[#0a66c2] rounded-xl text-white hover:bg-[#004182] transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
                        >
                            <Linkedin size={14} /> Share to LinkedIn
                        </button>
                    </div>
                </div>

                <div className="bg-[#1b1f23] border border-gray-800 rounded-[2rem] p-10 prose prose-invert max-w-none shadow-premium text-gray-200 leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown>{sec.content}</ReactMarkdown>
                </div>
            </div>
        );
    }

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex justify-between items-center px-4">
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Category</span>
              <h3 className="text-sm font-black text-brand-400 uppercase tracking-[0.2em]">{activeTab}</h3>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <button onClick={() => { setEditValue(sec.content); setEditingId(activeTab); }} className="p-2.5 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all border border-gray-700 flex items-center gap-2 text-xs font-bold">
                <Edit2 size={14} /> Edit
              </button>
            )}
            <button onClick={() => copyToClipboard(sec.content, activeTab)} className="p-2.5 bg-gray-800 rounded-xl text-gray-400 hover:text-brand-500 transition-all border border-gray-700 flex items-center gap-2 text-xs font-bold">
              {copiedId === activeTab ? <Check size={14} className="text-brand-500" /> : <Copy size={14} />} Copy
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="bg-gray-800 rounded-[2rem] p-6 border border-brand-500/30 overflow-hidden shadow-2xl">
             <textarea 
               value={editValue} 
               onChange={(e) => setEditValue(e.target.value)}
               className="w-full bg-transparent border-none outline-none text-white text-lg leading-relaxed h-[500px] resize-none font-mono"
               autoFocus
             />
             <div className="flex justify-end gap-3 mt-4">
               <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-400 font-bold hover:text-white">Cancel</button>
               <button onClick={() => saveEdit(activeTab, editValue)} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold flex items-center gap-2">
                 <Save size={16} /> Save Changes
               </button>
             </div>
          </div>
        ) : (
          <div className="bg-[#0B1425] border border-gray-800 rounded-[2rem] p-10 prose prose-invert max-w-none shadow-premium text-gray-200 leading-relaxed whitespace-pre-wrap">
             <ReactMarkdown>{sec.content}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Config Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-card rounded-[2.5rem] border border-gray-800 shadow-premium p-8 sticky top-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-brand-500" size={24} /> Viral LaunchPad
                </h2>
                <div className="flex items-center gap-3">
                    <button onClick={handleResetForm} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-1" title="Reset all fields">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            <div className="space-y-8">
              {/* STYLE SELECTOR */}
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Architecting Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPostStyle('Full-Suite')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${postStyle === 'Full-Suite' ? 'bg-brand-900/20 border-brand-500 text-white' : 'bg-dark-input border-gray-700 text-gray-500 hover:border-gray-600'}`}
                      >
                          <Terminal size={18} className={postStyle === 'Full-Suite' ? 'text-brand-400' : 'text-gray-600'} />
                          <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase">Full Suite</p>
                              <p className="text-[8px] opacity-60">11 High-Status Assets</p>
                          </div>
                      </button>
                      <button 
                        onClick={() => setPostStyle('Quick-Impact')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${postStyle === 'Quick-Impact' ? 'bg-brand-900/20 border-brand-500 text-white' : 'bg-dark-input border-gray-700 text-gray-500 hover:border-gray-600'}`}
                      >
                          <Zap size={18} className={postStyle === 'Quick-Impact' ? 'text-brand-400' : 'text-gray-600'} />
                          <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase">Quick Impact</p>
                              <p className="text-[8px] opacity-60">1 Super-Targeted Post</p>
                          </div>
                      </button>
                  </div>
              </div>

              {/* BRANDING PERSONA SECTION */}
              <div className="pt-4 space-y-6 border-t border-gray-800">
                <div className="flex justify-between items-center mb-1.5 ml-1">
                    <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <UserCheck size={14} /> Branding Persona
                    </h3>
                    <button onClick={() => loadGlobalProfile()} className="text-[10px] font-black text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                        <RefreshCw size={10} /> Sync Global
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {/* Circle Loader Feature */}
                    <div className="flex flex-col items-center gap-3">
                        <div 
                            onClick={() => profileImageInputRef.current?.click()}
                            className="relative group cursor-pointer"
                        >
                            <div className="w-24 h-24 rounded-full border-2 border-brand-500/50 p-1 bg-dark-bg group-hover:border-brand-500 transition-all shadow-glow-sm overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-dark-input flex items-center justify-center text-brand-500/30 group-hover:text-brand-500 transition-colors">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Load Handle</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => profileImageInputRef.current?.click()}
                            className="text-[9px] font-black text-gray-500 hover:text-brand-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
                        >
                            <Upload size={10} /> Load Profile Image
                        </button>
                        <input 
                            type="file" 
                            ref={profileImageInputRef} 
                            onChange={handleProfileImageUpload} 
                            className="hidden" 
                            accept="image/*" 
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input 
                                    value={profileName} 
                                    onChange={(e) => setProfileName(e.target.value)} 
                                    placeholder="Your Name" 
                                    className="w-full bg-dark-input border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Social Handle</label>
                            <div className="relative">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input 
                                    value={profileHandle} 
                                    onChange={(e) => setProfileHandle(e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`)} 
                                    placeholder="@handle" 
                                    className="w-full bg-dark-input border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* PLATFORM SELECTOR */}
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Distribution Target</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 gap-2">
                      {PLATFORMS.map((p) => (
                          <button 
                            key={p.name}
                            onClick={() => setSelectedPlatform(p.name)}
                            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${selectedPlatform === p.name ? 'bg-brand-900/20 border-brand-500 ' + p.color : 'bg-dark-input border-gray-700 text-gray-500 hover:border-gray-600'}`}
                            title={p.name}
                          >
                              <p.icon size={16} />
                          </button>
                      ))}
                  </div>
              </div>

              {/* STRATEGY INPUTS */}
              <div className="pt-4 space-y-6 border-t border-gray-800">
                <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <ShieldCheck size={14} /> Strategy & Identity
                </h3>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Briefcase size={12} /> My Industry
                    </label>
                    <div className="relative">
                        <input 
                          value={industry} 
                          onChange={(e) => setIndustry(e.target.value)} 
                          placeholder="e.g. Construction, Hospitality, SaaS" 
                          className="w-full bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-700 font-bold pr-12" 
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceInput onTranscript={(t) => setIndustry(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">The Topic / Hook</label>
                    <div className="relative">
                        <input 
                          value={nicheTopic} 
                          onChange={(e) => setNicheTopic(e.target.value)} 
                          placeholder="e.g. Scaling with AI Automation" 
                          className="w-full bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 font-bold pr-12" 
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceInput onTranscript={(t) => setNicheTopic(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Pain Points & Challenges
                    </label>
                    <div className="relative">
                        <textarea 
                          value={painPoints} 
                          onChange={(e) => setPainPoints(e.target.value)} 
                          placeholder="What problems are you solving? e.g. Manual data entry, low lead quality..." 
                          className="w-full bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 h-24 resize-none pr-12" 
                        />
                        <div className="absolute right-2 bottom-2">
                          <VoiceInput onTranscript={(t) => setPainPoints(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Flag size={12} /> Business Goals
                    </label>
                    <div className="relative">
                        <input 
                          value={goals} 
                          onChange={(e) => setGoals(e.target.value)} 
                          placeholder="e.g. 50 new leads, brand awareness, sales" 
                          className="w-full bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 pr-12" 
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceInput onTranscript={(t) => setGoals(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Audience</label>
                    <div className="relative">
                        <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. 9-5 corporate workers, small biz owners" className="w-full bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 pr-12" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceInput onTranscript={(t) => setTargetAudience(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                    </div>
                </div>
              </div>

              {/* OFFER INPUTS */}
              <div className="pt-4 space-y-6 border-t border-gray-800">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <LinkIcon size={14} /> Monetization Bridge
                </h3>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">The Offer Link</label>
                        <button onClick={() => loadGlobalOffer()} className="text-[10px] font-black text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                            <RefreshCw size={10} /> Sync Global
                        </button>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <input value={offerName} onChange={(e) => setOfferName(e.target.value)} placeholder="Offer Name" className="w-full bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 pr-12" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceInput onTranscript={(t) => setOfferName(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                      </div>
                      <input value={offerUrl} onChange={(e) => setOfferUrl(e.target.value)} placeholder="https://yourlink.com" className="w-full bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Language</label>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-dark-input border border-gray-700 rounded-xl px-3 py-3.5 text-xs text-white outline-none">
                          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest ml-1">CTA Keyword</label>
                        <input value={ctaKeyword} onChange={(e) => setCtaKeyword(e.target.value)} placeholder="KEYWORD" className="w-full bg-dark-input border border-gray-700 rounded-xl px-4 py-3.5 text-xs text-white font-black outline-none" />
                    </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                  <button onClick={handleGenerate} disabled={loading} className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 border-transparent ${loading ? 'bg-brand-50 text-gray-500 border-transparent cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800 text-white shadow-glow active:scale-95'}`}>
                      {loading ? <Loader2 className="animate-spin" size={24} /> : <Compass size={24} />}
                      {loading ? 'Synthesizing...' : `Architect ${postStyle === 'Full-Suite' ? 'Suite' : 'Post'}`}
                  </button>
              </div>

              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center gap-2">
                  <Info size={16} className="text-blue-400 shrink-0" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">System state is automatically saved. Provide deep context for industry-aligned content.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 bg-dark-card rounded-[2.5rem] border border-gray-800 shadow-premium flex flex-col h-[900px] overflow-hidden">
          <div className="flex border-b border-gray-800 shrink-0 bg-dark-card/30 overflow-x-auto custom-scrollbar">
            {TABS.filter(tab => sections.some(s => s.title === tab)).map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-6 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                 {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-500 shadow-glow"></div>}
               </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#020C1B]">
            {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <Loader2 size={64} className="animate-spin text-brand-500 mb-6 opacity-40" />
                    <h3 className="text-white font-serif font-bold text-2xl mb-3">Deep SBL Synthesis Active</h3>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">AI is architecting high-converting sequential copy aligned with {industry || 'your industry'} values and preferences.</p>
                </div>
            ) : (
                <div className={`generated-content ${isContentVisible ? 'reveal' : ''}`} ref={observerRef}>
                    {getTabContent()}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreator;
