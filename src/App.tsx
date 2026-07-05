import React, { useState } from "react";
import ApplicationForm from "./components/ApplicationForm";
import StatusTracker from "./components/StatusTracker";
import AdminDashboard from "./components/AdminDashboard";
import IDBILogo from "./components/IDBILogo";
import { Landmark, FileText, Activity, ShieldCheck, Lock, ChevronRight, HelpCircle, Cpu, ExternalLink } from "lucide-react";
import { MSMEApplication } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"apply" | "track" | "admin">("apply");
  const [lastSubmittedId, setLastSubmittedId] = useState<string>("");

  const handleApplicationSuccess = (app: MSMEApplication) => {
    setLastSubmittedId(app.applicationId);
    // Optionally switch to track tab immediately
    setTimeout(() => {
      setActiveTab("track");
    }, 2500);
  };

  return (
    <div id="msme-app-workspace" className="min-h-screen bg-[#F4F9F6] text-slate-900 font-sans selection:bg-idbi-green selection:text-white flex flex-col">
      {/* Prime Bank Banner */}
      <header className="bg-idbi-green border-b border-idbi-green-dark sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IDBILogo variant="full" height={44} />
            <span className="hidden sm:inline-block px-2 py-0.5 bg-white/10 text-emerald-200 font-bold text-[9px] rounded-md border border-white/20 uppercase tracking-wider font-mono">MSME SmartStack</span>
          </div>

          <div className="flex items-center gap-4 text-white">
            <div className="hidden md:flex items-center gap-5 text-xs text-emerald-100/80 font-medium border-r border-emerald-800 pr-5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                GSTN API: <strong className="text-white font-semibold">Active</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                EPFO API: <strong className="text-white font-semibold">Active</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-idbi-orange" />
                Gemini AI Analyst: <strong className="text-white font-semibold">Ready</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-full border border-white/20 transition duration-150">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Sandbox Secure
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Core Description Card */}
        <div className="bg-idbi-green text-white p-6 sm:p-8 rounded-3xl border border-idbi-green-dark shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-idbi-green-dark/60 to-transparent pointer-events-none" />
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-idbi-orange/15 text-idbi-orange border border-idbi-orange/20 rounded-full text-[10px] font-bold tracking-wider uppercase">
              <Cpu className="w-3 h-3 text-idbi-orange" /> Automated Risk Underwriting
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
              Democratizing MSME Credit Decisions
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
              By utilizing merchant transactions, tax filings, and employment indexes, IDBI fast-tracks loan sanctions from months to minutes. Powered by machine credit scoring coupled with real-time Gemini LLM appraisal memorialization.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("apply")}
              className={`flex-1 sm:flex-initial text-center px-5 py-3 font-bold text-xs rounded-xl cursor-pointer select-none transition border duration-150 shadow-sm ${
                activeTab === "apply"
                  ? "bg-idbi-orange text-white border-idbi-orange hover:bg-idbi-orange/90"
                  : "bg-idbi-green-dark hover:bg-idbi-green-dark/80 text-white border-idbi-green-dark"
              }`}
            >
              Start New Application
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 sm:flex-initial text-center px-5 py-3 font-bold text-xs rounded-xl cursor-pointer select-none transition border duration-150 flex items-center justify-center gap-1.5 shadow-sm ${
                activeTab === "admin"
                  ? "bg-idbi-orange text-white border-idbi-orange hover:bg-idbi-orange/90"
                  : "bg-idbi-green-dark hover:bg-idbi-green-dark/80 text-white border-idbi-green-dark"
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-white" /> IDBI Admin Panel
            </button>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        <div className="border-b border-emerald-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("apply")}
              className={`pb-3.5 text-sm font-bold border-b-2 cursor-pointer transition ${
                activeTab === "apply"
                  ? "border-idbi-green text-idbi-green"
                  : "border-transparent text-slate-500 hover:text-idbi-green"
              }`}
            >
              1. Apply for Credit
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`pb-3.5 text-sm font-bold border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === "track"
                  ? "border-idbi-green text-idbi-green"
                  : "border-transparent text-slate-500 hover:text-idbi-green"
              }`}
            >
              2. Track Application Status
              {lastSubmittedId && (
                <span className="w-2 h-2 rounded-full bg-idbi-orange animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`pb-3.5 text-sm font-bold border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "border-idbi-green text-idbi-green"
                  : "border-transparent text-slate-500 hover:text-idbi-green"
              }`}
            >
              3. Banker Underwriting Portal
              <Lock className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-slate-400 pb-3">
            <Activity className="w-3.5 h-3.5 text-idbi-green" /> IDBI Credit Appraisal V2.1
          </div>
        </div>

        {/* Dynamic Workspace Panels */}
        <div className="py-2">
          {activeTab === "apply" && (
            <div className="animate-fade-in-up">
              <ApplicationForm onSuccess={handleApplicationSuccess} />
            </div>
          )}

          {activeTab === "track" && (
            <div className="animate-fade-in-up">
              <StatusTracker />
            </div>
          )}

          {activeTab === "admin" && (
            <div className="animate-fade-in-up">
              <AdminDashboard />
            </div>
          )}
        </div>
      </main>

      {/* Corporate Banker Footer */}
      <footer className="bg-idbi-green border-t border-idbi-green-dark text-emerald-100/80 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <IDBILogo variant="emblem" height={24} />
                IDBI Digital Underwriting Stack
              </div>
              <p className="text-[11px] text-emerald-200/70">
                Official Bank Demonstration Prototype. Optimized for fast decisioning.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-idbi-green-dark rounded-lg text-emerald-100 font-semibold text-[10px] uppercase font-mono border border-emerald-800">
                API Version: 2.1-Prod
              </span>
              <span className="px-2.5 py-1 bg-idbi-green-dark rounded-lg text-emerald-100 font-semibold text-[10px] uppercase font-mono border border-emerald-800">
                Gemini Engine: v3.5-flash
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-[11px] text-emerald-200/60 gap-4">
            <p>© {new Date().getFullYear()} Industrial Development Bank of India (IDBI) Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">India Stack Guidelines</a>
              <span className="text-emerald-800">|</span>
              <a href="#" className="hover:text-white transition">GSTN Integration Guide</a>
              <span className="text-emerald-800">|</span>
              <a href="#" className="hover:text-white transition">EPFO Underwriting Rules</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
