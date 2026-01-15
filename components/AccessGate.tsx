import React, { useState, useEffect } from 'react';
import { Crown, Lock, Rocket, ShieldAlert, Zap, ArrowRight, CreditCard, Sparkles, RefreshCw } from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';

interface AccessGateProps {
    onNavigateToBilling: () => void;
}

const AccessGate: React.FC<AccessGateProps> = ({ onNavigateToBilling }) => {
    const [appLogo, setAppLogo] = useState<string | null>(() => localStorage.getItem('sbl_app_logo'));

    useEffect(() => {
        const handleStorage = () => setAppLogo(localStorage.getItem('sbl_app_logo'));
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="fixed inset-0 z-[300] bg-dark-bg flex items-center justify-center p-6 overflow-y-auto">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-500/20"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
            </div>

            <div className="max-w-2xl w-full bg-dark-card border border-gray-800 rounded-[3rem] shadow-premium relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
                
                <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8 relative z-10">
                    <div className="w-20 h-20 bg-brand-900/40 rounded-[2rem] flex items-center justify-center border border-brand-500/30 animate-pulse shadow-glow">
                        <Lock className="w-10 h-10 text-brand-400" />
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20">
                            <ShieldAlert size={12} /> Access Restricted
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                            Your 15-day free trial <br /> <span className="text-transparent bg-clip-text bg-brand-gradient">has reached its limit.</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
                            To maintain access to your viral assets and architect new digital campaigns, a premium subscription is required.
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left space-y-3 hover:border-brand-500/30 transition-colors">
                            <div className="flex items-center gap-2 text-brand-400 font-black text-xs uppercase tracking-widest">
                                <Sparkles size={14} /> Creator Benefits
                            </div>
                            <ul className="space-y-2 text-xs text-gray-500 font-medium">
                                <li className="flex items-center gap-2"><Check size={12} className="text-brand-500" /> Unlimited Viral Suite Generation</li>
                                <li className="flex items-center gap-2"><Check size={12} className="text-brand-500" /> High-Retention Video Architect</li>
                                <li className="flex items-center gap-2"><Check size={12} className="text-brand-500" /> Access to Pattern Intelligence</li>
                            </ul>
                        </div>
                        <div className="bg-brand-500/5 border border-brand-500/20 p-6 rounded-2xl text-left flex flex-col justify-center">
                            <div className="text-2xl font-black text-white">$10.00 <span className="text-sm text-gray-500 font-bold tracking-normal">/ month</span></div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Architect your entire content schedule for less than a coffee.</p>
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <button 
                            onClick={onNavigateToBilling}
                            className="w-full bg-brand-500 hover:bg-brand-400 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-glow transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            Unlock Unlimited Access <ArrowRight size={20} />
                        </button>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <CreditCard size={10} /> Secure checkout powered by SBL Protocol
                        </p>
                    </div>
                </div>

                <div className="bg-[#0B1425] p-6 border-t border-gray-800 flex justify-center gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        {appLogo ? (
                            <img src={appLogo} alt="Logo" className="w-6 h-6 object-contain" />
                        ) : (
                            <GreenNovaLogo className="w-6 h-6 text-brand-500" />
                        )}
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SBL System Access Guard</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Check = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default AccessGate;