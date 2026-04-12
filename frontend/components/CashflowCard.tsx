"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCashflow } from '@/lib/api';
import { IndianRupee, TrendingUp, TrendingDown, Activity, ShieldCheck, AlertOctagon } from 'lucide-react';

interface CashflowData {
  expectedSales: number;
  expectedPurchases: number;
  net: number;
  status: "safe" | "risk";
}

export default function CashflowCard() {
  const [data, setData] = useState<CashflowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCashflow() {
      try {
        const result = await getCashflow();
        setData(result);
      } catch (err) {
        console.error("Failed to load cashflow data", err);
      } finally {
        setLoading(false);
      }
    }
    loadCashflow();
  }, []);

  if (loading) {
    return (
      <Card className="h-full bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/5 flex flex-col items-center justify-center min-h-[250px]">
        <Activity className="w-6 h-6 animate-pulse text-indigo-400 mb-3" />
        <span className="text-sm font-medium text-slate-500 animate-pulse">Calculating net financials...</span>
      </Card>
    );
  }

  if (!data) return null;

  const isSafe = data.status === 'safe';

  return (
    <Card className="h-full bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/5 dark:shadow-[0_4px_30px_rgb(0,0,0,0.5)] flex flex-col overflow-hidden relative">
      {/* Dynamic top gradient indicator securely mapping API status strings */}
      <div className={`absolute inset-x-0 top-0 h-1 transition-colors ${isSafe ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`}></div>
      
      <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className={`w-5 h-5 transition-colors ${isSafe ? 'text-emerald-500' : 'text-rose-500'}`} /> Cashflow Projections
          </div>
          {isSafe ? (
             <ShieldCheck className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          ) : (
             <AlertOctagon className="w-5 h-5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          )}
        </CardTitle>
        <CardDescription>Predictive algorithmic analysis pipeline</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1 flex flex-col justify-between space-y-6">
         
         <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                 <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Expected Sales</span>
            </div>
            <span className="font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">₹{data.expectedSales.toLocaleString()}</span>
         </div>

         <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                 <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Projected Purchases</span>
            </div>
            <span className="font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">₹{data.expectedPurchases.toLocaleString()}</span>
         </div>
         
         <div className={`mt-4 pt-4 border-t ${isSafe ? 'border-emerald-500/20' : 'border-rose-500/20'} flex items-center justify-between`}>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Net Flow</span>
            <div className={`text-3xl font-black tracking-tight ${isSafe ? 'text-emerald-500' : 'text-rose-500'}`}>
               ₹{data.net.toLocaleString()}
            </div>
         </div>
         
      </CardContent>
    </Card>
  );
}
