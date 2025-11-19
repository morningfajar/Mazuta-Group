
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, PICS } from '../types';
import { MetricCard } from './MetricCard';
import { LayoutList, CheckCircle2, AlertOctagon, Timer, Clock, Target, Briefcase } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  // --- Metrics Calculation ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const countCompleted = completedTasks.length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue' || (new Date(t.endDate) < new Date() && t.status !== 'Completed'));
  const countOverdue = overdueTasks.length;
  
  const inProgressTasks = tasks.filter(t => ['In Progress', 'Waiting Review', 'Revision Needed'].includes(t.status));
  const countInProgress = inProgressTasks.length;
  
  const notStartedTasks = tasks.filter(t => t.status === 'Not Started');
  const countNotStarted = notStartedTasks.length;

  const completionRate = totalTasks > 0 ? Math.round((countCompleted / totalTasks) * 100) : 0;
  
  const onTimeTasks = completedTasks.filter(t => {
      if (!t.actualEndTime) return true; 
      const endOfDayDeadline = new Date(t.endDate);
      endOfDayDeadline.setHours(23, 59, 59, 999);
      return new Date(t.actualEndTime) <= endOfDayDeadline;
  });
  const onTimeRate = countCompleted > 0 ? Math.round((onTimeTasks.length / countCompleted) * 100) : 100;

  const totalDurationMinutes = completedTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const avgWorkHours = countCompleted > 0 ? (totalDurationMinutes / 60 / countCompleted).toFixed(2) : "0.00";

  // --- Chart Data ---
  const distributionData = [
    { name: 'Completed', value: countCompleted },
    { name: 'Pending', value: totalTasks - countCompleted },
  ];
  const COLORS = ['#10b981', '#e2e8f0']; 

  const memberPerformance = PICS.map(pic => {
      const memberTasks = tasks.filter(t => t.pic === pic);
      const memberCompleted = memberTasks.filter(t => t.status === 'Completed');
      const memberTotalMinutes = memberCompleted.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      
      const memberLate = memberCompleted.filter(t => {
         if (!t.actualEndTime) return false;
         const deadline = new Date(t.endDate);
         deadline.setHours(23, 59, 59, 999);
         return new Date(t.actualEndTime) > deadline;
      }).length;

      return {
          name: pic,
          tasks: memberTasks.length,
          completed: memberCompleted.length,
          hours: (memberTotalMinutes / 60).toFixed(1),
          late: memberLate
      };
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500 text-sm mt-1">Track team performance and daily creative output.</p>
      </div>

      {/* Top Row Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <MetricCard title="Total Tasks" value={totalTasks} icon={LayoutList} />
        <MetricCard title="Completed" value={countCompleted} icon={CheckCircle2} trendColor="text-green-500" />
        <MetricCard title="Overdue" value={countOverdue} icon={AlertOctagon} trend={countOverdue > 0 ? "Needs Action" : "On Track"} trendColor={countOverdue > 0 ? "text-red-500" : "text-green-500"} />
        <MetricCard title="Active" value={countInProgress} icon={Timer} subtitle="In Progress" />
        <MetricCard title="Not Started" value={countNotStarted} icon={Clock} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Task Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center h-80">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 w-full text-left flex items-center gap-2">
                    <Target size={16} /> Completion Rate
                  </h3>
                  <div className="flex-1 w-full relative flex items-center justify-center min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={0}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-4xl font-bold text-slate-800">{completionRate}%</span>
                         <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Done</span>
                    </div>
                  </div>
                </div>

                {/* Team Contribution Bar */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-80">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                     <Briefcase size={16} /> Workload Distribution
                  </h3>
                  <div className="flex-1 w-full min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={memberPerformance} barGap={8} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                         <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                         <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                         <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                         />
                         <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Assigned" barSize={32} />
                         <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" barSize={32} />
                       </BarChart>
                     </ResponsiveContainer>
                  </div>
                </div>
             </div>

             {/* Detailed Member Performance Table */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                 <div className="p-6 border-b border-slate-100">
                     <h3 className="text-sm font-bold text-slate-700">Team Performance Breakdown</h3>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-600">
                         <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                             <tr>
                                 <th className="px-6 py-4">Member</th>
                                 <th className="px-6 py-4 text-center">Assigned</th>
                                 <th className="px-6 py-4 text-center">Hours Logged</th>
                                 <th className="px-6 py-4 text-center">Late Tasks</th>
                                 <th className="px-6 py-4 text-center">Completion %</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {memberPerformance.map((m, idx) => (
                                 <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">
                                             {m.name.substring(0,2).toUpperCase()}
                                         </div>
                                         {m.name}
                                     </td>
                                     <td className="px-6 py-4 text-center font-medium">{m.tasks}</td>
                                     <td className="px-6 py-4 text-center">{m.hours} h</td>
                                     <td className="px-6 py-4 text-center">
                                         {m.late > 0 ? <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">{m.late}</span> : <span className="text-slate-300">-</span>}
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                         {m.tasks > 0 ? Math.round((m.completed / m.tasks) * 100) : 0}%
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        </div>

        {/* Right Column: Stats & Lists */}
        <div className="flex flex-col gap-6">
           <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">Avg. Time</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{avgWorkHours}</p>
                    <p className="text-[10px] text-slate-400">Hours / Task</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">On-Time</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{onTimeRate}%</p>
                    <p className="text-[10px] text-slate-400">Rate</p>
                </div>
           </div>
           
           {/* Active Tasks List */}
           <div className="bg-white shadow-sm rounded-xl border border-slate-100 flex flex-col flex-1 overflow-hidden h-[320px]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 text-sm">Active Now</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{countInProgress}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {inProgressTasks.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle2 size={24} className="mb-2 opacity-20"/>
                            <span className="text-xs">No active tasks</span>
                        </div>
                    )}
                    {inProgressTasks.map(t => (
                        <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-slate-800 line-clamp-1">{t.title}</div>
                                <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                                  <span>{t.pic}</span>
                                  {t.status === 'Waiting Review' ? <span className="text-yellow-600 font-bold bg-yellow-50 px-1 rounded">Review</span> : 
                                   t.status === 'Revision Needed' ? <span className="text-red-600 font-bold bg-red-50 px-1 rounded">Revision</span> :
                                   <span className="text-blue-600 bg-blue-50 px-1 rounded">Working</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
           </div>

           {/* Overdue List */}
           <div className="bg-white shadow-sm rounded-xl border border-slate-100 flex flex-col flex-1 overflow-hidden h-[320px]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-red-700 text-sm">Attention Needed</h3>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{countOverdue}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {overdueTasks.length === 0 && (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle2 size={24} className="mb-2 opacity-20"/>
                            <span className="text-xs">All good! Nothing overdue.</span>
                        </div>
                    )}
                    {overdueTasks.map(t => (
                        <div key={t.id} className="bg-red-50/50 p-3 rounded-lg border border-red-100">
                            <div className="text-xs font-bold text-red-800 line-clamp-1">{t.title}</div>
                            <div className="text-[10px] text-red-600/80 flex justify-between mt-1">
                                <span className="font-medium">{t.pic}</span>
                                <span>Due: {t.endDate}</span>
                            </div>
                        </div>
                    ))}
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};
