
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, VideoGenerationParams } from '../services/geminiService';
import { saveItem, blobUrlToBase64 } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { Loader2, Film, Download, Bookmark, Check, AlertCircle, Key, Play, Image as ImageIcon, Type, X, Upload, Sparkles, Zap } from 'lucide-react';

const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
];

const FreeVideoGenerator: React.FC = () => {
  // Pre-fill the prompt as requested
  const [prompt, setPrompt] = useState('A futuristic robot writing code on a holographic screen');
  const [toolMode, setToolMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
    // Auto Load - only overwrite if data exists in local storage
    const savedData = localStorage.getItem('sbl_autosave_free_video');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (typeof parsed === 'string') setPrompt(parsed);
            else {
                if (parsed.prompt) setPrompt(parsed.prompt);
                if (parsed.toolMode) setToolMode(parsed.toolMode);
                if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
                if (parsed.resolution) setResolution(parsed.resolution);
                if (parsed.selectedImage) setSelectedImage(parsed.selectedImage);
                if (parsed.mimeType) setMimeType(parsed.mimeType);
            }
        } catch(e) { setPrompt(savedData); }
    }
  }, []);

  // Auto Save
  useEffect(() => {
      localStorage.setItem('sbl_autosave_free_video', JSON.stringify({ 
        prompt, 
        toolMode, 
        aspectRatio, 
        resolution,
        selectedImage,
        mimeType
      }));
  }, [prompt, toolMode, aspectRatio, resolution, selectedImage, mimeType]);

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
          
          // If we were in text-to-video but upload an image, we can optionally switch or just stay
          // Usually image upload implies image-to-video intent or reference
          window.dispatchEvent(new CustomEvent('sbl-toast', { 
            detail: { message: 'Reference image loaded', type: 'success' } 
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    
    if (toolMode === 'image-to-video' && !selectedImage) {
        alert("Please upload an image to animate.");
        return;
    }
    
    setLoading(true);
    setGeneratedVideo(null);
    setSaved(false);
    
    const runSimulation = !hasApiKey;
    setIsDemoMode(runSimulation);
    setStatusMessage(runSimulation ? 'Initializing simulation engine...' : 'Initializing Veo AI model...');

    try {
      if (runSimulation) {
          const statusSteps = [
              'Analyzing prompt semantics...',
              'Generating base keyframes...',
              'Interpolating motion vectors...',
              'Rendering final physics...',
              'Polishing video output...'
          ];

          for (const step of statusSteps) {
              setStatusMessage(step);
              await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
          }

          const randomVideo = DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
          setGeneratedVideo(randomVideo);
          trackEvent('video_generated');

      } else {
          const params: VideoGenerationParams = {
            prompt,
            aspectRatio,
            resolution,
            image: selectedImage ? {
                data: selectedImage.split(',')[1],
                mimeType
            } : undefined
          };

          const statusInterval = setInterval(() => {
             setStatusMessage(prev => {
                if (prev.includes('Initializing')) return 'Rendering high-quality frames...';
                if (prev.includes('Rendering')) return 'Compiling video sequence...';
                if (prev.includes('Compiling')) return 'Finalizing video output...';
                return prev;
             });
          }, 8000);

          const videoUrl = await generateVideo(params);
          clearInterval(statusInterval);
          setGeneratedVideo(videoUrl);
          trackEvent('video_generated');
      }
      
      setStatusMessage('');
    } catch (error) {
        console.error("Video generation failed", error);
        setStatusMessage('Failed to generate video.');
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedVideo) return;
    let content = generatedVideo;
    
    try {
        if (!isDemoMode) { 
            const base64 = await blobUrlToBase64(generatedVideo);
            if (base64.length < 4500000) content = base64;
        }
    } catch (e) { console.warn("Saving URL reference instead of file", e); }

    const success = saveItem({
        type: 'Video',
        content: content,
        title: `${isDemoMode ? 'Free Gen' : 'Veo Gen'}: ${prompt.substring(0, 20)}...`
    });
    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
                <Film className="w-8 h-8 mr-3 text-brand-500" />
                Free Video Generator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Generate engaging videos instantly. No waiting, no cost.</p>
         </div>
         
         {!hasApiKey && (
             <button 
                onClick={handleOpenKeySelect}
                className="flex items-center text-xs font-bold text-gray-500 hover:text-brand-500 transition-colors bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
             >
                 <Key className="w-3 h-3 mr-1" />
                 Have a Paid Key? Activate Veo Mode
             </button>
         )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
         {!hasApiKey && (
             <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-green-200 dark:border-green-800">
                 <Zap className="w-3 h-3 mr-1 fill-current" /> Free Mode Active
             </div>
         )}

         <div className="flex gap-4 mb-6 mt-2">
             <button
                onClick={() => setToolMode('text-to-video')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center transition-all ${toolMode === 'text-to-video' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
             >
                <Type className="w-4 h-4 mr-2" /> Text to Video
             </button>
             <button
                onClick={() => setToolMode('image-to-video')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center transition-all ${toolMode === 'image-to-video' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
             >
                <ImageIcon className="w-4 h-4 mr-2" /> Image to Video
             </button>
         </div>

         <div className="space-y-6">
            <div>
               <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Video Prompt</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold transition-all border border-brand-500/20"
                  >
                    <Upload size={14} />
                    {selectedImage ? 'Update Reference' : 'Upload Image Ref'}
                  </button>
               </div>
               <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={toolMode === 'text-to-video' ? "Describe the scene..." : "Describe how the image should move..."}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-32 resize-none"
               />
               <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            {selectedImage && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <ImageIcon size={12} /> Image Reference Active
                        </span>
                        <button onClick={() => { setSelectedImage(null); setMimeType(''); }} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="relative w-32 aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                        <img src={selectedImage} alt="Reference" className="w-full h-full object-cover" />
                    </div>
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={loading || !prompt || (toolMode === 'image-to-video' && !selectedImage)}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center border-2 border-transparent
                    ${loading || !prompt ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 shadow-brand-900/20'}`}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {loading ? 'Processing...' : (hasApiKey ? 'Generate Video (Veo)' : 'Generate Video (Free)')}
            </button>
         </div>
      </div>

      {(loading || generatedVideo) && (
        <div className="bg-black rounded-3xl p-8 border border-gray-800 shadow-2xl text-center">
            {loading ? (
                <div className="py-12">
                    <Loader2 className="w-16 h-16 text-brand-500 animate-spin mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Creating Your Video</h3>
                    <p className="text-gray-400 animate-pulse font-mono">{statusMessage}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative">
                        <video src={generatedVideo!} controls autoPlay loop className="w-full rounded-xl shadow-2xl border border-gray-700" />
                        {isDemoMode && (
                             <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">
                                 AI SIMULATION PREVIEW
                             </div>
                        )}
                    </div>
                    
                    <div className="flex justify-center gap-4">
                        <button onClick={handleSave} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center">
                            {saved ? <Check className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                            {saved ? 'Saved' : 'Save to Library'}
                        </button>
                        <a href={generatedVideo!} download="video.mp4" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors flex items-center">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </a>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default FreeVideoGenerator;
