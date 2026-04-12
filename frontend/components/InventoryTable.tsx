"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, RefreshCw, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getStock } from "@/lib/api";

interface StockItem {
  name: string;
  stock: number;
  avgSalesLast30Days: number;
  salesLast30Days: number;
}

function stockStatus(stock: number, avg: number): "healthy" | "low" | "critical" {
  const daysLeft = avg > 0 ? stock / avg : Infinity;
  if (daysLeft <= 3 || stock <= 5)  return "critical";
  if (daysLeft <= 7 || stock <= 15) return "low";
  return "healthy";
}

const STATUS_CONFIG = {
  healthy:  { label: "In Stock",  color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  low:      { label: "Low Stock", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  critical: { label: "Critical",  color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" },
};

interface InventoryTableProps {
  /** Pass a refresh key (increment it) to force a refetch from the parent */
  refreshKey?: number;
}

export default function InventoryTable({ refreshKey = 0 }: InventoryTableProps) {
  const [items, setItems]       = useState<StockItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");

  const fetchStock = useCallback(async (showSpin = false) => {
    if (showSpin) setSpinning(true);
    try {
      const data = await getStock();
      if (data?.inventory) {
        setItems(data.inventory);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch {
      // silently degrade — backend may not be running yet
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  }, []);

  // Initial load + whenever refreshKey changes (triggered by parent after POS upload)
  useEffect(() => {
    fetchStock();
  }, [fetchStock, refreshKey]);

  const stockBarWidth = (stock: number) => {
    const max = 100;
    return `${Math.min(100, (stock / max) * 100)}%`;
  };

  return (
    <Card className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_4px_30px_rgb(0,0,0,0.5)]">
      <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-base">Live Stock Levels</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {lastSync ? `Last updated: ${lastSync}` : "Fetching inventory…"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchStock(true)}
            className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors"
            title="Refresh stock"
          >
            <RefreshCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 p-0">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-24" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full" />
                <div className="h-5 bg-slate-100 dark:bg-white/5 rounded w-16" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            No inventory data available. Ensure the backend is running.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-white/[0.03]">
            {items.map((item) => {
              const status = stockStatus(item.stock, item.avgSalesLast30Days);
              const cfg    = STATUS_CONFIG[status];
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors"
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {status === "healthy"  && <CheckCircle2   className="w-4 h-4 text-emerald-500" />}
                    {status === "low"      && <AlertTriangle  className="w-4 h-4 text-amber-500" />}
                    {status === "critical" && <TrendingDown   className="w-4 h-4 text-rose-500" />}
                  </div>

                  {/* Product name */}
                  <p className="font-semibold text-sm w-24 shrink-0 capitalize">{item.name}</p>

                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        status === "critical" ? "bg-rose-500" :
                        status === "low"      ? "bg-amber-400" :
                                               "bg-emerald-500"
                      }`}
                      style={{ width: stockBarWidth(item.stock) }}
                    />
                  </div>

                  {/* Stock count */}
                  <p className="font-mono font-bold text-sm w-14 text-right shrink-0">
                    {item.stock} <span className="font-normal text-slate-400 text-xs">units</span>
                  </p>

                  {/* Badge */}
                  <Badge variant="outline" className={`text-[10px] font-bold shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
