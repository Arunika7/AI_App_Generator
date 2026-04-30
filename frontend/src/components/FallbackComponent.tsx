import React from "react";

export const FallbackComponent = ({ type }: { type: string }) => {
  return (
    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-md shadow-sm">
      <h3 className="font-bold text-lg mb-1">⚠️ Unsupported Component</h3>
      <p>
        The component type <strong>{type}</strong> is not recognized by the system.
        Please check your JSON configuration.
      </p>
    </div>
  );
};
