"use client";

import React from "react";
import { UIComponentConfig } from "../../../shared/config";
import { useConfig } from "../providers/ConfigProvider";
import { useAuth } from "../providers/AuthProvider";
import Link from "next/link";
import { Lock } from "lucide-react";
import DynamicTable from "./DynamicTable";
import DynamicForm from "./DynamicForm";
import { FallbackComponent } from "./FallbackComponent";
import ChartComponent from "./ChartComponent";

// The Component Registry Map
// Adding a new component is as simple as registering it here.
const componentRegistry: Record<string, React.FC<any>> = {
  table: DynamicTable,
  form: DynamicForm,
  chart: ChartComponent,
  dashboard: () => <div className="p-8 bg-blue-50 rounded-lg text-center font-bold text-blue-800">Dashboard Component (Placeholder)</div>,
};

export const DynamicRenderer = ({ uiConfig }: { uiConfig: UIComponentConfig }) => {
  const { config } = useConfig();
  const { user } = useAuth();

  if (!config) return null;

  // Global Auth Guard: If app config requires auth but no user is logged in
  if (config.auth && !user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 shadow-xl">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <Lock className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Authentication Required</h3>
        <p className="text-slate-500 mb-8 text-center max-w-xs font-medium">This application is private. Please sign in to view and manage your data.</p>
        <Link 
          href="/login" 
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  // Find the associated entity config if an entity is specified
  const entityConfig = uiConfig.entity
    ? config.entities.find((e) => e.name === uiConfig.entity)
    : null;

  if (uiConfig.entity && !entityConfig) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded">
        Error: Entity '{uiConfig.entity}' defined in UI config not found in Entities list.
      </div>
    );
  }

  // Component Registry Pattern Lookup
  const Component = componentRegistry[uiConfig.type];

  if (!Component) {
    return <FallbackComponent type={uiConfig.type} />;
  }

  return <Component entityConfig={entityConfig} />;
};
