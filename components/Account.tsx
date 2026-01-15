
import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import { getSavedItems } from '../services/storageService';
import { createPayPalOrder, capturePayPalOrder, TIER_PRICES } from '../services/paypalService';
import { analyzeSubscription } from '../services/geminiService';
// Added Edit2 to the imports
import { Settings, CreditCard, LogOut, Database, ExternalLink, Save, User, Share2, Copy, Check, Crown, Zap, AlertTriangle, Lock, Loader2, Activity, TrendingUp, RefreshCw, MessageSquare, Receipt, Download, Target, Briefcase, DollarSign, Globe, Clock, Palette, Upload, Trash2, Camera, ShieldCheck, Edit2 } from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';

interface AccountProps {
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

interface UserSession {
    name: string;
    email: string;
    createdAt: number;
    subscriptionStatus: 'Active' | 'Inactive';
}

interface SubscriptionState {
  plan: 'Free Trial' | 'Monthly Starter' | 'Annual Pro';
  status: 'Active' | 'Past Due' | 'Cancelled';
  renewalDate: string;
  features: {
    postsUsed: number;
    postsLimit: number;
    storageUsedMB: number;
    storageLimitMB: number;
  };
}

interface GlobalOffer {
    name: string;
    link: string;
    description: string;
    targetAudience: string;
    pricePoint: string;
    transformation: string;
    ctaKeyword: string;
}

interface AnalysisResult {
    cancellation_risk: number;
    renewal_action: string;
    plan_change: string;
    message_template: string;
    priority_score: number;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: 'Success' | 'Refunded';
  method: string;
}

const Account: React.FC<AccountProps> = ({ onNavigate, onLogout }) => {
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  
  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserSession>(() => {
      const stored = localStorage.getItem('sbl_user_session');
      return stored ? JSON.parse(stored) : { name: 'James Shizha', email: 'james@sblsystem.com', createdAt: Date.now(), subscriptionStatus: 'Inactive' };
  });
  const [emailError, setEmailError] = useState('');

  // Branding State
  const [appLogo, setAppLogo] = useState<string | null>(() => localStorage.getItem('sbl_app_logo'));
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Global Offer State
  const [offer, setOffer] = useState<GlobalOffer>({
      name: '',
      link: '',
      description: '',
      targetAudience: '',
      pricePoint: '',
      transformation: '',
      ctaKeyword: ''
  });
  const [isEditingOffer, setIsEditingOffer] = useState(false);

  // Subscription State
  const [subscription, setSubscription] = useState<SubscriptionState>({
    plan: 'Free Trial',
    status: 'Active',
    renewalDate: new Date(profile.createdAt + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    features: {
      postsUsed: 0,
      postsLimit: 50,
      storageUsedMB: 0,
      storageLimitMB: 100
    }
  });

  // Payment History State
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);

  // AI Analysis State
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const appLink = "https://ai.studio/apps/drive/1SUqMKJCeWEgGBdZJOZtCRr89lvfcGNaq?fullscreenApplet=true";

  useEffect(() => {
    // 1. Load Data Stats
    const items = getSavedItems();
    setSavedItemsCount(items.length);
    const json = JSON.stringify(items);
    const bytes = new Blob([json]).size;
    const mbUsed = parseFloat((bytes / (1024 * 1024)).toFixed(2));
    
    // 2. Sync Subscription with User Session
    const storedSub = localStorage.getItem('sbl_subscription');
    if (profile.subscriptionStatus === 'Active') {
        const subData = storedSub ? JSON.parse(storedSub) : {
            plan: 'Monthly Starter',
            status: 'Active',
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            features: { postsUsed: items.length, postsLimit: 500, storageUsedMB: mbUsed, storageLimitMB: 1000 }
        };
        setSubscription(subData);
    } else {
        setSubscription(prev => ({
            ...prev,
            plan: 'Free Trial',
            status: (Date.now() - profile.createdAt) < (15 * 24 * 60 * 60 * 1000) ? 'Active' : 'Cancelled',
            renewalDate: new Date(profile.createdAt + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            features: {
                ...prev.features,
                postsUsed: items.length,
                storageUsedMB: mbUsed < 0.1 ? 0.1 : mbUsed
            }
        }));
    }

    // 3. Load Global Offer
    const storedOffer = localStorage.getItem('sbl_global_offer');
    if (storedOffer) {
        setOffer(JSON.parse(storedOffer));
    }

    // Load Payment History
    const storedHistory = localStorage.getItem('sbl_payment_history');
    if (storedHistory) {
        setPaymentHistory(JSON.parse(storedHistory));
    }

    // 4. Handle PayPal Return
    const handlePaymentReturn = async () => {
        const params = new URLSearchParams(window.location.search);
        const isSuccess = params.get('payment_success');
        const token = params.get('token'); 
        const payerId = params.get('PayerID');
        const tier = params.get('tier') as 'pro' | 'agency' || 'pro';

        if (isSuccess === 'true' && token && payerId) {
            setProcessingPayment(true);
            try {
                await capturePayPalOrder(token);
                
                // Update Session Status
                const updatedSession = { ...profile, subscriptionStatus: 'Active' as const };
                setProfile(updatedSession);
                localStorage.setItem('sbl_user_session', JSON.stringify(updatedSession));

                const newSub: SubscriptionState = {
                    plan: tier === 'agency' ? 'Annual Pro' : 'Monthly Starter',
                    status: 'Active',
                    renewalDate: new Date(Date.now() + (tier === 'agency' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    features: {
                        postsUsed: items.length,
                        postsLimit: tier === 'agency' ? 9999 : 500,
                        storageUsedMB: mbUsed,
                        storageLimitMB: tier === 'agency' ? 10000 : 1000
                    }
                };
                
                setSubscription(newSub);
                localStorage.setItem('sbl_subscription', JSON.stringify(newSub));

                const amount = tier === 'agency' ? '99.00' : '10.00';
                const newRecord: PaymentRecord = {
                    id: token,
                    date: new Date().toISOString(),
                    amount: amount,
                    plan: tier === 'agency' ? 'Annual Pro' : 'Monthly Starter',
                    status: 'Success',
                    method: 'PayPal'
                };
                
                const currentHistory = JSON.parse(localStorage.getItem('sbl_payment_history') || '[]');
                if (!currentHistory.some((r: PaymentRecord) => r.id === newRecord.id)) {
                    const updatedHistory = [newRecord, ...currentHistory];
                    localStorage.setItem('sbl_payment_history', JSON.stringify(updatedHistory));
                    setPaymentHistory(updatedHistory);
                }

                setPaymentSuccess(`Successfully upgraded to ${tier === 'agency' ? 'Annual Pro' : 'Monthly Starter'} Plan!`);
                window.history.replaceState({}, '', window.location.pathname);
            } catch (error) {
                console.error(error);
                setPaymentError("Payment capture failed. Please contact support.");
            } finally {
                setProcessingPayment(false);
            }
        } else if (params.get('payment_cancel') === 'true') {
            setPaymentError("Payment was cancelled.");
            window.history.replaceState({}, '', window.location.pathname);
        }
    };

    handlePaymentReturn();
  }, []);

  // Auto-Save Profile and Global Offer for robust persistence
  useEffect(() => {
    const timer = setTimeout(() => {
        if (isEditing) {
            localStorage.setItem('sbl_user_session', JSON.stringify(profile));
            // Also sync to landing page identity hints
            localStorage.setItem('sbl_last_user_hint', JSON.stringify({ name: profile.name, mail: profile.email }));
        }
    }, 1000);
    return () => clearTimeout(timer);
  }, [profile, isEditing]);

  useEffect(() => {
      const timer = setTimeout(() => {
          if (isEditingOffer) {
            localStorage.setItem('sbl_global_offer', JSON.stringify(offer));
          }
      }, 1000);
      return () => clearTimeout(timer);
  }, [offer, isEditingOffer]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setAppLogo(base64);
              localStorage.setItem('sbl_app_logo', base64);
              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new CustomEvent('sbl-toast', { 
                  detail: { message: 'System logo updated successfully', type: 'success', title: 'BRANDING UPDATED' } 
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleResetLogo = () => {
      if (window.confirm("Reset application logo to default GreenNova branding?")) {
          setAppLogo(null);
          localStorage.removeItem('sbl_app_logo');
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('sbl-toast', { 
              detail: { message: 'Branding reset to system defaults', type: 'info' } 
          }));
      }
  };

  const saveOffer = () => {
      localStorage.setItem('sbl_global_offer', JSON.stringify(offer));
      setIsEditingOffer(false);
      window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Primary Offer saved globally. Consuming tools will now auto-fill.', type: 'success', title: 'OFFER UPDATED' } 
      }));
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.removeItem('sbl_system_saved_content');
      localStorage.removeItem('sbl_payment_history');
      localStorage.removeItem('sbl_global_offer');
      localStorage.removeItem('sbl_subscription');
      localStorage.removeItem('sbl_app_logo');
      localStorage.removeItem('sbl_landing_form_cache');
      setSavedItemsCount(0);
      setAppLogo(null);
      setSubscription(prev => ({
        ...prev,
        plan: 'Free Trial',
        features: { ...prev.features, postsUsed: 0, storageUsedMB: 0 }
      }));
      setPaymentHistory([]);
      alert('Local data cleared.');
    }
  };

  const handlePayPalUpgrade = async (tier: 'pro' | 'agency') => {
    if (subscription.plan === (tier === 'agency' ? 'Annual Pro' : 'Monthly Starter')) {
        alert("You are already on this plan!");
        return;
    }

    setProcessingPayment(true);
    setPaymentError('');
    
    try {
        const order = await createPayPalOrder(tier, profile.email); 
        const approveLink = order.links.find((link: any) => link.rel === "approve");
        if (approveLink) {
            window.location.href = approveLink.href;
        } else {
            throw new Error("No approval link found in PayPal response");
        }
    } catch (error: any) {
        console.error("PayPal Error:", error);
        setPaymentError(error.message || "Failed to initiate payment");
        setProcessingPayment(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const toggleEdit = () => {
      if (isEditing) {
          if (!validateEmail(profile.email)) {
              setEmailError('Please enter a valid email address.');
              return;
          }
          setEmailError('');
          localStorage.setItem('sbl_user_session', JSON.stringify(profile));
          window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Profile Updated', type: 'success' } }));
      }
      setIsEditing(!isEditing);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(appLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const calculateProgress = (used: number, limit: number) => {
    return Math.min(100, (used / limit) * 100);
  };

  const getTrialDaysLeft = () => {
      const fifteenDays = 15 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - profile.createdAt;
      const remaining = Math.max(0, fifteenDays - elapsed);
      return Math.ceil(remaining / (24 * 60 * 60 * 1000));
  };

  if (processingPayment) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
              <Loader2 className="w-16 h-16 text-brand-500 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h2>
              <p className="text-gray-500 dark:text-gray-400">Please wait while we confirm your subscription.</p>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">My Account</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile, primary offer, and subscription.</p>
      </div>

      {paymentSuccess && (
          <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl flex items-center mb-6 animate-fade-in">
              <Check className="w-5 h-5 mr-2" />
              {paymentSuccess}
          </div>
      )}

      {paymentError && (
          <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-xl flex items-center mb-6 animate-fade-in">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {paymentError}
          </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-lg text-white text-3xl font-black shrink-0 border-4 border-white dark:border-gray-700">
           {profile.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 text-center md:text-left w-full">
           {isEditing ? (
               <div className="space-y-3 max-w-sm mx-auto md:mx-0">
                   <div>
                       <label className="text-xs font-bold text-gray-500 uppercase ml-1">Display Name</label>
                       <input 
                           value={profile.name} 
                           onChange={(e) => setProfile({...profile, name: e.target.value})}
                           className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                       />
                   </div>
                   <div>
                       <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                       <input 
                           value={profile.email} 
                           onChange={(e) => {
                               setProfile({...profile, email: e.target.value});
                               if (emailError) setEmailError('');
                           }}
                           className={`w-full p-2 bg-gray-50 dark:bg-gray-900 border ${emailError ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg text-gray-500 dark:text-gray-300 text-sm focus:ring-2 focus:ring-brand-500 outline-none`}
                       />
                       {emailError && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{emailError}</p>}
                   </div>
               </div>
           ) : (
               <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
               </>
           )}
           
           {!isEditing && (
             <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border 
                    ${subscription.plan === 'Annual Pro' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' 
                        : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700'}`}>
                    {subscription.plan}
                </span>
                <span className="text-xs text-gray-400">Created {new Date(profile.createdAt).toLocaleDateString()}</span>
             </div>
           )}
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[160px]">
            <button 
                onClick={toggleEdit}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center
                    ${isEditing 
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-glow' 
                        : 'bg-brand-900 dark:bg-white text-white dark:text-gray-900 hover:bg-brand-800 dark:hover:bg-gray-100 border-2 border-brand-700 dark:border-white'}`
                }
            >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
            <button onClick={onLogout} className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center">
                <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
        </div>
      </div>

      {/* Global Offer Management */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                      <Target className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">Primary Digital Offer</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Centralized monetization context</p>
                  </div>
              </div>
              {!isEditingOffer ? (
                  <button 
                    onClick={() => setIsEditingOffer(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                      <Edit2 size={14} /> Edit Context
                  </button>
              ) : (
                  <button 
                    onClick={saveOffer}
                    className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-500 shadow-glow transition-all flex items-center gap-2"
                  >
                      <Save size={14} /> Finalize Offer
                  </button>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Offer Identity (Name)</label>
                      {isEditingOffer ? (
                          <input 
                              value={offer.name}
                              onChange={(e) => setOffer({...offer, name: e.target.value})}
                              placeholder="e.g. SBL System Mastery"
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      ) : (
                          <div className="p-3 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white min-h-[46px]">
                              {offer.name || <span className="opacity-20">Not Set</span>}
                          </div>
                      )}
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Sales Link / URL</label>
                      {isEditingOffer ? (
                          <input 
                              value={offer.link}
                              onChange={(e) => setOffer({...offer, link: e.target.value})}
                              placeholder="https://..."
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      ) : (
                          <div className="p-3 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-700 rounded-xl text-sm text-gray-400 truncate flex items-center gap-2">
                              <Globe size={14} className="opacity-40" />
                              {offer.link || <span className="opacity-20">Not Set</span>}
                          </div>
                      )}
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">CTA Action Keyword</label>
                      {isEditingOffer ? (
                          <input 
                              value={offer.ctaKeyword}
                              onChange={(e) => setOffer({...offer, ctaKeyword: e.target.value})}
                              placeholder="e.g. REPURPOSE"
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black text-brand-500 uppercase focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      ) : (
                          <div className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl text-sm font-black text-brand-500 uppercase flex items-center gap-2">
                              <Zap size={14} className="fill-current" />
                              {offer.ctaKeyword || "INFO"}
                          </div>
                      )}
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Offer Psychology (DNA)</label>
                      {isEditingOffer ? (
                          <textarea 
                              value={offer.description}
                              onChange={(e) => setOffer({...offer, description: e.target.value})}
                              placeholder="Describe the transformation..."
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 outline-none h-[184px] resize-none leading-relaxed"
                          />
                      ) : (
                          <div className="p-4 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm text-gray-500 dark:text-gray-400 h-[184px] overflow-y-auto custom-scrollbar italic leading-relaxed">
                              {offer.description || <span className="opacity-20 italic">"The SBL protocol automatically consumes this context to bridge every viral asset directly to your sales argument..."</span>}
                          </div>
                      )}
                  </div>
              </div>
          </div>
          
          {!isEditingOffer && !offer.name && (
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                  <Target className="text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Setup your primary offer to enable auto-bridging in the LaunchPad tools.</p>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Branding Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                      <Palette className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">System Branding</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Application Identity</p>
                  </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div 
                      onClick={() => logoInputRef.current?.click()}
                      className="relative group cursor-pointer"
                  >
                      <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-black/20 group-hover:border-brand-500 transition-all shadow-inner overflow-hidden flex items-center justify-center">
                          {appLogo ? (
                              <img src={appLogo} alt="App Logo" className="w-full h-full object-contain" />
                          ) : (
                              <div className="flex flex-col items-center text-brand-500/30 group-hover:text-brand-500 transition-colors">
                                  <GreenNovaLogo className="w-12 h-12 mb-1" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Default</span>
                              </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                              <Camera size={24} className="mb-1" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Change Logo</span>
                          </div>
                      </div>
                  </div>
                  <input 
                      type="file" 
                      ref={logoInputRef} 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                      accept="image/*" 
                  />
                  <div className="mt-4 flex gap-2">
                      <button 
                          onClick={() => logoInputRef.current?.click()}
                          className="px-4 py-2 bg-dark-input border border-gray-700 text-white rounded-xl text-xs font-bold hover:bg-gray-700 transition-all flex items-center gap-2"
                      >
                          <Upload size={14} /> Upload New
                      </button>
                      {appLogo && (
                          <button 
                              onClick={handleResetLogo}
                              className="px-4 py-2 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50/10 transition-all flex items-center gap-2"
                              title="Reset to default logo"
                          >
                              <Trash2 size={14} /> Reset
                          </button>
                      )}
                  </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                  <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                      The application logo appears in the Sidebar, Landing Page hero, and Access Guards. High-contrast PNGs with transparent backgrounds work best.
                  </p>
              </div>
          </div>

          {/* Billing Management */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Billing</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment & Subscription</p>
                    </div>
                 </div>
             </div>

             <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5 mb-6 mt-4 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1">Status</p>
                        <p className="text-xl font-black text-amber-900 dark:text-amber-100 flex items-center gap-2">
                            {subscription.plan}
                            {subscription.plan === 'Annual Pro' && <Crown className="w-5 h-5 text-amber-500 fill-current" />}
                        </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${subscription.status === 'Active' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                        {subscription.status}
                    </span>
                </div>
                
                <div className="space-y-4">
                     {subscription.plan === 'Free Trial' && (
                         <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-amber-200/50">
                             <div className="flex items-center justify-between mb-1.5">
                                 <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase">Trial Clock</span>
                                 <span className="text-[10px] font-black text-amber-900 dark:text-white">{getTrialDaysLeft()} Days Left</span>
                             </div>
                             <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-amber-500" 
                                    style={{ width: `${(getTrialDaysLeft() / 15) * 100}%` }}
                                 ></div>
                             </div>
                         </div>
                     )}
                     <div>
                        <div className="flex justify-between text-xs font-medium text-amber-800 dark:text-amber-200 mb-1.5">
                            <span>Usage</span>
                            <span>{subscription.features.postsUsed} / {subscription.features.postsLimit >= 9999 ? '∞' : subscription.features.postsLimit}</span>
                        </div>
                        <div className="h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${subscription.features.postsLimit >= 9999 ? 5 : calculateProgress(subscription.features.postsUsed, subscription.features.postsLimit)}%` }}
                            ></div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 mt-2">
                         <Clock className="w-3 h-3" />
                         <span>{subscription.status === 'Active' ? 'Next billing' : 'Expires'} on {subscription.renewalDate}</span>
                     </div>
                </div>
             </div>

             <div className="space-y-3">
                <button 
                    onClick={() => handlePayPalUpgrade('pro')}
                    disabled={subscription.plan !== 'Free Trial'}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-between group
                    ${subscription.plan !== 'Free Trial' 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-600' 
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'}`}
                >
                    Unlock Pro ($10.00/mo)
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>

                <button 
                    onClick={() => handlePayPalUpgrade('agency')}
                    disabled={subscription.plan === 'Annual Pro'}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2 border-2 border-transparent
                    ${subscription.plan === 'Annual Pro'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-brand-900 hover:bg-brand-800 border-brand-700 text-white shadow-brand-900/20'}`}
                >
                    {subscription.plan === 'Annual Pro' ? 'Agency Access Active' : 'Annual Agency Plan ($99.00/yr)'}
                    {subscription.plan !== 'Annual Pro' && <Crown className="w-4 h-4" />}
                </button>
             </div>
          </div>

          {/* App Data & Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                    <Database className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Data & Storage</h3>
             </div>
             
             <div className="space-y-6 flex-1">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Cloud Storage</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {subscription.features.storageUsedMB.toFixed(1)}MB / {subscription.features.storageLimitMB}MB
                        </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${calculateProgress(subscription.features.storageUsedMB, subscription.features.storageLimitMB)}%` }}
                        ></div>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-xs">
                         <span className="text-gray-500 dark:text-gray-400">Saved Items: {savedItemsCount}</span>
                         <button onClick={() => onNavigate(View.SAVED_POSTS)} className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center">
                            View Library <ExternalLink className="w-3 h-3 ml-1" />
                         </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onNavigate(View.SETTINGS)} className="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center">
                        <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                    <button onClick={clearData} className="py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10">
                        Clear Cache
                    </button>
                </div>
             </div>
          </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Payment History</h3>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Invoice</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm">
                      {paymentHistory.length === 0 ? (
                          <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                  No payment history found.
                              </td>
                          </tr>
                      ) : (
                          paymentHistory.map((record) => (
                              <tr key={record.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                                      {new Date(record.date).toLocaleDateString()}
                                  </td>
                                  <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                                      {record.plan} subscription
                                      <span className="block text-xs text-gray-400">{record.method} • {record.id}</span>
                                  </td>
                                  <td className="py-4 px-4 text-gray-900 dark:text-white font-bold">
                                      ${record.amount}
                                  </td>
                                  <td className="py-4 px-4">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 capitalize">
                                          {record.status}
                                      </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                      <button className="text-brand-600 dark:text-brand-400 hover:underline text-xs font-bold flex items-center justify-end w-full">
                                          <Download className="w-3 h-3 mr-1" /> Download
                                      </button>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default Account;
