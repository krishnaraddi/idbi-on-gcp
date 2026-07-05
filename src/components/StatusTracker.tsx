import React, { useState } from "react";
import { MSMEApplication } from "../types";
import CreditScoreGauge from "./CreditScoreGauge";
import { Search, Loader2, Landmark, CheckCircle2, AlertTriangle, XCircle, Clock, FileText, TrendingUp, Users, Sparkles } from "lucide-react";

export default function StatusTracker() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [app, setApp] = useState<MSMEApplication | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError("");
    setApp(null);

    try {
      const res = await fetch(`/api/status/${searchId.trim()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Application not found.");
      }
      const data: MSMEApplication = await res.json();
      setApp(data);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve status.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: MSMEApplication["status"]) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold font-mono uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold font-mono uppercase">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
          </span>
        );
      case "Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold font-mono uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-full text-xs font-bold font-mono uppercase">
            <Clock className="w-3.5 h-3.5 text-slate-600" /> Pending
          </span>
        );
    }
  };

  return (
    <div id="status-tracker-container" className="max-w-4xl mx-auto space-y-6">
      {/* Search Bar Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
          Track Existing Application
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Enter your unique <strong>Application ID</strong> (e.g. <code>APP-408912</code>) or <strong>Udyam Registration ID</strong> to retrieve instant automated credit appraisal summaries.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. APP-408912 or UDYAM-MH-12-0048291"
              className="w-full text-sm pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150 font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-idbi-green hover:bg-idbi-green-dark text-white font-semibold text-sm rounded-xl cursor-pointer transition flex items-center gap-2 shrink-0 border border-idbi-green-dark"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Status"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Main Appraisal Summary Details */}
      {app && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Side Gauge Panel */}
          <div className="space-y-6 lg:col-span-1">
            <CreditScoreGauge score={app.score} riskLevel={app.riskLevel} />

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Application Meta
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500 font-medium">App ID</span>
                  <span className="font-mono font-bold text-slate-800">{app.applicationId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500 font-medium">Udyam ID</span>
                  <span className="font-mono text-slate-700 max-w-[140px] truncate">{app.msmeId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500 font-medium">Requested Amt</span>
                  <span className="font-bold text-slate-800">₹{(app.loanAmount / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500 font-medium">Sector</span>
                  <span className="font-semibold text-slate-700">{app.industryType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Created On</span>
                  <span className="text-slate-600 font-medium">{new Date(app.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Appraisal Breakdown Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Applicant Credit Memo</span>
                  <h3 className="text-lg font-bold text-slate-950 mt-0.5">{app.companyName}</h3>
                </div>
                <div>{getStatusBadge(app.status)}</div>
              </div>

              {/* AI Assistant Callout Box */}
              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 mb-6">
                <div className="flex items-center gap-2 mb-2 text-sky-800 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
                  IDBI AI-Stack Credit Decision Summary
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {app.analysis.summary}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>Recommendation:</span>
                  <strong className="text-slate-700 underline font-semibold">{app.recommendation}</strong>
                </div>
              </div>

              {/* Individual Stack Parameters */}
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Public Infrastructure Digital Trails
              </h4>

              <div className="space-y-4">
                {/* GST compliance */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-xs font-bold text-slate-800">GST Compliance Track</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Score contribution: {app.analysis.gstScore || 0} / 200 pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {app.analysis.gstAnalysis}
                  </p>
                </div>

                {/* UPI Inflow */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-xs font-bold text-slate-800">UPI Business Inflows Ledger</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Score contribution: {app.analysis.upiScore || 0} / 350 pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {app.analysis.upiAnalysis}
                  </p>
                </div>

                {/* EPFO payroll */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-xs font-bold text-slate-800">EPFO Formal Employment Base</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      Score contribution: {app.analysis.epfoScore || 0} / 250 pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {app.analysis.epfoAnalysis}
                  </p>
                </div>

                {/* Sector assessment */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-xs font-bold text-slate-800">Industry & Sector Analysis</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {app.analysis.industryAnalysis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
