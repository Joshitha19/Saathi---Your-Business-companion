"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Store, User, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";

const FLOATING_WORDS = ["Rice", "Oil", "Sugar", "Dal", "Milk", "Flour", "Spices", "Salt"];

function FloatingWord({ word, style }: { word: string; style: React.CSSProperties }) {
  return (
    <span
      className="absolute text-xs font-mono text-white/[0.07] select-none pointer-events-none animate-float"
      style={style}
    >
      {word}
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [shopName, setShopName]   = useState("");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [mounted, setMounted]     = useState(false);
  const [focused, setFocused]     = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !username || !password) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate auth — replace with real API call
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    router.push("/dashboard");
  };

  const floatingItems = mounted
    ? FLOATING_WORDS.map((word, i) => ({
        word,
        style: {
          left:              `${5 + (i * 12)}%`,
          top:               `${10 + (i % 3) * 30}%`,
          animationDelay:    `${i * 0.7}s`,
          animationDuration: `${6 + (i % 3)}s`,
        } as React.CSSProperties,
      }))
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.07; }
          50%       { transform: translateY(-20px) rotate(3deg); opacity: 0.12; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-float  { animation: float linear infinite; }
        .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa, #6366f1, #8b5cf6, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.09);
        }
        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          transition: all 0.2s ease;
        }
        .input-field:focus { 
          background: rgba(255,255,255,0.08);
          border-color: rgba(139,92,246,0.6);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
          outline: none;
        }
        .input-field.focused { 
          border-color: rgba(139,92,246,0.6);
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden font-[Inter,sans-serif]"
        style={{ background: "linear-gradient(135deg, #0f0c24 0%, #0d1117 50%, #0a0f1e 100%)" }}
      >
        {/* Ambient blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />

        {/* Floating inventory words */}
        {floatingItems.map(({ word, style }, i) => (
          <FloatingWord key={i} word={word} style={style} />
        ))}

        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Card */}
        <div className="w-full max-w-md mx-4 relative z-10">
          <div
            className="glass-card rounded-2xl p-8 shadow-2xl"
            style={{ animation: "fadeUp 0.7s ease forwards" }}
          >
            {/* Logo area */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                  <Image
                    src="/logo.jpeg"
                    alt="Saathi Logo"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-2xl border border-violet-500/40"
                  style={{ animation: "pulse-ring 2s ease-out infinite" }} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                Welcome to <span className="shimmer-text">Saathi</span>
              </h1>
              <p className="text-sm text-white/40 text-center">
                Your AI-powered inventory assistant
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Shop Name */}
              <div style={{ animation: "fadeUp 0.6s 0.1s ease both" }}>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5 ml-1">
                  Shop Name
                </label>
                <div className="relative">
                  <Store className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                    focused === 'shop' ? 'text-violet-400' : 'text-white/30'
                  }`} />
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    onFocus={() => setFocused('shop')}
                    onBlur={() => setFocused(null)}
                    placeholder="e.g. Ravi General Store"
                    className={`input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 ${focused === 'shop' ? 'focused' : ''}`}
                  />
                </div>
              </div>

              {/* Username */}
              <div style={{ animation: "fadeUp 0.6s 0.2s ease both" }}>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5 ml-1">
                  Username
                </label>
                <div className="relative">
                  <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                    focused === 'user' ? 'text-violet-400' : 'text-white/30'
                  }`} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocused('user')}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your username"
                    className={`input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 ${focused === 'user' ? 'focused' : ''}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ animation: "fadeUp 0.6s 0.3s ease both" }}>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                    focused === 'pass' ? 'text-violet-400' : 'text-white/30'
                  }`} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass')}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your password"
                    className={`input-field w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/20 ${focused === 'pass' ? 'focused' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <div style={{ animation: "fadeUp 0.6s 0.4s ease both" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 mt-2"
                  style={{
                    background: loading
                      ? "rgba(139,92,246,0.5)"
                      : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    boxShadow: loading ? "none" : "0 8px 24px rgba(124,58,237,0.35)",
                  }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing In…</>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>

            {/* Footer note */}
            <p className="text-center text-[11px] text-white/20 mt-6">
              Saathi Inventory OS · Powered by AI
            </p>
          </div>

          {/* Demo hint */}
          <p className="text-center text-xs text-white/20 mt-4">
            Demo: fill any values and click Sign In
          </p>
        </div>
      </div>
    </>
  );
}
