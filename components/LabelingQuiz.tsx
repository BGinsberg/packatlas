"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    id: "recycling_claim",
    question: "Does your packaging display the recycling symbol (♻) or any 'recyclable' claim?",
    options: [
      { value: "yes_symbol", label: "Yes — the chasing arrows ♻ symbol appears on the packaging" },
      { value: "yes_text", label: "Yes — text says 'recyclable' or 'please recycle'" },
      { value: "no", label: "No recycling claims or symbols" },
    ],
  },
  {
    id: "compostable_claim",
    question: "Does your packaging make any 'compostable' or 'biodegradable' claims?",
    options: [
      { value: "certified_compostable", label: "Yes — certified compostable (BPI, TÜV, DIN CERTCO, etc.)" },
      { value: "uncertified_compostable", label: "Yes — says 'compostable' but not certified" },
      { value: "biodegradable", label: "Yes — says 'biodegradable' or 'eco-friendly'" },
      { value: "no", label: "No compostable or biodegradable claims" },
    ],
  },
  {
    id: "material",
    question: "What is the primary material of this packaging?",
    options: [
      { value: "plastic_recyclable", label: "Plastic — type 1 (PET) or type 2 (HDPE), widely recycled" },
      { value: "plastic_limited", label: "Plastic — type 3, 4, 5, 6, or 7, or multi-layer film" },
      { value: "paper", label: "Paper or cardboard (fiber-based)" },
      { value: "glass", label: "Glass" },
      { value: "aluminum", label: "Aluminum or metal" },
      { value: "compostable_certified", label: "Certified compostable material (PHA, BPI-certified PLA, etc.)" },
    ],
  },
  {
    id: "sells_ca",
    question: "Do you sell this product in California?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

type Answers = Record<string, string>;

interface Finding {
  severity: "high" | "medium" | "low";
  rule: string;
  issue: string;
  recommendation: string;
}

function getFindings(answers: Answers): Finding[] {
  const findings: Finding[] = [];

  // FTC Green Guides — biodegradable claims (applies everywhere)
  if (answers.compostable_claim === "biodegradable") {
    findings.push({
      severity: "high",
      rule: "FTC Green Guides (16 CFR § 260)",
      issue: "'Biodegradable' claims are nearly impossible to substantiate under FTC rules. The FTC requires that a product break down completely within one year in typical disposal environments — landfills and incinerators do not qualify. This applies in all 50 states.",
      recommendation: "Remove 'biodegradable' from all packaging. Replace with a specific, substantiated claim (e.g., 'certified compostable in industrial facilities').",
    });
  }

  // FTC Green Guides — unqualified compostable claims
  if (answers.compostable_claim === "uncertified_compostable") {
    findings.push({
      severity: "high",
      rule: "FTC Green Guides (16 CFR § 260.7)",
      issue: "Unsubstantiated 'compostable' claims violate FTC guidelines. Compostable claims must be supported by third-party certification (BPI, TÜV, etc.) and must disclose whether composting infrastructure is available to most consumers.",
      recommendation: "Obtain BPI or TÜV certification, or remove the claim. If certified, add a qualifier such as 'Certified compostable in industrial facilities — check local availability.'",
    });
  }

  // CA SB 343 — recycling symbol on non-recyclable materials
  if (answers.sells_ca === "yes" && (answers.recycling_claim === "yes_symbol" || answers.recycling_claim === "yes_text")) {
    if (answers.material === "plastic_limited") {
      findings.push({
        severity: "high",
        rule: "California SB 343 (2021)",
        issue: "California prohibits the use of the ♻ symbol or 'recyclable' claims on packaging that does not meet CalRecycle's recyclability standards. Multi-layer films, #3, #4, #6, and #7 plastics generally do not qualify. Violations carry penalties of $50K–$1M per day.",
        recommendation: "Remove the recycling symbol and all 'recyclable' language from this SKU's packaging for California distribution, or reformulate to a material that meets CA recyclability thresholds (e.g., PET, HDPE, aluminum, fiber).",
      });
    } else if (answers.material === "paper") {
      findings.push({
        severity: "low",
        rule: "California SB 343 (2021)",
        issue: "Paper and fiber packaging generally qualifies under SB 343, but you must confirm with CalRecycle that your specific product is accepted in curbside programs. Contaminated paper (e.g., greasy food packaging) may not qualify.",
        recommendation: "Verify your specific paper substrate is accepted in California curbside programs at CalRecycle.ca.gov before using the ♻ symbol.",
      });
    }
  }

  // FTC — recycling claims on non-recyclable materials (all states)
  if (answers.material === "plastic_limited" && (answers.recycling_claim === "yes_symbol" || answers.recycling_claim === "yes_text")) {
    findings.push({
      severity: "medium",
      rule: "FTC Green Guides (16 CFR § 260.12)",
      issue: "The FTC requires that 'recyclable' claims only be made on items that can be recycled by a substantial majority of consumers (60%+ threshold). Multi-layer films and #3, #6, #7 plastics typically do not meet this standard.",
      recommendation: "Remove unqualified 'recyclable' claims. If recycling is available in limited areas, use a qualified claim such as 'Recyclable where facilities exist — check locally.'",
    });
  }

  // Certified compostable — infrastructure disclosure
  if (answers.compostable_claim === "certified_compostable") {
    findings.push({
      severity: "low",
      rule: "FTC Green Guides + CA AB 1201",
      issue: "Certified compostable claims are generally permissible, but must include a disclosure about whether the product is suitable for home composting vs. industrial-only composting. California AB 1201 requires specific labeling language for compostable products sold in CA.",
      recommendation: "Ensure your label specifies 'industrial composting only' or 'home compostable' as applicable. In California, use the exact language required under AB 1201.",
    });
  }

  // No issues found
  if (findings.length === 0) {
    findings.push({
      severity: "low",
      rule: "No violations detected",
      issue: "Based on your answers, no obvious labeling compliance issues were identified.",
      recommendation: "Continue to monitor FTC guidance and state-level labeling laws as regulations evolve. Consider a formal legal review if packaging claims change.",
    });
  }

  return findings;
}

const severityStyles = {
  high: { bg: "bg-red-500/10 border-red-500/30", label: "High Risk", labelColor: "text-red-400", icon: "⚠" },
  medium: { bg: "bg-yellow-500/10 border-yellow-500/30", label: "Medium Risk", labelColor: "text-yellow-400", icon: "!" },
  low: { bg: "bg-green-500/10 border-green-500/30", label: "Low Risk", labelColor: "text-green-400", icon: "✓" },
};

export default function LabelingQuiz({
  skuName,
  onComplete,
  onReset,
}: {
  skuName: string;
  onComplete?: (passed: boolean) => void;
  onReset?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);

  function reset() {
    setStep(0);
    setAnswers({});
    setShowResults(false);
    onReset?.();
  }

  function handleAnswer(value: string) {
    const newAnswers = { ...answers, [QUESTIONS[step].id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
      const allFindings = getFindings(newAnswers);
      const passed = !allFindings.some((f) => f.severity === "high" || f.severity === "medium");
      onComplete?.(passed);
    }
  }

  const findings = showResults ? getFindings(answers) : [];
  const highCount = findings.filter((f) => f.severity === "high").length;

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap text-sm"
      >
        Check Labeling Compliance →
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Labeling Compliance Check</div>
                <div className="text-white/40 text-xs mt-0.5">{skuName} · FTC Green Guides + CA SB 343</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-6">
              {!showResults ? (
                <>
                  <div className="flex gap-1.5 mb-6">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-yellow-500" : "bg-white/10"}`} />
                    ))}
                  </div>

                  <div className="text-white font-medium mb-4">{QUESTIONS[step].question}</div>
                  <div className="space-y-2">
                    {QUESTIONS[step].options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className="w-full text-left px-4 py-3 rounded-lg border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/5 text-white/80 text-sm transition-all"
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white font-medium">Labeling findings</div>
                    {highCount > 0 && (
                      <span className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">
                        {highCount} high-risk issue{highCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {findings.map((f, i) => {
                      const style = severityStyles[f.severity];
                      return (
                        <div key={i} className={`rounded-xl border p-4 ${style.bg}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-xs">{f.rule}</span>
                            <span className={`text-xs font-semibold ${style.labelColor}`}>{style.icon} {style.label}</span>
                          </div>
                          <p className="text-white/60 text-xs leading-relaxed mb-2">{f.issue}</p>
                          <p className="text-white/80 text-xs leading-relaxed"><span className="text-white/40">Recommendation: </span>{f.recommendation}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 text-white/30 text-xs">
                    This tool provides general guidance only and does not constitute legal advice.
                  </div>

                  <button onClick={reset} className="mt-4 text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
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
