"use client";

import { motion, useMotionTemplate, useMotionValue, useTransform, useScroll } from "framer-motion";
import { ArrowRight, BrainCircuit, Box, Zap, Activity, BarChart3, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent, useRef } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const backgroundTemplate = useMotionTemplate`
    radial-gradient(
      700px circle at ${mouseX}px ${mouseY}px,
      rgba(124, 58, 237, 0.15),
      transparent 80%
    )
  `;

  const dashboardRotateX = useTransform(scrollYProgress, [0, 0.3], [25, 0]);
  const dashboardScale = useTransform(scrollYProgress, [0, 0.3], [0.85, 1]);
  const dashboardY = useTransform(scrollYProgress, [0, 0.3], [100, -20]);
  const dashboardOpacity = useTransform(scrollYProgress, [0, 0.1], [0.6, 1]);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="relative min-h-[200vh] bg-[#050505] text-white selection:bg-indigo-500/30 overflow-hidden font-sans"
      onMouseMove={handleMouseMove}
    >
      <WelcomeScreen />
      {/* Dynamic Cursor Light Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-40 transition duration-300 z-0"
        style={{ background: backgroundTemplate }}
      />
      
      {/* Background Rotating Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px]" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[150px]" 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col pt-6">

        {/* ── Premium Navbar ─────────────────────────────────────── */}
        <motion.nav
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-5 z-50 flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            background: "rgba(10,10,20,0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30 border border-white/10">
                <Image
                  src="/logo.jpeg"
                  alt="Saathi Logo"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a14] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-base font-black tracking-tight text-white">Saathi</span>
              <span className="text-[9px] font-mono text-emerald-400/80 tracking-widest uppercase">Inventory OS</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Features",     href: "#features" },
              { label: "Intelligence", href: "#intelligence" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing",      href: "#pricing" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="relative px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 group rounded-lg hover:bg-white/[0.04]"
              >
                {label}
                <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </a>
            ))}
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-violet-300 tracking-widest"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              v2.1 LIVE
            </div>

            {/* Sign In — styled Link, no nested button */}
            <Link
              href="/login"
              className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/[0.05]"
            >
              Sign In
            </Link>

            {/* Open Dashboard — styled Link, no nested button */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
              }}
            >
              Open Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center text-center space-y-10 mt-32 relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <Badge variant="outline" className="px-5 py-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-300 rounded-full mb-4 gap-2 backdrop-blur-md">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="uppercase tracking-widest text-xs font-bold font-mono">Neural Engine v2 Active</span>
            </Badge>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 50 }}
            className="text-6xl md:text-[5.5rem] font-black tracking-tighter max-w-5xl leading-[1.1]"
          >
            Evolutionary Retail <br/>
            <span className="relative inline-block mt-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                Zero Dead Stock.
              </span>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl font-light leading-relaxed"
          >
            Pre-cog demand forecasting, autonomous WhatsApp reordering, and unparalleled precise Cashflow Analytics.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 pt-6"
          >
            <Link href="/login">
              <Button size="lg" className="rounded-full bg-emerald-500 text-black hover:bg-emerald-400 h-16 px-10 text-lg font-bold group shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 border border-emerald-400/50">
                Start Neural Trial 
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="ml-3 w-5 h-5"/>
                </motion.div>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-16 px-10 text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl">
                <Activity className="mr-3 w-5 h-5 text-indigo-400"/> System Demo
              </Button>
            </Link>
          </motion.div>
        </main>

        {/* 3D Isometric Interface Mockup Syncing with Scroll */}
        <motion.div
           style={{
             rotateX: dashboardRotateX,
             scale: dashboardScale,
             y: dashboardY,
             opacity: dashboardOpacity
           }}
           className="relative mx-auto w-full max-w-5xl mt-32 group perspective-[1500px]"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
          
          <Card className="relative bg-[#0a0a0a]/90 border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl rounded-[1.8rem] ring-1 ring-white/10">
            <CardContent className="p-0">
               {/* URL Bar Frame */}
               <div className="bg-[#111] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                 <div className="flex gap-2">
                   <div className="w-4 h-4 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                   <div className="w-4 h-4 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                   <div className="w-4 h-4 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                 </div>
                 <div className="bg-black/50 rounded-full px-6 py-1.5 flex items-center gap-2 text-xs text-slate-400 font-mono border border-white/10 shadow-inner">
                   <Zap className="w-3 h-3 text-emerald-400"/> saathi.os / command-center
                 </div>
                 <div className="w-16"></div>
               </div>
               
               {/* Internal Grid */}
               <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gradient-to-b from-[#111]/50 to-[#050505]">
                 
                 <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="col-span-1 lg:col-span-2 bg-[#1a1a1a]/80 border border-white/10 p-8 rounded-3xl space-y-6 relative overflow-hidden group/card shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                  >
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/card:opacity-20 transition-opacity duration-500">
                     <TrendingUp className="w-32 h-32 text-emerald-400" />
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                       <BarChart3 className="w-6 h-6 text-emerald-400"/>
                     </span>
                     <div>
                       <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">AI Forecast Trajectory</h3>
                       <p className="text-3xl font-bold text-white tracking-tight mt-1">₹ 14,000 net</p>
                     </div>
                   </div>
                   
                   <div className="flex gap-3">
                     <div className="h-16 w-1/6 bg-white/5 rounded-t-lg relative overflow-hidden"><div className="absolute bottom-0 w-full h-[40%] bg-emerald-500/20"/></div>
                     <div className="h-16 w-1/6 bg-white/5 rounded-t-lg relative overflow-hidden"><div className="absolute bottom-0 w-full h-[50%] bg-emerald-500/30"/></div>
                     <div className="h-16 w-1/6 bg-white/5 rounded-t-lg relative overflow-hidden"><div className="absolute bottom-0 w-full h-[30%] bg-emerald-500/40"/></div>
                     <div className="h-16 w-1/6 bg-white/5 rounded-t-lg relative overflow-hidden"><div className="absolute bottom-0 w-full h-[60%] bg-emerald-500/50"/></div>
                     <div className="h-16 w-1/6 bg-white/5 rounded-t-lg relative overflow-hidden"><div className="absolute bottom-0 w-full h-[80%] bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"/></div>
                     <div className="h-16 w-1/6 bg-white/5 rounded-t-lg relative overflow-hidden"><div className="absolute bottom-0 w-full h-[95%] bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse"/></div>
                   </div>
                 </motion.div>

                 <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-indigo-950/20 border border-indigo-500/30 p-8 rounded-3xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden"
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                   <div className="relative">
                     <div className="flex items-center gap-2 mb-4">
                       <span className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                         <BrainCircuit className="w-5 h-5 text-indigo-400"/>
                       </span>
                       <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Predictive Action</h3>
                     </div>
                     <p className="text-4xl font-extrabold text-white tracking-tight mb-2">Stock up Oil</p>
                     <p className="text-indigo-300 text-sm font-medium flex items-center gap-2 bg-indigo-500/20 w-fit px-4 py-2 rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Zap className="w-4 h-4 animate-pulse"/> Festival anomaly (+40 units)
                     </p>
                   </div>
                 </motion.div>

                 <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="col-span-1 lg:col-span-3 bg-gradient-to-r from-[#1a1a1a]/80 to-rose-950/20 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:border-rose-500/30 transition-colors"
                 >
                    <div className="flex items-center gap-5 mb-4 md:mb-0">
                      <span className="p-4 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                        <Box className="w-8 h-8 text-rose-400"/>
                      </span>
                      <div>
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Algorithmic Clearance</h3>
                        <p className="text-2xl font-bold text-white tracking-tight">Soft Drinks <span className="text-red-400 ml-2 font-mono text-sm px-2 py-1 bg-red-400/10 rounded">&lt; 2 avg units/day</span></p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white border-0 px-6 py-4 rounded-xl text-md font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 cursor-pointer flex items-center gap-2">
                      <Activity className="w-5 h-5"/> Execute 20% Discount
                    </Badge>
                 </motion.div>

               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── FEATURES section ───────────────────────────────── */}
        <section id="features" className="py-40">
          <div className="text-center mb-24 space-y-6">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
             >
               <h2 className="text-4xl md:text-7xl font-black tracking-tighter">
                 Command your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]">Inventory</span>
               </h2>
               <p className="text-slate-400 max-w-2xl mx-auto text-xl font-light mt-6">Stop managing spreadsheets. Let autonomous agents optimize your retail matrix.</p>
             </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Bento block 1 */}
            <motion.div 
              className="md:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-10 rounded-[2rem] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all duration-500 group shadow-lg relative overflow-hidden flex flex-col justify-between"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="relative z-10 mb-8">
                <BrainCircuit className="w-12 h-12 text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-500"/>
                <h3 className="text-2xl font-bold text-white mb-4">Deep Learning Forecasts</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Connects trailing 7-day average velocities to dynamic historical matrices, perfectly predicting massive festival spikes before they trigger.
                </p>
              </div>
              <div className="relative w-full h-32 bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-end px-3 pb-0 gap-2 mt-auto">
                 {/* Integrated Bar Chart Mockup */}
                 {[30, 40, 35, 50, 45, 80, 120, 110, 90, 60].map((val, i) => (
                    <motion.div 
                      key={i} 
                      className={`w-full rounded-t-sm ${val > 100 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] z-10 relative' : 'bg-emerald-500/40 relative z-0'}`} 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(val/120)*100}%` }}
                      transition={{ duration: 1, delay: 0.1 * i, type: "spring" }}
                      viewport={{ once: true }}
                    >
                      {val > 100 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-indigo-300">SPIKE</div>
                      )}
                    </motion.div>
                 ))}
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-transparent to-black/30 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Bento block 2 */}
            <motion.div 
              className="md:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-10 rounded-[2rem] border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all duration-500 group shadow-lg relative overflow-hidden flex flex-col justify-between"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="relative z-10 mb-8">
                <ShoppingCart className="w-12 h-12 text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-500"/>
                <h3 className="text-2xl font-bold text-white mb-4">WhatsApp Automation</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Systematically converts logic layers into native URI templates, letting you send fully verified stock requests to suppliers in a single click.
                </p>
              </div>
              <div className="mt-auto w-full relative z-10 transition-transform duration-500 group-hover:scale-105 origin-bottom">
                <Card className="bg-[#0a0a0a]/80 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative backdrop-blur-xl">
                  <div className="absolute top-2 right-4 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">Agent Active</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  </div>
                  <CardContent className="p-5 pt-8 space-y-4">
                    {/* Bot Message */}
                    <div className="flex gap-3 items-end">
                      <div className="w-7 h-7 rounded-full bg-slate-800 shrink-0 flex items-center justify-center border border-white/5 shadow-md">
                        <BrainCircuit className="w-4 h-4 text-emerald-400"/>
                      </div>
                      <div className="bg-slate-800/80 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-200 border border-white/5 shadow-md">
                        <p className="font-mono text-[10px] text-emerald-400 mb-1 tracking-wider uppercase">System Alert</p>
                        Stock level for Oil is running low. (Current: 8)
                      </div>
                    </div>
                    {/* Native App Generation Message */}
                    <div className="flex gap-3 items-end flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 shrink-0 flex items-center justify-center border border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                        <Zap className="w-4 h-4 text-white"/>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-400"
                      >
                        Namaste, need 40 units of Oil.
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Main Long Bento Block 3 */}
            <motion.div 
              className="md:col-span-4 bg-gradient-to-br from-[#0f172a] via-[#020617] to-slate-950 p-12 rounded-[2rem] border border-white/10 hover:border-rose-500/40 transition-all duration-500 group relative overflow-hidden shadow-2xl"
              whileHover={{ y: -5, scale: 1.01 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <Box className="w-16 h-16 text-rose-400 mb-6 group-hover:animate-bounce"/>
                  <h3 className="text-4xl font-black text-white mb-6 tracking-tight">Algorithmic Clearance</h3>
                  <p className="text-slate-300 text-xl leading-relaxed font-light">
                    Continuously aggregates inventory arrays to detect average daily sales sliding beneath strict thresholds <span className="font-mono bg-white/10 px-2 py-1 rounded text-rose-300 text-sm font-bold ml-1 border border-white/5">(avg &lt; 2)</span>. Eliminates dead-stock seamlessly by routing frozen assets straight into dynamic WhatsApp discount schemas.
                  </p>
                </div>
                
                <div className="w-full md:w-1/3">
                  <Card className="bg-black/60 border-white/10 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                          <span>Clearance Rate</span>
                          <span className="text-rose-400 font-bold">85%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                          <motion.div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] rounded-full"
                            initial={{ width: "10%" }}
                            whileInView={{ width: "85%" }}
                            transition={{ duration: 2.5, type: "spring", bounce: 0.2, delay: 0.5 }}
                            viewport={{ once: true }}
                          />
                        </div>
                        <p className="text-center text-sm font-medium text-slate-400">Total frozen assets liquidated autonomously.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── INTELLIGENCE ─────────────────────────────────────── */}
        <section id="intelligence" className="py-24 max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
              AI that thinks{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">before you do</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg font-light mt-5">
              Our ML pipeline processes 90-day velocity data to detect festival spikes, dead-stock, and reorder thresholds automatically.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: TrendingUp,   color: "emerald", title: "Demand Forecasting",     desc: "Predicts the next 10 days of sales per product using weighted moving averages spiked by festival calendar metadata." },
              { Icon: Zap,          color: "violet",  title: "Anomaly Detection",      desc: "Flags when any product's average daily sales drops below 2 units — triggering automatic clearance routing." },
              { Icon: ShoppingCart, color: "indigo",  title: "Procurement Automation", desc: "Generates WhatsApp supplier messages with exact quantities derived from forecast shortfall calculations." },
            ].map(({ Icon, color, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.15 }}
                className="p-8 rounded-2xl border group hover:-translate-y-1 transition-transform duration-300"
                style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.07)" }}>
                <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center" style={{ background:`rgba(var(--${color}-rgb,99,102,241),0.1)`, border:`1px solid rgba(var(--${color}-rgb,99,102,241),0.25)` }}>
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
              Up and running in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">3 steps</span>
            </h2>
          </motion.div>
          <div className="relative space-y-8">
            <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/40 via-indigo-500/40 to-emerald-500/40 hidden md:block" />
            {[
              { step:"01", title:"Connect your inventory",      desc:"Upload your product list via CSV or let Saathi auto-generate a baseline from your shop category. Takes 60 seconds." },
              { step:"02", title:"AI trains on your history",   desc:"The ML engine ingests your trailing 90-day sales history, maps festival overlaps, and calibrates forecast weights per product." },
              { step:"03", title:"Act on live recommendations", desc:"Every morning, Saathi surfaces ranked actions: reorder, discount, or avoid buying — with WhatsApp-ready supplier messages." },
            ].map(({ step, title, desc }, i) => (
              <motion.div key={step} initial={{ opacity:0,x:-30 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ duration:0.5,delay:i*0.15 }} className="flex gap-8 items-start">
                <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 z-10">
                  {step}
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────── */}
        <section id="pricing" className="py-24 max-w-5xl mx-auto px-4 pb-40">
          <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
              Simple, honest{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">pricing</span>
            </h2>
            <p className="text-slate-400 mt-4 text-lg font-light">No hidden fees. Cancel anytime.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { plan:"Starter",    price:"Free",     desc:"Perfect for single-store owners",      highlight:false, features:["Up to 20 products","Basic forecasting","CSV export","WhatsApp alerts"] },
              { plan:"Pro",        price:"₹999/mo",  desc:"For growing retail businesses",        highlight:true,  features:["Unlimited products","ML demand forecasting","POS CSV sync","Voice inventory agent","Priority support"] },
              { plan:"Enterprise", price:"Custom",   desc:"Multi-store chains & distributors",    highlight:false, features:["Everything in Pro","Custom ML models","API access","Dedicated onboarding","SLA guarantee"] },
            ].map(({ plan, price, desc, highlight, features }, i) => (
              <motion.div key={plan} initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.5,delay:i*0.15 }}
                className={`p-8 rounded-2xl border relative ${highlight ? "border-violet-500/50" : "border-white/[0.07]"}`}
                style={{ background: highlight ? "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.08))" : "rgba(255,255,255,0.02)" }}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest text-white"
                    style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)" }}>MOST POPULAR</div>
                )}
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{plan}</p>
                <p className="text-4xl font-black text-white mb-1">{price}</p>
                <p className="text-slate-500 text-sm mb-6">{desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login"
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 ${highlight ? "text-white" : "text-slate-300 border border-white/10 hover:bg-white/[0.05]"}`}
                  style={highlight ? { background:"linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow:"0 4px 20px rgba(124,58,237,0.35)" } : {}}>
                  {price === "Custom" ? "Contact Sales" : "Get Started →"}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
