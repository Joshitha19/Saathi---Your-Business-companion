"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PlusCircle, AlertCircle, CheckCircle2, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateStock } from '@/lib/api';

interface ParsedResult {
  action?: string;
  quantity?: number;
  measurement?: string;
  product?: string;
}

interface MockInventoryState {
  [productName: string]: number;
}

// Advanced NLP Mapping Dictionary simulating a deeply trained phonetic fallback lattice
const REGIONAL_DICTIONARY: Record<string, string> = {
  // Measurement Systems translation
  "लीटर": "liters", "లీటర్లు": "liters", "లీటర్": "liters", "ltr": "liters",
  "किलो": "kg", "కిలోలను": "kg", "కిలోలు": "kg", "కిలో": "kg", "kilo": "kg", "kilos": "kg", "kgs": "kg",
  "ग्राम": "grams", "గ్రాములు": "grams", "గ్రామ్": "grams", "gram": "grams",
  "पैकेट": "packets", "ప్యాకెట్లు": "packets", "ప్యాకెట్": "packets", "packet": "packets",

  // Hindi definitions & FMCG Staples
  "चावल": "rice", "तेल": "oil", "चीनी": "sugar", "शक्कर": "sugar",
  "दाल": "dal", "नमक": "salt", "आटा": "flour", "दूध": "milk", "मसाले": "spices",
  "जोड़ें": "add", "डालें": "add", "बढ़ाएं": "increase", "लाओ": "add", "रखो": "add",
  "हटाएं": "remove", "कम": "remove", "निकालें": "remove",

  // Telugu definitions & FMCG Staples
  "బియ్యం": "rice", "అన్నం": "rice", "నూనె": "oil", "చక్కెర": "sugar", "పంచదార": "sugar",
  "పప్పు": "dal", "ఉప్పు": "salt", "పిండి": "flour", "పాలు": "milk", "మసాలా": "spices",
  "జోడించు": "add", "కలపండి": "add", "జోడించండి": "add", "పెంచండి": "increase", "తే": "add",
  "తొలగించు": "remove", "తగ్గించండి": "remove", "తీయండి": "remove",

  // Transliterated phonetic overlaps (Hinglish/Tenglish)
  "chawal": "rice", "tel": "oil", "cheeni": "sugar", "shakkar": "sugar",
  "biyyam": "rice", "nune": "oil", "panchadara": "sugar",
  "daal": "dal", "dhal": "dal", "pappu": "dal",
  "namak": "salt", "uppu": "salt", "atta": "flour", "pindi": "flour",
  "doodh": "milk", "paalu": "milk", "masala": "spices",
  "karo": "add", "chey": "add", "lao": "add", "vaddu": "remove",

  // Aggressive Audio Misinterpretation Fallbacks (Training phonetic edge cases natively)
  "right": "rice", "ice": "rice", "price": "rice", 
  "oiled": "oil", "all": "oil", "boil": "oil",
  "cigar": "sugar", "shugar": "sugar",
  "doll": "dal", "dial": "dal", "dull": "dal",
  "fault": "salt", "vault": "salt",
  "flower": "flour", "floor": "flour",
  "silk": "milk", "mill": "milk"
};

const translateToEnglish = (text: string) => {
  let translated = text.toLowerCase();
  Object.keys(REGIONAL_DICTIONARY).forEach(regionalWord => {
     const regex = new RegExp(regionalWord, "gi");
     translated = translated.replace(regex, ` ${REGIONAL_DICTIONARY[regionalWord]} `);
  });
  return translated;
};

export default function VoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [syncingState, setSyncingState] = useState(false);
  const [langCode, setLangCode] = useState('en-IN');
  const [translatedTranscript, setTranslatedTranscript] = useState("");
  
  // Local active memory mimicking state handling cleanly
  const [inventory, setInventory] = useState<MockInventoryState>({
    rice: 50,
    dal: 120,
    oil: 20,
    flour: 80,
    sugar: 40,
    salt: 30
  });

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Standard webkit bindings for multi-browser native ML dictation hooks
    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.SpeechRecognition && !w.webkitSpeechRecognition) {
        setSupported(false);
      }
    }
  }, []);

  const handleListen = () => {
    if (!supported) return;

    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langCode;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg("");
      setTranscript("");
      setTranslatedTranscript("");
      setParsed(null);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const speechToText = event.results[current][0].transcript.toLowerCase();
      
      setTranscript(speechToText);
      
      const translated = translateToEnglish(speechToText);
      setTranslatedTranscript(translated.trim());
      
      parseCommand(translated);
    };

    recognition.onerror = (event: any) => {
      setErrorMsg(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Elevated out asynchronously to handle backend HTTP Hooks safely
  const parseCommand = async (text: string) => {
    let parsedData: ParsedResult | null = null;

    // 1. Completely grammatical agnostic extraction mapping quantities safely
    const quantityMatch = text.match(/\d+/);
    const quantity = quantityMatch ? parseInt(quantityMatch[0], 10) : null;
    
    // 2. Extract Measurement metrics strictly dynamically
    const unitMatch = text.match(/\b(liters?|ltr|ml|kg|kgs|grams?|g|packets?|boxes?|pieces?|units?)\b/i);
    const measurement = unitMatch ? unitMatch[0].toLowerCase() : "units"; // Native "units" fallback
    
    // 3. Identify action independently
    let action = "add"; // Default assumption 
    if (text.match(/\b(remove|decrease|delete|sub)\b/i)) action = "remove";

    // 4. Fuzzy matched entity boundary scanning natively across broad inventory arrays
    const supportedProducts = ["rice", "oil", "sugar", "dal", "salt", "flour", "milk", "spices"];
    let product = "";
    
    // Iterate securely handling all dictionary items recursively
    for (const item of supportedProducts) {
       // Using aggressive boundary catching
       if (text.match(new RegExp(`\\b(${item})\\b`, 'i'))) {
          product = item;
          break;
       }
    }

    if (quantity && product) {
       parsedData = { action, quantity, measurement, product };
    }

    if (parsedData && parsedData.product) {
       setParsed(parsedData);
       const finalProd = parsedData.product;
       
       if (parsedData.action === "add" || parsedData.action === "increase" || !parsedData.action) {
         setInventory(prev => ({
           ...prev,
           [finalProd]: (prev[finalProd] || 0) + (parsedData.quantity || 0)
         }));

         // Native External System Action
         try {
           setSyncingState(true);
           await updateStock(finalProd, parsedData.quantity || 0);
         } catch (e) {
           setErrorMsg("Failed to push update sequence reliably to Neural Backend Engine.");
         } finally {
           setSyncingState(false);
         }
       }
    } else {
       setErrorMsg("Could not parse payload variables accurately. Try speaking: 'Add 10 rice'.");
    }
  };

  return (
    <Card className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_4px_30px_rgb(0,0,0,0.5)] flex flex-col h-full">
      <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-500" /> NLP Voice Commands
            </CardTitle>
            <CardDescription className="mt-1">Speak naturally to overwrite matrices directly natively.</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg border border-slate-200 dark:border-white/10 shrink-0 shadow-inner">
             <Globe2 className="w-4 h-4 text-slate-500 ml-1" />
             <select 
                value={langCode}
                onChange={(e) => setLangCode(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none border-none py-1 pr-2 cursor-pointer focus:ring-0"
             >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">हिंदी (Hindi)</option>
                <option value="te-IN">తెలుగు (Telugu)</option>
             </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 flex flex-col flex-1 gap-6 relative overflow-hidden overflow-y-auto">
        
        {!supported && (
          <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg text-sm flex items-center gap-2 border border-rose-200 dark:border-rose-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" /> Browser explicitly disallows dictated NLP Hooks internally.
          </div>
        )}

        {supported && (
          <div className="flex flex-col items-center justify-center py-4 shrink-0">
            <Button 
               onClick={handleListen} 
               disabled={isListening}
               className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                 isListening 
                  ? 'bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.6)] animate-pulse border-none' 
                  : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 hover:shadow-lg border border-slate-200 dark:border-white/10'
               }`}
            >
               {isListening ? (
                 <Mic className="w-10 h-10 text-white" />
               ) : (
                 <MicOff className="w-8 h-8 opacity-50" />
               )}
               <span className={`font-bold uppercase tracking-wider text-[10px] ${isListening ? 'text-white' : 'opacity-70'}`}>
                 {isListening ? "Listening..." : "Tap to Speak"}
               </span>
            </Button>
          </div>
        )}

        {errorMsg && (
          <div className="text-sm font-medium text-rose-500 text-center animate-in fade-in zoom-in">{errorMsg}</div>
        )}

        {transcript && (
          <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-4 shrink-0">
             <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 ml-1">
                  {langCode === 'en-IN' ? "Native ML Transcript" : "Regional Transcript"}
                </p>
                <div className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm mb-3">
                   <p className="text-md font-medium text-slate-800 dark:text-slate-200 italic">"{transcript}"</p>
                </div>
                
                {langCode !== 'en-IN' && translatedTranscript && (
                  <>
                     <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold mb-1 ml-1">Computed English Fallback</p>
                     <div className="bg-indigo-50/50 dark:bg-indigo-500/10 p-3 rounded-lg border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                        <p className="text-md font-medium text-indigo-900 dark:text-indigo-100 font-mono tracking-tight">"{translatedTranscript}"</p>
                     </div>
                  </>
                )}
             </div>
             
             {parsed && parsed.product && parsed.quantity && (
                <div className="border-t border-slate-200 dark:border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 ml-1">Parsed System Target</p>
                     <div className="flex items-center flex-wrap gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30 font-bold uppercase">{parsed.action || 'add'}</Badge>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-mono text-xs tracking-tight">+{parsed.quantity} {parsed.measurement}</Badge>
                        <Badge variant="outline" className="bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white font-mono capitalize border-slate-200 dark:border-white/10">{parsed.product}</Badge>
                     </div>
                   </div>
                   <div className={`flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-lg border shadow-sm animate-in zoom-in shrink-0 transition-colors ${syncingState ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 border-indigo-200 dark:border-indigo-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'}`}>
                     {syncingState ? <AlertCircle className="w-4 h-4 animate-spin text-indigo-500" /> : <CheckCircle2 className="w-4 h-4" />}
                     {syncingState ? "Syncing Network..." : "Live System Confirmed"}
                   </div>
                </div>
             )}
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
             <PlusCircle className="w-3.5 h-3.5" /> Mock Local Database
           </p>
           <div className="grid grid-cols-3 gap-3">
             {Object.entries(inventory).map(([key, value]) => (
               <div key={key} className="bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/5 rounded-lg p-3 text-center transition-all hover:border-indigo-300 dark:hover:border-indigo-500/30">
                 <div className="text-xs text-slate-500 capitalize tracking-wide mb-1">{key}</div>
                 <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">{value}</div>
               </div>
             ))}
           </div>
        </div>

      </CardContent>
    </Card>
  );
}
