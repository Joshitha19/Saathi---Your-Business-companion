"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { posSync } from "@/lib/api";

type SyncStatus = "idle" | "loading" | "success" | "error";

interface POSSyncButtonProps {
  /** Called after a successful sync so the parent can refresh its data */
  onSuccess?: () => void;
  /** Optional extra class names for the wrapper */
  className?: string;
}

export default function POSSyncButton({ onSuccess, className = "" }: POSSyncButtonProps) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const handleSync = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const data = await posSync();
      setStatus("success");
      setMessage(data?.message ?? "POS synced successfully");
      onSuccess?.();
      // Auto-reset back to idle after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error ?? err?.message ?? "Failed to sync POS data";
      setStatus("error");
      setMessage(errMsg);
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  };

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <Button
        id="pos-sync-btn"
        onClick={handleSync}
        disabled={status === "loading"}
        className={`
          inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg transition-all shadow-none
          ${status === "success"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : status === "error"
            ? "bg-rose-600 hover:bg-rose-700 text-white"
            : "bg-violet-600 hover:bg-violet-700 text-white"
          }
        `}
      >
        {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === "success" && <CheckCircle2 className="w-4 h-4" />}
        {status === "error"   && <AlertCircle  className="w-4 h-4" />}
        {status === "idle"    && <ShoppingCart  className="w-4 h-4" />}

        {status === "loading" && "Syncing…"}
        {status === "success" && "Synced!"}
        {status === "error"   && "Sync Failed"}
        {status === "idle"    && "Sync POS Data"}
      </Button>

      {/* Status message line */}
      {message && (
        <p
          className={`flex items-center gap-1.5 text-xs font-medium
            ${status === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}
          `}
        >
          {status === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          {message}
        </p>
      )}

      {/* Idle hint */}
      {status === "idle" && !message && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Pulls latest sales from POS terminal
        </p>
      )}
    </div>
  );
}
