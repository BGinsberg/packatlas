"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import { skus, stateData, ComplianceLevel } from "@/lib/data";

const allStateNames = Object.keys(stateData);

const stateAbbrMap: Record<string, string> = {
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

const abbrToState = Object.fromEntries(Object.entries(stateAbbrMap).map(([k, v]) => [v, k]));

const levelStyle: Record<ComplianceLevel, string> = {
  red: "bg-red-500/20 text-red-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  green: "bg-green-500/20 text-green-400",
};

export default function ComparePage() {
  const [selectedSKU, setSelectedSKU] = useState(skus[0]);
  const [annualUnits, setAnnualUnits] = useState(50000);

  const relevantStates = selectedSKU.states
    .map((abbr) => ({ abbr, name: abbrToState[abbr] }))
    .filter((s) => s.name && stateData[s.name]);

  const totalCurrentEPR = relevantStates.reduce((sum, s) => {
    return sum + stateData[s.name].currentMaterial.eprFeePerUnit * annualUnits;
  }, 0);

  const totalAltEPR = relevantStates.reduce((sum, s) => {
    return sum + stateData[s.name].alternativeMaterial.eprFeePerUnit * annualUnits;
  }, 0);

  const currentMatCost = stateData[relevantStates[0]?.name]?.currentMaterial.costPerUnit ?? 0;
  const altMatCost = stateData[relevantStates[0]?.name]?.alternativeMaterial.costPerUnit ?? 0;

  const totalCurrentMaterial = currentMatCost * annualUnits;
  const totalAltMaterial = altMatCost * annualUnits;

  const totalCurrentAll = totalCurrentEPR + totalCurrentMaterial;
  const totalAltAll = totalAltEPR + totalAltMaterial;
  const netSavings = totalCurrentAll - totalAltAll;

  const altName = relevantStates[0]?.name ? stateData[relevantStates[0].name].alternativeMaterial.name : "Alternative";
  const currentName = relevantStates[0]?.name ? stateData[relevantStates[0].name].currentMaterial.name : "Current";

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="other" />

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Material Cost Comparison</h1>
          <p className="text-white/50 text-sm">Compare your current packaging material against recommended alternatives across all states you sell in.</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Select SKU</label>
            <select
              value={selectedSKU.id}
              onChange={(e) => setSelectedSKU(skus.find((s) => s.id === e.target.value) ?? skus[0])}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {skus.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0d1526]">
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Annual Units Sold</label>
            <input
              type="number"
              value={annualUnits}
              onChange={(e) => setAnnualUnits(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
            <div className="text-red-400 text-xs uppercase tracking-wider mb-3">Current Total Annual Cost</div>
            <div className="text-3xl font-bold text-white mb-1">${totalCurrentAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-white/40 text-xs">Material + EPR fees across {relevantStates.length} regulated states</div>
            <div className="mt-3 pt-3 border-t border-red-500/20 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Material cost</span>
                <span className="text-white">${totalCurrentMaterial.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">EPR fees</span>
                <span className="text-red-400">${totalCurrentEPR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
            <div className="text-green-400 text-xs uppercase tracking-wider mb-3">Alternative Total Annual Cost</div>
            <div className="text-3xl font-bold text-white mb-1">${totalAltAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-white/40 text-xs">Material + EPR fees with {altName}</div>
            <div className="mt-3 pt-3 border-t border-green-500/20 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Material cost</span>
                <span className="text-white">${totalAltMaterial.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">EPR fees</span>
                <span className="text-green-400">${totalAltEPR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className={`${netSavings > 0 ? "bg-blue-500/10 border-blue-500/20" : "bg-white/5 border-white/10"} border rounded-xl p-5`}>
            <div className={`${netSavings > 0 ? "text-blue-400" : "text-white/40"} text-xs uppercase tracking-wider mb-3`}>
              {netSavings > 0 ? "Net Annual Savings" : "Net Annual Cost"}
            </div>
            <div className={`text-3xl font-bold mb-1 ${netSavings > 0 ? "text-blue-400" : "text-white"}`}>
              {netSavings > 0 ? "+" : ""} ${Math.abs(netSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-white/40 text-xs">
              {netSavings > 0
                ? `By switching from ${currentName} to ${altName}`
                : `Alternative material costs more but reduces compliance risk`}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-500/20">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Per-unit savings</span>
                <span className={netSavings > 0 ? "text-blue-400 font-medium" : "text-white"}>
                  ${(netSavings / annualUnits).toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* State-by-state table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold">State-by-State Breakdown</h2>
            <p className="text-white/40 text-sm mt-0.5">EPR fee comparison across all regulated states for this SKU</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-6 py-3">State</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Current EPR / unit</th>
                <th className="text-right px-6 py-3">Alt. EPR / unit</th>
                <th className="text-right px-6 py-3">Savings / unit</th>
                <th className="text-right px-6 py-3">Annual Savings</th>
              </tr>
            </thead>
            <tbody>
              {relevantStates.map(({ abbr, name }) => {
                const d = stateData[name];
                const savingsPerUnit = d.currentMaterial.eprFeePerUnit - d.alternativeMaterial.eprFeePerUnit;
                const annualSavingsState = savingsPerUnit * annualUnits;
                return (
                  <tr key={abbr} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-medium text-white">{name}</span>
                      <span className="text-white/40 text-xs ml-2">{abbr}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelStyle[d.level]}`}>
                        {d.level === "red" ? "Critical" : d.level === "yellow" ? "At Risk" : "Compliant"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-red-400 font-medium">
                      ${d.currentMaterial.eprFeePerUnit.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-right text-green-400 font-medium">
                      ${d.alternativeMaterial.eprFeePerUnit.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {savingsPerUnit > 0 ? (
                        <span className="text-blue-400 font-medium">${savingsPerUnit.toFixed(2)}</span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {annualSavingsState > 0 ? (
                        <span className="text-blue-400 font-bold">${annualSavingsState.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Material Detail */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Material Card */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden">
            {relevantStates[0]?.name && stateData[relevantStates[0].name].currentMaterial.imageUrl && (
              <div className="relative h-44 overflow-hidden bg-white/5">
                <img
                  src={stateData[relevantStates[0].name].currentMaterial.imageUrl}
                  alt={currentName}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a0a]/80 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white/70 text-xs uppercase tracking-wider font-medium">Current Material</div>
              </div>
            )}
            <div className="flex items-center gap-4 p-5 border-b border-red-500/10">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {relevantStates[0]?.name ? stateData[relevantStates[0].name].currentMaterial.icon : "🧴"}
              </div>
              <div>
                <div className="text-red-400 text-xs uppercase tracking-wider mb-1">Current Material</div>
                <div className="text-white font-bold text-lg leading-tight">{currentName}</div>
                <div className="text-white/40 text-xs mt-1">{selectedSKU.material}</div>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Material cost / unit</span>
                <span className="text-white">${currentMatCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Avg EPR fee / unit</span>
                <span className="text-red-400">${(totalCurrentEPR / annualUnits / Math.max(relevantStates.length, 1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-red-500/20 pt-2 mt-2">
                <span className="text-white/70 font-medium">Total annual cost</span>
                <span className="text-white font-bold">${totalCurrentAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Alternative Material Card */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl overflow-hidden">
            {relevantStates[0]?.name && stateData[relevantStates[0].name].alternativeMaterial.imageUrl && (
              <div className="relative h-44 overflow-hidden bg-white/5">
                <img
                  src={stateData[relevantStates[0].name].alternativeMaterial.imageUrl}
                  alt={altName}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0a]/80 to-transparent" />
                <div className="absolute bottom-3 left-4 text-green-400 text-xs uppercase tracking-wider font-medium">Recommended Alternative</div>
              </div>
            )}
            <div className="flex items-center gap-4 p-5 border-b border-green-500/10">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {relevantStates[0]?.name ? stateData[relevantStates[0].name].alternativeMaterial.icon : "♻️"}
              </div>
              <div>
                <div className="text-green-400 text-xs uppercase tracking-wider mb-1">Recommended Alternative</div>
                <div className="text-white font-bold text-lg leading-tight">{altName}</div>
                <div className="text-white/40 text-xs mt-1 leading-relaxed">
                  {relevantStates[0]?.name ? stateData[relevantStates[0].name].alternativeMaterial.description : ""}
                </div>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Material cost / unit</span>
                <span className="text-white">${altMatCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Avg EPR fee / unit</span>
                <span className="text-green-400">${(totalAltEPR / annualUnits / Math.max(relevantStates.length, 1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-green-500/20 pt-2 mt-2">
                <span className="text-white/70 font-medium">Total annual cost</span>
                <span className="text-white font-bold">${totalAltAll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Recommendations */}
        {relevantStates[0]?.name && stateData[relevantStates[0].name].alternativeMaterial.suppliers && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-lg">🏭</div>
              <div>
                <h2 className="font-semibold">Recommended Suppliers for {altName}</h2>
                <p className="text-white/40 text-sm mt-0.5">Verified suppliers that can fulfill this material at scale</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0">
              {stateData[relevantStates[0].name].alternativeMaterial.suppliers!.map((supplier, i) => (
                <div
                  key={supplier.name}
                  className={`p-5 flex items-start gap-4 ${
                    i % 2 === 0 ? "border-r border-white/5" : ""
                  } ${i < 2 ? "border-b border-white/5" : ""} hover:bg-white/5 transition-colors`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg flex-shrink-0 font-bold text-white/60">
                    {supplier.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm">{supplier.name}</div>
                    <div className="text-white/40 text-xs mb-1">{supplier.location}</div>
                    <div className="text-white/60 text-xs leading-relaxed">{supplier.note}</div>
                    <div className="mt-2">
                      <a
                        href={`https://${supplier.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs font-mono bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded transition-colors inline-block"
                      >
                        {supplier.website} ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
