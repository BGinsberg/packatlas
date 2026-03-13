import Link from "next/link";
import NavBar from "@/components/NavBar";
import { skus, stateData, defaultGreenState, ComplianceLevel, SKU } from "@/lib/data";
import { notFound } from "next/navigation";

const stateAbbrToName: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
  MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",
  NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",
  NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",
  PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",
  TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",
  WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

const levelStyle: Record<ComplianceLevel, { badge: string; bg: string; border: string; text: string }> = {
  red:    { badge: "bg-red-500/20 text-red-400",    bg: "bg-red-500/5",    border: "border-red-500/20",    text: "text-red-400" },
  yellow: { badge: "bg-yellow-500/20 text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20", text: "text-yellow-400" },
  green:  { badge: "bg-green-500/20 text-green-400",  bg: "bg-green-500/5",  border: "border-green-500/20",  text: "text-green-400" },
};

const levelLabel: Record<ComplianceLevel, string> = {
  red: "Critical — Action Required",
  yellow: "Moderate Risk — Monitor",
  green: "Compliant",
};

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state: stateAbbr } = await params;
  const abbr = stateAbbr.toUpperCase();
  const stateName = stateAbbrToName[abbr];
  if (!stateName) notFound();

  const data = stateData[stateName] ?? { name: stateName, abbr, ...defaultGreenState };
  const level = data.level;
  const styles = levelStyle[level];

  // SKUs sold in this state
  const stateSKUs = skus.filter((s) => s.states.includes(abbr));
  const totalEPR = stateSKUs.reduce((sum, s) => sum + (s.riskLevel !== "green" ? s.eprObligation / s.states.length : 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="dashboard" />

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Back */}
        <Link href="/dashboard" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1 mb-6">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className={`${styles.bg} ${styles.border} border rounded-2xl p-6 mb-8`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{stateName}</h1>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${styles.badge}`}>
                  {levelLabel[level]}
                </span>
              </div>
              <div className={`text-sm font-medium ${styles.text} mb-2`}>{data.regulation}</div>
              <p className="text-white/60 text-sm leading-relaxed max-w-3xl">{data.issue}</p>
            </div>
            <div className="text-right ml-8 flex-shrink-0">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Est. Annual EPR Exposure</div>
              <div className={`text-3xl font-bold ${level === "green" ? "text-green-400" : "text-red-400"}`}>
                ${Math.round(totalEPR).toLocaleString()}
              </div>
              <div className="text-white/40 text-xs mt-1">{stateSKUs.length} SKUs sold here</div>
            </div>
          </div>
        </div>

        {stateSKUs.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📦</div>
            <div className="text-white font-medium mb-2">No SKUs sold in {stateName}</div>
            <div className="text-white/40 text-sm">Upload your SKU data to see compliance status here.</div>
          </div>
        ) : (
          <div className="space-y-6">
            {stateSKUs.map((sku) => {
              const skuLevel = sku.riskLevel;
              const skuStyles = levelStyle[skuLevel];
              const currentFee = data.currentMaterial.eprFeePerUnit;
              const altFee = data.alternativeMaterial.eprFeePerUnit;
              const savings = (currentFee - altFee) * 50000;

              return (
                <div key={sku.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {/* SKU Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-lg">{sku.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${skuStyles.badge}`}>
                            {skuLevel === "red" ? "Critical" : skuLevel === "yellow" ? "At Risk" : "Compliant"}
                          </span>
                        </div>
                        <div className="text-white/40 text-sm mt-0.5">{sku.id} · {sku.category} · {sku.weightGrams}g</div>
                      </div>
                    </div>
                    <Link
                      href={`/skus/${sku.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      Full SKU detail →
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-white/10">
                    {/* Current Packaging */}
                    <div className="p-5">
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Current Packaging</div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{data.currentMaterial.icon}</span>
                        <div>
                          <div className="text-white font-semibold text-sm">{sku.material}</div>
                          <div className="text-white/40 text-xs">{data.currentMaterial.name}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/50">Material cost/unit</span>
                          <span className="text-white">${data.currentMaterial.costPerUnit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">EPR fee/unit in {abbr}</span>
                          <span className={currentFee > 0 ? "text-red-400 font-medium" : "text-green-400"}>${currentFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1.5">
                          <span className="text-white/70 font-medium">Total/unit</span>
                          <span className="text-white font-bold">${(data.currentMaterial.costPerUnit + currentFee).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Status */}
                    <div className="p-5">
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Compliance Status in {abbr}</div>
                      <div className={`${skuStyles.bg} ${skuStyles.border} border rounded-xl p-3 mb-3`}>
                        <div className={`text-xs font-bold ${skuStyles.text} mb-1`}>
                          {skuLevel === "red" ? "⚠️ Non-Compliant" : skuLevel === "yellow" ? "⚡ At Risk" : "✅ Compliant"}
                        </div>
                        <div className="text-white/60 text-xs leading-relaxed">
                          {skuLevel === "red"
                            ? `${sku.material} triggers EPR fees under ${data.regulation.split("–")[0].trim()}.`
                            : skuLevel === "yellow"
                            ? `Moderate risk — pending legislation may apply fees to this material.`
                            : `This material is currently compliant in ${stateName}.`}
                        </div>
                      </div>
                      {sku.eprObligation > 0 && (
                        <div className="text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/50">Annual EPR (this state)</span>
                            <span className="text-red-400 font-bold">${Math.round(sku.eprObligation / sku.states.length).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommended Alternative */}
                    <div className="p-5">
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Recommended Switch</div>
                      {skuLevel !== "green" ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{data.alternativeMaterial.icon}</span>
                            <div>
                              <div className="text-white font-semibold text-sm">{data.alternativeMaterial.name}</div>
                              <div className="text-white/40 text-xs">{data.alternativeMaterial.description.slice(0, 50)}…</div>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/50">Material cost/unit</span>
                              <span className="text-white">${data.alternativeMaterial.costPerUnit.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/50">EPR fee/unit in {abbr}</span>
                              <span className="text-green-400 font-medium">${altFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1.5">
                              <span className="text-white/70 font-medium">Total/unit</span>
                              <span className="text-white font-bold">${(data.alternativeMaterial.costPerUnit + altFee).toFixed(2)}</span>
                            </div>
                          </div>
                          {savings > 0 && (
                            <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-center">
                              <span className="text-blue-400 text-xs font-bold">Save ~${Math.round(savings).toLocaleString()}/yr by switching</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-white/40 text-sm">No switch needed — fully compliant.</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Suppliers */}
        {level !== "green" && data.alternativeMaterial.suppliers && (
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold">Recommended Suppliers for {data.alternativeMaterial.name}</h2>
              <p className="text-white/40 text-sm mt-0.5">Verified suppliers that can fulfill this material for your {stateName} operations</p>
            </div>
            <div className="grid grid-cols-2 gap-0">
              {data.alternativeMaterial.suppliers.map((supplier, i) => (
                <div key={supplier.name} className={`p-5 flex items-start gap-4 ${i % 2 === 0 ? "border-r border-white/5" : ""} ${i < 2 ? "border-b border-white/5" : ""} hover:bg-white/5 transition-colors`}>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg flex-shrink-0 font-bold text-white/60">
                    {supplier.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{supplier.name}</div>
                    <div className="text-white/40 text-xs mb-1">{supplier.location}</div>
                    <div className="text-white/60 text-xs leading-relaxed">{supplier.note}</div>
                    <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer"
                      className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-mono bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded transition-colors inline-block">
                      {supplier.website} ↗
                    </a>
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
