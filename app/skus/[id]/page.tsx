import Link from "next/link";
import NavBar from "@/components/NavBar";
import ProducerQuiz from "@/components/ProducerQuiz";
import LabelingQuiz from "@/components/LabelingQuiz";
import { skus, stateData, defaultGreenState, ComplianceLevel } from "@/lib/data";
import { notFound } from "next/navigation";

const allStates = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

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

const levelStyle: Record<ComplianceLevel, { badge: string; row: string }> = {
  red: { badge: "bg-red-500/20 text-red-400", row: "border-red-500/20" },
  yellow: { badge: "bg-yellow-500/20 text-yellow-400", row: "border-yellow-500/20" },
  green: { badge: "bg-green-500/20 text-green-400", row: "border-green-500/20" },
};

const levelLabel: Record<ComplianceLevel, string> = {
  red: "Critical",
  yellow: "At Risk",
  green: "Compliant",
};

export default async function SKUDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sku = skus.find((s) => s.id === id);
  if (!sku) notFound();

  const totalCurrentCost = sku.states.reduce((sum, abbr) => {
    const stateName = allStates.find((s) => stateAbbrMap[s] === abbr);
    const data = stateName && stateData[stateName] ? stateData[stateName] : null;
    return sum + (data ? data.currentMaterial.eprFeePerUnit : 0);
  }, 0);

  const totalAltCost = sku.states.reduce((sum, abbr) => {
    const stateName = allStates.find((s) => stateAbbrMap[s] === abbr);
    const data = stateName && stateData[stateName] ? stateData[stateName] : null;
    return sum + (data ? data.alternativeMaterial.eprFeePerUnit : 0);
  }, 0);

  const annualSavings = (totalCurrentCost - totalAltCost) * 50000; // assume 50k units/year

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="skus" />

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Back */}
        <Link href="/skus" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1 mb-6">
          ← Back to SKUs
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">{sku.id}</div>
            <h1 className="text-3xl font-bold mb-2">{sku.name}</h1>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span>{sku.category}</span>
              <span>·</span>
              <span>{sku.material}</span>
              <span>·</span>
              <span>{sku.weightGrams}g</span>
            </div>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${levelStyle[sku.riskLevel].badge}`}>
            {levelLabel[sku.riskLevel]}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Annual EPR Obligation</div>
            <div className="text-2xl font-bold text-red-400">${sku.eprObligation.toLocaleString()}</div>
            <div className="text-white/40 text-xs mt-1">Across {sku.states.length} states</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Potential Annual Savings</div>
            <div className="text-2xl font-bold text-green-400">${Math.abs(annualSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <div className="text-white/40 text-xs mt-1">By switching materials</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">States Sold In</div>
            <div className="text-2xl font-bold text-white">{sku.states.length}</div>
            <div className="text-white/40 text-xs mt-1">
              {sku.states.filter(abbr => {
                const stateName = allStates.find(s => stateAbbrMap[s] === abbr);
                return stateName && stateData[stateName];
              }).length} with active regulations
            </div>
          </div>
        </div>

        {/* State-by-State Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold text-lg">State-by-State Compliance Breakdown</h2>
            <p className="text-white/40 text-sm mt-0.5">EPR obligations and recommendations for each state you sell in</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-6 py-3">State</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Regulation</th>
                <th className="text-left px-6 py-3">Current EPR Fee</th>
                <th className="text-left px-6 py-3">Alt. Fee</th>
                <th className="text-left px-6 py-3">Savings/Unit</th>
              </tr>
            </thead>
            <tbody>
              {sku.states.map((abbr) => {
                const stateName = allStates.find((s) => stateAbbrMap[s] === abbr);
                const data = stateName && stateData[stateName] ? stateData[stateName] : null;
                const level: ComplianceLevel = data ? data.level : "green";
                const currentFee = data ? data.currentMaterial.eprFeePerUnit : 0;
                const altFee = data ? data.alternativeMaterial.eprFeePerUnit : 0;
                const savings = currentFee - altFee;

                return (
                  <tr key={abbr} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-medium text-white">{stateName || abbr}</span>
                      <span className="text-white/40 text-xs ml-2">{abbr}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelStyle[level].badge}`}>
                        {levelLabel[level]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white/60 text-xs max-w-xs">
                      {data ? data.regulation.split("–")[0].trim() : "No active EPR law"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={currentFee > 0 ? "text-red-400 font-medium" : "text-white/40"}>
                        {currentFee > 0 ? `$${currentFee.toFixed(2)}` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={altFee > 0 ? "text-yellow-400" : "text-green-400 font-medium"}>
                        {altFee > 0 ? `$${altFee.toFixed(2)}` : altFee === 0 && currentFee > 0 ? "$0.00" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {savings > 0 ? (
                        <span className="text-green-400 font-medium">${savings.toFixed(2)}</span>
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

        {/* Producer Eligibility Check */}
        <div className="mb-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Important</div>
              <h3 className="text-white font-bold text-lg mb-1">Do these EPR obligations actually apply to you?</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-xl">
                Each state defines "producer" differently. Depending on your role in the supply chain, your revenue, and your sales volume, you may or may not be the responsible party. Run this quick check to find out.
              </p>
            </div>
            <div className="flex-shrink-0">
              <ProducerQuiz skuName={sku.name} weightGrams={sku.weightGrams} annualUnitsPerState={sku.annualUnitsPerState} />
            </div>
          </div>
        </div>

        {/* Labeling Compliance Check */}
        <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-2">Labeling</div>
              <h3 className="text-white font-bold text-lg mb-1">Is your packaging labeling compliant?</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-xl">
                FTC Green Guides and California SB 343 impose strict rules on recycling symbols, compostable claims, and biodegradable language. Run this check to flag potential violations.
              </p>
            </div>
            <div className="flex-shrink-0">
              <LabelingQuiz skuName={sku.name} />
            </div>
          </div>
        </div>

        {/* Recommendation Box */}
        {sku.riskLevel === "red" && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="text-blue-400 text-xs uppercase tracking-wider mb-2 font-semibold">PackAtlas Recommendation</div>
            <h3 className="text-white font-bold text-lg mb-2">Switch to a lower-EPR material to reduce obligations</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Based on your current packaging material ({sku.material}) and the states you sell in, PackAtlas recommends switching to a recycled-content or fiber-based alternative. This change could reduce your annual EPR obligation by up to <strong className="text-white">${Math.abs(annualSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</strong> while keeping your unit costs competitive.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/reports"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Generate Compliance Report
              </Link>
              <button className="border border-white/20 hover:border-white/40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Compare Materials
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
