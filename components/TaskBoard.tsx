
import React, { useState, useEffect } from 'react';
import { Task, Status, BRANDS, PICS, User, CAMPAIGNS, Reference } from '../types';
import { generateCreativeBrief } from '../services/geminiService';
import { Plus, Trash2, Wand2, CheckCircle, Play, Loader2, Upload, Link as LinkIcon, AlertCircle, X, Eye, Calendar, User as UserIcon, FileText, ExternalLink, MessageSquare, Image as ImageIcon, Paperclip, File as FileIcon, MoreHorizontal } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentUser: User;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, setTasks, currentUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumptionTask, setResumptionTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  
  const [submittingTask, setSubmittingTask] = useState<Task | null>(null);
  const [reviewingTask, setReviewingTask] = useState<Task | null>(null);
  const [proofLink, setProofLink] = useState('');
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [proofType, setProofType] = useState<'link' | 'image'>('link');
  const [revisionFeedback, setRevisionFeedback] = useState('');

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    brand: BRANDS[0],
    campaign: CAMPAIGNS[0],
    pic: PICS[0],
    status: 'Not Started',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    references: []
  });

  const [refName, setRefName] = useState('');
  const [refType, setRefType] = useState<'link' | 'file'>('link');
  const [refUrl, setRefUrl] = useState('');
  const [refFiles, setRefFiles] = useState<FileList | null>(null);
  const [refInputKey, setRefInputKey] = useState(0);

  const isAdmin = currentUser.role === 'Admin';

  const visibleTasks = isAdmin 
    ? tasks 
    : tasks.filter(t => t.pic === currentUser.name);

  useEffect(() => {
    if (isAdmin) {
      setResumptionTask(null);
      return;
    }
    const inProgress = tasks.find(t => t.pic === currentUser.name && (t.status === 'In Progress' || t.status === 'Revision Needed'));
    if (inProgress) {
      setResumptionTask(inProgress);
    } else {
      setResumptionTask(null);
    }
  }, [currentUser.id, tasks, isAdmin]); 

  const handleStartTask = (id: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        status: 'In Progress',
        actualStartTime: t.actualStartTime || now
      };
    }));
  };

  const handleOpenSubmit = (task: Task) => {
    setSubmittingTask(task);
    setProofLink('');
    setProofFile(null);
    setProofType('link');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = () => {
    if (!submittingTask) return;
    const now = new Date();
    
    setTasks(prev => prev.map(t => {
      if (t.id !== submittingTask.id) return t;
      
      const startTime = t.actualStartTime ? new Date(t.actualStartTime) : now;
      const durationMs = now.getTime() - startTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      
      return {
        ...t,
        status: 'Waiting Review',
        proofType: proofType,
        proofOfWork: proofType === 'link' ? proofLink : (proofFile || ''),
        actualEndTime: now.toISOString(),
        durationMinutes: (t.durationMinutes || 0) + durationMinutes
      };
    }));
    setSubmittingTask(null);
  };

  const handleOpenReview = (task: Task) => {
    setReviewingTask(task);
    setRevisionFeedback('');
  };

  const handleApprove = () => {
    if (!reviewingTask) return;
    setTasks(prev => prev.map(t => {
        if (t.id !== reviewingTask.id) return t;
        return { ...t, status: 'Completed' };
    }));
    setReviewingTask(null);
  };

  const handleRequestRevision = () => {
    if (!reviewingTask) return;
    setTasks(prev => prev.map(t => {
        if (t.id !== reviewingTask.id) return t;
        return { 
            ...t, 
            status: 'Revision Needed', 
            revisionFeedback: revisionFeedback,
            actualEndTime: undefined
        };
    }));
    setReviewingTask(null);
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddReference = async () => {
    if (refType === 'link') {
      if (!refName || !refUrl) return;
      const newRef: Reference = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'link',
        name: refName,
        url: refUrl
      };
      setNewTask(prev => ({ ...prev, references: [...(prev.references || []), newRef] }));
      setRefName('');
      setRefUrl('');
    } else {
      if (!refFiles || refFiles.length === 0) return;
      
      const newRefs: Reference[] = [];
      
      const readFile = (file: File): Promise<Reference> => {
        return new Promise((resolve) => {
           const reader = new FileReader();
           reader.onloadend = () => {
              resolve({
                 id: Math.random().toString(36).substr(2, 9),
                 type: 'image',
                 name: refName ? `${refName} - ${file.name}` : file.name,
                 url: reader.result as string
              });
           };
           reader.readAsDataURL(file);
        });
      };

      for (let i = 0; i < refFiles.length; i++) {
          const ref = await readFile(refFiles[i]);
          newRefs.push(ref);
      }

      setNewTask(prev => ({ ...prev, references: [...(prev.references || []), ...newRefs] }));
      setRefFiles(null);
      setRefName('');
      setRefInputKey(prev => prev + 1);
    }
  };

  const handleRemoveReference = (id: string) => {
    setNewTask(prev => ({
      ...prev,
      references: (prev.references || []).filter(r => r.id !== id)
    }));
  };

  const isImageRef = (url: string) => {
     return url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      brand: newTask.brand || BRANDS[0],
      campaign: newTask.campaign || CAMPAIGNS[0],
      pic: newTask.pic || PICS[0],
      status: newTask.status || 'Not Started',
      startDate: newTask.startDate || '',
      endDate: newTask.endDate || '',
      description: newTask.description || '',
      subtasks: newTask.subtasks || [],
      references: newTask.references || []
    };

    setTasks([...tasks, task]);
    setIsAdding(false);
    setNewTask({ title: '', brand: BRANDS[0], campaign: CAMPAIGNS[0], pic: PICS[0], status: 'Not Started', startDate: '', endDate: '', references: [] });
    setRefName('');
    setRefUrl('');
    setRefFiles(null);
  };

  const handleGenerateBrief = async () => {
    if (!newTask.title || !newTask.brand || !newTask.pic) {
      alert("Please fill in Title, Brand and PIC first.");
      return;
    }
    setIsGenerating(true);
    try {
      const subtasks = await generateCreativeBrief(newTask.title, newTask.brand, newTask.pic);
      setNewTask(prev => ({ ...prev, subtasks }));
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Overdue': return 'bg-rose-100 text-rose-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Waiting Review': return 'bg-amber-100 text-amber-700';
      case 'Revision Needed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen relative font-sans">
      {/* --- MODAL: Task Detail --- */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(viewingTask.status)}`}>
                        {viewingTask.status}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-800 text-white px-2.5 py-0.5 rounded-full">{viewingTask.brand}</span>
                    <span className="text-[10px] font-semibold text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">{viewingTask.campaign}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{viewingTask.title}</h3>
              </div>
              <button onClick={() => setViewingTask(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</div>
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-1"><Calendar size={14}/> {viewingTask.startDate}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Deadline</div>
                    <div className="text-sm font-semibold text-rose-600 flex items-center gap-1"><Calendar size={14}/> {viewingTask.endDate}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">PIC</div>
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-1"><UserIcon size={14}/> {viewingTask.pic}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</div>
                    <div className="text-sm font-semibold text-blue-600">{formatDuration(viewingTask.durationMinutes)}</div>
                 </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><FileText size={16} className="text-slate-400"/> Description</h4>
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
                  {viewingTask.description || "No detailed description provided."}
                </div>
              </div>

              {viewingTask.references && viewingTask.references.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Paperclip size={16} className="text-slate-400"/> Attachments & References</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingTask.references.map(ref => (
                      <div key={ref.id} className="border border-slate-200 rounded-lg p-3 bg-white hover:shadow-md transition-all group">
                         {ref.type === 'link' ? (
                            <a href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600">
                               <div className="bg-blue-50 p-2 rounded-md group-hover:bg-blue-100 transition-colors"><ExternalLink size={18} /></div>
                               <div className="flex-1 min-w-0">
                                   <div className="text-xs font-bold truncate">{ref.name}</div>
                                   <div className="text-[10px] text-slate-400 truncate">{ref.url}</div>
                               </div>
                            </a>
                         ) : (
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.open(ref.url, '_blank')}>
                               {isImageRef(ref.url) ? (
                                 <img src={ref.url} alt={ref.name} className="w-10 h-10 object-cover rounded-md border border-slate-100" />
                               ) : (
                                 <div className="bg-slate-50 p-2 rounded-md"><FileIcon size={18} className="text-slate-500"/></div>
                               )}
                               <div className="flex-1 min-w-0">
                                   <div className="text-xs font-bold text-slate-700 truncate">{ref.name}</div>
                                   <div className="text-[10px] text-slate-400">Click to view</div>
                               </div>
                            </div>
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingTask.subtasks && viewingTask.subtasks.length > 0 && (
                <div>
                   <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><CheckCircle size={16} className="text-slate-400"/> Subtasks</h4>
                   <ul className="space-y-2">
                     {viewingTask.subtasks.map((task, idx) => (
                       <li key={idx} className="text-sm text-slate-600 flex items-start gap-3 bg-slate-50 p-2 rounded border border-slate-100">
                         <div className="mt-0.5 w-4 h-4 rounded border border-slate-300 bg-white flex-shrink-0"></div>
                         {task}
                       </li>
                     ))}
                   </ul>
                </div>
              )}

              {viewingTask.revisionFeedback && (
                 <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-1">
                      <AlertCircle size={16}/> Revision Feedback
                    </h4>
                    <p className="text-sm text-red-600">{viewingTask.revisionFeedback}</p>
                 </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setViewingTask(null)} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm shadow-sm">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Resumption --- */}
      {resumptionTask && !submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-t-4 border-blue-600">
            <div className="mb-6">
                 <div className="flex items-center gap-2 mb-2">
                     <span className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                     </span>
                     <h3 className="text-lg font-bold text-slate-800">Active Session Found</h3>
                 </div>
                 <p className="text-slate-600 text-sm">
                    Welcome back, <strong>{currentUser.name}</strong>. You have a task in progress.
                 </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
               <h4 className="font-bold text-slate-900 mb-1">{resumptionTask.title}</h4>
               <div className="flex gap-2 text-xs text-slate-500 mb-3">
                   <span>{resumptionTask.brand}</span> • <span>{resumptionTask.campaign}</span>
               </div>

               {resumptionTask.references && resumptionTask.references.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                     <div className="text-[10px] font-bold text-slate-400 uppercase">Quick Reference Access</div>
                     {resumptionTask.references.map(ref => (
                        <div key={ref.id} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => window.open(ref.url, '_blank')}>
                            {ref.type === 'link' ? <ExternalLink size={14} className="text-blue-500"/> : <Paperclip size={14} className="text-blue-500"/>}
                            <span className="text-xs text-slate-700 font-medium truncate">{ref.name}</span>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setResumptionTask(null)}
                className="px-4 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Continue Later
              </button>
              <button 
                onClick={() => handleOpenSubmit(resumptionTask)}
                className="px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18}/> Complete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Submit Proof --- */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Submit Work</h3>
                    <button onClick={() => setSubmittingTask(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button onClick={() => setProofType('link')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${proofType === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>URL Link</button>
                    <button onClick={() => setProofType('image')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${proofType === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Upload Image</button>
                </div>

                {proofType === 'link' ? (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Paste your work link</label>
                        <div className="flex items-center border border-slate-200 rounded-lg px-3 py-3 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                            <LinkIcon size={18} className="text-slate-400 mr-3"/>
                            <input 
                                type="text" 
                                value={proofLink} 
                                onChange={(e) => setProofLink(e.target.value)} 
                                placeholder="e.g. Figma, Google Drive, YouTube..." 
                                className="flex-1 outline-none text-sm bg-transparent text-slate-900"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Upload proof image</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all relative group">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setProofFile)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {proofFile ? (
                                <img src={proofFile} alt="Preview" className="h-40 object-contain rounded shadow-sm" />
                            ) : (
                                <>
                                    <div className="bg-slate-100 p-3 rounded-full text-slate-400 mb-3 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <Upload size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">Click to upload image</span>
                                    <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => setSubmittingTask(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSubmitProof} className="px-5 py-2.5 text-sm font-bold bg-[#C8102E] text-white rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Submit for Review</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL: Admin Review --- */}
      {reviewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-900">Review Task</h3>
               <button onClick={() => setReviewingTask(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>

            <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Submitted Proof</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    {reviewingTask.proofType === 'link' ? (
                        <a href={reviewingTask.proofOfWork} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline break-all">
                            <div className="bg-white p-2 rounded shadow-sm"><ExternalLink size={18} /></div>
                            <span className="font-medium text-sm">{reviewingTask.proofOfWork}</span>
                        </a>
                    ) : (
                        reviewingTask.proofOfWork ? (
                             <img src={reviewingTask.proofOfWork} alt="Proof" className="w-full h-auto rounded-lg shadow-sm" />
                        ) : <span className="text-slate-400 text-sm italic">No proof provided</span>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    Feedback <span className="text-slate-300 font-normal normal-case">(Only if requesting revision)</span>
                </h4>
                <textarea 
                   value={revisionFeedback}
                   onChange={(e) => setRevisionFeedback(e.target.value)}
                   placeholder="Describe what needs to be fixed..."
                   className="w-full border border-slate-200 rounded-xl p-3 text-sm h-24 focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 focus:bg-white transition-all resize-none text-slate-900"
                />
            </div>

            <div className="flex justify-end gap-3">
                <button 
                  onClick={handleRequestRevision}
                  disabled={!revisionFeedback}
                  className="px-5 py-2.5 text-sm font-bold bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Request Revision
                </button>
                <button 
                  onClick={handleApprove}
                  className="px-5 py-2.5 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                >
                    Approve Work
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Add Task --- */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Create New Task</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Task Title</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g., Holiday Campaign Visuals"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Brand</label>
                <div className="relative">
                    <select 
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white appearance-none text-slate-900"
                    value={newTask.brand}
                    onChange={e => setNewTask({...newTask, brand: e.target.value})}
                    >
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Campaign</label>
                <div className="relative">
                    <select 
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white appearance-none text-slate-900"
                    value={newTask.campaign}
                    onChange={e => setNewTask({...newTask, campaign: e.target.value})}
                    >
                    {CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Assign To (PIC)</label>
                <div className="relative">
                    <select 
                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white appearance-none text-slate-900"
                    value={newTask.pic}
                    onChange={e => setNewTask({...newTask, pic: e.target.value})}
                    >
                    {PICS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Deadline</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white text-slate-900"
                  value={newTask.endDate}
                  onChange={e => setNewTask({...newTask, endDate: e.target.value})}
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Description</label>
                <textarea 
                  className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none bg-slate-50 focus:bg-white transition-all text-slate-900"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="What needs to be done? Be specific..."
                />
              </div>
            </div>

            {/* Reference Material */}
            <div className="mb-6 pt-6 border-t border-slate-100">
               <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                   <Paperclip size={18} className="text-slate-500"/> Attachments & References
               </label>
               
               {newTask.references && newTask.references.length > 0 && (
                   <div className="mb-4 flex flex-wrap gap-2">
                       {newTask.references.map(ref => (
                           <div key={ref.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-xs">
                               <span className="font-medium text-blue-800">{ref.name}</span>
                               <button onClick={() => handleRemoveReference(ref.id)} className="text-blue-400 hover:text-blue-600"><X size={14}/></button>
                           </div>
                       ))}
                   </div>
               )}

               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full space-y-3">
                      <div className="flex gap-3">
                          <div className="w-1/3">
                              <input 
                                type="text" 
                                value={refName} 
                                onChange={(e) => setRefName(e.target.value)} 
                                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none focus:border-blue-500 text-slate-900" 
                                placeholder={refType === 'file' ? "Prefix (Optional)" : "Name e.g. Moodboard"} 
                              />
                          </div>
                          <div className="w-2/3">
                               <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                                   <button onClick={() => setRefType('link')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${refType === 'link' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>Link</button>
                                   <button onClick={() => setRefType('file')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${refType === 'file' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>File</button>
                               </div>
                          </div>
                      </div>
                      
                      {refType === 'link' ? (
                          <input type="text" value={refUrl} onChange={(e) => setRefUrl(e.target.value)} className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none focus:border-blue-500 text-slate-900" placeholder="https://example.com/assets..." />
                      ) : (
                          <input 
                            key={refInputKey}
                            type="file" 
                            multiple 
                            onChange={(e) => setRefFiles(e.target.files)} 
                            className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-slate-900" 
                            accept="image/*,application/pdf,text/plain" 
                          />
                      )}
                  </div>
                  <button 
                      onClick={handleAddReference} 
                      className="w-full md:w-auto px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm"
                  >
                      <Plus size={18}/>
                  </button>
               </div>
            </div>

            {/* AI Generator */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Wand2 size={16} className="text-blue-600"/> AI Creative Assistant
                </label>
                <button 
                  onClick={handleGenerateBrief}
                  disabled={isGenerating}
                  className="text-xs bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                  Generate Checklist
                </button>
              </div>
              
              {newTask.subtasks && newTask.subtasks.length > 0 ? (
                <ul className="space-y-2 bg-white/60 rounded-lg p-3 border border-blue-100/50">
                  {newTask.subtasks.map((st, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1 bg-blue-100 rounded-full p-0.5"><CheckCircle size={10}/></span> {st}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-blue-400/80 italic">
                  Enter details and click generate to get AI-powered subtasks.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleAddTask} className="px-6 py-3 bg-[#C8102E] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'Team Tasks' : 'My Assignments'}
            </h2>
            <p className="text-slate-500 mt-1">Manage campaigns and creative output.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform"/> <span className="font-bold">New Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleTasks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <FileText size={48} className="mb-4 opacity-20"/>
                <p className="font-medium">No tasks found matching your filters.</p>
            </div>
        )}
        {visibleTasks.map(task => (
          <div key={task.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            {/* Decorative Brand Stripe */}
            <div className={`absolute top-0 left-0 w-full h-1 ${
                task.brand === 'Nike' ? 'bg-black' : 
                task.brand === 'Coca-Cola' ? 'bg-red-600' : 
                task.brand === 'Spotify' ? 'bg-green-500' : 
                task.brand === 'Samsung' ? 'bg-blue-600' : 'bg-slate-400'
            }`} />

            <div className="flex justify-between items-start mb-3 mt-1">
                <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${getStatusStyle(task.status)}`}>
                        {task.status}
                    </span>
                </div>
                {task.references && task.references.length > 0 && (
                     <div className="text-slate-300 group-hover:text-blue-500 transition-colors" title="Has references">
                         <Paperclip size={14}/>
                     </div>
                )}
            </div>

            <h3 
                onClick={() => setViewingTask(task)}
                className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight cursor-pointer group-hover:text-[#C8102E] transition-colors"
            >
                {task.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
                 <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">{task.brand}</span>
                 <span>•</span>
                 <span className="truncate max-w-[100px]">{task.campaign}</span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-2 ring-white">
                      {task.pic.substring(0, 2).toUpperCase()}
                   </div>
                   <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Assignee</span>
                        <span className="text-xs font-bold text-slate-700">{task.pic}</span>
                   </div>
                </div>

                {/* Due Date Warning */}
                <div className={`text-xs font-bold ${new Date(task.endDate) < new Date() && task.status !== 'Completed' ? 'text-red-500' : 'text-slate-400'}`}>
                     {new Date(task.endDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                </div>
            </div>
            
            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                 <button 
                    onClick={() => setViewingTask(task)}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 shadow-lg flex items-center justify-center hover:text-blue-600 hover:scale-110 transition-all"
                    title="View Details"
                 >
                     <Eye size={18} />
                 </button>

                 {isAdmin ? (
                     <>
                        {task.status === 'Waiting Review' && (
                            <button onClick={() => handleOpenReview(task)} className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 shadow-lg flex items-center justify-center hover:scale-110 transition-all" title="Review">
                                <CheckCircle size={18}/>
                            </button>
                        )}
                        <button onClick={() => handleDelete(task.id)} className="w-10 h-10 rounded-full bg-white border border-slate-200 text-red-500 shadow-lg flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all" title="Delete">
                            <Trash2 size={18} />
                        </button>
                     </>
                 ) : (
                     <>
                        {(task.status === 'Not Started' || task.status === 'Revision Needed') && (
                            <button onClick={() => handleStartTask(task.id)} className="w-10 h-10 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all" title="Start Timer">
                                <Play size={18} />
                            </button>
                        )}
                        {task.status === 'In Progress' && (
                            <button onClick={() => handleOpenSubmit(task)} className="w-10 h-10 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all" title="Submit Work">
                                <CheckCircle size={18} />
                            </button>
                        )}
                     </>
                 )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
