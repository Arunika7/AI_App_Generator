"use client";

import React from "react";
import { UIComponentConfig } from "../../../../shared/config";
import { useConfig } from "../providers/ConfigProvider";
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

  if (!config) return null;

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
