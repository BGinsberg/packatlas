export type EPRRiskLevel = "red" | "yellow" | "green";

export type MaterialKey =
  | "Virgin HDPE Plastic"
  | "Virgin PET Plastic"
  | "PP Plastic"
  | "Polystyrene Foam (EPS)"
  | "Multi-layer Plastic Film"
  | "LDPE Plastic Bag"
  | "rPET (Recycled Plastic)"
  | "rHDPE (Recycled Plastic)"
  | "Kraft Paper / Paperboard"
  | "Aluminum"
  | "Glass"
  | "PLA Compostable"
  | "PHA Compostable"
  | "Other Plastic";

export type CategoryKey =
  | "Snack Food"
  | "Beverage"
  | "Food Service"
  | "Fresh Produce"
  | "Dairy"
  | "Deli / Meat"
  | "Household"
  | "Pet Food"
  | "Personal Care"
  | "Retail"
  | "Other";

export type ProducerRole =
  | "brand_owner"
  | "manufacturer"
  | "importer"
  | "distributor"
  | "retailer";

export type RevenueRange =
  | "under_1m"
  | "1m_5m"
  | "5m_50m"
  | "over_50m";

export type EPRExperience =
  | "none"
  | "aware"
  | "registered"
  | "filing";

export interface OnboardingSKU {
  id: string;
  name: string;
  category: CategoryKey;
  material: MaterialKey;
  annualUnits: number;
  states: string[];
  riskLevel: EPRRiskLevel;
  flaggedStates: { abbr: string; name: string; level: "red" | "yellow" }[];
  estimatedObligation: number;
  flagReasons: string[];
}

export interface OnboardingProducerInfo {
  role: ProducerRole;
  revenueRange: RevenueRange;
  eprExperience: EPRExperience;
  completedAt: string;
}

export interface OnboardingData {
  skus: OnboardingSKU[];
  producer: OnboardingProducerInfo;
  totalEstimatedObligation: number;
}

export const ONBOARDING_KEY = "packatlas_onboarding";
