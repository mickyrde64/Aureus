
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
    <div className="w-full h-[400px] glass-card p-6 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Portfolio Trajectory</h3>
        <div className="flex gap-4 text-[10px] font-bold uppercase">
          <div className="flex items-center gap-1.5 text-amber-500">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Value
          </div>
          <div className="flex items-center gap-1.5 text-blue-500">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Cost
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#18181b" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#52525b" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `M${val}`}
            minTickGap={20}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(9, 9, 11, 0.95)', 
              border: '1px solid #27272a', 
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#71717a', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="portfolioValue" 
            stroke="#f59e0b" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="cumulativeInvested" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorInvested)" 
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationChart;
