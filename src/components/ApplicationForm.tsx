import React, { useState } from "react";
import { MSMEApplication } from "../types";
import IDBILogo from "./IDBILogo";
import { Landmark, FileText, Smartphone, ShieldCheck, Cpu, Play, CheckCircle } from "lucide-react";

interface ApplicationFormProps {
  onSuccess: (app: MSMEApplication) => void;
}

export default function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  // Form State
  const [msmeId, setMsmeId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [gstCompliance, setGstCompliance] = useState(90);
  const [upiInflows, setUpiInflows] = useState<number | "">("");
  const [epfoContributions, setEpfoContributions] = useState<number | "">("");
  const [industryType, setIndustryType] = useState("Services");
  const [loanAmount, setLoanAmount] = useState<number | "">("");

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successApp, setSuccessApp] = useState<MSMEApplication | null>(null);

  // Quick Demo Presets
  const applyPreset = (type: "low" | "medium" | "high") => {
    setError("");
    if (type === "low") {
      setMsmeId("UDYAM-MH-12-0056123");
      setCompanyName("Vikas CNC Precision Engineering");
      setGstin("27AABCV1284E1Z3");
      setGstCompliance(98);
      setUpiInflows(2400000);
      setEpfoContributions(220000);
      setIndustryType("Manufacturing");
      setLoanAmount(4500000);
    } else if (type === "medium") {
      setMsmeId("UDYAM-KA-03-0094182");
      setCompanyName("Kalyan Organic Spices");
      setGstin("29AAFCK9042F1Z1");
      setGstCompliance(85);
      setUpiInflows(550000);
      setEpfoContributions(45000);
      setIndustryType("Retail");
      setLoanAmount(2000000);
    } else {
      setMsmeId("UDYAM-UP-16-0012934");
      setCompanyName("Shree Balaji Confectionery");
      setGstin("09AAGPB1291G1ZB");
      setGstCompliance(55);
      setUpiInflows(60000);
      setEpfoContributions(0);
      setIndustryType("Retail");
      setLoanAmount(1200000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessApp(null);

    // Basic Validation
    if (!msmeId.trim()) return setError("Udyam Registration ID is required.");
    if (!companyName.trim()) return setError("Company Name is required.");
    if (gstCompliance < 0 || gstCompliance > 100) return setError("GST compliance must be between 0 and 100%.");
    if (upiInflows === "" || Number(upiInflows) < 0) return setError("Please enter valid monthly UPI Inflows.");
    if (epfoContributions === "" || Number(epfoContributions) < 0) return setError("Please enter valid monthly EPFO Contributions.");
    if (loanAmount === "" || Number(loanAmount) <= 0) return setError("Please enter a valid requested Loan Amount.");

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msme_id: msmeId,
          company_name: companyName,
          gstin: gstin || "N/A",
          gst_compliance: Number(gstCompliance),
          upi_inflows: Number(upiInflows),
          epfo_contributions: Number(epfoContributions),
          industry_type: industryType,
          loan_amount: Number(loanAmount)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit credit underwriting application.");
      }

      const data: MSMEApplication = await response.json();
      setSuccessApp(data);
      onSuccess(data);

      // Reset form
      setMsmeId("");
      setCompanyName("");
      setGstin("");
      setGstCompliance(90);
      setUpiInflows("");
      setEpfoContributions("");
      setIndustryType("Services");
      setLoanAmount("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="application-form-panel" className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Banner / Header */}
      <div className="bg-idbi-green px-6 py-6 border-b border-idbi-green-dark flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <IDBILogo variant="emblem" height={44} />
          <div>
            <h2 className="text-lg font-bold tracking-tight">IDBI MSME Credit Application Form</h2>
            <p className="text-xs text-emerald-100/80 font-medium">Fast-track underwriting based on Indian Public Digital Infrastructure</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-idbi-green-dark rounded-full border border-emerald-800 text-[10px] font-mono tracking-wider text-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> India Stack Integrated
        </div>
      </div>

      {/* Preset Buttons for Easy Demo */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 font-sans">
          ⚡ Demo Sandbox Presets:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => applyPreset("low")}
            className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition duration-150 flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" /> Low Risk (Prime)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("medium")}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition duration-150 flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" /> Medium Risk
          </button>
          <button
            type="button"
            onClick={() => applyPreset("high")}
            className="text-xs font-semibold px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition duration-150 flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" /> High Risk (Subprime)
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {successApp && (
        <div className="m-6 p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">Application Submitted Successfully!</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Enterprise evaluated by <strong>IDBI AI-Stack Engine</strong>.
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-emerald-800">
                <span>Application ID: <strong className="underline">{successApp.applicationId}</strong></span>
                <span>Bureau Score: <strong>{successApp.score} / 900</strong></span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`inline-block text-xs font-bold font-mono uppercase px-2.5 py-1 rounded-full border ${
              successApp.riskLevel === "Low" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
              successApp.riskLevel === "Medium" ? "bg-amber-100 text-amber-800 border-amber-300" :
              "bg-rose-100 text-rose-800 border-rose-300"
            }`}>
              {successApp.riskLevel} Risk
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1: Enterprise Information */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Enterprise Demographics & Authentication
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Udyam Registration Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={msmeId}
                onChange={(e) => setMsmeId(e.target.value)}
                placeholder="e.g., UDYAM-MH-12-0048291"
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150 font-mono"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">MSME Government Registration Identity</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Legal Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Prime Engineering Pvt Ltd"
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">Registered trade or business entity name</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                GSTIN (Tax Registration Number)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                maxLength={15}
                placeholder="e.g., 27AADCT1245G1Z9"
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150 font-mono"
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">15-digit GST identification number</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Industry Sector <span className="text-rose-500">*</span>
              </label>
              <select
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150"
              >
                <option value="Services">Services (Tech, Consultancy, Hospitality)</option>
                <option value="Manufacturing">Manufacturing (Machinery, Textile, Chemical)</option>
                <option value="Retail">Retail & Wholesale Trade (Kirana, E-commerce)</option>
              </select>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Primary business operations category</p>
            </div>
          </div>
        </div>

        {/* Section 2: Public Digital Infrastructure Indicators */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <Smartphone className="w-4 h-4 text-slate-400" />
            India Stack Transaction Trails
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                  GST Compliance Rate (%) <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-bold text-slate-700 font-mono">{gstCompliance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={gstCompliance}
                onChange={(e) => setGstCompliance(Number(e.target.value))}
                className="w-full accent-idbi-green cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>0% Filing</span>
                <span>Pro-rata regularity scorecard</span>
                <span>100% Perfect</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Requested Loan Amount (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="e.g., 2000000"
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150 font-mono"
                min="50000"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Amount requested (typically ₹2.00 Lakhs - ₹100.00 Lakhs)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Average Monthly UPI Inflows (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={upiInflows}
                onChange={(e) => setUpiInflows(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="e.g., 500000"
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150 font-mono"
                min="0"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Verifiable merchant UPI payments aggregated from bank statements
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Average Monthly EPFO Contributions (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={epfoContributions}
                onChange={(e) => setEpfoContributions(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="e.g., 40000"
                className="w-full text-sm py-2.5 px-3 bg-white border border-slate-200 rounded-xl focus:border-idbi-green focus:ring-1 focus:ring-idbi-green outline-none transition duration-150 font-mono"
                min="0"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Employer contributions to Provident Fund (confirms formal employee payroll size)
              </p>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 font-medium max-w-md">
            By submitting, you consent to IDBI retrieving real-time telemetry from GSTN, EPFO, and UPI aggregators.
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-idbi-green hover:bg-idbi-green-dark text-white font-semibold text-sm rounded-xl cursor-pointer select-none border border-idbi-green-dark flex items-center gap-2 transition duration-150 disabled:opacity-50 shrink-0 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-idbi-orange" />
                Analyzing with IDBI AI Underwriter...
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 text-idbi-orange" />
                Submit and Appraise Loan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
