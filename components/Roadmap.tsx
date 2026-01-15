
import React, { useState, useEffect } from 'react';
import { generateBusinessRoadmap } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { CheckCircle, Circle, Loader2, Bookmark, Check, Copy, Edit2, Save, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Roadmap: React.FC = () => {
  const [businessType, setBusinessType] = useState('E-commerce');
  const [roadmap, setRoadmap] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const generatePlan = async () => {
    setLoading(true);
    setSaved(false);
    setIsEditing(false);
    try {
      const result = await generateBusinessRoadmap(businessType);
      setRoadmap(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!roadmap) return;
    const success = saveItem({
        type: 'Post', 
        content: roadmap,
        title: `Roadmap: ${businessType} Launch Plan`,
    });
    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleCopy = () => {
    if (!roadmap) return;
    navigator.clipboard.writeText(roadmap);
    setCopied(true);
    window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Roadmap copied to clipboard', type: 'info' } 
    }));
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = () => {
    setEditValue(roadmap);
    setIsEditing(true);
  };

  const saveEdit = () => {
    setRoadmap(editValue);
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('sbl-toast', { 
        detail: { message: 'Roadmap updated', type: 'success' } 
    }));
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  // Initial fetch
  useEffect(() => {
    if (!roadmap) generatePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
         <div>
           <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Launch Roadmap</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Step-by-step plan to launch your sustainable business.</p>
         </div>
         <div className="flex items-center gap-2 flex-wrap">
           <select 
             value={businessType}
             onChange={(e) => setBusinessType(e.target.value)}
             className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
             disabled={loading || isEditing}
           >
             <option>E-commerce</option>
             <option>SaaS</option>
             <option>Consulting / Agency</option>
             <option>Content Creation</option>
             <option>Service Business (Plumbing, Electrician)</option>
             <option>Medical Practice / Clinic</option>
             <option>Restaurant / Food Service</option>
             <option>Education / Tutoring</option>
             <option>Real Estate</option>
             <option>Non-Profit Organization</option>
           </select>
           <button 
             onClick={generatePlan}
             className="bg-brand-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-800 transition-all flex items-center border-2 border-brand-700"
             disabled={loading || isEditing}
           >
             {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Refresh Plan'}
           </button>
           {roadmap && !loading && (
               <>
                {!isEditing ? (
                  <button 
                      onClick={startEditing}
                      className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                        onClick={saveEdit}
                        className="flex items-center bg-brand-600 border border-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-500 transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" /> Save
                    </button>
                    <button 
                        onClick={cancelEdit}
                        className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-4 h-4 mr-2" /> Cancel
                    </button>
                  </div>
                )}
                <button 
                    onClick={handleCopy}
                    disabled={isEditing}
                    className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    {copied ? <Check className="w-4 h-4 mr-2 text-brand-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
                <button 
                    onClick={handleSaveToLibrary}
                    disabled={isEditing}
                    className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    {saved ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Bookmark className="w-4 h-4 mr-2" />}
                    {saved ? 'Saved' : 'Save'}
                </button>
               </>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-premium">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-4" />
              <p className="text-gray-500">Architecting your {businessType} Roadmap...</p>
            </div>
          ) : isEditing ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full h-96 p-6 bg-gray-50 dark:bg-gray-900 border border-brand-500/30 rounded-2xl text-gray-900 dark:text-white font-mono text-sm leading-relaxed outline-none resize-none"
              autoFocus
            />
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none prose-brand prose-headings:text-brand-500 prose-strong:text-brand-400">
              <ReactMarkdown>{roadmap}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-brand-500/5 p-8 rounded-[2rem] border border-brand-500/10 shadow-lg">
            <h3 className="font-black text-brand-500 mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Protocol Progress
            </h3>
            <div className="space-y-6">
               {[
                 { label: 'Define Niche', done: true },
                 { label: 'Setup Social Accounts', done: true },
                 { label: 'Generate First Content', done: true },
                 { label: 'Launch Website', done: false },
                 { label: 'First Client/Sale', done: false },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-start">
                   {item.done ? (
                     <CheckCircle className="w-5 h-5 text-brand-500 mr-3 shrink-0" />
                   ) : (
                     <Circle className="w-5 h-5 text-gray-400 dark:text-gray-700 mr-3 shrink-0" />
                   )}
                   <span className={`text-sm font-bold ${item.done ? 'text-gray-400 dark:text-gray-600 line-through decoration-brand-500/30' : 'text-gray-700 dark:text-gray-300'}`}>
                     {item.label}
                   </span>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">AI Launch Tip</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Use the generated roadmap to guide your daily tasks in the LaunchPad. Most entrepreneurs fail because they lack a sequential system. AI ensures you follow the most efficient path to profitability.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
