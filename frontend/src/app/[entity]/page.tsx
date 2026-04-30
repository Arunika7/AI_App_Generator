"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useConfig } from "../../providers/ConfigProvider";
import { DynamicRenderer } from "../../components/DynamicRenderer";
import Link from "next/link";
import { ArrowLeft, Database, Loader2 } from "lucide-react";

export default function EntityPage() {
  const params = useParams();
  const entityName = params.entity as string;
  const { config, loading } = useConfig();

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-fuchsia-400 blur-xl opacity-30 animate-pulse rounded-full"></div>
        <Loader2 className="w-12 h-12 text-fuchsia-600 animate-spin relative z-10" />
      </div>
      <p className="text-lg font-medium text-slate-600 animate-pulse">Loading {entityName}...</p>
    </div>
  );
  if (!config) return <div className="p-10 text-red-500">Configuration not loaded.</div>;

  // Find the UI config associated with this entity.
  const matchedUIConfigs = config.ui.filter(ui => ui.entity === entityName);

  if (matchedUIConfigs.length === 0) {
    return (
      <div className="p-10">
        <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1"/> Back to Dashboard
        </Link>
        <div className="bg-red-50/80 backdrop-blur-sm text-red-700 p-6 rounded-2xl border border-red-200 shadow-sm">
          No UI configured for entity: <span className="font-bold">{entityName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <Link 
        href="/" 
        className="inline-flex items-center px-4 py-2 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:text-indigo-700 font-semibold rounded-full mb-8 shadow-sm transition-all hover:shadow-md hover:-translate-x-1"
      >
        <ArrowLeft size={16} className="mr-2"/> Back to Dashboard
      </Link>
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Database className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 capitalize tracking-tight">
            {entityName} Management
          </h1>
          <p className="text-slate-500 mt-1">Manage and view your dynamically generated data entries.</p>
        </div>
      </div>
      
      <div className="space-y-12">
        {matchedUIConfigs.map((uiConfig, idx) => (
          <div key={idx} className="relative">
            {/* Subtle connector line between stacked components if there are multiple */}
            {idx !== 0 && <div className="absolute -top-12 left-8 w-0.5 h-12 bg-gradient-to-b from-transparent to-indigo-100" />}
            <DynamicRenderer uiConfig={uiConfig} />
          </div>
        ))}
      </div>
    </div>
  );
}
