"use client";

import React from "react";
import { useConfig } from "../providers/ConfigProvider";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2, AlertCircle, LayoutTemplate } from "lucide-react";

export default function Home() {
  const { config, loading, error } = useConfig();

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-fuchsia-400 blur-xl opacity-30 animate-pulse rounded-full"></div>
        <Loader2 className="w-12 h-12 text-fuchsia-600 animate-spin relative z-10" />
      </div>
      <p className="text-lg font-medium text-slate-600 animate-pulse">Orchestrating your platform...</p>
    </div>
  );
  
  if (error) return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl shadow-xl flex items-start gap-4">
      <div className="p-3 bg-red-100 rounded-full text-red-600 shrink-0">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-red-800 mb-2">Configuration Error</h2>
        <p className="text-red-600/90 leading-relaxed">{error}</p>
      </div>
    </div>
  );
  
  if (!config) return <div className="p-10 text-slate-500 font-medium text-center">No config loaded. Ensure the backend is providing a valid app configuration.</div>;

  return (
    <div className="max-w-6xl mx-auto mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-12 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Configured via JSON</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight text-slate-900">
          {config.appName || "Enterprise Nexus"}
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl leading-relaxed font-light">
          A high-performance, schema-driven architecture. Experience seamless data management with interfaces that adapt instantly to your system configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {config.ui.map((uiItem, idx) => (
          <Link 
            key={idx} 
            href={uiItem.entity ? `/${uiItem.entity}` : "#"}
            className="group relative block p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-transparent to-fuchsia-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 capitalize mb-3 group-hover:text-indigo-700 transition-colors">
                {uiItem.entity || "Dashboard"}
              </h2>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                  {uiItem.type}
                </span>
              </div>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Dynamically generated {uiItem.type} interface mapped to the <strong className="font-semibold">{uiItem.entity}</strong> entity.
              </p>

              <div className="flex items-center text-sm font-semibold text-indigo-600 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                Explore Module <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
