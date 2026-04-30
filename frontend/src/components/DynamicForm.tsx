"use client";

import React, { useState } from "react";
import api from "../lib/api";
import { EntityConfig } from "../../../../shared/config";
import { useI18n } from "../providers/I18nProvider";
import { CheckCircle2, AlertCircle, Send, Plus } from "lucide-react";

export default function DynamicForm({ entityConfig }: { entityConfig: EntityConfig }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post(`/dynamic/${entityConfig.name}`, formData);
      setSuccess(true);
      setFormData({}); // Reset
    } catch (err: any) {
      setError(err.response?.data?.error || t("submit_error") || "Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
          <Plus className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 capitalize">
          {t(`Create New ${entityConfig.name}`)}
        </h2>
      </div>
      
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50/80 backdrop-blur-sm text-emerald-700 p-4 rounded-2xl mb-6 border border-emerald-100 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="font-medium">{t("submit_success") || "Successfully created!"}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50/80 backdrop-blur-sm text-red-700 p-4 rounded-2xl mb-6 border border-red-100 animate-in fade-in zoom-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {entityConfig.fields.map((field) => (
            <div key={field.name} className={`${field.type === 'text' && entityConfig.fields.length % 2 !== 0 ? 'md:col-span-2' : ''}`}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize ml-1">
                {t(field.name)} {field.required && <span className="text-rose-500 font-bold">*</span>}
              </label>
              <input
                type={field.type === "date" ? "datetime-local" : field.type === "number" ? "number" : "text"}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={`Enter ${t(field.name).toLowerCase()}...`}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>
          ))}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("saving") || "Saving"}...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t("save") || "Save Entry"} <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
