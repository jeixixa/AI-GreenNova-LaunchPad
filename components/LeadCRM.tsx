
import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { analyzeLeadPsychology } from '../services/geminiService';
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  User, 
  Filter, 
  ArrowRight, 
  Zap, 
  Target, 
  Brain, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  MessageCircle,
  LayoutGrid,
  List,
  Download,
  ChevronRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldCheck,
  Flag
} from 'lucide-react';

const STATUSES = ['Hooked', 'Engaged', 'Conversion', 'Closed'] as const;
const DRAFT_KEY = 'sbl_lead_form_draft';

const LeadCRM: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>(() => {
        const saved = localStorage.getItem('sbl_lead_vault');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Example Lead', source: 'Facebook Hook', status: 'Engaged', notes: 'Interested in AI coaching.', lastContact: Date.now() },
            { id: '2', name: 'James Miller', source: 'LinkedIn Thread', status: 'Hooked', notes: 'Looking to scale his agency.', lastContact: Date.now() - 86400000 },
            { id: '3', name: 'Sarah Chen', source: 'WhatsApp Ad', status: 'Conversion', notes: 'High intent, ready for proposal.', lastContact: Date.now() - 172800000 }
        ];
    });
    
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
    const [isAdding, setIsAdding] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', source: 'Manual', status: 'Hooked' as const, notes: '' });
    const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
    const [leadAnalysis, setLeadAnalysis] = useState<Record<string, string>>({});

    useEffect(() => {
        localStorage.setItem('sbl_lead_vault', JSON.stringify(leads));
    }, [leads]);

    // Load form draft on mount
    useEffect(() => {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
            try {
                const p = JSON.parse(draft);
                setNewLead(p);
                // If there's content in the draft, open the modal to remind them
                if (p.name || p.notes) setIsAdding(true);
            } catch (e) {}
        }
    }, []);

    // Save form draft on change
    useEffect(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(newLead));
    }, [newLead]);

    const handleAddLead = () => {
        if (!newLead.name) return;
        const lead: Lead = {
            id: Date.now().toString(),
            ...newLead,
            lastContact: Date.now()
        };
        setLeads([lead, ...leads]);
        setNewLead({ name: '', source: 'Manual', status: 'Hooked', notes: '' });
        localStorage.removeItem(DRAFT_KEY);
        setIsAdding(false);
    };

    const handleAnalyze = async (lead: Lead) => {
        setAnalyzingLeadId(lead.id);
        try {
            const result = await analyzeLeadPsychology(lead.notes);
            setLeadAnalysis(prev => ({ ...prev, [lead.id]: result }));
        } catch (e) {
            alert("Neural analysis failed.");
        } finally {
            setAnalyzingLeadId(null);
        }
    };

    const updateLeadStatus = (id: string, status: Lead['status']) => {
        setLeads(leads.map(l => l.id === id ? { ...l, status, lastContact: Date.now() } : l));
    };

    const deleteLead = (id: string) => {
        if (confirm("Permanently remove lead from the SBL vault?")) {
            setLeads(leads.filter(l => l.id !== id));
        }
    };

    const exportToCSV = () => {
        const headers = ["Name", "Source", "Status", "Notes", "Last Contact"];
        const rows = leads.map(l => [
            l.name,
            l.source,
            l.status,
            l.notes.replace(/,/g, ';'),
            new Date(l.lastContact).toLocaleDateString()
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(r => r.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SBL_Leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(search.toLowerCase()) || 
        l.notes.toLowerCase().includes(search.toLowerCase()) ||
        l.source.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: leads.length,
        closed: leads.filter(l => l.status === 'Closed').length,
        conversion: leads.filter(l => l.status === 'Conversion').length,
        active: leads.filter(l => l.status !== 'Closed').length
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
                        <Users className="w-10 h-10 text-brand-500" />
                        Lead Conversion Vault
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Managing the digital harvest. From attention to sustainable revenue.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={exportToCSV}
                        className="bg-dark-input hover:bg-gray-800 text-gray-400 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 border border-gray-700 transition-all"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-glow"
                    >
                        <Plus size={18} /> New Lead Protocol
                    </button>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Leads', val: stats.total, icon: Users, color: 'text-blue-500' },
                    { label: 'Active Pipeline', val: stats.active, icon: TrendingUp, color: 'text-brand-500' },
                    { label: 'Ready to Close', val: stats.conversion, icon: Target, color: 'text-yellow-500' },
                    { label: 'Closed Deals', val: stats.closed, icon: ShieldCheck, color: 'text-emerald-500' }
                ].map((s, i) => (
                    <div key={i} className="bg-dark-card border border-gray-800 p-6 rounded-3xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                                <h3 className="text-2xl font-black text-white">{s.val}</h3>
                            </div>
                            <s.icon className={`${s.color} opacity-20`} size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls & View Toggle */}
            <div className="bg-dark-card border border-gray-800 rounded-3xl p-6 shadow-premium">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search names, notes, or sources..."
                            className="w-full bg-dark-input border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                        />
                    </div>
                    <div className="flex bg-dark-input p-1 rounded-2xl border border-gray-700">
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <List size={16} /> Table View
                        </button>
                        <button 
                            onClick={() => setViewMode('pipeline')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'pipeline' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <LayoutGrid size={16} /> Pipeline View
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    {viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-800 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                        <th className="p-4">Lead Identity</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Harvest Source</th>
                                        <th className="p-4">Neural Strategy</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filteredLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center text-gray-600 uppercase font-black text-xs tracking-widest">No leads detected in current search.</td>
                                        </tr>
                                    ) : filteredLeads.map(lead => (
                                        <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand-900/40 rounded-full flex items-center justify-center border border-brand-500/20 text-brand-400 font-black">
                                                        {lead.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold">{lead.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                                                            <Clock size={10} /> Active {new Date(lead.lastContact).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={lead.status}
                                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-transparent outline-none cursor-pointer ${
                                                        lead.status === 'Closed' ? 'border-green-500 text-green-400' : 
                                                        lead.status === 'Conversion' ? 'border-blue-500 text-blue-400' :
                                                        lead.status === 'Engaged' ? 'border-yellow-500 text-yellow-400' :
                                                        'border-gray-700 text-gray-400'
                                                    }`}
                                                >
                                                    {STATUSES.map(s => <option key={s} value={s} className="bg-dark-card">{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5 w-fit">{lead.source}</p>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                {leadAnalysis[lead.id] ? (
                                                    <div className="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                                                        <p className="text-[10px] text-brand-300 italic line-clamp-2">{leadAnalysis[lead.id]}</p>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleAnalyze(lead)}
                                                        disabled={analyzingLeadId === lead.id}
                                                        className="text-[10px] font-black uppercase tracking-widest text-brand-500 flex items-center gap-2 hover:text-brand-400 transition-colors"
                                                    >
                                                        {analyzingLeadId === lead.id ? <Loader2 className="animate-spin" size={12} /> : <Brain size={14} />}
                                                        Extract Strategy
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-gray-500 hover:text-brand-500 transition-colors" title="Launch Message Bridge"><MessageCircle size={18} /></button>
                                                    <button onClick={() => deleteLead(lead.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Wipe Lead Data"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
                            {STATUSES.map(status => {
                                const statusLeads = filteredLeads.filter(l => l.status === status);
                                return (
                                    <div key={status} className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                                                status === 'Closed' ? 'text-green-500' : 
                                                status === 'Conversion' ? 'text-blue-500' :
                                                status === 'Engaged' ? 'text-yellow-500' :
                                                'text-gray-500'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    status === 'Closed' ? 'bg-green-500' : 
                                                    status === 'Conversion' ? 'bg-blue-500' :
                                                    status === 'Engaged' ? 'bg-yellow-500' :
                                                    'bg-gray-500'
                                                }`} />
                                                {status} ({statusLeads.length})
                                            </h4>
                                        </div>
                                        <div className="flex-1 bg-dark-input/30 rounded-3xl border border-gray-800/50 p-3 space-y-3 custom-scrollbar overflow-y-auto max-h-[700px]">
                                            {statusLeads.map(lead => (
                                                <div 
                                                    key={lead.id} 
                                                    className="bg-dark-card border border-gray-800 p-4 rounded-2xl shadow-sm hover:border-brand-500/30 transition-all cursor-grab active:cursor-grabbing group"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-brand-900/40 rounded-full flex items-center justify-center text-[10px] font-black text-brand-400">
                                                                {lead.name[0]}
                                                            </div>
                                                            <p className="text-xs font-bold text-white">{lead.name}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const nextIdx = (STATUSES.indexOf(lead.status) + 1) % STATUSES.length;
                                                                updateLeadStatus(lead.id, STATUSES[nextIdx]);
                                                            }}
                                                            className="text-gray-600 hover:text-white transition-colors"
                                                        >
                                                            <ChevronRight size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 line-clamp-2 italic mb-3 leading-relaxed">
                                                        "{lead.notes || 'No psychological data logged...'}"
                                                    </p>
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                                                        <span className="text-[8px] font-black text-gray-600 uppercase">{lead.source}</span>
                                                        {leadAnalysis[lead.id] ? (
                                                            <Brain size={12} className="text-brand-500 animate-pulse" />
                                                        ) : (
                                                            <button onClick={() => handleAnalyze(lead)} className="text-gray-600 hover:text-brand-500"><Brain size={12} /></button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {statusLeads.length === 0 && (
                                                <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-800/50 rounded-2xl opacity-20">
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Zone Empty</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Lead Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-dark-card border border-gray-800 rounded-[3rem] p-10 max-w-lg w-full relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                            <ShieldCheck className="text-brand-500" />
                            New Lead Protocol
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity Name</label>
                                <input 
                                    value={newLead.name}
                                    onChange={e => setNewLead({...newLead, name: e.target.value})}
                                    placeholder="Full Name"
                                    className="w-full bg-dark-input border border-gray-700 rounded-xl py-4 px-5 text-white font-bold outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Initial Status</label>
                                    <select 
                                        value={newLead.status}
                                        onChange={e => setNewLead({...newLead, status: e.target.value as any})}
                                        className="w-full bg-dark-input border border-gray-700 rounded-xl py-4 px-5 text-white font-bold outline-none"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Acquisition Source</label>
                                    <input 
                                        value={newLead.source}
                                        onChange={e => setNewLead({...newLead, source: e.target.value})}
                                        placeholder="e.g. Facebook"
                                        className="w-full bg-dark-input border border-gray-700 rounded-xl py-4 px-5 text-white font-bold outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Neural Profile (Notes)</label>
                                <textarea 
                                    value={newLead.notes}
                                    onChange={e => setNewLead({...newLead, notes: e.target.value})}
                                    placeholder="Pain points, primary resistance, or specific goals mentioned..."
                                    className="w-full bg-dark-input border border-gray-700 rounded-xl py-4 px-5 text-white h-32 outline-none focus:ring-2 focus:ring-brand-500 resize-none font-medium"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => { setIsAdding(false); localStorage.removeItem(DRAFT_KEY); setNewLead({ name: '', source: 'Manual', status: 'Hooked', notes: '' }); }} className="flex-1 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">Discard Entry</button>
                                <button onClick={handleAddLead} className="flex-1 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-glow transition-all active:scale-95">Finalize In Vault</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadCRM;
