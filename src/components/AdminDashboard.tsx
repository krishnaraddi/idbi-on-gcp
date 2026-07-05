import React, { useState, useEffect } from "react";
import { MSMEApplication, ApplicationStatus, RiskLevel } from "../types";
import IDBILogo from "./IDBILogo";
import { Filter, Search, ShieldAlert, Check, X, RefreshCw, FileText, Landmark, FileSpreadsheet, Sparkles, AlertTriangle, Eye } from "lucide-react";

export default function AdminDashboard() {
  const [apps, setApps] = useState<MSMEApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters state
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Detail Modal / Sidebar state
  const [selectedApp, setSelectedApp] = useState<MSMEApplication | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (riskFilter !== "All") params.append("risk_level", riskFilter);
      if (searchTerm.trim() !== "") params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load applications list.");
      const data = await res.json();
      setApps(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, riskFilter, searchTerm]);

  // Handle Manual Credit Verdict Overwrite
  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingStatus(appId);
    try {
      const res = await fetch(`/api/admin/applications/${appId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status.");
      }

      const updatedApp: MSMEApplication = await res.json();

      // Refresh applications list locally
      setApps((prev) => prev.map((a) => (a.applicationId === appId ? updatedApp : a)));

      // If this was selected, update selected too
      if (selectedApp && selectedApp.applicationId === appId) {
        setSelectedApp(updatedApp);
      }
    } catch (err: any) {
      alert(err.message || "Error updating application status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "Approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold font-mono uppercase">Approved</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[10px] font-bold font-mono uppercase">Rejected</span>;
      case "Review":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold font-mono uppercase">Review</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-full text-[10px] font-bold font-mono uppercase">Pending</span>;
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "Low":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100/70 text-emerald-900 border border-emerald-300 rounded-md text-[10px] font-semibold font-sans">Low Risk</span>;
      case "Medium":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100/70 text-amber-900 border border-amber-300 rounded-md text-[10px] font-semibold font-sans">Medium Risk</span>;
      case "High":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100/70 text-rose-900 border border-rose-300 rounded-md text-[10px] font-semibold font-sans">High Risk</span>;
    }
  };

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Applications</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block font-mono">{apps.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Risk (Prime)</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block font-mono">
            {apps.filter(a => a.riskLevel === "Low").length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Medium Risk</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block font-mono">
            {apps.filter(a => a.riskLevel === "Medium").length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High Risk (Subprime)</span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block font-mono">
            {apps.filter(a => a.riskLevel === "High").length}
          </span>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, MSME, or company name..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-idbi-green outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:border-idbi-green outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Review">Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:border-idbi-green outline-none"
            >
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 ml-auto md:ml-0 cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                <th className="py-3.5 px-4 font-mono">App ID</th>
                <th className="py-3.5 px-4">Enterprise</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4">Requested Amt</th>
                <th className="py-3.5 px-4">Digital Score</th>
                <th className="py-3.5 px-4">Risk Class</th>
                <th className="py-3.5 px-4">Verdict</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium font-sans">
                    No applications matched the current workspace filters.
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{app.applicationId}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{app.companyName}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">{app.msmeId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{app.industryType}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">₹{(app.loanAmount / 100000).toFixed(2)} L</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold font-mono text-sm ${
                          app.score >= 750 ? "text-emerald-600" :
                          app.score >= 600 ? "text-amber-600" : "text-rose-600"
                        }`}>{app.score}</span>
                        <span className="text-[10px] text-slate-400">/ 900</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getRiskBadge(app.riskLevel)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 shrink-0 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg cursor-pointer transition inline-flex items-center gap-1.5 text-[10px] font-bold"
                        title="View Full Credit Memoir"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.applicationId, "Approved")}
                        disabled={updatingStatus === app.applicationId || app.status === "Approved"}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 disabled:opacity-30 rounded-lg cursor-pointer transition inline-flex"
                        title="Instant Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.applicationId, "Rejected")}
                        disabled={updatingStatus === app.applicationId || app.status === "Rejected"}
                        className="p-1 text-rose-600 hover:bg-rose-50 border border-rose-100 disabled:opacity-30 rounded-lg cursor-pointer transition inline-flex"
                        title="Decline Facility"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel (For Credit Memoir Appraisal Inspection) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Slide Header */}
            <div className="bg-idbi-green px-6 py-5 text-white flex items-center justify-between border-b border-idbi-green-dark">
              <div className="flex items-center gap-3">
                <IDBILogo variant="emblem" height={36} />
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-200">CREDIT DECISIONING MEMORANDUM</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedApp.companyName}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 hover:bg-idbi-green-dark rounded-lg border border-emerald-800 text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stat overview row */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">MSME Credit Score</span>
                  <span className={`text-xl font-extrabold font-mono mt-1 block ${
                    selectedApp.score >= 750 ? "text-emerald-600" :
                    selectedApp.score >= 600 ? "text-amber-600" : "text-rose-600"
                  }`}>{selectedApp.score} <span className="text-xs text-slate-400">/ 900</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Bureau Risk</span>
                  <span className="text-xs font-bold text-slate-800 mt-2 block">{selectedApp.riskLevel} Risk</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Appraisal Status</span>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {/* Bank decision controls */}
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Banker Decision Control Override</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.applicationId, "Approved")}
                    disabled={selectedApp.status === "Approved"}
                    className="flex-1 text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-505 text-white border border-emerald-500 disabled:opacity-40 hover:opacity-90 rounded-lg transition text-center cursor-pointer"
                  >
                    Approve Credit Facility
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.applicationId, "Review")}
                    disabled={selectedApp.status === "Review"}
                    className="flex-1 text-xs font-bold py-2 bg-amber-500 hover:bg-amber-600 text-white border border-amber-400 disabled:opacity-40 hover:opacity-90 rounded-lg transition text-center cursor-pointer"
                  >
                    Hold for Manual Audit
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.applicationId, "Rejected")}
                    disabled={selectedApp.status === "Rejected"}
                    className="flex-1 text-xs font-bold py-2 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 disabled:opacity-40 hover:opacity-90 rounded-lg transition text-center cursor-pointer"
                  >
                    Reject Application
                  </button>
                </div>
              </div>

              {/* Digital Underwriting analysis memo */}
              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100">
                <div className="flex items-center gap-2 mb-2 text-sky-800 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                  Gemini Underwriting Rationale Summary
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedApp.analysis.summary}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>Standard Advice:</span>
                  <strong className="text-slate-700 font-semibold">{selectedApp.recommendation}</strong>
                </div>
              </div>

              {/* Telemetry Breakdown Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">India Stack Underwriting Details</h4>

                <div className="space-y-3.5">
                  <div className="pb-3 border-b border-slate-100 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-800">GST Compliance</strong>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Score: {selectedApp.analysis.gstScore} / 200 pts
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedApp.analysis.gstAnalysis}</p>
                  </div>

                  <div className="pb-3 border-b border-slate-100 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-800">UPI Business Cashflows</strong>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Score: {selectedApp.analysis.upiScore} / 350 pts
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedApp.analysis.upiAnalysis}</p>
                  </div>

                  <div className="pb-3 border-b border-slate-100 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-800">EPFO Formal Employee Payroll</strong>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Score: {selectedApp.analysis.epfoScore} / 250 pts
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedApp.analysis.epfoAnalysis}</p>
                  </div>

                  <div className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-800">Industry Sector Context</strong>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedApp.analysis.industryAnalysis}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg cursor-pointer transition"
              >
                Close Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
