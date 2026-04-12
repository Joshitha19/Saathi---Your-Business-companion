"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRecommendations, executeReorder } from '@/lib/api';
import { BrainCircuit, Zap, ShieldAlert, Tag, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RecommendationData {
  reorder: { product: string, reason: string }[];
  avoidBuying: { product: string, reason: string }[];
  discount: { product: string, suggestion: string }[];
}

export default function RecommendationsCard() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefetched, setLastRefetched] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [reorderingItem, setReorderingItem] = useState<string | null>(null);
  const [successItem, setSuccessItem] = useState<string | null>(null);

  const fetchRecs = async () => {
    setRefreshing(true);
    try {
      const result = await getRecommendations();
      setData(result);
      setLastRefetched(new Date().toLocaleTimeString());
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReorder = async (product: string) => {
    setReorderingItem(product);
    try {
      const response = await executeReorder(product, 40);
      if (response && response.success && response.whatsappLink) {
         window.open(response.whatsappLink, '_blank', 'noopener,noreferrer');
         setSuccessItem(product);
         setTimeout(() => setSuccessItem(null), 3000);
      }
    } catch (err) {
      console.error("Reorder failed", err);
    } finally {
      setReorderingItem(null);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  if (loading && !data) {
    return (
      <Card className="h-full bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-500/20 flex flex-col items-center justify-center min-h-[400px]">
        <BrainCircuit className="w-8 h-8 animate-pulse text-indigo-400 mb-3" />
        <span className="text-sm font-medium text-indigo-500 animate-pulse tracking-wide">Synthesizing macro intelligence...</span>
      </Card>
    );
  }

  return (
    <Card className="h-full border-indigo-200 dark:border-indigo-500/20 shadow-md bg-slate-50 dark:bg-indigo-950/10 relative overflow-hidden flex flex-col">
       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <BrainCircuit className="w-48 h-48 text-indigo-500" />
       </div>
       
       <CardHeader className="pb-4 border-b border-indigo-100 dark:border-indigo-500/10 relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
         <div>
           <CardTitle className="flex items-center gap-2 text-indigo-950 dark:text-indigo-50 text-xl font-bold">
             <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Action Center
           </CardTitle>
           <CardDescription className="dark:text-indigo-200/60 mt-1 tracking-wide">Autonomous strategic task queues via API logic.</CardDescription>
         </div>
         <div className="flex flex-col items-end gap-1.5">
           <Button 
              onClick={fetchRecs} 
              disabled={refreshing}
              className={`${showSuccess ? 'bg-emerald-600' : 'bg-indigo-600'} text-white font-bold transition-all active:scale-95 text-xs h-9 px-4`}
           >
             {refreshing ? <RefreshCw className="mr-2 w-4 h-4 animate-spin text-white"/> : showSuccess ? <CheckCircle2 className="mr-2 w-4 h-4" /> : "🧠 "}
             {refreshing ? "Re-synthesizing..." : showSuccess ? "Refetched!" : "What should I do today?"}
           </Button>
           {lastRefetched && (
             <span className="text-[10px] text-slate-400 font-medium">Last refetched at {lastRefetched}</span>
           )}
         </div>
       </CardHeader>
       
       <CardContent className="pt-6 space-y-8 flex-1 overflow-auto relative z-10">
         {data?.reorder && data.reorder.length > 0 && (
           <div className="space-y-3">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
               <Zap className="w-4 h-4 text-emerald-500" /> Priority Reorder Requests
             </h3>
             <div className="grid gap-3">
               {data.reorder.map((item, i) => (
                 <div key={i} className="p-4 rounded-xl border border-emerald-200 bg-white dark:bg-black/40 shadow-sm relative overflow-hidden group">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                     <div className="pr-12">
                       <h4 className="font-bold text-slate-900 dark:text-slate-100 text-md">{item.product}</h4>
                       <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1 font-medium">{item.reason}</p>
                     </div>
                     <Button 
                        size="sm" 
                        disabled={reorderingItem === item.product || successItem === item.product}
                        onClick={() => handleReorder(item.product)}
                        className={`font-semibold ${successItem === item.product ? 'bg-emerald-500' : 'bg-emerald-50 text-emerald-700'}`}
                     >
                       {reorderingItem === item.product ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : successItem === item.product ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
                       {reorderingItem === item.product ? "..." : successItem === item.product ? "Sent" : "WhatsApp"}
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {data?.discount && data.discount.length > 0 && (
           <div className="space-y-3">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
               <Tag className="w-4 h-4 text-rose-500" /> Clearance Suggestion
             </h3>
             <div className="grid gap-3">
               {data.discount.map((item, i) => (
                 <div key={i} className="p-4 rounded-xl border border-rose-100 bg-white dark:bg-black/40 flex justify-between items-center">
                   <h4 className="font-bold text-sm tracking-tight">{item.product}</h4>
                   <Badge variant="outline" className="text-rose-600 border-rose-200">{item.suggestion}</Badge>
                 </div>
               ))}
             </div>
           </div>
         )}
       </CardContent>
    </Card>
  );
}
