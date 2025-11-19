
import React from 'react';
import { FilterState, BRANDS, PICS, CAMPAIGNS } from '../types';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const Select = ({ label, value, onChange, options }: any) => (
    <div className="flex flex-col w-full">
      <label className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white text-slate-800 text-xs font-semibold py-2.5 px-3 rounded-lg border-none focus:ring-2 focus:ring-white/50 cursor-pointer appearance-none shadow-sm"
        >
          <option value="All">All {label}s</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#C8102E] px-6 py-5 w-full shadow-md z-10">
      <div className="flex items-center gap-2 mb-3 text-white/90">
        <Filter size={14} />
        <span className="text-xs font-bold uppercase tracking-widest">Global Filters</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <Select label="Brand" value={filters.brand} onChange={(v: string) => handleChange('brand', v)} options={BRANDS} />
        
        <div className="flex flex-col w-full">
           <label className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">Start Date</label>
           <input 
             type="date"
             value={filters.startDate || ''}
             onChange={(e) => handleChange('startDate', e.target.value)}
             className="bg-white text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg border-none focus:ring-2 focus:ring-white/50 w-full cursor-pointer outline-none shadow-sm h-[34px]"
           />
        </div>

         <div className="flex flex-col w-full">
           <label className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">End Date</label>
           <input 
             type="date"
             value={filters.endDate || ''}
             onChange={(e) => handleChange('endDate', e.target.value)}
             className="bg-white text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg border-none focus:ring-2 focus:ring-white/50 w-full cursor-pointer outline-none shadow-sm h-[34px]"
           />
        </div>

        <Select label="PIC" value={filters.pic} onChange={(v: string) => handleChange('pic', v)} options={PICS} />
        <Select label="Campaign" value={filters.campaign} onChange={(v: string) => handleChange('campaign', v)} options={CAMPAIGNS} />
      </div>
    </div>
  );
};
