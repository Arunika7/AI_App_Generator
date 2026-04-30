"use client";

import React, { useState } from "react";
import api from "../lib/api";
import { EntityConfig } from "../../../shared/config";
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
    <div className="bg-white rounded-[2rem] p-10 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-400/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white transform rotate-3">
          <Plus className="w-6 h-6 -rotate-3" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 capitalize tracking-tight">
            {t(`Create ${entityConfig.name}`)}
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Fill out the information below to add a new record.</p>
        </div>
      </div>
      
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-5 rounded-2xl mb-8 border border-emerald-200/60 shadow-sm animate-in fade-in zoom-in duration-300 relative z-10">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <p className="font-semibold text-emerald-800">{t("submit_success") || "Successfully created record!"}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-5 rounded-2xl mb-8 border border-red-200/60 shadow-sm animate-in fade-in zoom-in duration-300 relative z-10">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
          <p className="font-semibold text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {entityConfig.fields.map((field) => (
            <div key={field.name} className={`${field.type === 'text' && entityConfig.fields.length % 2 !== 0 ? 'md:col-span-2' : ''} group`}>
              <label className="block text-sm font-bold text-slate-700 mb-2 capitalize tracking-wide transition-colors group-focus-within:text-indigo-600">
                {t(field.name).replace(/_/g, ' ')} {field.required && <span className="text-rose-500 font-black">*</span>}
              </label>
              <input
                type={field.type === "date" ? "datetime-local" : field.type === "number" ? "number" : "text"}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={`Enter ${t(field.name).replace(/_/g, ' ').toLowerCase()}...`}
                className="w-full bg-slate-50/80 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-sm hover:border-slate-200"
              />
            </div>
          ))}
        </div>
        
        <div className="pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full group flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("saving") || "Saving Data"}...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                {t("save") || "Save Record"} <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
