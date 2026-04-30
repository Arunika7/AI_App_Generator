"use client";

import React from "react";
import { I18nProvider } from "../providers/I18nProvider";
import { useConfig } from "../providers/ConfigProvider";

export const I18nProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { config } = useConfig();

  return (
    <I18nProvider config={config}>
      {children}
    </I18nProvider>
  );
};
