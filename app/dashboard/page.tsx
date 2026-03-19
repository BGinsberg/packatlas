import Link from "next/link";
import NavBar from "@/components/NavBar";
import USMap from "@/components/USMap";
import OnboardingBanner from "@/components/OnboardingBanner";
import { skus } from "@/lib/data";

export default function Dashboard() {
  const totalEPR = skus.reduce((sum, s) => sum + s.eprObligation, 0);
  const redSKUs = skus.filter((s) => s.riskLevel === "red").length;
  const yellowSKUs = skus.filter((s) => s.riskLevel === "yellow").length;
  const greenSKUs = skus.filter((s) => s.riskLevel === "green").length;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="dashboard" />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <OnboardingBanner />
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Compliance Dashboard</h1>
          <p className="text-white/50 text-sm">Hover over any state to see regulations, risks, and material recommendations.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Total EPR Obligation</div>
            <div className="text-2xl font-bold text-white">${(totalEPR / 1000).toFixed(0)}K</div>
            <div className="text-white/40 text-xs mt-1">Estimated annual</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="text-red-400 text-xs uppercase tracking-wider mb-2">Critical SKUs</div>
            <div className="text-2xl font-bold text-red-400">{redSKUs}</div>
            <div className="text-white/40 text-xs mt-1">Action required</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="text-yellow-400 text-xs uppercase tracking-wider mb-2">At-Risk SKUs</div>
            <div className="text-2xl font-bold text-yellow-400">{yellowSKUs}</div>
            <div className="text-white/40 text-xs mt-1">Monitor closely</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-green-400 text-xs uppercase tracking-wider mb-2">Compliant SKUs</div>
            <div className="text-2xl font-bold text-green-400">{greenSKUs}</div>
            <div className="text-white/40 text-xs mt-1">No action needed</div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">Compliance Map</h2>
              <p className="text-white/40 text-sm">Hover over any state for details</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-300 inline-block"></span>Verify Labeling</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Compliant</span>
            </div>
          </div>
          <USMap />
        </div>

        {/* Recent SKUs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Top Risk SKUs</h2>
            <Link href="/skus" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left pb-3">SKU</th>
                <th className="text-left pb-3">Material</th>
                <th className="text-left pb-3">States</th>
                <th className="text-left pb-3">EPR Obligation</th>
                <th className="text-left pb-3">Risk</th>
                <th className="text-left pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {skus
                .filter((s) => s.riskLevel === "red")
                .slice(0, 5)
                .map((sku) => (
                  <tr key={sku.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      <div className="font-medium text-white">{sku.name}</div>
                      <div className="text-white/40 text-xs">{sku.id}</div>
                    </td>
                    <td className="py-3 text-white/70">{sku.material}</td>
                    <td className="py-3 text-white/70">{sku.states.join(", ")}</td>
                    <td className="py-3 font-medium text-red-400">${sku.eprObligation.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        Critical
                      </span>
                    </td>
                    <td className="py-3">
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
