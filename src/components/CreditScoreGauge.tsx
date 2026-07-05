import React from "react";

interface CreditScoreGaugeProps {
  score: number;
  riskLevel: "Low" | "Medium" | "High";
}

export default function CreditScoreGauge({ score, riskLevel }: CreditScoreGaugeProps) {
  // Normalize score between 300 and 900 to 0 and 180 degrees
  const minScore = 300;
  const maxScore = 900;
  const clampedScore = Math.max(minScore, Math.min(maxScore, score));
  const percentage = (clampedScore - minScore) / (maxScore - minScore);
  const angle = percentage * 180 - 90; // Rotate from -90 to 90 degrees

  // Color selection
  const getColor = () => {
    if (riskLevel === "Low") return "stroke-emerald-500 text-emerald-500";
    if (riskLevel === "Medium") return "stroke-amber-500 text-amber-500";
    return "stroke-rose-500 text-rose-500";
  };

  const getBgColor = () => {
    if (riskLevel === "Low") return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (riskLevel === "Medium") return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-rose-50 text-rose-800 border-rose-200";
  };

  return (
    <div id="credit-score-gauge-container" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
      <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4">
        Bureau Risk Evaluation Score
      </h4>
      <div className="relative w-48 h-28 flex items-center justify-center overflow-hidden">
        {/* Arc Track */}
        <svg className="w-48 h-48 absolute top-0" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
              <stop offset="50%" stopColor="#f59e0b" /> {/* Orange */}
              <stop offset="100%" stopColor="#10b981" /> {/* Green */}
            </linearGradient>
          </defs>
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 15 50 A 35 35 0 0 1 85 50"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="110"
            strokeDashoffset={110 - percentage * 110}
          />
        </svg>

        {/* Gauge Center Content */}
        <div className="absolute bottom-1 text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${getColor().split(" ")[1]}`}>
            {score}
          </span>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Scale: 300 - 900</p>
        </div>

        {/* Needle Indicator */}
        <div
          className="absolute bottom-0 w-1.5 h-16 origin-bottom rounded-full bg-slate-800 transition-transform duration-1000 ease-out"
          style={{
            transform: `rotate(${angle}deg)`,
            bottom: "0px",
          }}
        />
        <div className="absolute bottom-0 w-3 h-3 bg-slate-800 rounded-full border border-white" />
      </div>

      <div className="flex items-center gap-4 mt-4 w-full">
        <div className={`flex-1 text-center py-2 px-3 rounded-xl border text-sm font-semibold ${getBgColor()}`}>
          Risk Class: {riskLevel}
        </div>
      </div>
    </div>
  );
}
