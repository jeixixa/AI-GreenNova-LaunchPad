
import React, { useState, useRef, useEffect } from 'react';
import { 
    BrainCircuit, 
    Send, 
    Sparkles, 
    Loader2, 
    Trash2, 
    Zap, 
    Target, 
    Rocket, 
    Mic,
    MoreVertical,
    History,
    RefreshCcw,
    Maximize2,
    ShieldCheck,
    Settings,
    User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { startAssistantChat } from '../services/geminiService';
import VoiceInput from './VoiceInput';
import GreenNovaLogo from './GreenNovaLogo';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const NeuralCommand: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('sbl_neural_history');
        return saved ? JSON.parse(saved) : [];
    });
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
            let ctx = "WORKSPACE CONTEXT:\n";
            if (launchpad.nicheTopic) ctx += `- Active Niche: ${launchpad.nicheTopic}\n`;
            if (offer.name) ctx += `- Primary Offer: ${offer.name}\n`;
            return ctx;
        } catch (e) { return "Workspace data syncing..."; }
    };

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('sbl_neural_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const userMsg = textOverride || input.trim();
        if (!userMsg || loading) return;
        
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            if (!chatRef.current) {
                chatRef.current = startAssistantChat(getWorkspaceContext());
            }
            const response = await chatRef.current.sendMessage({ message: userMsg });
            setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Neural logic error." }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Neural Link interrupted. Ensure your API Key is valid." }]);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        if (confirm("Wipe neural command history?")) {
            setMessages([]);
            chatRef.current = null;
        }
    };

    const suggestions = [
        { label: "Analyze my Niche DNA", prompt: "Perform a psychological DNA analysis of my current niche and tell me what hooks are working best right now." },
        { label: "Architect a 7-Day Launch", prompt: "Help me architect a sequential 7-day launch plan for my primary offer using the SBL protocol." },
        { label: "Refine my Authority Voice", prompt: "How can I make my brand tone more authoritative and high-status while remaining helpful?" }
    ];

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in space-y-6">
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
                        <BrainCircuit className="w-10 h-10 text-brand-500" />
                        Neural Command Center
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Discuss complex system architecture and scale strategy with your AI partner.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={clearHistory}
                        className="p-3 bg-dark-card border border-gray-800 rounded-xl text-gray-500 hover:text-red-400 transition-all"
                        title="Wipe History"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button 
                        className="p-3 bg-dark-card border border-gray-800 rounded-xl text-gray-500 hover:text-white transition-all"
                        title="Neural Settings"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-dark-card border border-gray-800 rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none"></div>
                
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-[#020C1B] relative z-10">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-2xl mx-auto opacity-60">
                            <div className="relative">
                                <div className="w-32 h-32 bg-brand-500/5 rounded-full border-2 border-brand-500/20 flex items-center justify-center overflow-hidden p-6">
                                    {appLogo ? <img src={appLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles size={64} className="text-brand-500" />}
                                </div>
                                <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#020C1B] animate-pulse"></div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural Link Established</h3>
                                <p className="text-gray-400 font-medium">I am your strategic architect. Every conversation is tuned to your workspace context. What shall we scale today?</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSend(s.prompt)}
                                        className="p-5 bg-white/5 border border-white/5 hover:border-brand-500/40 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all text-center leading-relaxed"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                <div className={`
                                    max-w-[85%] rounded-[2rem] p-8 text-lg leading-relaxed shadow-xl border
                                    ${msg.role === 'user' 
                                        ? 'bg-brand-900/40 border-brand-500/30 text-white rounded-tr-none font-bold' 
                                        : 'bg-dark-input border border-gray-800 text-gray-300 rounded-tl-none'}
                                `}>
                                    <div className="flex items-center gap-3 mb-4 opacity-40">
                                        <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                                            {msg.role === 'assistant' ? (
                                                appLogo ? <img src={appLogo} alt="AI" className="w-full h-full object-contain" /> : <BrainCircuit size={16} />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{msg.role === 'assistant' ? 'GreenNova AI' : 'System Architect'}</span>
                                    </div>
                                    <div className="prose prose-invert prose-lg max-none prose-headings:text-brand-400 prose-strong:text-white">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-dark-input border border-gray-800 rounded-3xl p-6 flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Architecting Strategy...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-8 bg-[#0B1425] border-t border-gray-800 relative z-10">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative group max-w-4xl mx-auto"
                    >
                        <div className="absolute -inset-1 bg-brand-gradient rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                        <div className="relative flex items-center gap-4 bg-[#020C1B] border border-gray-700 rounded-3xl p-2 px-6">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Issue a strategic command..."
                                className="flex-1 bg-transparent py-5 text-lg text-white outline-none font-bold placeholder:text-gray-700"
                            />
                            <div className="flex items-center gap-3">
                                <VoiceInput onTranscript={setInput} className="w-12 h-12" />
                                <button 
                                    type="submit" 
                                    disabled={loading || !input.trim()}
                                    className="p-4 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl transition-all shadow-glow active:scale-95 disabled:opacity-20"
                                >
                                    <Send size={24} />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="flex justify-center gap-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-brand-500" /> End-to-End Encryption</span>
                <span className="flex items-center gap-2"><History size={12} className="text-brand-500" /> Neural History Persistent</span>
                <span className="flex items-center gap-2"><RefreshCcw size={12} className="text-brand-500" /> Real-time Synthesis</span>
            </div>
        </div>
    );
};

export default NeuralCommand;
