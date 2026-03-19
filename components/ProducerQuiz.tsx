"use client";

import { useState } from "react";

const stateRules: Record<string, {
  revenueThreshold: number | null;
  tonThreshold: number | null;
  brandOwnerOnly: boolean;
  note: string;
  pending?: boolean;
}> = {
  California: {
    revenueThreshold: 1_000_000,
    tonThreshold: null,
    brandOwnerOnly: false,
    note: "CA defines the producer as the brand owner, or if no brand owner is present in the US, the manufacturer or importer. Annual gross revenue must exceed $1M.",
  },
  Oregon: {
    revenueThreshold: null,
    tonThreshold: 1,
    brandOwnerOnly: true,
    note: "OR defines the producer as the brand owner. You must supply 1+ ton of covered packaging to Oregon residents annually to be covered.",
  },
  Maine: {
    revenueThreshold: null,
    tonThreshold: null,
    brandOwnerOnly: true,
    note: "ME defines the producer as the brand owner. There is no de minimis revenue or volume threshold — all brand owners selling into Maine are covered.",
  },
  Colorado: {
    revenueThreshold: 5_000_000,
    tonThreshold: null,
    brandOwnerOnly: true,
    note: "CO defines the producer as the brand owner. Annual gross revenue must exceed $5M to be a covered producer.",
  },
  Minnesota: {
    revenueThreshold: null,
    tonThreshold: 1,
    brandOwnerOnly: true,
    note: "MN defines the producer as the brand owner. You must supply 1+ ton of covered packaging to MN consumers annually to be covered.",
  },
  "New Jersey": {
    revenueThreshold: null,
    tonThreshold: null,
    brandOwnerOnly: false,
    pending: true,
    note: "NJ's EPR rules are still being finalized. Producer definitions and thresholds have not yet been formally adopted.",
  },
};

const QUESTIONS = [
  {
    id: "role",
    question: "What is your role with this product?",
    options: [
      { value: "brand_owner", label: "Brand owner — my company's name or logo is on this product" },
      { value: "manufacturer", label: "Manufacturer — I make this product for another brand" },
      { value: "importer", label: "Importer — I import this product into the US" },
      { value: "distributor", label: "Distributor or wholesaler" },
      { value: "retailer", label: "Retailer — I sell this product but don't make or brand it" },
    ],
  },
  {
    id: "nexus",
    question: "Do you sell or supply this product to customers in this state?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "revenue",
    question: "What is your company's total annual gross revenue?",
    options: [
      { value: "under_1m", label: "Under $1 million" },
      { value: "1m_5m", label: "$1M – $5M" },
      { value: "5m_50m", label: "$5M – $50M" },
      { value: "over_50m", label: "Over $50M" },
    ],
  },
];

type Answers = Record<string, string>;

function getResult(
  state: string,
  answers: Answers,
  tonsInState: number
): { verdict: "covered" | "not_covered" | "below_threshold" | "unclear"; explanation: string } {
  const rules = stateRules[state];
  if (!rules) return { verdict: "unclear", explanation: "No specific producer rules on file for this state." };
  if (rules.pending) return { verdict: "unclear", explanation: rules.note };

  if (answers.nexus === "no") {
    return { verdict: "not_covered", explanation: "You do not sell into this state, so EPR obligations do not apply." };
  }

  const role = answers.role;
  const isBrandOwner = role === "brand_owner";
  const isManufacturerOrImporter = role === "manufacturer" || role === "importer";

  if (!isBrandOwner && rules.brandOwnerOnly) {
    return {
      verdict: "not_covered",
      explanation: `${state} places EPR responsibility on the brand owner. As a ${role.replace(/_/g, " ")}, you are likely not the covered producer.`,
    };
  }

  if (!isBrandOwner && !isManufacturerOrImporter) {
    return {
      verdict: "not_covered",
      explanation: `As a ${role.replace(/_/g, " ")}, EPR obligations for this product likely fall on the brand owner or manufacturer, not you.`,
    };
  }

  if (rules.revenueThreshold) {
    const threshold = rules.revenueThreshold;
    if (answers.revenue === "under_1m") {
      return {
        verdict: "below_threshold",
        explanation: `${state} exempts producers with annual gross revenue under $${(threshold / 1_000_000).toFixed(0)}M. You likely fall below this threshold.`,
      };
    }
    if (threshold >= 5_000_000 && answers.revenue === "1m_5m") {
      return {
        verdict: "below_threshold",
        explanation: `${state} only covers producers with annual revenue above $${(threshold / 1_000_000).toFixed(0)}M. You likely fall below this threshold.`,
      };
    }
  }

  if (rules.tonThreshold) {
    const tonsLabel = tonsInState.toFixed(2);
    if (tonsInState < rules.tonThreshold) {
      return {
        verdict: "below_threshold",
        explanation: `${state} only covers producers supplying ${rules.tonThreshold}+ ton(s) of covered packaging annually. Based on your SKU data, you supply ~${tonsLabel} tons to this state — below the threshold.`,
      };
    }
  }

  return {
    verdict: "covered",
    explanation: rules.note,
  };
}

const verdictStyles = {
  covered: { bg: "bg-red-500/10 border-red-500/30", label: "Likely a Covered Producer", labelColor: "text-red-400", icon: "⚠" },
  not_covered: { bg: "bg-green-500/10 border-green-500/30", label: "Likely Not the Covered Producer", labelColor: "text-green-400", icon: "✓" },
  below_threshold: { bg: "bg-yellow-500/10 border-yellow-500/30", label: "Likely Below Threshold", labelColor: "text-yellow-400", icon: "~" },
  unclear: { bg: "bg-blue-500/10 border-blue-500/30", label: "Unclear — Consult Legal Counsel", labelColor: "text-blue-400", icon: "?" },
};

export default function ProducerQuiz({
  skuName,
  weightGrams,
  annualUnitsPerState,
}: {
  skuName: string;
  weightGrams: number;
  annualUnitsPerState: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);

  function reset() {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  }

  function handleAnswer(value: string) {
    const newAnswers = { ...answers, [QUESTIONS[step].id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  }

  const regulatedStates = Object.keys(stateRules);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm"
      >
        Check My Producer Status →
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Producer Eligibility Check</div>
                <div className="text-white/40 text-xs mt-0.5">{skuName}</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-6">
              {!showResults ? (
                <>
                  {/* Progress */}
                  <div className="flex gap-1.5 mb-6">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-blue-500" : "bg-white/10"}`} />
                    ))}
                  </div>

                  {/* Question */}
                  <div className="text-white font-medium mb-4">{QUESTIONS[step].question}</div>
                  <div className="space-y-2">
                    {QUESTIONS[step].options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className="w-full text-left px-4 py-3 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 text-white/80 text-sm transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="mt-4 text-white/30 hover:text-white text-xs transition-colors">
                      ← Back
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="text-white font-medium mb-4">Results by state</div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {regulatedStates.map((state) => {
                      const stateAbbrs: Record<string, string> = { California: "CA", Oregon: "OR", Maine: "ME", Colorado: "CO", Minnesota: "MN", "New Jersey": "NJ" };
                      const abbr = stateAbbrs[state];
                      const units = annualUnitsPerState[abbr] ?? 0;
                      const tonsInState = (units * weightGrams) / 1_000_000;
                      const result = getResult(state, answers, tonsInState);
                      const style = verdictStyles[result.verdict];
                      return (
                        <div key={state} className={`rounded-xl border p-4 ${style.bg}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-sm">{state}</span>
                            <span className={`text-xs font-semibold ${style.labelColor}`}>{style.icon} {style.label}</span>
                          </div>
                          <p className="text-white/50 text-xs leading-relaxed">{result.explanation}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 text-white/30 text-xs">
                    This tool provides general guidance only and does not constitute legal advice. Consult counsel for compliance decisions.
                  </div>

                  <button onClick={reset} className="mt-4 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                    ← Run again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
