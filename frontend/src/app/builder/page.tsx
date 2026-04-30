"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConfig } from "../../providers/ConfigProvider";
import api from "../../lib/api";
import { 
  Wand2, Play, AlertTriangle, RotateCcw, Database, FileJson, History,
  Send, Bot, User, CheckCircle2, Copy, Sparkles, PlusCircle, LayoutDashboard, Settings
} from "lucide-react";
import { DynamicRenderer } from "../../components/DynamicRenderer";
import { useSearchParams, useRouter } from "next/navigation";

export default function BuilderPage() {
  const { config, refreshConfig } = useConfig();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  
  // Tabs & History
  const [activeTab, setActiveTab] = useState<"chat" | "config" | "history">("chat");
  const [chatLog, setChatLog] = useState<{role: 'user'|'system', content: string}[]>([]);
  const [configHistory, setConfigHistory] = useState<{id: number, timestamp: Date, config: any}[]>([]);
  const [configText, setConfigText] = useState("");
  
  // Active Preview State
  const [previewEntity, setPreviewEntity] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-run prompt from Landing Page
  useEffect(() => {
    const initialPrompt = searchParams.get("prompt");
    if (initialPrompt && chatLog.length === 0 && !loading) {
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt);
      router.replace("/builder"); // Clear URL
    }
  }, [searchParams]);

  // Keep config text editor synced
  useEffect(() => {
    if (config && activeTab === "config") {
      setConfigText(JSON.stringify(config, null, 2));
    }
  }, [config, activeTab]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const pushHistory = (newConfig: any) => {
    setConfigHistory(prev => [...prev, { id: prev.length + 1, timestamp: new Date(), config: newConfig }]);
  };

  const handleGenerate = async (submitPrompt: string = prompt) => {
    if (!submitPrompt.trim()) return;
    
    const userMessage = submitPrompt;
    setPrompt("");
    setChatLog(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setSyncStatus("Analyzing request and building AI schema...");

    try {
      // Pass currentConfig to backend to allow conversational updates
      const res = await api.post("/builder/generate", { 
        prompt: userMessage,
        currentConfig: config 
      });
      
      const { config: newConfig, message } = res.data;
      
      // Ensure auth is false during builder testing
      newConfig.auth = false;

      setChatLog(prev => [...prev, { role: "system", content: message }]);
      
      // Sync to Backend
      setSyncStatus("Synchronizing database schema...");
      await api.put("/builder/config", newConfig);
      await refreshConfig();
      pushHistory(newConfig);
      
      if (newConfig.entities.length > 0) {
        setPreviewEntity(newConfig.entities[newConfig.entities.length - 1].name);
      }
      setSyncStatus(null);
    } catch (err) {
      setChatLog(prev => [...prev, { role: "system", content: "Error: Failed to generate configuration. Please check the backend connection." }]);
      setSyncStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyConfigJson = async () => {
    try {
      setLoading(true);
      setSyncStatus("Applying JSON configuration...");
      const parsed = JSON.parse(configText);
      parsed.auth = false;
      await api.put("/builder/config", parsed);
      await refreshConfig();
      pushHistory(parsed);
      setChatLog(prev => [...prev, { role: "system", content: "Manual JSON configuration applied successfully." }]);
      setActiveTab("chat");
    } catch (err) {
      alert("Invalid JSON format or schema mismatch.");
    } finally {
      setLoading(false);
      setSyncStatus(null);
    }
  };

  const handleRevert = async (historicalConfig: any) => {
    if (!confirm("Are you sure you want to revert to this version?")) return;
    try {
      setLoading(true);
      setSyncStatus("Reverting application state...");
      await api.put("/builder/config", historicalConfig);
      await refreshConfig();
      pushHistory(historicalConfig); // Push the revert as a new history item
      setChatLog(prev => [...prev, { role: "system", content: "Successfully reverted to a previous version." }]);
      setActiveTab("chat");
    } finally {
      setLoading(false);
      setSyncStatus(null);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to completely reset the application?")) return;
    setLoading(true);
    setSyncStatus("Resetting application...");
    try {
      const emptyConfig = { appName: "Dynamic App", auth: false, entities: [], ui: [] };
      await api.put("/builder/config", emptyConfig);
      await refreshConfig();
      setPreviewEntity(null);
      setChatLog([{ role: "system", content: "Application has been completely reset. What would you like to build?" }]);
      pushHistory(emptyConfig);
    } finally {
      setLoading(false);
      setSyncStatus(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      
      {/* LEFT PANE: Control Panel */}
      <div className="w-[450px] bg-white border-r border-slate-200 flex flex-col shadow-2xl shadow-slate-200/50 z-20 shrink-0">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-500 rounded-full blur-[50px] opacity-30 pointer-events-none" />
          <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
            <Sparkles className="w-5 h-5 text-fuchsia-400" /> AI Co-Founder
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">Build and iterate your application via chat.</p>
          
          <div className="flex bg-slate-800 p-1 rounded-xl mt-6">
            <button onClick={() => setActiveTab("chat")} className={`flex-1 text-sm font-bold py-2 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              Chat
            </button>
            <button onClick={() => setActiveTab("config")} className={`flex-1 text-sm font-bold py-2 rounded-lg transition-all ${activeTab === 'config' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              JSON Config
            </button>
            <button onClick={() => setActiveTab("history")} className={`flex-1 text-sm font-bold py-2 rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              History
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">
          
          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div className="flex-1 p-6 flex flex-col gap-6">
              {chatLog.length === 0 && (
                <div className="text-center py-10 opacity-60">
                  <Bot className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 font-medium">I'm your AI Co-Founder. Tell me what app you want to build!</p>
                </div>
              )}
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-medium shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* CONFIG TAB */}
          {activeTab === "config" && (
            <div className="flex-1 p-6 flex flex-col">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium mb-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                Advanced mode: Modifying this JSON directly will alter the database schema when applied.
              </div>
              <textarea 
                className="flex-1 w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none shadow-inner"
                value={configText}
                onChange={e => setConfigText(e.target.value)}
              />
              <button onClick={handleApplyConfigJson} disabled={loading} className="mt-4 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Apply JSON Config
              </button>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="flex-1 p-6 space-y-4">
              {configHistory.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <History className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 font-medium">No history recorded yet.</p>
                </div>
              ) : (
                configHistory.map((hist, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                    <div>
                      <p className="font-bold text-slate-800">Version {hist.id}</p>
                      <p className="text-xs text-slate-500">{hist.timestamp.toLocaleTimeString()}</p>
                    </div>
                    <button onClick={() => handleRevert(hist.config)} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 text-sm font-bold rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      Revert
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Input Area (Only visible on Chat) */}
        {activeTab === "chat" && (
          <div className="p-4 bg-white border-t border-slate-200 relative z-10">
            {syncStatus && (
              <div className="absolute -top-10 left-0 w-full flex justify-center pointer-events-none">
                <div className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> {syncStatus}
                </div>
              </div>
            )}
            <form onSubmit={e => { e.preventDefault(); handleGenerate(); }} className="relative">
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-14 py-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none shadow-inner"
                rows={2}
                placeholder="E.g. Create a gym app... or Add email field..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              />
              <button 
                type="submit" 
                disabled={loading || !prompt.trim()}
                className="absolute right-3 bottom-3 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-md"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
            
            <div className="mt-4 flex gap-2">
               <button onClick={handleReset} className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-lg transition-colors border border-rose-100">
                 <RotateCcw className="w-3.5 h-3.5" /> Reset App
               </button>
               {/* Quick Templates */}
               <button onClick={() => { setPrompt("Add a dashboard with charts"); handleGenerate("Add a dashboard with charts"); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors border border-slate-200">
                 <LayoutDashboard className="w-3.5 h-3.5" /> + Dashboard
               </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANE: Live Preview */}
      <div className="flex-1 bg-slate-50 relative overflow-y-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Top Bar */}
        <div className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 p-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-800 tracking-tight">Live App Preview</h2>
            </div>
            {previewEntity && (
              <div className="bg-white text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Entity: <span className="capitalize">{previewEntity}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {config?.entities.map(e => (
               <button 
                 key={e.name}
                 onClick={() => setPreviewEntity(e.name)}
                 className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize border ${previewEntity === e.name ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-sm'}`}
               >
                 {e.name}
               </button>
            ))}
          </div>
        </div>

        <div className="p-10 max-w-5xl mx-auto pb-32">
          {!config || config.entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-4">
               <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center border border-slate-100 transform rotate-3">
                 <Wand2 className="w-10 h-10 text-fuchsia-400" />
               </div>
               <h3 className="text-2xl font-black text-slate-700 tracking-tight mt-4">Canvas is Empty</h3>
               <p className="text-lg font-medium tracking-tight max-w-md text-center">Use the chat panel on the left to describe the application you want to build.</p>
            </div>
          ) : previewEntity ? (
            <div className="space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-8">
               {/* Dynamically render all UI components for the selected entity! */}
               {config.ui.filter(u => u.entity === previewEntity).length > 0 ? (
                 config.ui.filter(u => u.entity === previewEntity).map((uiItem, idx) => (
                   <div key={`${uiItem.type}-${idx}`} className="shadow-2xl shadow-indigo-900/5 rounded-[2rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
                     <DynamicRenderer uiConfig={uiItem} />
                   </div>
                 ))
               ) : (
                 <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl border border-yellow-200 text-center font-bold">
                   No UI configured for {previewEntity}. Ask the AI to add a form or table!
                 </div>
               )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
