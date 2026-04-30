"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppConfig } from "../../../shared/config";

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export const I18nProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: AppConfig | null;
}) => {
  const [locale, setLocale] = useState("en");

  const t = (key: string): string => {
    if (!config || !config.translations) return key;
    
    const translationSet = config.translations[locale];
    if (translationSet && translationSet[key]) {
      return translationSet[key];
    }
    
    // Fallback to key if not found
    return key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
