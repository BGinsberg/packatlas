import type { MaterialKey, OnboardingSKU, EPRRiskLevel } from "./onboardingTypes";

// States with active EPR fees for plastic packaging
export const EPR_RED_STATES: Record<string, number> = {
  CA: 0.15,
  CO: 0.12,
  ME: 0.09,
  OR: 0.09,
  MN: 0.08,
  NJ: 0.08,
};

// States with pending/watch legislation
export const EPR_YELLOW_STATES = ["WA", "NY", "IL", "MA", "CT", "MD", "VT", "HI"];

// Special bans that trigger regardless of state fee schedule
const MATERIAL_BANS: Partial<Record<MaterialKey, string[]>> = {
  "Polystyrene Foam (EPS)": ["OR", "ME", "MN", "MD", "CA"],
  "LDPE Plastic Bag": ["CA", "NJ", "HI", "NY"],
};

type MaterialRisk = "high" | "medium" | "low";

const MATERIAL_RISK: Record<MaterialKey, MaterialRisk> = {
  "Virgin HDPE Plastic": "high",
  "Virgin PET Plastic": "high",
  "PP Plastic": "high",
  "Polystyrene Foam (EPS)": "high",
  "Multi-layer Plastic Film": "high",
  "LDPE Plastic Bag": "high",
  "rPET (Recycled Plastic)": "medium",
  "rHDPE (Recycled Plastic)": "medium",
  "Other Plastic": "medium",
  "Kraft Paper / Paperboard": "low",
  "Aluminum": "low",
  "Glass": "low",
  "PLA Compostable": "low",
  "PHA Compostable": "low",
};

const FEE_MULTIPLIER: Record<MaterialRisk, number> = {
  high: 1.0,
  medium: 0.4,
  low: 0.0,
};

export const ALL_STATES = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" },
  { abbr: "AZ", name: "Arizona" }, { abbr: "AR", name: "Arkansas" },
  { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" },
  { abbr: "FL", name: "Florida" }, { abbr: "GA", name: "Georgia" },
  { abbr: "HI", name: "Hawaii" }, { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" },
  { abbr: "IA", name: "Iowa" }, { abbr: "KS", name: "Kansas" },
  { abbr: "KY", name: "Kentucky" }, { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" },
  { abbr: "MA", name: "Massachusetts" }, { abbr: "MI", name: "Michigan" },
  { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" },
  { abbr: "NE", name: "Nebraska" }, { abbr: "NV", name: "Nevada" },
  { abbr: "NH", name: "New Hampshire" }, { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" },
  { abbr: "NC", name: "North Carolina" }, { abbr: "ND", name: "North Dakota" },
  { abbr: "OH", name: "Ohio" }, { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" },
  { abbr: "RI", name: "Rhode Island" }, { abbr: "SC", name: "South Carolina" },
  { abbr: "SD", name: "South Dakota" }, { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" },
  { abbr: "VT", name: "Vermont" }, { abbr: "VA", name: "Virginia" },
  { abbr: "WA", name: "Washington" }, { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" },
];

export function flagSKU(
  id: string,
  name: string,
  category: OnboardingSKU["category"],
  material: MaterialKey,
  annualUnits: number,
  states: string[]
): OnboardingSKU {
  const risk = MATERIAL_RISK[material] ?? "medium";
  const feeMultiplier = FEE_MULTIPLIER[risk];
  const perStateUnits = Math.ceil(annualUnits / Math.max(states.length, 1));

  const flaggedStates: OnboardingSKU["flaggedStates"] = [];
  const flagReasons: string[] = [];
  let estimatedObligation = 0;

  for (const abbr of states) {
    const bans = MATERIAL_BANS[material];
    if (bans && bans.includes(abbr)) {
      const stateName = ALL_STATES.find((s) => s.abbr === abbr)?.name ?? abbr;
      flaggedStates.push({ abbr, name: stateName, level: "red" });
      flagReasons.push(`${material} is banned or heavily restricted in ${stateName}`);
      estimatedObligation += perStateUnits * (EPR_RED_STATES[abbr] ?? 0.10) * feeMultiplier;
    } else if (EPR_RED_STATES[abbr] !== undefined && risk !== "low") {
      const stateName = ALL_STATES.find((s) => s.abbr === abbr)?.name ?? abbr;
      flaggedStates.push({ abbr, name: stateName, level: "red" });
      const fee = EPR_RED_STATES[abbr] * feeMultiplier;
      estimatedObligation += perStateUnits * fee;
      if (!flagReasons.some((r) => r.includes("EPR fee"))) {
        flagReasons.push(`Active EPR fee applies in ${flaggedStates.filter((s) => s.level === "red").length > 1 ? "multiple states" : stateName}`);
      }
    } else if (EPR_YELLOW_STATES.includes(abbr) && risk !== "low") {
      const stateName = ALL_STATES.find((s) => s.abbr === abbr)?.name ?? abbr;
      flaggedStates.push({ abbr, name: stateName, level: "yellow" });
      if (!flagReasons.some((r) => r.includes("pending"))) {
        flagReasons.push(`Pending EPR legislation in ${stateName} and other states`);
      }
    }
  }

  let riskLevel: EPRRiskLevel = "green";
  if (flaggedStates.some((s) => s.level === "red")) riskLevel = "red";
  else if (flaggedStates.some((s) => s.level === "yellow")) riskLevel = "yellow";

  return {
    id,
    name,
    category,
    material,
    annualUnits,
    states,
    riskLevel,
    flaggedStates,
    estimatedObligation: Math.round(estimatedObligation),
    flagReasons,
  };
}

export const MATERIAL_OPTIONS: { value: MaterialKey; label: string; risk: MaterialRisk }[] = [
  { value: "Virgin HDPE Plastic", label: "Virgin HDPE Plastic", risk: "high" },
  { value: "Virgin PET Plastic", label: "Virgin PET Plastic", risk: "high" },
  { value: "PP Plastic", label: "PP Plastic", risk: "high" },
  { value: "Polystyrene Foam (EPS)", label: "Polystyrene Foam (EPS)", risk: "high" },
  { value: "Multi-layer Plastic Film", label: "Multi-layer Plastic Film", risk: "high" },
  { value: "LDPE Plastic Bag", label: "LDPE Plastic Bag", risk: "high" },
  { value: "rPET (Recycled Plastic)", label: "rPET (Recycled Plastic)", risk: "medium" },
  { value: "rHDPE (Recycled Plastic)", label: "rHDPE (Recycled Plastic)", risk: "medium" },
  { value: "Other Plastic", label: "Other Plastic", risk: "medium" },
  { value: "Kraft Paper / Paperboard", label: "Kraft Paper / Paperboard", risk: "low" },
  { value: "Aluminum", label: "Aluminum", risk: "low" },
  { value: "Glass", label: "Glass", risk: "low" },
  { value: "PLA Compostable", label: "PLA Compostable", risk: "low" },
  { value: "PHA Compostable", label: "PHA Compostable", risk: "low" },
];

export const CATEGORIES: OnboardingSKU["category"][] = [
  "Snack Food", "Beverage", "Food Service", "Fresh Produce",
  "Dairy", "Deli / Meat", "Household", "Pet Food", "Personal Care", "Retail", "Other",
];
