
import React, { useState } from 'react';
/* Added missing icons Sparkles and ArrowRight from lucide-react to fix "Cannot find name" errors */
import { Copy, Check, Star, Zap, TrendingUp, MessageCircle, BarChart3, Clock, Rocket, Sparkles, ArrowRight } from 'lucide-react';

const POSTS = [
  {
    id: 1,
    title: "The 'Anti-Hustle' Shift",
    hook: "Stop grinding 16 hours a day. It's keeping you broke.",
    content: `Stop grinding 16 hours a day. It's keeping you broke. 🛑💸

1 - The "Hustle Trap": Society tells you more work = more money. False. Leveraging systems = more money.

2 - AI is the new leverage: I replaced my copywriter, scheduler, and strategist with one AI workflow.

3 - The Result: I work 4 hours a day and make 3x more. 

4 - The Shift: Move from "Worker" to "Architect". Build the machine, don't be the machine.

Say "ARCHITECT" and I'll send you the blueprint. 👇`,
    stats: "2.4K Likes • 450 Comments",
    category: "Mindset Shift",
    icon: Clock
  },
  {
    id: 2,
    title: "The Simple Math to $10k",
    hook: "You don't need a million followers to make $10k/month.",
    content: `You don't need a million followers to make $10k/month. 📉➡️💰

Here is the simple math:

1 - Sell a High Ticket Offer ($2,000).
2 - You only need 5 sales a month.
3 - That is 1.25 sales a week.

How to get them?
- Post daily value (AI helps here).
- Start conversations in DMs.
- Solve real problems.

Don't overcomplicate it. 

Say "MATH" for my offer breakdown worksheet. 👇`,
    stats: "1.8K Likes • 320 Comments",
    category: "Strategy",
    icon: BarChart3
  },
  {
    id: 3,
    title: "AI Tools I Actually Use",
    hook: "I tested 50 AI tools so you don't have to.",
    content: `I tested 50 AI tools so you don't have to. 🤖✅

Here are the top 3 that actually make money:

1 - ChatGPT (The Brain): Use it for strategy and frameworks, not just generic text.
2 - Gemini (The Creative): Great for analyzing images and video scripts.
3 - SBL Threads (The System): All-in-one content to cash machine.

Stop collecting tools. Start building systems.

Say "TOOLS" for my complete tech stack list. 👇`,
    stats: "3.1K Likes • 600 Comments",
    category: "Tools",
    icon: Zap
  },
  {
    id: 4,
    title: "The Silent Killer of Growth",
    hook: "Complexity is the silent killer of your business.",
    content: `Complexity is the silent killer of your business. 🤫🔪

If you need a 10-step manual to post a video, you're losing.

The SBL Goal:
Simple Inputs ➡️ AI Synthesis ➡️ Viral Output.

I don't spend hours editing anymore. I spend minutes architecting.

The more you automate, the more you accelerate.

Say "SIMPLE" if you want to see my automated workflow. 👇`,
    stats: "1.2K Likes • 185 Comments",
    category: "Efficiency",
    icon: Rocket
  }
];

const StudioJames: React.FC = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    window.dispatchEvent(new CustomEvent('sbl-toast', { detail: { message: 'Template copied', type: 'success' } }));
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                <Star size={14} className="fill-current" /> High-Performance Library
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">Studio SBL Viral Posts</h1>
            <p className="text-yellow-100 font-medium text-lg max-w-2xl leading-relaxed">
                Access the exact templates and high-performing scripts used to generate millions of views and thousands of leads. Copy, paste, and win.
            </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Star className="w-96 h-96 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POSTS.map((post) => (
            <div key={post.id} className="bg-dark-card rounded-3xl border border-gray-800 shadow-premium hover:shadow-xl hover:border-gray-700 transition-all flex flex-col group overflow-hidden">
                <div className="p-6 border-b border-gray-800 bg-dark-card/50">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-orange-900/40 text-orange-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] border border-orange-500/20">
                            {post.category}
                        </span>
                        <div className="flex items-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                            <TrendingUp className="w-3 h-3 mr-1 text-brand-500" />
                            Viral Asset
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-3 bg-dark-input rounded-2xl group-hover:bg-brand-900/20 transition-colors">
                            <post.icon className="w-6 h-6 text-brand-500" />
                        </div>
                        <h3 className="font-bold text-white text-xl leading-tight flex-1">{post.title}</h3>
                    </div>
                </div>
                
                <div className="p-8 flex-1 bg-[#020C1B] font-mono text-sm text-gray-400 whitespace-pre-wrap leading-relaxed italic group-hover:text-gray-200 transition-colors">
                    {post.content}
                </div>

                <div className="p-6 border-t border-gray-800 flex justify-between items-center bg-dark-card/50">
                    <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <Zap className="w-3 h-3 mr-1.5 text-yellow-500 fill-current" />
                        {post.stats}
                    </div>
                    <button 
                        onClick={() => handleCopy(post.content, post.id)}
                        className={`
                            flex items-center px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg
                            ${copiedId === post.id 
                                ? 'bg-brand-500 text-white shadow-glow' 
                                : 'bg-white text-black hover:bg-gray-200'}
                        `}
                    >
                        {copiedId === post.id ? <Check size={14} className="text-brand-500" /> : <Copy size={14} />}
                        {copiedId === post.id ? 'Copied' : 'Get Post'}
                    </button>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-brand-900/10 border border-brand-500/20 rounded-[2.5rem] p-10 text-center relative overflow-hidden">
        <div className="absolute -left-10 top-0 p-10 opacity-5">
            <MessageCircle size={150} className="text-brand-500" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="text-brand-500 w-8 h-8" />
            </div>
            <h3 className="font-bold text-white text-2xl">Need a Custom Viral Sequence?</h3>
            <p className="text-gray-400 text-base leading-relaxed">
                While these templates are proven winners, your business is unique. Use the <span className="text-brand-400 font-bold">Viral LaunchPad</span> to architect a custom suite perfectly matched to your audience's psychology.
            </p>
            <div className="pt-4">
                <button className="bg-brand-900 hover:bg-brand-800 text-white px-8 py-4 rounded-2xl font-bold transition-all border-2 border-brand-700 shadow-glow flex items-center gap-2 mx-auto">
                    Open Viral LaunchPad <ArrowRight size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudioJames;
