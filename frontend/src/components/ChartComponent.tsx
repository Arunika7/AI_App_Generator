import React from "react";
import { EntityConfig } from "../../../../shared/config";
import { BarChart3 } from "lucide-react";

export default function ChartComponent({ entityConfig }: { entityConfig?: EntityConfig }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-inner">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Analytics <span className="text-slate-400 font-normal text-lg ml-1">for {entityConfig ? entityConfig.name : "Unknown Entity"}</span>
        </h2>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 h-72 flex flex-col items-center justify-center rounded-2xl text-blue-600 font-semibold shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-multiply pointer-events-none"></div>
        <BarChart3 className="w-16 h-16 mb-4 text-blue-300 opacity-50" />
        <span className="relative z-10 text-lg">[ Chart Placeholder: Proving Extensibility ]</span>
        <p className="relative z-10 text-sm font-medium text-blue-400 mt-2">Plug in Recharts or Chart.js here</p>
      </div>
    </div>
  );
}
