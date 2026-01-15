
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenBlob } from '@google/genai';
import { Mic, MicOff, X, Sparkles, Loader2, Volume2, Target, Zap, Rocket } from 'lucide-react';
import { decodeBase64, decodeAudioData, playAudioBuffer } from '../services/audioUtils';

// Manual Base64 Implementation as per rules
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const LiveAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('Ready for Neural Link');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startLive = async () => {
    setConnecting(true);
    setStatus('Initializing Neural Audio...');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        
        inputNodeRef.current = audioContextRef.current.createGain();
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        outputNodeRef.current.connect(outputAudioContextRef.current.destination);

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            callbacks: {
                onopen: () => {
                    const source = audioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: GenBlob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                    setIsActive(true);
                    setConnecting(false);
                    setStatus('Neural Link Established');
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64EncodedAudioString && outputAudioContextRef.current) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        const audioBuffer = await decodeAudioData(
                            decode(base64EncodedAudioString),
                            outputAudioContextRef.current,
                            24000,
                            1
                        );
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNodeRef.current!);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                        source.onended = () => sourcesRef.current.delete(source);
                    }
                    if (message.serverContent?.interrupted) {
                        sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e) => { console.error(e); stopLive(); },
                onclose: () => stopLive(),
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                systemInstruction: 'You are the GreenNova Strategic Partner. You provide high-level business coaching voice-to-voice. Be encouraging, precise, and high-status.',
            }
        });

        sessionRef.current = await sessionPromise;
    } catch (err) {
        console.error(err);
        stopLive();
    }
  };

  const stopLive = () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
      setIsActive(false);
      setConnecting(false);
      onClose();
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in h-full">
        <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-brand-500/20 scale-110 shadow-glow' : 'bg-gray-800'}`}>
                {connecting ? (
                    <Loader2 className="w-16 h-16 text-brand-500 animate-spin" />
                ) : isActive ? (
                    <div className="flex gap-1 items-center">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 bg-brand-500 rounded-full animate-bounce" style={{ height: '30px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                ) : (
                    <Sparkles className="w-16 h-16 text-gray-600" />
                )}
            </div>
            {isActive && (
                 <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-dark-card animate-pulse"></div>
            )}
        </div>

        <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">{status}</h2>
            <p className="text-gray-500 text-sm max-w-xs font-bold uppercase tracking-widest leading-relaxed">
                {isActive ? 'Speak now. Your strategic partner is listening in real-time.' : 'Activate voice coaching to architect your empire hands-free.'}
            </p>
        </div>

        <div className="w-full max-w-xs space-y-4">
            {!isActive ? (
                <button 
                    onClick={startLive}
                    disabled={connecting}
                    className="w-full py-5 bg-brand-900 hover:bg-brand-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-glow transition-all flex items-center justify-center gap-3 border-2 border-brand-700 active:scale-95"
                >
                    <Mic className="w-5 h-5" />
                    Establish Neural Link
                </button>
            ) : (
                <button 
                    onClick={stopLive}
                    className="w-full py-5 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 border-2 border-red-900/30"
                >
                    <MicOff className="w-5 h-5" />
                    Terminate Link
                </button>
            )}
            
            <button onClick={onClose} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Return to Neural Chat</button>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full opacity-40">
             <div className="p-3 bg-white/5 rounded-xl flex flex-col items-center gap-2">
                <Target size={14} />
                <span className="text-[8px] font-black uppercase">Direct</span>
             </div>
             <div className="p-3 bg-white/5 rounded-xl flex flex-col items-center gap-2">
                <Zap size={14} />
                <span className="text-[8px] font-black uppercase">Fast</span>
             </div>
             <div className="p-3 bg-white/5 rounded-xl flex flex-col items-center gap-2">
                <Rocket size={14} />
                <span className="text-[8px] font-black uppercase">Scale</span>
             </div>
        </div>
    </div>
  );
};

export default LiveAssistant;
