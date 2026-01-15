
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, ChevronDown, RefreshCcw, Zap, Target, Rocket, Mic, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { startAssistantChat } from '../services/geminiService';
import LiveAssistant from './LiveAssistant';
import GreenNovaLogo from './GreenNovaLogo';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [appLogo, setAppLogo] = useState<string | null>(() => localStorage.getItem('sbl_app_logo'));
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    const handleStorage = () => setAppLogo(localStorage.getItem('sbl_app_logo'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getWorkspaceContext = () => {
    try {
      const launchpad = JSON.parse(localStorage.getItem('sbl_autosave_launchpad_v11') || '{}');
      const offer = JSON.parse(localStorage.getItem('sbl_global_offer') || '{}');
      const leads = JSON.parse(localStorage.getItem('sbl_lead_vault') || '[]');
      
      let ctx = "SYSTEM WORKSPACE STATUS:\n";
      if (launchpad.nicheTopic) ctx += `- User Niche: ${launchpad.nicheTopic}\n`;
      if (offer.name) ctx += `- User Offer: ${offer.name} (${offer.ctaKeyword})\n`;
      if (leads.length > 0) ctx += `- Active Leads: ${leads.length}\n`;
      
      return ctx;
    } catch (e) { return "Workspace data syncing..."; }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!chatRef.current) initChat();
    }
  }, [messages, isOpen]);

  const initChat = () => {
    const context = getWorkspaceContext();
    chatRef.current = startAssistantChat(context);
    const initialGreeting = `System Online. I am your **GreenNova Neural Partner**. I have synced with your current niche and offer. How can we accelerate your launch today?`;
    setMessages([{ role: 'assistant', content: initialGreeting }]);
  };

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      if (!chatRef.current) initChat();
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Neural logic error." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural Link interrupted. Check API Key." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[500] flex flex-col items-end gap-4 pointer-events-none">
      {isOpen && (
        <div className="w-[420px] h-[650px] max-w-[calc(100vw-2.5rem)] max-h-[calc(100vh-8rem)] bg-dark-card border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-slide-up relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none"></div>
          
          {isLive ? (
              <LiveAssistant onClose={() => setIsLive(false)} />
          ) : (
              <>
                <div className="bg-[#0B1425] p-6 border-b border-gray-800 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 bg-brand-500/10 rounded-2xl border border-brand-500/20 shadow-glow-sm flex items-center justify-center overflow-hidden">
                                {appLogo ? <img src={appLogo} alt="Logo" className="w-full h-full object-contain p-1" /> : <Sparkles size={20} className="text-brand-500" />}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B1425] animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic leading-none">GreenNova AI</h3>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1.5 block">Neural Logic Engine v2.4</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsLive(true)} className="p-2.5 bg-brand-900/40 text-brand-400 hover:bg-brand-500 hover:text-white rounded-xl transition-all border border-brand-500/20" title="Neural Voice Link">
                            <Mic size={18} />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#020C1B] relative z-10">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[88%] rounded-[1.5rem] p-5 text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-brand-500 text-white font-bold rounded-tr-none' : 'bg-dark-input border border-gray-800 text-gray-300 rounded-tl-none'}`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-dark-input border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Brain size={12} className="animate-pulse" /> Architecting Logic...
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-5 bg-[#0B1425] border-t border-gray-800 flex gap-3 items-center relative z-10">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Discuss your system architecture..."
                        className="flex-1 bg-dark-input border border-gray-700 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold placeholder:text-gray-700 shadow-inner"
                    />
                    <button type="submit" disabled={loading || !input.trim()} className="p-4 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl transition-all shadow-glow active:scale-95 disabled:opacity-20 flex items-center justify-center">
                        <Send size={20} />
                    </button>
                </form>
              </>
          )}
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="w-[64px] h-[64px] bg-brand-500 hover:bg-brand-400 text-white rounded-full shadow-glow flex items-center justify-center transition-all active:scale-90 pointer-events-auto border-4 border-dark-bg group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <ChevronDown size={32} />
        ) : (
          appLogo ? (
            <img src={appLogo} alt="Logo" className="w-10 h-10 object-contain p-1" />
          ) : (
            <MessageSquare size={32} />
          )
        )}
        {!isOpen && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-4 border-dark-bg flex items-center justify-center animate-bounce">
                <Sparkles size={12} className="text-black fill-current" />
            </div>
        )}
      </button>
    </div>
  );
};

export default ChatAssistant;
