"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Zap, Database, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/builder?prompt=${encodeURIComponent(prompt)}`);
  };

  const samplePrompts = [
    "Student management system with grades",
    "Gym app with members and classes",
    "Todo list with deadlines and priority",
    "Simple CRM for my real estate clients"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden flex-1">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-fuchsia-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />

      <main className="max-w-4xl w-full px-6 relative z-10 flex flex-col items-center text-center -mt-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-fuchsia-200 text-fuchsia-700 font-bold text-sm mb-8 shadow-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4" /> AI App Generator Pro
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
          Build your app <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600">with AI.</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-12 max-w-2xl font-medium">
          No coding required. Just describe what you need, and we'll instantly generate the database, APIs, and a beautiful UI.
        </p>

        <form onSubmit={handleGenerate} className="w-full max-w-2xl relative mb-12 group">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-3xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
          <div className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-2 border-white group-focus-within:border-fuchsia-200 transition-colors flex items-center p-2 overflow-hidden">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the app you want to build..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 px-6 py-4 placeholder:text-slate-400 font-medium"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!prompt.trim()}
              className="bg-slate-900 hover:bg-fuchsia-600 disabled:bg-slate-300 disabled:text-slate-500 text-white p-4 rounded-2xl transition-colors shadow-sm"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => { setPrompt(p); router.push(`/builder?prompt=${encodeURIComponent(p)}`); }}
              className="px-5 py-2.5 bg-white/60 hover:bg-white backdrop-blur-sm border border-slate-200 hover:border-indigo-300 rounded-xl text-slate-600 hover:text-indigo-700 font-medium text-sm transition-all shadow-sm hover:shadow-md"
            >
              "{p}"
            </button>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-2xl flex items-center justify-center mb-4 text-fuchsia-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Instant Generation</h3>
            <p className="text-slate-500 text-sm font-medium">Watch your application come to life in real-time as the AI writes the code.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Full-Stack Architecture</h3>
            <p className="text-slate-500 text-sm font-medium">Automatic Postgres migrations, Node.js APIs, and Next.js React components.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Production Ready</h3>
            <p className="text-slate-500 text-sm font-medium">Built on enterprise-grade patterns. Export your code or deploy directly.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
