
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  trendColor?: 'text-green-500' | 'text-red-500';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, trend, trendColor }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        {Icon && (
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                <Icon size={20} />
            </div>
        )}
      </div>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2 text-xs font-medium">
            {trend && (
                <span className={`${trendColor || 'text-slate-600'} bg-slate-50 px-1.5 py-0.5 rounded`}>
                    {trend}
                </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
