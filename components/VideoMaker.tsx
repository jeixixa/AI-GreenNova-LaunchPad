import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateVideo, VideoGenerationParams, generateVideoMeta } from '../services/geminiService';
import { saveItem, blobUrlToBase64 } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { 
  Loader2, Upload, Video, X, Play, Film, AlertCircle, Key, Bookmark, 
  Check, Layers, Zap, PenTool, Layout, Smartphone, Share2, 
  GripVertical, Undo, Redo, RefreshCw, RotateCcw,
  Scissors, Maximize2, MoveRight, ChevronDown, Plus, Sparkles
} from 'lucide-react';
import VoiceInput from './VoiceInput';

interface TimelineClip {
    id: number;
    name: string;
    start: number;
    end: number;
    url: string;
    transition?: 'none' | 'fade' | 'slide' | 'dissolve';
}

const PIXELS_PER_SECOND = 20;

const VideoMaker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'editor'>('generator');

  // Generator State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Editor State
  const [editorVideo, setEditorVideo] = useState<string | null>(null);
  const [editorVideoName, setEditorVideoName] = useState<string>('Untitled Project');
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [aiToolOutput, setAiToolOutput] = useState('');
  const [aiToolLoading, setAiToolLoading] = useState(false);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  
  // Trimming State
  const [trimmingClipId, setTrimmingClipId] = useState<{id: number, edge: 'start' | 'end'} | null>(null);

  // Undo/Redo State
  const [history, setHistory] = useState<TimelineClip[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [hasApiKey, setHasApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkApiKey();
    const savedData = localStorage.getItem('sbl_autosave_video_maker_v3');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.prompt) setPrompt(parsed.prompt);
            if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
            if (parsed.resolution) setResolution(parsed.resolution);
            if (parsed.activeTab) setActiveTab(parsed.activeTab);
            if (parsed.clips) setClips(parsed.clips);
            if (parsed.editorVideoName) setEditorVideoName(parsed.editorVideoName);
            if (parsed.previewPlatform) setPreviewPlatform(parsed.previewPlatform);
        } catch(e) { console.error("Failed to restore Video Maker session", e); }
    }
  }, []);

  useEffect(() => {
      const dataToSave = { 
        prompt, 
        aspectRatio, 
        resolution, 
        activeTab, 
        clips, 
        editorVideoName, 
        previewPlatform 
      };
      localStorage.setItem('sbl_autosave_video_maker_v3', JSON.stringify(dataToSave));
  }, [prompt, aspectRatio, resolution, activeTab, clips, editorVideoName, previewPlatform]);

  const checkApiKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        setHasApiKey(await win.aistudio.hasSelectedApiKey());
    } else {
        setHasApiKey(!!process.env.API_KEY);
    }
  };

  const handleOpenKeySelect = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
        await win.aistudio.openSelectKey();
        setHasApiKey(true);
    } else {
        alert("API Key selection not supported in this environment");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setMimeType(file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
        await handleOpenKeySelect();
        return;
    }
    if (!prompt) return;
    setLoading(true);
    setGeneratedVideo(null);
    setSaved(false);
    setStatusMessage('Initializing creation (approx 1-2 mins)...');
    try {
      const params: VideoGenerationParams = {
        prompt, aspectRatio, resolution,
        image: selectedImage ? { data: selectedImage.split(',')[1], mimeType } : undefined
      };
      const videoUrl = await generateVideo(params);
      trackEvent('video_generated');
      setGeneratedVideo(videoUrl);
      setStatusMessage('');
    } catch (error) {
        console.error("Video generation failed", error);
        setStatusMessage('Generation failed. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedVideo) return;
    let content = generatedVideo;
    try {
        const base64 = await blobUrlToBase64(generatedVideo);
        if (base64.length < 4500000) content = base64;
    } catch (e) { console.warn("Could not convert video to base64 for storage", e); }
    const success = saveItem({ type: 'Video', content, title: `Video: ${prompt.substring(0, 30)}...` });
    if (success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const updateClipsWithHistory = (newClips: TimelineClip[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newClips);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setClips(newClips);
  };

  const undo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setClips(history[newIndex]);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setClips(history[newIndex]);
      }
  };

  const handleRegenerateTimeline = () => {
      if (!editorVideo) return;
      const clipCount = 4;
      const newClips: TimelineClip[] = [];
      const durationPerClip = 3;
      for (let i = 0; i < clipCount; i++) {
          newClips.push({
              id: Date.now() + i,
              name: `Scene ${i + 1}`,
              start: i * durationPerClip,
              end: (i * durationPerClip) + durationPerClip,
              url: editorVideo,
              transition: 'none'
          });
      }
      updateClipsWithHistory(newClips);
  };

  const handleResetTimeline = () => {
      if (!editorVideo) return;
      const newClips = [{ id: Date.now(), name: editorVideoName, start: 0, end: 10, url: editorVideo, transition: 'none' as const }];
      updateClipsWithHistory(newClips);
  };

  const sendToEditor = async () => {
      if (generatedVideo) {
          setEditorVideo(generatedVideo);
          setEditorVideoName(`Generated: ${prompt.substring(0, 15)}...`);
          const newClips = [{ id: Date.now(), name: 'Main Scene', start: 0, end: 5, url: generatedVideo, transition: 'none' as const }];
          setClips(newClips);
          setHistory([newClips]);
          setHistoryIndex(0);
          try {
            const response = await fetch(generatedVideo);
            const blob = await response.blob();
            const file = new File([blob], "generated_video.mp4", { type: blob.type });
            setEditorFile(file);
          } catch (e) { setEditorFile(null); }
          setActiveTab('editor');
      }
  };

  const handleEditorFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setEditorVideo(url);
    setEditorVideoName(file.name);
    setEditorFile(file);
    const newClips = [{ id: Date.now(), name: file.name, start: 0, end: 10, url, transition: 'none' as const }];
    setClips(newClips);
    setHistory([newClips]);
    setHistoryIndex(0);
  };

  const updateClipTimes = (id: number, start: number, end: number) => {
    const newClips = clips.map(c => (c.id === id ? { ...c, start, end } : c));
    updateClipsWithHistory(newClips);
  };

  const updateClipTransition = (id: number, transition: TimelineClip['transition']) => {
      const newClips = clips.map(c => (c.id === id ? { ...c, transition } : c));
      updateClipsWithHistory(newClips);
  };

  const handleClipDragStart = (e: React.DragEvent, index: number) => {
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClipDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleClipDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedClipIndex === null || draggedClipIndex === targetIndex) return;
    const updatedClips = [...clips];
    const [movedClip] = updatedClips.splice(draggedClipIndex, 1);
    updatedClips.splice(targetIndex, 0, movedClip);
    updateClipsWithHistory(updatedClips);
    setDraggedClipIndex(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const runAITool = async (task: 'hooks' | 'captions' | 'script') => {
      setAiToolLoading(true);
      setAiToolOutput('');
      try {
          const context = editorVideoName + (prompt ? ` - ${prompt}` : '');
          let videoData = undefined;
          if (editorFile) {
              const base64 = await fileToBase64(editorFile);
              videoData = { data: base64, mimeType: editorFile.type };
          }
          const result = await generateVideoMeta(task, context, videoData);
          setAiToolOutput(result);
      } catch (e) { setAiToolOutput('Failed to generate. Please try again.'); }
      finally { setAiToolLoading(false); }
  };

  // Trimming Logic
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!trimmingClipId || !timelineRef.current) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const clipElement = document.getElementById(`clip-${trimmingClipId.id}`);
    if (!clipElement) return;

    const deltaX = e.clientX - clipElement.getBoundingClientRect().left;
    const newSeconds = Math.max(0, deltaX / PIXELS_PER_SECOND);

    setClips(prev => prev.map(c => {
        if (c.id === trimmingClipId.id) {
            if (trimmingClipId.edge === 'start') {
                return { ...c, start: Math.min(newSeconds, c.end - 0.5) };
            } else {
                return { ...c, end: Math.max(newSeconds, c.start + 0.5) };
            }
        }
        return c;
    }));
  }, [trimmingClipId]);

  const handleMouseUp = useCallback(() => {
    if (trimmingClipId) {
        updateClipsWithHistory(clips);
        setTrimmingClipId(null);
    }
  }, [trimmingClipId, clips]);

  useEffect(() => {
    if (trimmingClipId) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [trimmingClipId, handleMouseMove, handleMouseUp]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-6">
         <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
            <Film className="w-8 h-8 mr-3 text-brand-500" />
            Viral Video Maker
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mt-1">Create, edit, and optimize videos for maximum viral reach.</p>
      </div>

      <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-fit mb-6">
          <button
              onClick={() => setActiveTab('generator')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'generator' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
              <Zap className="w-4 h-4 mr-2" /> Veo Generator
          </button>
          <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'editor' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
              <Layers className="w-4 h-4 mr-2" /> Studio Editor
          </button>
      </div>

      {activeTab === 'generator' ? (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="space-y-6">
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video Prompt</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the video you want to create (e.g. A cyberpunk city at night with neon rain)..."
                            className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-32 resize-none"
                        />
                        <div className="absolute right-3 bottom-3">
                            <VoiceInput onTranscript={(text) => setPrompt(prev => prev ? prev + ' ' + text : text)} className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aspect Ratio</label>
                            <div className="flex gap-2">
                                <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-2 rounded-lg border text-sm font-bold ${aspectRatio === '16:9' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>16:9</button>
                                <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-2 rounded-lg border text-sm font-bold ${aspectRatio === '9:16' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>9:16</button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source Image (Opt)</label>
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-[42px] flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                {selectedImage ? <span className="text-xs text-green-500 font-bold"><Check className="w-3 h-3 mr-1" /> Ready</span> : <span className="text-xs text-gray-400"><Upload className="w-3 h-3 mr-1" /> Upload</span>}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={loading || !prompt} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${loading || !prompt ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800'}`}>
                        {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Video className="w-5 h-5 mr-2" />}
                        {loading ? 'Synthesizing Video...' : 'Generate AI Video'}
                    </button>
                </div>
            </div>
            {(loading || generatedVideo) && (
                <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl text-center">
                    {loading ? (
                        <div className="py-12">
                            <Loader2 className="w-16 h-16 text-brand-500 animate-spin mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">Architecting Pixels</h3>
                            <p className="text-gray-400 animate-pulse">{statusMessage}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center"><Check className="w-6 h-6 text-green-500 mr-2" /> Vision Ready</h3>
                            <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                                <video src={generatedVideo!} controls autoPlay loop className="w-full" />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={handleSave} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center">
                                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />} {saved ? 'Saved' : 'Save to Library'}
                                </button>
                                <button onClick={sendToEditor} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center shadow-lg"><PenTool className="w-4 h-4 mr-2" /> Open in Editor</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[850px]">
            {/* Editor Main Content */}
            <div className="lg:col-span-3 bg-gray-900 rounded-3xl border border-gray-800 p-6 flex flex-col relative overflow-hidden">
                <div className="flex-1 bg-black/50 rounded-2xl relative flex items-center justify-center overflow-hidden mb-6 group">
                    {editorVideo ? (
                        <div className="relative h-full w-full flex items-center justify-center">
                             {previewPlatform !== 'youtube' && (
                                 <div className="absolute inset-0 pointer-events-none z-10 opacity-60 flex flex-col justify-end p-8">
                                     <div className="flex flex-col items-end gap-6 mb-12">
                                         <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20"></div>
                                         <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20"></div>
                                         <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20"></div>
                                     </div>
                                     <div className="space-y-3">
                                         <div className="h-4 w-32 bg-white/20 rounded-full"></div>
                                         <div className="h-3 w-56 bg-white/10 rounded-full"></div>
                                     </div>
                                 </div>
                             )}
                             <video ref={videoRef} src={editorVideo} controls className={`max-h-full shadow-2xl ${previewPlatform !== 'youtube' ? 'aspect-[9/16]' : 'aspect-video'}`} />
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                             <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
                             <p className="font-bold">No master video loaded</p>
                             <button onClick={() => editorInputRef.current?.click()} className="mt-4 px-8 py-3 bg-brand-900/50 rounded-xl hover:bg-brand-900 transition-colors text-white font-bold">Import Media</button>
                        </div>
                    )}
                    <input type="file" ref={editorInputRef} onChange={handleEditorFileUpload} className="hidden" accept="video/*" />
                </div>

                {/* VISUAL TIMELINE */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                         <div className="flex items-center gap-4">
                             <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Editing Timeline</h3>
                             <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-gray-800 shadow-inner">
                                 <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 disabled:opacity-20 transition-all"><Undo size={14} /></button>
                                 <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 disabled:opacity-20 transition-all"><Redo size={14} /></button>
                                 <div className="w-px bg-gray-800 mx-1"></div>
                                 <button onClick={handleRegenerateTimeline} className="p-2 hover:bg-gray-800 rounded-lg text-brand-500 transition-all" title="Auto-Split Scenes"><RefreshCw size={14} /></button>
                                 <button onClick={handleResetTimeline} className="p-2 hover:bg-gray-800 rounded-lg text-red-400 transition-all" title="Reset Timeline"><RotateCcw size={14} /></button>
                             </div>
                         </div>
                         <div className="flex items-center gap-2 text-xs text-gray-500">
                             <Scissors size={12} />
                             <span className="font-bold">{clips.length} Scenes Architected</span>
                         </div>
                    </div>

                    <div 
                        ref={timelineRef}
                        className="h-44 bg-black/40 rounded-2xl p-4 border border-gray-800 overflow-x-auto flex items-center gap-4 custom-scrollbar shadow-inner relative"
                    >
                         {clips.map((c, index) => (
                             <div key={c.id} className="flex items-center gap-3 shrink-0">
                                 <div 
                                    id={`clip-${c.id}`}
                                    draggable
                                    onDragStart={(e) => handleClipDragStart(e, index)}
                                    onDragOver={handleClipDragOver}
                                    onDrop={(e) => handleClipDrop(e, index)}
                                    className={`group h-28 bg-brand-900/30 border border-brand-500/40 rounded-2xl p-3 flex flex-col justify-between relative transition-all duration-300 hover:bg-brand-900/50 hover:border-brand-500 shadow-lg cursor-move
                                        ${draggedClipIndex === index ? 'opacity-30 scale-95' : 'opacity-100'}
                                    `}
                                    style={{ width: `${(c.end - c.start) * PIXELS_PER_SECOND + 100}px` }}
                                 >
                                     {/* Trim Handles */}
                                     <div 
                                        onMouseDown={() => setTrimmingClipId({ id: c.id, edge: 'start' })}
                                        className="absolute left-0 top-0 bottom-0 w-2 bg-brand-500/20 hover:bg-brand-500 rounded-l-2xl cursor-ew-resize transition-all z-20 group-hover:w-3"
                                     ></div>
                                     <div 
                                        onMouseDown={() => setTrimmingClipId({ id: c.id, edge: 'end' })}
                                        className="absolute right-0 top-0 bottom-0 w-2 bg-brand-500/20 hover:bg-brand-500 rounded-r-2xl cursor-ew-resize transition-all z-20 group-hover:w-3"
                                     ></div>

                                     <div className="flex justify-between items-start pointer-events-none">
                                         <div className="bg-brand-500/20 p-1 rounded-lg">
                                            <GripVertical size={12} className="text-brand-400" />
                                         </div>
                                         <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{c.end - c.start}s</span>
                                     </div>
                                     
                                     <div className="pointer-events-none">
                                         <p className="text-xs font-black text-white truncate max-w-full mb-1">{c.name}</p>
                                         <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                                             <div className="h-full bg-brand-500 w-1/3 opacity-40"></div>
                                         </div>
                                     </div>
                                     
                                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                                         <div className="px-3 py-1 bg-black/60 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
                                             <Maximize2 size={12} className="text-white" />
                                         </div>
                                     </div>
                                 </div>

                                 {/* Transition Selector */}
                                 {index < clips.length - 1 && (
                                     <div className="relative group/trans">
                                         <button 
                                            className={`p-2 rounded-lg border transition-all ${c.transition && c.transition !== 'none' ? 'bg-brand-500 border-brand-400 text-white shadow-glow' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'}`}
                                            onClick={() => {
                                                const options: TimelineClip['transition'][] = ['none', 'fade', 'slide', 'dissolve'];
                                                const currentIdx = options.indexOf(c.transition || 'none');
                                                const nextTrans = options[(currentIdx + 1) % options.length];
                                                updateClipTransition(c.id, nextTrans);
                                            }}
                                         >
                                             {c.transition === 'fade' ? <div className="w-3 h-3 bg-white rounded-full opacity-50"></div> : 
                                              c.transition === 'slide' ? <MoveRight size={14} /> : 
                                              c.transition === 'dissolve' ? <Zap size={14} /> : <Plus size={14} />}
                                         </button>
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/trans:opacity-100 transition-opacity whitespace-nowrap pointer-events-none bg-black text-[10px] font-black uppercase px-2 py-1 rounded-md border border-gray-700 text-gray-400 z-30">
                                             Trans: {c.transition || 'None'}
                                         </div>
                                     </div>
                                 )}
                             </div>
                         ))}
                         {clips.length === 0 && (
                             <div className="flex-1 flex flex-col items-center justify-center text-gray-700 gap-2 border-2 border-dashed border-gray-800 rounded-[2.5rem] py-10">
                                 <Scissors className="opacity-20" />
                                 <span className="text-xs font-bold uppercase tracking-widest">Import media to start editing</span>
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="bg-dark-card rounded-3xl border border-gray-800 p-6 flex flex-col gap-6 shadow-premium">
                <div className="bg-[#0B1425] p-5 rounded-2xl border border-gray-800 space-y-4">
                     <h3 className="font-black text-gray-500 uppercase tracking-widest text-[10px] flex items-center">
                         <Smartphone className="w-3 h-3 mr-2" /> Platform Preview
                     </h3>
                     <div className="grid grid-cols-1 gap-2">
                         {[
                            { id: 'instagram', label: 'Instagram Reels', color: 'hover:border-pink-500/50' },
                            { id: 'tiktok', label: 'TikTok Short', color: 'hover:border-white/50' },
                            { id: 'youtube', label: 'YouTube Studio', color: 'hover:border-red-500/50' }
                         ].map(p => (
                             <button 
                                key={p.id}
                                onClick={() => setPreviewPlatform(p.id as any)}
                                className={`p-3 text-xs font-black uppercase tracking-widest rounded-xl border transition-all text-left ${previewPlatform === p.id ? 'bg-brand-900/40 border-brand-500 text-white shadow-glow-sm' : `bg-gray-900 border-gray-800 text-gray-600 ${p.color}`}`}
                             >
                                 {p.label}
                             </button>
                         ))}
                     </div>
                </div>

                <div className="bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20 flex-1 flex flex-col gap-4">
                     <h3 className="font-black text-purple-400 uppercase tracking-widest text-[10px] flex items-center">
                         <Zap className="w-3 h-3 mr-2" /> Neural Engine
                     </h3>
                     
                     <div className="space-y-2">
                         <button onClick={() => runAITool('hooks')} disabled={aiToolLoading} className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-300 transition-all text-left flex items-center justify-between">
                             <span>Viral Hooks</span>
                             <Sparkles size={12} />
                         </button>
                         <button onClick={() => runAITool('captions')} disabled={aiToolLoading} className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-300 transition-all text-left flex items-center justify-between">
                             <span>Smart Caption</span>
                             <PenTool size={12} />
                         </button>
                         <button onClick={() => runAITool('script')} disabled={aiToolLoading} className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-purple-300 transition-all text-left flex items-center justify-between">
                             <span>Edit Script</span>
                             <Layout size={12} />
                         </button>
                     </div>

                     <div className="flex-1 bg-black/40 rounded-xl border border-gray-800 p-4 relative min-h-[150px] overflow-hidden">
                         {aiToolLoading ? (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                             </div>
                         ) : aiToolOutput ? (
                             <textarea 
                                value={aiToolOutput}
                                onChange={(e) => setAiToolOutput(e.target.value)}
                                className="w-full h-full text-xs font-mono text-gray-400 bg-transparent resize-none outline-none custom-scrollbar italic leading-relaxed"
                             />
                         ) : (
                             <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed text-center mt-10">Neural tools will architect metadata here.</p>
                         )}
                     </div>
                </div>

                <button className="w-full py-5 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-glow active:scale-95 transition-all">
                    Final Render
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoMaker;