"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { skus, ComplianceLevel } from "@/lib/data";

const levelLabel: Record<ComplianceLevel, string> = {
  red: "Critical",
  yellow: "At Risk",
  green: "Compliant",
};

const levelStyle: Record<ComplianceLevel, string> = {
  red: "bg-red-500/20 text-red-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  green: "bg-green-500/20 text-green-400",
};

export default function SKUsPage() {
  const [filter, setFilter] = useState<"all" | ComplianceLevel>("all");

  const filtered = filter === "all" ? skus : skus.filter((s) => s.riskLevel === filter);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="skus" />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">SKU Library</h1>
            <p className="text-white/50 text-sm">{skus.length} products · Compliance status across all states</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {(["all", "red", "yellow", "green"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "All SKUs" : levelLabel[f]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Material</th>
                <th className="text-left px-6 py-4">Weight</th>
                <th className="text-left px-6 py-4">States Sold</th>
                <th className="text-left px-6 py-4">EPR Obligation</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sku) => (
                <tr key={sku.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{sku.name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{sku.id}</div>
                  </td>
                  <td className="px-6 py-4 text-white/70">{sku.category}</td>
                  <td className="px-6 py-4 text-white/70">{sku.material}</td>
                  <td className="px-6 py-4 text-white/70">{sku.weightGrams}g</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {sku.states.slice(0, 4).map((s) => (
                        <span key={s} className="bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                      {sku.states.length > 4 && (
                        <span className="text-white/40 text-xs px-1 py-0.5">+{sku.states.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={sku.eprObligation > 0 ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
                      {sku.eprObligation > 0 ? `$${sku.eprObligation.toLocaleString()}` : "$0"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelStyle[sku.riskLevel]}`}>
                      {levelLabel[sku.riskLevel]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/skus/${sku.id}`} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
