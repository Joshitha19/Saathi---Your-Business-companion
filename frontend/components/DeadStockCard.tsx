"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDeadStock } from '@/lib/api';
import { Box, AlertTriangle, Activity } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DeadStockItem {
  name: string;
  stock: number;
  suggestion: string;
}

export default function DeadStockCard() {
  const [data, setData] = useState<DeadStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeadStock() {
      try {
        const result = await getDeadStock();
        setData(result);
      } catch (err) {
        console.error("Failed to load dead stock", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeadStock();
  }, []);

  return (
    <Card className="h-full bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/5 dark:shadow-[0_4px_30px_rgb(0,0,0,0.5)] flex flex-col">
      <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 flex flex-row items-center justify-between shrink-0">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Box className="w-5 h-5 text-rose-500" /> Clearance Targets
          </CardTitle>
          <CardDescription className="hidden sm:block">Assets trailing drastically beneath base averages.</CardDescription>
        </div>
        <Badge variant="destructive" className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 px-3 py-1.5 flex items-center gap-2 shadow-sm rounded-full tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5" /> Dead Stock
        </Badge>
      </CardHeader>
      <CardContent className="pt-0 p-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-3 items-center justify-center p-8 text-slate-500 h-full min-h-[250px]">
            <Activity className="w-6 h-6 animate-pulse text-rose-400" />
            <span className="text-sm font-medium animate-pulse">Evaluating historical trajectory thresholds...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col gap-3 items-center justify-center p-8 text-slate-500 h-full min-h-[250px]">
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
               <Box className="w-6 h-6 text-emerald-500" />
             </div>
            <span className="text-sm font-semibold text-emerald-500 tracking-wide">All assets liquidating optimally!</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/30 sticky top-0 z-10 backdrop-blur-md">
                <TableRow className="border-b border-slate-200 dark:border-white/5 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-300 py-3">Product Hash</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-300 text-center py-3">Frozen Units</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-300 text-right py-3">Suggested Macro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, i) => (
                  <TableRow key={i} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3 py-4">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm shrink-0">
                        <Box className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      {item.name}
                    </TableCell>
                    <TableCell className="text-center font-mono text-rose-600 dark:text-rose-400 font-bold text-lg">
                      {item.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-white dark:bg-black border-slate-200 dark:border-white/10 shadow-sm text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer px-3 py-1.5 font-medium">
                        Apply {item.suggestion}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
