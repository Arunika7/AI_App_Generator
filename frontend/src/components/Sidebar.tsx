"use client";

import React from "react";
import Link from "next/link";
import { useConfig } from "../providers/ConfigProvider";
import { LayoutDashboard, Home, Database, Sparkles } from "lucide-react";

export function Sidebar() {
  const { config } = useConfig();
  const entities = config?.entities || [];

  return (
    <div className="w-72 h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden shrink-0 border-r border-white/5">
      {/* Dynamic Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-fuchsia-600/30 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-tl from-indigo-600/20 to-transparent blur-3xl pointer-events-none" />

      {/* Branding */}
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/10">
            <span className="text-white font-bold text-xl">AG</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">AI App Generator</h1>
            <span className="text-xs font-medium text-purple-200/80 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Pro Edition</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-transparent hover:border-white/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
            <Home className="w-5 h-5 text-purple-200 group-hover:text-white transition-colors" />
            <span className="font-medium text-purple-50 group-hover:text-white">Dashboard Home</span>
          </Link>

          <Link href="/builder" className="flex items-center gap-3 p-3 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/40 transition-all duration-300 border border-fuchsia-400/30 hover:border-fuchsia-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400/0 via-fuchsia-400/20 to-fuchsia-400/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
            <Sparkles className="w-5 h-5 text-fuchsia-300 group-hover:text-white transition-colors relative z-10" />
            <span className="font-bold text-fuchsia-100 group-hover:text-white relative z-10">AI Builder Studio</span>
          </Link>
          
          {entities.length > 0 && (
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-purple-300/50 uppercase tracking-wider mb-2">Generated Apps</p>
              <div className="space-y-1">
                {entities.map((entity) => (
                  <Link
                    key={entity.name}
                    href={`/app/${entity.name}`}
                    className="flex items-center gap-3 p-2.5 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-slate-300 hover:text-white group"
                  >
                    <Database className="w-4 h-4 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
                    <span className="capitalize text-sm font-medium">{entity.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
      
      {/* Footer Profile */}
      <div className="mt-auto relative z-10 bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm m-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-500 border-2 border-white/20 flex items-center justify-center font-bold text-sm shadow-inner">
            AG
          </div>
          <div>
            <p className="text-sm font-semibold">AI App Generator</p>
            <p className="text-xs text-purple-300">Admin Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
