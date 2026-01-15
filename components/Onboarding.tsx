
import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  MonitorPlay, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  X,
  ChevronRight,
  TrendingUp,
  Shield,
  Rocket
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to SBL System",
    description: "The definitive driven growth engine for entrepreneurs. Stop the manual grind and start architecting your digital empire with proven viral frameworks.",
    icon: Rocket,
    color: "text-brand-500",
    bg: "bg-brand-500/10"
  },
  {
    title: "Viral Intelligence",
    description: "Use the Trends Board to scan your niche's DNA. Identify 'Exploding' topics and extract viral hook structures before the competition even notices.",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10"
  },
  {
    title: "The LaunchPad",
    description: "Our core engine. Architect a full 11-asset social suite—from X threads to LinkedIn authority posts—bridged directly to your offer in seconds.",
    icon: MonitorPlay,
    color: "text-brand-400",
    bg: "bg-brand-400/10"
  },
  {
    title: "Media Lab",
    description: "Design high-status visuals in the Authority Studio or generate AI video with Veo. Every asset is designed to stop the scroll and build instant trust.",
    icon: Layers,
    color: "text-purple-400",
    bg: "bg-purple-400/10"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="max-w-2xl w-full bg-dark-card border border-gray-800 rounded-[3rem] shadow-premium overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8">
          <div className={`w-24 h-24 ${step.bg} rounded-[2rem] flex items-center justify-center shadow-xl animate-bounce-slow`}>
            <Icon className={`w-12 h-12 ${step.color}`} />
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              {step.title}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="w-full space-y-6">
            <div className="flex justify-center gap-2">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentStep === i ? 'bg-brand-500 w-12' : 'bg-gray-800 w-3'}`}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onComplete}
                className="flex-1 px-8 py-4 text-gray-500 font-bold hover:text-white transition-colors order-2 sm:order-1"
              >
                Skip Tutorial
              </button>
              <button 
                onClick={nextStep}
                className="flex-[2] bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-glow transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
              >
                {currentStep === STEPS.length - 1 ? 'Start Launching' : 'Next Insight'}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Status markers */}
        <div className="bg-[#0B1425] p-6 border-t border-gray-800 flex justify-center gap-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-brand-500" /> System Ready
            </span>
            <span className="flex items-center gap-2">
              <Shield size={12} className="text-brand-500" /> Secure Protocol
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp size={12} className="text-brand-500" /> Growth Active
            </span>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
