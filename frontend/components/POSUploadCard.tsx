"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, X, ShoppingCart, Download
} from "lucide-react";
import { posUpload } from "@/lib/api";

interface SaleItem {
  product: string;
  quantity: number;
}

type UploadStatus = "idle" | "loading" | "success" | "error";

interface POSUploadCardProps {
  onSuccess?: () => void;
}

// Demo CSV content — user downloads this, edits quantities, then re-uploads
const TEMPLATE_CSV = `product,quantity
Rice,5
Oil,3
Sugar,10
Dal,8
Salt,4
Flour,6
Milk,12
Spices,2`;

const downloadTemplate = () => {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = "saathi_pos_template.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function POSUploadCard({ onSuccess }: POSUploadCardProps) {
  const [items, setItems]           = useState<SaleItem[]>([]);
  const [fileName, setFileName]     = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const [status, setStatus]         = useState<UploadStatus>("idle");
  const [message, setMessage]       = useState("");
  const fileInputRef                = useRef<HTMLInputElement>(null);

  /* ─── CSV Parser ─────────────────────────────────────────── */
  const parseCSV = (text: string): SaleItem[] => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return [];           // must have header + at least 1 row
    const parsed: SaleItem[] = [];
    for (let i = 1; i < lines.length; i++) {   // skip header row
      const [product, qty] = lines[i].split(",").map(s => s.trim());
      const quantity = Number(qty);
      if (product && !isNaN(quantity) && quantity > 0) {
        parsed.push({ product, quantity });
      }
    }
    return parsed;
  };

  /* ─── File Handler ───────────────────────────────────────── */
  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setMessage("Only .csv files are supported.");
      setStatus("error");
      return;
    }
    setFileName(file.name);
    setStatus("idle");
    setMessage("");
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setMessage("No valid rows found. Check your CSV format.");
        setStatus("error");
        setItems([]);
      } else {
        setItems(parsed);
      }
    };
    reader.readAsText(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /* ─── Submit ─────────────────────────────────────────────── */
  const handleUpload = async () => {
    if (!items.length) return;
    setStatus("loading");
    setMessage("");
    try {
      const data = await posUpload(items);
      setStatus("success");
      setMessage(data?.message ?? "POS data uploaded successfully");
      onSuccess?.();
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
        setItems([]);
        setFileName("");
      }, 5000);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error ?? err?.message ?? "Upload failed";
      setStatus("error");
      setMessage(errMsg);
    }
  };

  const clearFile = () => {
    setItems([]);
    setFileName("");
    setStatus("idle");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─── UI ─────────────────────────────────────────────────── */
  return (
    <Card className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_4px_30px_rgb(0,0,0,0.5)]">
      <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-base">POS CSV Upload</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Upload a sale file to reduce stock automatically
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="h-8 text-xs font-semibold border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/10 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Template
            </Button>
            {fileName && (
              <button onClick={clearFile} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">

        {/* Drop zone */}
        {!items.length && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragOver
                ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                : "border-slate-200 dark:border-white/10 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
              }
            `}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Drop your CSV here or <span className="text-violet-500 font-semibold">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Format: <code>product, quantity</code> (with header row)</p>
            <p className="text-xs text-slate-400 mt-2">
              Don&apos;t have a file?{" "}
              <button
                onClick={e => { e.stopPropagation(); downloadTemplate(); }}
                className="text-violet-500 font-semibold hover:underline"
              >
                Download template ↓
              </button>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        )}

        {/* CSV template hint */}
        {!items.length && (
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-lg p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Expected CSV Format</p>
            <pre className="font-mono text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
{`product,quantity
Rice,5
Oil,3
Sugar,10`}
            </pre>
          </div>
        )}

        {/* Parsed preview table */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{fileName}</span>
              </div>
              <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20">
                {items.length} row{items.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Table */}
            <div className="border border-slate-100 dark:border-white/5 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/5">
                    <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-50 dark:border-white/[0.03] last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-3 py-2 font-medium capitalize">{item.product}</td>
                      <td className="px-3 py-2 text-right font-mono text-rose-500 font-semibold">−{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Upload button */}
            <Button
              onClick={handleUpload}
              disabled={status === "loading" || status === "success"}
              className={`w-full font-semibold rounded-lg shadow-none transition-all ${
                status === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : status === "error"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
              }`}
            >
              {status === "loading" && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>}
              {status === "success" && <><CheckCircle2 className="w-4 h-4 mr-2" /> Uploaded Successfully!</>}
              {status === "error"   && <><AlertCircle  className="w-4 h-4 mr-2" /> Retry Upload</>}
              {status === "idle"    && <><Upload className="w-4 h-4 mr-2" /> Upload & Sync Stock</>}
            </Button>
          </div>
        )}

        {/* Status message */}
        {message && (
          <p className={`text-xs flex items-center gap-1.5 font-medium ${
            status === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
          }`}>
            {status === "success"
              ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              : <AlertCircle  className="w-3.5 h-3.5 shrink-0" />
            }
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
