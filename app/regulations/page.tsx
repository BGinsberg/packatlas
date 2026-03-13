"use client";

import React, { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";

type LawStatus = "Active EPR" | "Plastic Ban" | "Pending" | "Study/Proposed" | "No Law";

interface StateRegulation {
  abbr: string;
  state: string;
  status: LawStatus;
  laws: string[];
  effectiveDate: string;
  keyRequirements: string;
  penaltyRange: string;
  nextDeadline: string;
}

const regulations: StateRegulation[] = [
  { abbr: "CA", state: "California", status: "Active EPR", laws: ["SB 54 (2022)", "AB 1080"], effectiveDate: "Jan 2024", keyRequirements: "65% recyclability by 2032; producers pay EPR fees by weight and material type; plastic reduction targets", penaltyRange: "$50K–$1M/day", nextDeadline: "Mar 31, 2026" },
  { abbr: "CO", state: "Colorado", status: "Active EPR", laws: ["HB 22-1355"], effectiveDate: "Jul 2024", keyRequirements: "Producer registration required; fees on all covered packaging; PRO membership mandatory", penaltyRange: "$10K–$100K", nextDeadline: "May 1, 2026" },
  { abbr: "ME", state: "Maine", status: "Active EPR", laws: ["LD 1541 (2021)"], effectiveDate: "Jul 2024", keyRequirements: "Nation's first EPR law; stewardship fees fund recycling; annual tonnage reporting", penaltyRange: "$10K/day", nextDeadline: "Feb 28, 2026" },
  { abbr: "OR", state: "Oregon", status: "Active EPR", laws: ["HB 3065 (2021)"], effectiveDate: "Jan 2025", keyRequirements: "Fees by resin type; #3, #6, #7 plastics face highest tiers; annual producer reports required", penaltyRange: "$25K/day", nextDeadline: "Apr 15, 2026" },
  { abbr: "MN", state: "Minnesota", status: "Active EPR", laws: ["SF 3035 (2023)"], effectiveDate: "Jan 2025", keyRequirements: "PRO membership required; fees based on material category; multi-layer film highest tier", penaltyRange: "$10K–$50K", nextDeadline: "Jun 30, 2026" },
  { abbr: "NJ", state: "New Jersey", status: "Active EPR", laws: ["A 1952 (2020)", "S 864"], effectiveDate: "May 2022", keyRequirements: "Single-use plastic bags and foam containers banned; EPR fees on all remaining plastic packaging", penaltyRange: "$1K–$5K/day", nextDeadline: "Apr 30, 2026" },
  { abbr: "MD", state: "Maryland", status: "Plastic Ban", laws: ["HB 109 (2020)", "SB 234"], effectiveDate: "Oct 2020", keyRequirements: "Polystyrene foam containers banned statewide; EPR legislation advancing; registration requirements pending", penaltyRange: "$250–$1K/day", nextDeadline: "Ongoing" },
  { abbr: "HI", state: "Hawaii", status: "Plastic Ban", laws: ["County ordinances", "HB 1571"], effectiveDate: "Jan 2011", keyRequirements: "Broadest statewide plastic bag ban in US; foam containers banned in many counties; statewide EPR study underway", penaltyRange: "$100–$1K/violation", nextDeadline: "Ongoing" },
  { abbr: "VT", state: "Vermont", status: "Plastic Ban", laws: ["Act 64 (2019)"], effectiveDate: "Jul 2020", keyRequirements: "Single-use plastic bags, straws, and many utensils banned; EPR study ongoing; legislation expected 2027", penaltyRange: "$100–$500/day", nextDeadline: "Ongoing" },
  { abbr: "WA", state: "Washington", status: "Pending", laws: ["HB 1131 (2024)"], effectiveDate: "2026 (fees)", keyRequirements: "Producer registration by end of 2025; EPR fees launch 2026; recyclability thresholds being finalized", penaltyRange: "TBD", nextDeadline: "Dec 31, 2025 (registration)" },
  { abbr: "NY", state: "New York", status: "Pending", laws: ["Packaging Reduction Act (2024)"], effectiveDate: "2027 (est.)", keyRequirements: "Plastic bag ban active; EPR fees on all packaging expected 2027; producer registration likely 2026", penaltyRange: "TBD", nextDeadline: "2026 (est. registration)" },
  { abbr: "IL", state: "Illinois", status: "Pending", laws: ["SB 1555", "Recycling Improvement Act"], effectiveDate: "TBD", keyRequirements: "Recycling mandate active; EPR bill advancing; moderate risk for plastic packaging producers", penaltyRange: "TBD", nextDeadline: "Monitor 2025–2026" },
  { abbr: "MA", state: "Massachusetts", status: "Pending", laws: ["Plastics Reduction Act (2023)"], effectiveDate: "TBD", keyRequirements: "PVC and polystyrene targeted for bans; EPR fees on remaining plastic packaging expected", penaltyRange: "TBD", nextDeadline: "Monitor 2026" },
  { abbr: "CT", state: "Connecticut", status: "Pending", laws: ["SB 1037 (2024)"], effectiveDate: "2026–2027 (est.)", keyRequirements: "EPR bill passed committee 2024; non-recyclable plastics face highest fee tiers; fiber alternatives preferred", penaltyRange: "TBD", nextDeadline: "2026 (est.)" },
  { abbr: "MI", state: "Michigan", status: "Study/Proposed", laws: ["HB 5535 (2023 study)"], effectiveDate: "TBD", keyRequirements: "EPR feasibility study underway; legislation not yet introduced; low-moderate risk", penaltyRange: "N/A", nextDeadline: "Monitor 2026" },
  { abbr: "PA", state: "Pennsylvania", status: "Study/Proposed", laws: ["HB 2440 (proposed)"], effectiveDate: "TBD", keyRequirements: "EPR bill introduced; unlikely to pass in current session; monitor for 2027+", penaltyRange: "N/A", nextDeadline: "Monitor 2027" },
  { abbr: "NC", state: "North Carolina", status: "Study/Proposed", laws: ["Study bill (2024)"], effectiveDate: "TBD", keyRequirements: "Legislature commissioned packaging waste study; no active bills yet", penaltyRange: "N/A", nextDeadline: "Monitor 2026" },
  { abbr: "VA", state: "Virginia", status: "Study/Proposed", laws: ["HB 1900 (2023)"], effectiveDate: "TBD", keyRequirements: "Plastic bag tax in localities; statewide EPR study bill introduced in 2023; no active program", penaltyRange: "N/A", nextDeadline: "Monitor 2026" },
  { abbr: "AZ", state: "Arizona", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or plastic ban. State preempts local plastic bag ordinances.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "TX", state: "Texas", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban. State preempts local ordinances on plastic bags.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "FL", state: "Florida", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law. State preempts local bag ordinances. Low regulatory risk.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "GA", state: "Georgia", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "OH", state: "Ohio", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "IN", state: "Indiana", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "TN", state: "Tennessee", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "MO", state: "Missouri", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "WI", state: "Wisconsin", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "KY", state: "Kentucky", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "SC", state: "South Carolina", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "AL", state: "Alabama", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "LA", state: "Louisiana", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "MS", state: "Mississippi", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "AR", state: "Arkansas", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "OK", state: "Oklahoma", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "KS", state: "Kansas", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "NE", state: "Nebraska", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "SD", state: "South Dakota", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "ND", state: "North Dakota", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "MT", state: "Montana", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "WY", state: "Wyoming", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "ID", state: "Idaho", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "UT", state: "Utah", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "NV", state: "Nevada", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "NM", state: "New Mexico", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "AK", state: "Alaska", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "DE", state: "Delaware", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law. Plastic bag ban in Wilmington only.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "NH", state: "New Hampshire", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "RI", state: "Rhode Island", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No statewide EPR law; Providence has a plastic bag ordinance.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "WV", state: "West Virginia", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
  { abbr: "IA", state: "Iowa", status: "No Law", laws: ["None"], effectiveDate: "N/A", keyRequirements: "No active EPR law or packaging ban.", penaltyRange: "N/A", nextDeadline: "N/A" },
];

const statusConfig: Record<LawStatus, { color: string; bg: string; dot: string }> = {
  "Active EPR":     { color: "text-red-400",    bg: "bg-red-500/20",    dot: "bg-red-500" },
  "Plastic Ban":    { color: "text-orange-400",  bg: "bg-orange-500/20", dot: "bg-orange-500" },
  "Pending":        { color: "text-yellow-400",  bg: "bg-yellow-500/20", dot: "bg-yellow-400" },
  "Study/Proposed": { color: "text-blue-400",    bg: "bg-blue-500/20",   dot: "bg-blue-400" },
  "No Law":         { color: "text-green-400",   bg: "bg-green-500/20",  dot: "bg-green-500" },
};

const allStatuses: LawStatus[] = ["Active EPR", "Plastic Ban", "Pending", "Study/Proposed", "No Law"];

export default function RegulationsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LawStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = regulations.filter((r) => {
    const matchSearch =
      r.state.toLowerCase().includes(search.toLowerCase()) ||
      r.laws.join(" ").toLowerCase().includes(search.toLowerCase()) ||
      r.keyRequirements.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    "Active EPR": regulations.filter((r) => r.status === "Active EPR").length,
    "Plastic Ban": regulations.filter((r) => r.status === "Plastic Ban").length,
    "Pending": regulations.filter((r) => r.status === "Pending").length,
    "Study/Proposed": regulations.filter((r) => r.status === "Study/Proposed").length,
    "No Law": regulations.filter((r) => r.status === "No Law").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="regulations" />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Regulation Database</h1>
          <p className="text-white/50 text-sm">Packaging EPR laws, plastic bans, and pending legislation across all 50 states — updated continuously.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {allStatuses.map((status) => {
            const cfg = statusConfig[status];
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? "all" : status)}
                className={`rounded-xl p-4 text-left border transition-all ${
                  filterStatus === status
                    ? `${cfg.bg} border-current ${cfg.color}`
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-medium ${filterStatus === status ? cfg.color : "text-white/60"}`}>{status}</span>
                </div>
                <div className={`text-2xl font-bold ${filterStatus === status ? cfg.color : "text-white"}`}>{counts[status]}</div>
                <div className="text-white/40 text-xs">states</div>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search states, laws, requirements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-6 py-4">State</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Legislation</th>
                <th className="text-left px-6 py-4">Effective</th>
                <th className="text-left px-6 py-4">Next Deadline</th>
                <th className="text-left px-6 py-4">Penalties</th>
                <th className="text-left px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => {
                const cfg = statusConfig[reg.status];
                const isExpanded = expanded === reg.abbr;
                return (
                  <React.Fragment key={reg.abbr}>
                    <tr
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : reg.abbr)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{reg.state}</div>
                        <div className="text-white/40 text-xs">{reg.abbr}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/70 text-xs">{reg.laws.join(", ")}</td>
                      <td className="px-6 py-4 text-white/70 text-xs">{reg.effectiveDate}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${reg.nextDeadline === "N/A" ? "text-white/30" : reg.nextDeadline.includes("2025") ? "text-red-400" : "text-yellow-400"}`}>
                          {reg.nextDeadline}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-xs">{reg.penaltyRange}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/states/${reg.abbr.toLowerCase()}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                          >
                            SKU view →
                          </Link>
                          <span className="text-white/30 text-xs">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-white/10">
                        <td colSpan={7} className="px-6 py-4 bg-white/3">
                          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Key Requirements</div>
                          <p className="text-white/70 text-sm leading-relaxed">{reg.keyRequirements}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/40">No states match your search.</div>
          )}
        </div>

        <div className="mt-4 text-white/30 text-xs text-right">
          Showing {filtered.length} of {regulations.length} states · Database updated March 2026
        </div>
      </div>
    </div>
  );
}
