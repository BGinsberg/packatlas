"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { stateData, defaultGreenState, StateData, ComplianceLevel } from "@/lib/data";

const stateNameToAbbr: Record<string, string> = {
  Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",
  Connecticut:"CT",Delaware:"DE",Florida:"FL",Georgia:"GA",Hawaii:"HI",Idaho:"ID",
  Illinois:"IL",Indiana:"IN",Iowa:"IA",Kansas:"KS",Kentucky:"KY",Louisiana:"LA",
  Maine:"ME",Maryland:"MD",Massachusetts:"MA",Michigan:"MI",Minnesota:"MN",
  Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV",
  "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY",
  "North Carolina":"NC","North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",
  Pennsylvania:"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
  Tennessee:"TN",Texas:"TX",Utah:"UT",Vermont:"VT",Virginia:"VA",Washington:"WA",
  "West Virginia":"WV",Wisconsin:"WI",Wyoming:"WY",
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const colorMap: Record<ComplianceLevel, { fill: string; hover: string; border: string }> = {
  red: { fill: "#fca5a5", hover: "#f87171", border: "#fecaca" },
  yellow: { fill: "#fde68a", hover: "#fcd34d", border: "#fef08a" },
  green: { fill: "#86efac", hover: "#4ade80", border: "#bbf7d0" },
};

interface TooltipState {
  x: number;
  y: number;
  data: StateData;
}

export default function USMap() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const router = useRouter();

  function getStateData(name: string): StateData {
    if (stateData[name]) return stateData[name];
    return { name, abbr: "", ...defaultGreenState };
  }

  function getColor(name: string) {
    const d = getStateData(name);
    return colorMap[d.level];
  }

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.name as string;
              const colors = getColor(name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(e) => {
                    const data = getStateData(name);
                    setTooltip({ x: e.clientX, y: e.clientY, data });
                  }}
                  onMouseMove={(e) => {
                    setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev);
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => {
                    const abbr = stateNameToAbbr[name];
                    if (abbr) router.push(`/states/${abbr.toLowerCase()}`);
                  }}
                  style={{
                    default: { fill: colors.fill, stroke: "#0a0f1e", strokeWidth: 0.5, outline: "none" },
                    hover: { fill: colors.hover, stroke: "#0a0f1e", strokeWidth: 1, outline: "none", cursor: "pointer" },
                    pressed: { fill: colors.hover, outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 16, top: tooltip.y - 10 }}
        >
          <div className="bg-[#0d1526] border border-white/20 rounded-xl shadow-2xl p-4 w-80 text-sm">
            <div className="text-white/30 text-xs text-center mb-2">Click to see full breakdown →</div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-white text-base">{tooltip.data.name}</div>
                <div
                  className={`text-xs font-semibold uppercase tracking-wider mt-0.5 ${
                    tooltip.data.level === "red"
                      ? "text-red-400"
                      : tooltip.data.level === "yellow"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {tooltip.data.level === "red"
                    ? "Critical — Action Required"
                    : tooltip.data.level === "yellow"
                    ? "Moderate Risk — Monitor"
                    : "Compliant"}
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  tooltip.data.level === "red"
                    ? "bg-red-500"
                    : tooltip.data.level === "yellow"
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
              />
            </div>

            {/* Regulation */}
            <div className="mb-3">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Regulation</div>
              <div className="text-blue-300 text-xs font-medium">{tooltip.data.regulation}</div>
            </div>

            {/* Issue */}
            <div className="mb-3">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Issue</div>
              <div className="text-white/80 text-xs leading-relaxed">{tooltip.data.issue}</div>
            </div>

            {/* Cost Comparison */}
            {tooltip.data.level !== "green" && (
              <div className="border-t border-white/10 pt-3">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Cost Comparison (per unit)</div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Current */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    <div className="text-red-400 text-xs font-semibold mb-1">Current</div>
                    <div className="text-white text-xs font-medium">{tooltip.data.currentMaterial.name}</div>
                    <div className="text-white/60 text-xs mt-1">
                      Material: ${tooltip.data.currentMaterial.costPerUnit.toFixed(2)}
                    </div>
                    <div className="text-red-400 text-xs">
                      EPR Fee: ${tooltip.data.currentMaterial.eprFeePerUnit.toFixed(2)}
                    </div>
                    <div className="text-white font-bold text-xs mt-1 border-t border-white/10 pt-1">
                      Total: ${(tooltip.data.currentMaterial.costPerUnit + tooltip.data.currentMaterial.eprFeePerUnit).toFixed(2)}
                    </div>
                  </div>
                  {/* Alternative */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                    <div className="text-green-400 text-xs font-semibold mb-1">Recommended</div>
                    <div className="text-white text-xs font-medium">{tooltip.data.alternativeMaterial.name}</div>
                    <div className="text-white/60 text-xs mt-1">
                      Material: ${tooltip.data.alternativeMaterial.costPerUnit.toFixed(2)}
                    </div>
                    <div className="text-green-400 text-xs">
                      EPR Fee: ${tooltip.data.alternativeMaterial.eprFeePerUnit.toFixed(2)}
                    </div>
                    <div className="text-white font-bold text-xs mt-1 border-t border-white/10 pt-1">
                      Total: ${(tooltip.data.alternativeMaterial.costPerUnit + tooltip.data.alternativeMaterial.eprFeePerUnit).toFixed(2)}
                    </div>
                  </div>
                </div>
                {/* Savings */}
                {(() => {
                  const currentTotal = tooltip.data.currentMaterial.costPerUnit + tooltip.data.currentMaterial.eprFeePerUnit;
                  const altTotal = tooltip.data.alternativeMaterial.costPerUnit + tooltip.data.alternativeMaterial.eprFeePerUnit;
                  const savings = currentTotal - altTotal;
                  if (savings > 0) {
                    return (
                      <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                        <span className="text-blue-400 text-xs font-bold">
                          Save ${savings.toFixed(2)}/unit by switching materials
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
