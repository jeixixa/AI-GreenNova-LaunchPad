
import React from 'react';
import { View } from '../types';
import { Zap, Users, Eye, MousePointer, Sparkles, ArrowUpRight, Mic, Image as ImageIcon, Youtube, RefreshCw, Target, Rocket, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.FC<any> }> = ({ title, value, trend, icon: Icon }) => (
  <div className="bg-dark-card p-6 rounded-3xl border border-gray-800 shadow-premium hover:border-gray-700 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-dark-input rounded-2xl group-hover:bg-brand-900/30 transition-colors">
        <Icon className="w-6 h-6 text-brand-500" />
      </div>
      <span className="text-xs font-bold text-brand-400 bg-brand-900/20 px-3 py-1.5 rounded-full flex items-center border border-brand-900/30">
        {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
      </span>
    </div>
    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-3xl font-black text-white">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto py-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">System Control Center</h1>
          <p className="text-gray-400 mt-2 text-lg">You are currently in <span className="text-brand-400 font-bold italic">Architect Mode</span>. Let's scale your empire.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavigate(View.VIRAL_GENERATOR)}
              className="bg-brand-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-800 border-2 border-brand-700 transition-all flex items-center justify-center shadow-brand-900/20 hover:shadow-glow-lg hover:-translate-y-0.5"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Launch New Campaign
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Viral Reach" value="2.4M" trend="+12%" icon={Eye} />
        <StatCard title="Architect Score" value="94/100" trend="+5%" icon={ShieldCheck} />
        <StatCard title="Link Clicks" value="845" trend="+24%" icon={MousePointer} />
        <StatCard title="Conversions" value="32" trend="+8%" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-dark-card rounded-[2.5rem] border border-gray-800 p-10 shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-brand-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Your Strategic Roadmap</h2>
            </div>
            <div className="space-y-6">
                {[
                    { step: '01', title: 'Viral Discovery', desc: 'Use the Trends Board to scan your niche DNA.', action: View.TRENDS_BOARD, status: 'Ready' },
                    { step: '02', title: 'Content Synthesis', desc: 'Architect an 11-asset social media suite.', action: View.VIRAL_GENERATOR, status: 'Ready' },
                    { step: '03', title: 'Authority Anchoring', desc: 'Design high-status visuals for your brand.', action: View.AUTHORITY_GENERATOR, status: 'Ready' },
                    { step: '04', title: 'Conversion Bridge', desc: 'Deploy the 1+8 comment ladder to capture leads.', action: View.VIRAL_MOCKUPS, status: 'Locked' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all group/item cursor-pointer" onClick={() => onNavigate(item.action)}>
                        <div className="text-xl font-black text-gray-700 group-hover/item:text-brand-500 transition-colors">{item.step}</div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">{item.title}</h4>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                        <div className="px-3 py-1 bg-dark-input border border-gray-700 rounded-full text-[10px] font-black text-gray-400 group-hover/item:text-brand-400 transition-colors uppercase tracking-widest">
                            {item.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-gradient-to-br from-[#0B1425] to-[#020C1B] rounded-[2.5rem] border border-red-900/30 p-10 text-center shadow-premium flex flex-col justify-between items-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Repurpose Engine</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed text-sm">Convert any YouTube link into a high-converting conversion sequence instantly.</p>
            <button onClick={() => onNavigate(View.VIDEO_REPURPOSER)} className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                <Youtube className="w-4 h-4" />
                Analyze Forensics
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
