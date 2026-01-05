
import React from 'react';
import {
  LineChart,
  Line,
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
    <div className="w-full h-[400px] bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
      <h3 className="text-zinc-400 text-sm font-medium mb-4">Portfolio Growth Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="month" 
            stroke="#71717a" 
            fontSize={12} 
            tickFormatter={(val) => `M${val}`}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={12} 
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#f4f4f5' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="portfolioValue" 
            name="Portfolio Value"
            stroke="#fbbf24" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="cumulativeInvested" 
            name="Total Invested"
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorInvested)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationChart;
