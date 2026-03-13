"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import NavBar from "@/components/NavBar";
import { skus } from "@/lib/data";

const PDFDownloadButton = dynamic(() => import("@/components/EPRReportPDF"), { ssr: false, loading: () => (
  <button className="bg-blue-600/50 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1" disabled>
    Loading...
  </button>
) });

const reports = [
  {
    id: "CA-2025",
    state: "California",
    abbr: "CA",
    regulation: "SB 54 – Plastic Pollution Prevention and Packaging Producer Responsibility Act",
    dueDate: "March 31, 2026",
    status: "Ready to File",
    skusAffected: 6,
    totalObligation: 84200,
    filingPeriod: "FY 2025",
  },
  {
    id: "OR-2025",
    state: "Oregon",
    abbr: "OR",
    regulation: "HB 3065 – Plastic Pollution and Producer Responsibility",
    dueDate: "April 15, 2026",
    status: "Ready to File",
    skusAffected: 4,
    totalObligation: 31400,
    filingPeriod: "FY 2025",
  },
  {
    id: "ME-2025",
    state: "Maine",
    abbr: "ME",
    regulation: "LD 1541 – Packaging EPR",
    dueDate: "February 28, 2026",
    status: "Overdue",
    skusAffected: 3,
    totalObligation: 18900,
    filingPeriod: "FY 2025",
  },
  {
    id: "CO-2025",
    state: "Colorado",
    abbr: "CO",
    regulation: "HB 22-1355 – Plastic Pollution Reduction Act",
    dueDate: "May 1, 2026",
    status: "In Progress",
    skusAffected: 4,
    totalObligation: 22600,
    filingPeriod: "FY 2025",
  },
  {
    id: "MN-2025",
    state: "Minnesota",
    abbr: "MN",
    regulation: "SF 3035 – Packaging Waste and Cost Reduction Act",
    dueDate: "June 30, 2026",
    status: "Draft",
    skusAffected: 3,
    totalObligation: 19100,
    filingPeriod: "FY 2025",
  },
  {
    id: "NJ-2025",
    state: "New Jersey",
    abbr: "NJ",
    regulation: "A 1952 – Single-Use Plastic & EPR",
    dueDate: "April 30, 2026",
    status: "Draft",
    skusAffected: 2,
    totalObligation: 11400,
    filingPeriod: "FY 2025",
  },
];

const statusStyle: Record<string, string> = {
  "Ready to File": "bg-green-500/20 text-green-400",
  "In Progress": "bg-blue-500/20 text-blue-400",
  "Overdue": "bg-red-500/20 text-red-400",
  "Draft": "bg-white/10 text-white/50",
};

export default function ReportsPage() {
  const [selected, setSelected] = useState<typeof reports[0] | null>(null);

  const totalObligation = reports.reduce((s, r) => s + r.totalObligation, 0);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="reports" />

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Regulatory Reports</h1>
            <p className="text-white/50 text-sm">Auto-generated EPR filings ready for submission</p>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs uppercase tracking-wider">Total Annual Obligation</div>
            <div className="text-2xl font-bold text-red-400">${totalObligation.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Report List */}
          <div className="space-y-3">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left border rounded-xl p-4 transition-all ${
                  selected?.id === r.id
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{r.state}</span>
                    <span className="text-white/40 text-xs">{r.abbr} · {r.filingPeriod}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-white/50 text-xs mb-2 leading-relaxed">{r.regulation}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Due: <span className="text-white/60">{r.dueDate}</span></span>
                  <span className="text-red-400 font-medium">${r.totalObligation.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Report Preview */}
          <div>
            {selected ? (
              <div className="border border-white/10 rounded-2xl overflow-hidden sticky top-8">
                {/* Report Header */}
                <div className="bg-white/5 border-b border-white/10 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-1">EPR Filing</div>
                      <div className="font-bold text-white text-lg">{selected.state} — {selected.filingPeriod}</div>
                    </div>
                    <PDFDownloadButton report={selected} />
                  </div>
                </div>

                <div className="p-6 text-sm space-y-5">
                  {/* Producer Info */}
                  <div>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Producer Information</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ["Company Name", "PackAtlas Demo Co."],
                        ["EIN", "XX-XXXXXXX"],
                        ["Filing Period", selected.filingPeriod],
                        ["Program", selected.abbr + " EPR Program"],
                        ["Submission Date", "Auto-generated"],
                        ["Contact", "compliance@company.com"],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-white/5 rounded-lg px-3 py-2">
                          <div className="text-white/40 mb-0.5">{label}</div>
                          <div className="text-white font-medium">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Covered SKUs */}
                  <div>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Covered Packaging ({selected.skusAffected} SKUs)</div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-white/30 border-b border-white/10">
                          <th className="text-left pb-2">SKU</th>
                          <th className="text-left pb-2">Material</th>
                          <th className="text-right pb-2">Weight (g)</th>
                          <th className="text-right pb-2">Units</th>
                          <th className="text-right pb-2">Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skus.filter(s => s.riskLevel === "red").slice(0, selected.skusAffected).map((sku) => (
                          <tr key={sku.id} className="border-b border-white/5">
                            <td className="py-1.5 text-white/70">{sku.id}</td>
                            <td className="py-1.5 text-white/70">{sku.material.split(" ").slice(0,2).join(" ")}</td>
                            <td className="py-1.5 text-right text-white/70">{sku.weightGrams}</td>
                            <td className="py-1.5 text-right text-white/70">50,000</td>
                            <td className="py-1.5 text-right text-red-400">${(sku.eprObligation / 6).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-white/40 text-xs uppercase tracking-wider">Total EPR Obligation</div>
                      <div className="text-white/50 text-xs mt-0.5">Due {selected.dueDate}</div>
                    </div>
                    <div className="text-red-400 font-bold text-2xl">${selected.totalObligation.toLocaleString()}</div>
                  </div>

                  {/* Certification */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-xs text-white/50 leading-relaxed">
                    <strong className="text-white/70">Certification:</strong> I certify that the information contained in this report is accurate and complete to the best of my knowledge. This filing was automatically generated by PackAtlas based on SKU-level packaging data.
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-white/10 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <div className="text-white font-medium mb-2">Select a report to preview</div>
                <div className="text-white/40 text-sm">Click any filing on the left to see a preview</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
