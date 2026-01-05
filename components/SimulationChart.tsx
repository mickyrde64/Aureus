
import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MonthlyData } from '../types';

interface Props {
  data: MonthlyData[];
}

const SimulationChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-[500px] glass-card p-10 rounded-3xl shadow-2xl border border-zinc-800/50">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-zinc-300 text-sm font-black uppercase tracking-[0.15em]">Portfolio Growth Projection</h3>
        <div className="flex gap-8 text-xs font-black uppercase tracking-widest">
          <div className="flex items-center gap-3 text-amber-500">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" /> Current Value
          </div>
          <div className="flex items-center gap-3 text-blue-500">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> Total Invested
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="6 6" stroke="#18181b" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#71717a" 
            fontSize={14} 
            fontWeight="bold"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `Month ${val}`}
            minTickGap={40}
            dy={15}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={14} 
            fontWeight="bold"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(9, 9, 11, 0.98)', 
              border: '2px solid #27272a', 
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              fontFamily: 'Arial, sans-serif'
            }}
            itemStyle={{ fontSize: '15px', fontWeight: 'bold', padding: '4px 0' }}
            labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="portfolioValue" 
            stroke="#f59e0b" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3 }}
          />
          <Area 
            type="monotone" 
            dataKey="cumulativeInvested" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorInvested)" 
            strokeDasharray="8 8"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationChart;
