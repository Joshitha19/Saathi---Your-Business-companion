"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Package, TrendingUp, LogOut,
  Bell, ShoppingCart, CheckCircle2, AlertCircle,
  Loader2, ChevronRight, Mic
} from "lucide-react";
import { posSync } from '@/lib/api';
import Image from "next/image";

import ForecastChart     from '@/components/ForecastChart';
import DeadStockCard     from '@/components/DeadStockCard';
import CashflowCard      from '@/components/CashflowCard';
import RecommendationsCard from '@/components/RecommendationsCard';
import VoiceInput        from '@/components/VoiceInput';
import POSSyncButton     from '@/components/POSSyncButton';
import POSUploadCard     from '@/components/POSUploadCard';
import InventoryTable    from '@/components/InventoryTable';
import WelcomeScreen     from '@/components/WelcomeScreen';

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',          icon: LayoutDashboard },
  { id: 'inventory',  label: 'Inventory & POS',   icon: Package },
  { id: 'analytics',  label: 'Analytics',          icon: TrendingUp },
  { id: 'voice',      label: 'Voice Agent',        icon: Mic },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab]         = useState('overview');
  const [stockRefreshKey, setStockRefreshKey] = useState(0);

  const triggerStockRefresh = () => setStockRefreshKey(k => k + 1);

  return (
    <div className="flex h-screen bg-[#f8f9fc] dark:bg-[#050507] text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
      <WelcomeScreen />

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-60 bg-white dark:bg-[#0a0a0f] border-r border-slate-100 dark:border-white/[0.06] flex flex-col shrink-0 z-20 hidden md:flex">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-white/[0.06] shrink-0 gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Saathi"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight leading-none">Saathi</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Inventory OS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${activeTab === id ? 'text-indigo-500' : ''}`} />
              {label}
              {activeTab === id && <ChevronRight className="h-3 w-3 ml-auto text-indigo-400" />}
            </button>
          ))}
        </nav>

        {/* Live status pill */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-white/[0.06] shrink-0 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            ML Engine Active
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center gap-2 text-xs font-medium text-rose-500 hover:text-rose-600 py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">

        {/* Top Bar */}
        <header className="h-14 bg-white dark:bg-[#0a0a0f]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-bold">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              {activeTab === 'overview'  && 'Real-time business intelligence'}
              {activeTab === 'inventory' && 'Live stock levels & POS sync'}
              {activeTab === 'analytics' && 'Demand forecast & cashflow'}
              {activeTab === 'voice'     && 'NLP voice inventory commands'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold">Sharma General Store</span>
            </div>
            <div className="flex items-center gap-3">
              <POSSyncButton onSuccess={triggerStockRefresh} />
              <button className="relative text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-[#0a0a0f]" />
              </button>
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-[10px] ring-2 ring-white dark:ring-white/5">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto p-6 space-y-6 pb-12">

            {/* ── OVERVIEW ───────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <>
                {/* Row 1: Chart + Cashflow */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <div className="xl:col-span-2">
                    <Card className="bg-white dark:bg-[#0a0a0f] border-slate-100 dark:border-white/[0.06] p-5 h-full min-h-[360px]">
                      <ForecastChart />
                    </Card>
                  </div>
                  <div className="xl:col-span-1">
                    <CashflowCard />
                  </div>
                </div>

                {/* Row 2: Recommendations + Dead Stock */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <RecommendationsCard />
                  <DeadStockCard />
                </div>
              </>
            )}

            {/* ── INVENTORY & POS ────────────────────────────────── */}
            {activeTab === 'inventory' && (
              <>
                {/* Row 1: Live Stock Table — full width */}
                <InventoryTable refreshKey={stockRefreshKey} />

                {/* Row 2: POS Tools */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {/* POS Simulator */}
                  <Card className="bg-white dark:bg-[#0a0a0f] border-slate-100 dark:border-white/[0.06] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4 text-violet-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">POS Simulator</p>
                        <p className="text-xs text-slate-400 mt-0.5">Fire a mock terminal sale to test sync</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-100 dark:border-white/5 p-3 mb-4 font-mono text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <p className="flex justify-between"><span>Rice</span><span className="text-rose-500">−5 units</span></p>
                      <p className="flex justify-between"><span>Oil</span><span className="text-rose-500">−3 units</span></p>
                    </div>
                    <POSSyncButton onSuccess={triggerStockRefresh} className="w-full [&>button]:w-full" />
                  </Card>

                  {/* CSV Upload */}
                  <POSUploadCard onSuccess={triggerStockRefresh} />
                </div>
              </>
            )}

            {/* ── ANALYTICS ──────────────────────────────────────── */}
            {activeTab === 'analytics' && (
              <div className="space-y-5">
                <Card className="bg-white dark:bg-[#0a0a0f] border-slate-100 dark:border-white/[0.06] p-5 min-h-[480px]">
                  <ForecastChart />
                </Card>
                <CashflowCard />
              </div>
            )}

            {/* ── VOICE AGENT ────────────────────────────────────── */}
            {activeTab === 'voice' && (
              <div className="max-w-2xl mx-auto">
                <VoiceInput />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
