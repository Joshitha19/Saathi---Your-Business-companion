"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getForecast } from '@/lib/api';
import { BrainCircuit } from 'lucide-react';

const CustomizedDot = (props: any) => {
  const { cx, cy, payload } = props;
  
  if (!cx || !cy) return null;
  
  if (payload.isSpike) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill="#ef4444" opacity={0.3} className="animate-pulse" />
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill="#6366f1" stroke="#fff" strokeWidth={2} />;
};

export default function ForecastChart() {
  const [data, setData] = useState<{ day: string; demand: number; isSpike: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getForecast();
        
        // Scan the ML results array for a product that registered an anomaly spike
        const targetProduct = result.find((p: any) => p.forecast.some((val: number) => val > 25)) || result[0];
        
        if (targetProduct) {
          setProductName(targetProduct.product);
          // Format 10-day prediction into native recharts array schema
          const chartData = targetProduct.forecast.map((val: number, index: number) => ({
            day: `Day ${index + 1}`,
            demand: val,
            isSpike: val > 25
          }));
          setData(chartData);
        }
      } catch (e) {
        console.error("Failed to load forecast data", e);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col gap-3 items-center justify-center text-slate-500 min-h-[300px]">
        <BrainCircuit className="w-8 h-8 animate-pulse text-indigo-400" />
        <span className="text-sm font-medium animate-pulse">Running ML Pipelines...</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500 min-h-[300px]">
        No forecast data generated.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
         <span className="text-sm font-mono text-slate-400">Target Asset Analytics: <span className="text-indigo-500 font-bold ml-1">{productName}</span></span>
         <div className="flex gap-4 text-[10px] font-bold tracking-wider uppercase">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Regular Trajectory</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> Predicted Spikes</div>
         </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
            dy={8} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
            cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="demand" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={<CustomizedDot />} 
            activeDot={{r: 6, fill: "#a78bfa", stroke: "#fff"}} 
            animationDuration={2000} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
