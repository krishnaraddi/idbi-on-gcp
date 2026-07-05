import React from "react";

interface IDBILogoProps {
  variant?: "full" | "emblem" | "text-only";
  className?: string;
  height?: number | string;
}

export default function IDBILogo({ variant = "full", className = "", height = 40 }: IDBILogoProps) {
  // Orange color: #FF6600, IDBI Green: #006B3E
  const orange = "#FF6600";
  const green = "#006B3E";

  const emblemSvg = (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-auto select-none"
      style={{ display: "inline-block" }}
    >
      {/* Outer White Circle */}
      <circle cx="50" cy="50" r="46" fill="#FFFFFF" />
      
      {/* Orange Emblem Shape */}
      {/* Left curved wing */}
      <path
        d="M 50 82 C 34 80 20 66 20 48 C 20 38 25 32 29 28 C 27 34 26 42 28 48 C 30 55 35 60 41 64 C 44 66 47 67 50 68 Z"
        fill={orange}
      />
      {/* Right curved wing */}
      <path
        d="M 50 82 C 66 80 80 66 80 48 C 80 38 75 32 71 28 C 73 34 74 42 72 48 C 70 55 65 60 59 64 C 56 66 53 67 50 68 Z"
        fill={orange}
      />
      
      {/* Central Orange Body */}
      <path
        d="M 40 76 C 40 82 60 82 60 76 C 60 70 58 66 58 52 L 42 52 C 42 66 40 70 40 76 Z"
        fill={orange}
      />
      
      {/* Central White Pillar cutout */}
      <rect x="46" y="44" width="8" height="34" rx="4" fill="#FFFFFF" />
      
      {/* Orange Head Dot */}
      <circle cx="50" cy="35" r="7" fill={orange} />
    </svg>
  );

  if (variant === "emblem") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} style={{ height }}>
        {emblemSvg}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} style={{ height }}>
      {/* Emblem */}
      <div className="h-full py-1 shrink-0">
        {emblemSvg}
      </div>
      {/* IDBI BANK text in solid clean elegant bold font matching the upload */}
      <div className="flex flex-col justify-center select-none">
        <div className="flex items-baseline leading-none">
          <span className="font-sans font-black tracking-tight text-white text-lg sm:text-xl">
            IDBI
          </span>
          <span className="font-sans font-light tracking-wide text-white ml-1.5 text-base sm:text-lg">
            BANK
          </span>
        </div>
        <span className="text-[7.5px] tracking-[0.18em] text-emerald-200/90 font-mono font-bold uppercase mt-0.5">
          A Government of India Owned Bank
        </span>
      </div>
    </div>
  );
}
