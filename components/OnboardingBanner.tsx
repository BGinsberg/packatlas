"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ONBOARDING_KEY, type OnboardingData } from "@/lib/onboardingTypes";

const DISMISSED_KEY = "packatlas_onboarding_banner_dismissed";

export default function OnboardingBanner() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    const isDismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    if (raw) setData(JSON.parse(raw) as OnboardingData);
    if (isDismissed) setDismissed(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const reset = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(DISMISSED_KEY);
    window.location.href = "/onboarding";
  };

  if (!data || dismissed) return null;

  const redCount = data.skus.filter((s) => s.riskLevel === "red").length;
  const roleLabels: Record<string, string> = {
    brand_owner: "Brand Owner",
    manufacturer: "Manufacturer",
    importer: "Importer",
    distributor: "Distributor",
    retailer: "Retailer",
  };

  return (
    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-6 flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Welcome to PackAtlas</div>
        <p className="text-white/70 text-sm">
          You entered <span className="text-white font-medium">{data.skus.length} SKU{data.skus.length !== 1 ? "s" : ""}</span> during setup
          {redCount > 0 && <> — <span className="text-red-400 font-medium">{redCount} flagged for EPR risk</span></>}.
          {" "}Estimated annual obligation:{" "}
          <span className="text-white font-medium">
            ${data.totalEstimatedObligation >= 1000
              ? `${(data.totalEstimatedObligation / 1000).toFixed(0)}K`
              : data.totalEstimatedObligation.toLocaleString()}
          </span>.
          {" "}Role: <span className="text-white/60">{roleLabels[data.producer.role] ?? data.producer.role}</span>.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <Link href="/skus" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View your SKUs →</Link>
          <button onClick={reset} className="text-xs text-white/25 hover:text-white/50 transition-colors">Reset onboarding</button>
        </div>
      </div>
      <button onClick={dismiss} className="text-white/20 hover:text-white/60 transition-colors text-lg shrink-0">×</button>
    </div>
  );
}
