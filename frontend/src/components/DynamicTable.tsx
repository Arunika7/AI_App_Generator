"use client";

import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { EntityConfig } from "../../../../shared/config";
import { useI18n } from "../providers/I18nProvider";
import { Upload, Trash2, TableProperties, RefreshCw, FileDown } from "lucide-react";
import Dropzone from "react-dropzone";

export default function DynamicTable({ entityConfig }: { entityConfig: EntityConfig }) {
  const { t } = useI18n();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dynamic/${entityConfig.name}`);
      setData(res.data);
    } catch (err) {
      setError(t("error_fetching_data") || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [entityConfig.name]);

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirm_delete") || "Are you sure?")) return;
    try {
      await api.delete(`/dynamic/${entityConfig.name}/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(t("delete_failed") || "Delete failed");
    }
  };

  const handleFileUpload = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post(`/dynamic/${entityConfig.name}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(t("import_success") || "Import successful");
      fetchData(); // Refresh table
    } catch (err) {
      alert(t("import_failed") || "Import failed");
      setLoading(false);
    }
  };

  if (error) return (
    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 p-6 rounded-3xl shadow-sm text-center font-medium">
      {error}
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 bg-white/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-50 rounded-xl text-fuchsia-600 shadow-inner">
            <TableProperties className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">{t(entityConfig.name)} <span className="text-slate-400 font-normal text-lg ml-1">Table</span></h2>
            <p className="text-sm text-slate-500 font-medium">
              {data.length} {data.length === 1 ? 'record' : 'records'} found
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={fetchData} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100 shadow-sm bg-white" title="Refresh">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          
          {/* CSV Import */}
          <Dropzone onDrop={handleFileUpload} accept={{ 'text/csv': ['.csv'] }}>
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl border-2 border-dashed transition-all font-semibold text-sm ${
                  isDragActive 
                  ? 'bg-fuchsia-50 border-fuchsia-400 text-fuchsia-700 shadow-inner' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 shadow-sm hover:shadow-md'
                }`}
              >
                <input {...getInputProps()} />
                <FileDown className={`w-4 h-4 ${isDragActive ? 'text-fuchsia-500 animate-bounce' : ''}`} />
                <span>{isDragActive ? 'Drop CSV Here' : (t("import_csv") || "Import CSV")}</span>
              </div>
            )}
          </Dropzone>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold">
              {entityConfig.fields.map((field) => (
                <th key={field.name} className="py-4 px-6 border-b border-slate-100 whitespace-nowrap">
                  {t(field.name)}
                </th>
              ))}
              <th className="py-4 px-6 border-b border-slate-100 text-right w-24">
                {t("actions") || "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={entityConfig.fields.length + 1} className="py-12 text-center">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-full text-sm font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={entityConfig.fields.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <TableProperties className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-semibold">{t("no_data") || "No data available yet"}</p>
                    <p className="text-slate-400 text-sm max-w-sm">Use the form above to add new entries or import a CSV file.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                  {entityConfig.fields.map((field) => (
                    <td key={field.name} className="py-4 px-6 text-slate-700 font-medium">
                      <div className="max-w-[200px] truncate" title={row[field.name]?.toString()}>
                        {row[field.name]?.toString() || <span className="text-slate-300 font-normal italic">Empty</span>}
                      </div>
                    </td>
                  ))}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
