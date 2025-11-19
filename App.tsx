
import React, { useState, useEffect } from 'react';
import { FilterBar } from './components/FilterBar';
import { Dashboard } from './components/Dashboard';
import { TaskBoard } from './components/TaskBoard';
import { INITIAL_TASKS, USERS } from './constants';
import { Task, FilterState, User } from './types';
import { LayoutDashboard, CheckSquare, Menu, UserCircle } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('creativePulseTasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (error) {
      console.error("Failed to load tasks from storage", error);
      return INITIAL_TASKS;
    }
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks'>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]); // Default to Admin
  const [filters, setFilters] = useState<FilterState>({
    brand: 'All',
    pic: 'All',
    campaign: 'All',
    startDate: '',
    endDate: ''
  });

  // Persist tasks whenever they change
  useEffect(() => {
    localStorage.setItem('creativePulseTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Apply Filters
  const filteredTasks = tasks.filter(task => {
    // Dropdown Filters
    if (filters.brand !== 'All' && task.brand !== filters.brand) return false;
    if (filters.pic !== 'All' && task.pic !== filters.pic) return false;
    
    // Campaign Filter (Now checking task.campaign)
    if (filters.campaign !== 'All' && task.campaign !== filters.campaign) return false;
    
    // Date Filters
    if (filters.startDate && task.startDate < filters.startDate) return false;
    if (filters.endDate && task.endDate > filters.endDate) return false;

    return true;
  });

  const handleUserSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const user = USERS.find(u => u.id === e.target.value);
     if (user) setCurrentUser(user);
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200 z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
           <h1 className="text-xl font-extrabold text-[#C8102E] flex items-center gap-2">
             <span className="bg-[#C8102E] text-white p-1 rounded">MG</span> Mazuta Group
           </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all ${currentView === 'dashboard' ? 'bg-red-50 text-[#C8102E] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all ${currentView === 'tasks' ? 'bg-red-50 text-[#C8102E] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <CheckSquare size={20} />
            Tasks & To-Do
          </button>
        </nav>

        {/* User Profile & Switcher */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold shadow-md">
               {currentUser.avatar}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
             </div>
          </div>
          
          {/* Demo: User Switcher */}
          <div className="mt-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Switch Account (Demo)</label>
            <select 
               className="w-full mt-1 text-xs border-gray-300 rounded shadow-sm p-1 bg-white text-slate-900"
               value={currentUser.id}
               onChange={handleUserSwitch}
            >
               {USERS.map(u => (
                 <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
               ))}
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm">
            <h1 className="text-lg font-bold text-[#C8102E]">Mazuta Group</h1>
            <button className="p-2 rounded bg-gray-100"><Menu size={20}/></button>
        </div>

        {/* Red Filter Bar */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' ? (
            <Dashboard tasks={filteredTasks} />
          ) : (
            <TaskBoard tasks={filteredTasks} setTasks={setTasks} currentUser={currentUser} />
          )}
        </div>
      </main>

      {/* Mobile Navigation Bottom */}
      <div className="md:hidden absolute bottom-0 w-full bg-white border-t flex justify-around p-4 z-30 shadow-lg">
         <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center ${currentView === 'dashboard' ? 'text-[#C8102E]' : 'text-gray-400'}`}>
            <LayoutDashboard size={20} /> <span className="text-xs">Dash</span>
         </button>
         <button onClick={() => setCurrentView('tasks')} className={`flex flex-col items-center ${currentView === 'tasks' ? 'text-[#C8102E]' : 'text-gray-400'}`}>
            <CheckSquare size={20} /> <span className="text-xs">Tasks</span>
         </button>
         <div className="flex-col items-center text-gray-400 hidden md:flex">
             <UserCircle size={20} /> <span className="text-xs">{currentUser.name}</span>
         </div>
      </div>
    </div>
  );
}
