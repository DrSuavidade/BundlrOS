import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Client } from '../types';
import { COLORS } from '../constants';

interface CapacityChartProps {
  data: Client[];
}

const CapacityChart: React.FC<CapacityChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.capacityUsage - a.capacityUsage);

  const getBarColor = (usage: number) => {
    if (usage >= 90) return COLORS.danger;
    if (usage >= 75) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: COLORS.background, borderColor: '#334155', color: '#f1f5f9' }}
          />
          <ReferenceLine x={80} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="capacityUsage" barSize={12} radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.capacityUsage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CapacityChart;