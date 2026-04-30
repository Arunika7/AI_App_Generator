"use client";

import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { EntityConfig } from "../../../shared/config";
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Import failed. Check CSV format.";
      alert(errorMsg);
      setLoading(false);
    }
  };

  if (error) return (
    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 p-6 rounded-3xl shadow-sm text-center font-medium">
      {error}
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden relative">
      <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 bg-white relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-fuchsia-50 rounded-2xl text-fuchsia-600 shadow-inner">
            <TableProperties className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 capitalize tracking-tight">{t(entityConfig.name)}</h2>
            <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">
              {data.length} {data.length === 1 ? 'Record' : 'Records'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button onClick={fetchData} className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-2 border-transparent hover:border-indigo-100 shadow-sm bg-slate-50" title="Refresh">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          
          {/* CSV Import */}
          <Dropzone onDrop={handleFileUpload} accept={{ 'text/csv': ['.csv'] }}>
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 cursor-pointer px-6 py-3 rounded-xl border-2 border-dashed transition-all font-bold text-sm ${
                  isDragActive 
                  ? 'bg-fuchsia-50 border-fuchsia-400 text-fuchsia-700 shadow-inner' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm hover:shadow-md'
                }`}
              >
                <input {...getInputProps()} />
                <FileDown className={`w-5 h-5 ${isDragActive ? 'text-fuchsia-500 animate-bounce' : ''}`} />
                <span>{isDragActive ? 'Drop CSV Here' : (t("import_csv") || "Import CSV")}</span>
              </div>
            )}
          </Dropzone>
        </div>
      </div>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-100 text-slate-500 text-xs uppercase tracking-widest font-extrabold">
              {entityConfig.fields.map((field) => (
                <th key={field.name} className="py-5 px-8 whitespace-nowrap">
                  {t(field.name).replace(/_/g, ' ')}
                </th>
              ))}
              <th className="py-5 px-8 text-right w-24">
                {t("actions") || "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={entityConfig.fields.length + 1} className="py-16 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-bold shadow-sm">
                    <RefreshCw className="w-5 h-5 animate-spin" /> Fetching Data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={entityConfig.fields.length + 1} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-3 shadow-inner">
                      <TableProperties className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-800 text-xl font-extrabold tracking-tight">{t("no_data") || "No Records Found"}</p>
                    <p className="text-slate-500 font-medium max-w-sm">Use the form to create new entries or drop a CSV file to import bulk data.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                  {entityConfig.fields.map((field, colIdx) => (
                    <td key={field.name} className="py-5 px-8 text-slate-800 font-semibold">
                      {colIdx === 0 && row[field.name] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-fuchsia-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-white">
                            {row[field.name].toString().charAt(0)}
                          </div>
                          <span className="max-w-[200px] truncate">{row[field.name].toString()}</span>
                        </div>
                      ) : (
                        <div className="max-w-[200px] truncate" title={row[field.name]?.toString()}>
                          {row[field.name] ? (
                            field.type === 'date' ? new Date(row[field.name]).toLocaleDateString() : row[field.name].toString()
                          ) : (
                            <span className="text-slate-300 font-medium italic">—</span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
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
