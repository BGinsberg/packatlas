export type ComplianceLevel = "red" | "yellow" | "green";

export interface Supplier {
  name: string;
  location: string;
  website: string;
  note: string;
}

export interface MaterialOption {
  name: string;
  costPerUnit: number;
  eprFeePerUnit: number;
  description: string;
  icon: string;
  color: string;
  imageUrl?: string;
  suppliers?: Supplier[];
}

export interface StateData {
  name: string;
  abbr: string;
  level: ComplianceLevel;
  regulation: string;
  issue: string;
  currentMaterial: MaterialOption;
  alternativeMaterial: MaterialOption;
}

export interface SKU {
  id: string;
  name: string;
  category: string;
  material: string;
  weightGrams: number;
  annualUnitsPerState: Record<string, number>; // units sold per state per year
  states: string[];
  riskLevel: ComplianceLevel;
  eprObligation: number; // annual $ estimate
}

export const stateData: Record<string, StateData> = {
  California: {
    name: "California",
    abbr: "CA",
    level: "red",
    regulation: "SB 54 – Plastic Pollution Prevention and Packaging Producer Responsibility Act",
    issue: "All single-use plastic packaging must meet 65% recyclability by 2032. Producers pay EPR fees based on packaging weight and material type. Non-compliant packaging faces surcharges up to $0.20/unit.",
    currentMaterial: { name: "Virgin HDPE Plastic", costPerUnit: 0.08, eprFeePerUnit: 0.18, description: "Standard plastic bottle", icon: "🧴", color: "#ef4444", imageUrl: "https://picsum.photos/seed/plastic-bottle/400/260" },
    alternativeMaterial: {
      name: "rPET (50% Recycled Content)", costPerUnit: 0.11, eprFeePerUnit: 0.05, description: "Recycled PET bottles made from 50% post-consumer recycled content. Fully recyclable, widely accepted curbside, and qualifies for the lowest CA EPR fee tier.", icon: "♻️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/recycled-pet/400/260",
      suppliers: [
        { name: "Plastipak Packaging", location: "Auburn Hills, MI", website: "plastipak.com", note: "Leading rPET bottle manufacturer, CA-certified recycled content" },
        { name: "Graham Packaging", location: "Lancaster, PA", website: "grahampackaging.com", note: "rPET bottles with 50–100% recycled content, national distribution" },
        { name: "Envision Plastics", location: "Reidsville, NC", website: "envisionplastics.com", note: "100% post-consumer rHDPE and rPET resins for bottle manufacturing" },
        { name: "CarbonLITE Industries", location: "Reading, PA", website: "carbonliteindustries.com", note: "Largest bottle-to-bottle rPET recycler in North America" },
      ],
    },
  },
  Colorado: {
    name: "Colorado",
    abbr: "CO",
    level: "red",
    regulation: "HB 22-1355 – Plastic Pollution Reduction Act",
    issue: "EPR program requires producers selling into Colorado to register and pay fees calculated on packaging material weight. Single-use plastic surcharges apply starting 2025.",
    currentMaterial: { name: "Virgin HDPE Plastic", costPerUnit: 0.08, eprFeePerUnit: 0.14, description: "Standard plastic container", icon: "🧴", color: "#ef4444", imageUrl: "https://picsum.photos/seed/plastic-hdpe/400/260" },
    alternativeMaterial: {
      name: "Paperboard (FSC Certified)", costPerUnit: 0.10, eprFeePerUnit: 0.02, description: "FSC-certified virgin or recycled paperboard cartons. Fiber packaging is exempt from CO plastic surcharge tiers and qualifies for the lowest EPR fee bracket.", icon: "📦", color: "#22c55e", imageUrl: "https://picsum.photos/seed/paperboard/400/260",
      suppliers: [
        { name: "WestRock", location: "Atlanta, GA", website: "westrock.com", note: "FSC-certified paperboard cartons, full-service packaging solutions" },
        { name: "Graphic Packaging", location: "Atlanta, GA", website: "graphicpkg.com", note: "Sustainable paperboard with recycled content, nationwide supply" },
        { name: "Smurfit Westrock", location: "Dublin, Ireland", website: "smurfitwestrock.com", note: "Global paperboard supplier, FSC-certified, US manufacturing plants" },
        { name: "Clearwater Paper", location: "Spokane, WA", website: "clearwaterpaper.com", note: "Recycled-content paperboard, strong Western US distribution" },
      ],
    },
  },
  Maine: {
    name: "Maine",
    abbr: "ME",
    level: "red",
    regulation: "LD 1541 – Packaging EPR (Nation's First EPR Law)",
    issue: "Maine's program requires producers to fund recycling infrastructure. Annual fees are assessed per material category. Non-fiber plastics carry the highest fee tier at $0.16/unit equivalent.",
    currentMaterial: { name: "Virgin HDPE Plastic", costPerUnit: 0.08, eprFeePerUnit: 0.16, description: "Standard plastic pouch", icon: "🧴", color: "#ef4444", imageUrl: "https://picsum.photos/seed/plastic-pouch/400/260" },
    alternativeMaterial: {
      name: "Compostable PLA Film", costPerUnit: 0.13, eprFeePerUnit: 0.03, description: "BPI-certified compostable film made from polylactic acid (PLA). Maine specifically incentivizes certified compostable packaging with reduced EPR fee treatment.", icon: "🌿", color: "#22c55e", imageUrl: "https://picsum.photos/seed/compostable/400/260",
      suppliers: [
        { name: "NatureWorks", location: "Minnetonka, MN", website: "natureworksllc.com", note: "World's largest PLA producer, Ingeo™ brand biopolymer resin" },
        { name: "Novamont", location: "Novara, Italy", website: "novamont.com", note: "Mater-Bi® certified compostable films, US distribution available" },
        { name: "Futamura", location: "Fieldhouse, UK", website: "futamuragroup.com", note: "NatureFlex™ compostable cellulose films, widely BPI-certified" },
        { name: "TekPak Solutions", location: "Chicago, IL", website: "tekpaksolutions.com", note: "US distributor of compostable flexible packaging films" },
      ],
    },
  },
  Oregon: {
    name: "Oregon",
    abbr: "OR",
    level: "red",
    regulation: "HB 3065 – Plastic Pollution and Producer Responsibility",
    issue: "Oregon's EPR program assesses fees on all plastic packaging. Low-recyclability plastics (#3, #6, #7) face the highest tiers. Producers must submit annual tonnage reports.",
    currentMaterial: { name: "Polystyrene (#6 Plastic)", costPerUnit: 0.06, eprFeePerUnit: 0.20, description: "Expanded polystyrene — highest fee tier in OR", icon: "🫙", color: "#ef4444", imageUrl: "https://picsum.photos/seed/foam-cup/400/260" },
    alternativeMaterial: {
      name: "Molded Fiber (Paper Pulp)", costPerUnit: 0.12, eprFeePerUnit: 0.02, description: "Molded pulp trays and containers made from recycled paper fiber. Curbside recyclable and compostable — Oregon's preferred alternative to polystyrene under HB 3065.", icon: "🥚", color: "#22c55e", imageUrl: "https://picsum.photos/seed/molded-fiber/400/260",
      suppliers: [
        { name: "Pactiv Evergreen", location: "Lake Forest, IL", website: "pactivevergreen.com", note: "Leading molded fiber tray manufacturer, US-wide distribution" },
        { name: "Huhtamaki", location: "Espoo, Finland", website: "huhtamaki.com", note: "Molded fiber foodservice packaging, US manufacturing in multiple states" },
        { name: "Sabert Corporation", location: "Sayreville, NJ", website: "sabert.com", note: "Fiber-based food packaging, strong retail and foodservice channels" },
        { name: "Pacific Pulp Molding", location: "Woodland, CA", website: "pacificpulp.com", note: "West Coast molded pulp specialist, ideal for OR/CA supply chain" },
      ],
    },
  },
  Minnesota: {
    name: "Minnesota",
    abbr: "MN",
    level: "red",
    regulation: "SF 3035 – Packaging Waste and Cost Reduction Act",
    issue: "Minnesota requires producers to join a Producer Responsibility Organization (PRO) and pay fees on all covered packaging. Program enforcement began 2025.",
    currentMaterial: { name: "Multi-layer Plastic Film", costPerUnit: 0.07, eprFeePerUnit: 0.15, description: "Non-recyclable multi-layer film — highest fee category", icon: "🎁", color: "#ef4444", imageUrl: "https://picsum.photos/seed/snack-film/400/260" },
    alternativeMaterial: {
      name: "Mono-material PE Film", costPerUnit: 0.09, eprFeePerUnit: 0.04, description: "Single-layer polyethylene film that is store-drop-off recyclable under How2Recycle guidelines. Minnesota EPR rules reward mono-material structures with significantly lower fee rates.", icon: "🛍️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/pe-film/400/260",
      suppliers: [
        { name: "Sealed Air", location: "Parsippany, NJ", website: "sealedair.com", note: "Cryovac® mono-PE films, recyclable flexible packaging at scale" },
        { name: "Bemis Company (Amcor)", location: "Neenah, WI", website: "amcor.com", note: "AmLite® mono-material recyclable films for food packaging" },
        { name: "Printpack", location: "Atlanta, GA", website: "printpack.com", note: "Recyclable mono-PE structures, strong Midwest distribution" },
        { name: "ProAmpac", location: "Cincinnati, OH", website: "proampac.com", note: "ProActive Sustainability® recyclable film portfolio" },
      ],
    },
  },
  "New Jersey": {
    name: "New Jersey",
    abbr: "NJ",
    level: "red",
    regulation: "A 1952 – Single-Use Plastic Bag and Foam Ban + Packaging EPR",
    issue: "New Jersey bans single-use plastic bags and foam containers outright. EPR fees apply to all remaining plastic packaging sold into the state. Annual registration required.",
    currentMaterial: { name: "Virgin HDPE Plastic Bag", costPerUnit: 0.03, eprFeePerUnit: 0.12, description: "Single-use bags are banned — must switch", icon: "🛍️", color: "#ef4444", imageUrl: "https://picsum.photos/seed/plastic-bag/400/260" },
    alternativeMaterial: {
      name: "Reusable Polypropylene Bag", costPerUnit: 0.18, eprFeePerUnit: 0.00, description: "Woven or non-woven polypropylene reusable bags with 125+ use cycles. Fully exempt from NJ's bag ban and EPR program, and can be branded for retail.", icon: "♻️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/tote-bag/400/260",
      suppliers: [
        { name: "ChicoBag", location: "Chico, CA", website: "chicobag.com", note: "Certified reusable bags, RPET and rPP options, B Corp certified" },
        { name: "Earthwise Bag Company", location: "Los Angeles, CA", website: "earthwisebag.com", note: "Custom branded reusable bags, NJ-compliant, nationwide fulfillment" },
        { name: "1 Bag At A Time", location: "Medford, NY", website: "1bagatatime.com", note: "Northeast-based reusable bag supplier, fast turnaround" },
        { name: "Holden Bags", location: "New Jersey", website: "holdenbags.com", note: "NJ-local reusable bag supplier, familiar with state requirements" },
      ],
    },
  },
  Washington: {
    name: "Washington",
    abbr: "WA",
    level: "yellow",
    regulation: "HB 1131 – Packaging EPR (Effective 2025)",
    issue: "Washington's EPR program launches fees in 2026. Producers must register by end of 2025. Plastic packaging not meeting recyclability thresholds will face surcharges.",
    currentMaterial: { name: "Virgin HDPE Plastic", costPerUnit: 0.08, eprFeePerUnit: 0.10, description: "Fees estimated based on draft rule", icon: "🧴", color: "#eab308", imageUrl: "https://picsum.photos/seed/hdpe-wa/400/260" },
    alternativeMaterial: {
      name: "rPET (30% Recycled Content)", costPerUnit: 0.10, eprFeePerUnit: 0.04, description: "30% post-consumer recycled PET meets Washington's draft recyclability threshold and is projected to qualify for the lowest EPR fee tier under HB 1131.", icon: "♻️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/rpet-wa/400/260",
      suppliers: [
        { name: "Plastipak Packaging", location: "Auburn Hills, MI", website: "plastipak.com", note: "rPET bottle manufacturing with 30–100% PCR content options" },
        { name: "Graham Packaging", location: "Lancaster, PA", website: "grahampackaging.com", note: "Pacific Northwest distribution, rPET bottles and jars" },
        { name: "Northwest Pallet & Packaging", location: "Seattle, WA", website: "nwpallet.com", note: "WA-local distributor for sustainable packaging materials" },
        { name: "Berry Global", location: "Evansville, IN", website: "berryglobal.com", note: "rPET and rHDPE packaging, strong West Coast supply chain" },
      ],
    },
  },
  "New York": {
    name: "New York",
    abbr: "NY",
    level: "yellow",
    regulation: "Packaging Reduction and Recycling Infrastructure Act (Pending)",
    issue: "EPR legislation is advancing in Albany. Plastic bag ban is already in effect. Producers should expect EPR fees on plastic packaging by 2027 based on current bill trajectory.",
    currentMaterial: { name: "Virgin HDPE Plastic", costPerUnit: 0.08, eprFeePerUnit: 0.08, description: "Projected fee based on current bill language", icon: "🧴", color: "#eab308", imageUrl: "https://picsum.photos/seed/virgin-plastic/400/260" },
    alternativeMaterial: {
      name: "Recycled Paperboard", costPerUnit: 0.10, eprFeePerUnit: 0.01, description: "Paperboard made with 30–80% recycled fiber content. Under NY's draft EPR bill, paper/fiber packaging is projected to fall in the lowest fee tier, minimizing compliance costs.", icon: "📦", color: "#22c55e", imageUrl: "https://picsum.photos/seed/recycled-paper/400/260",
      suppliers: [
        { name: "WestRock", location: "Atlanta, GA", website: "westrock.com", note: "Full-service paperboard, strong NY/NJ distribution" },
        { name: "Graphic Packaging", location: "Atlanta, GA", website: "graphicpkg.com", note: "Recycled fiber cartons, NYC metro fulfillment" },
        { name: "Hood Packaging", location: "Boucherville, QC", website: "hoodpackaging.com", note: "Northeast US paper bags and kraft packaging" },
        { name: "Newark Group", location: "Clifton, NJ", website: "newarkgroup.com", note: "NJ-based recycled paperboard manufacturer serving NY market" },
      ],
    },
  },
  Illinois: {
    name: "Illinois",
    abbr: "IL",
    level: "yellow",
    regulation: "Recycling Improvement Act + Proposed EPR Bill SB 1555",
    issue: "Illinois has an active recycling mandate and EPR legislation under debate. Moderate risk — producers selling plastic packaging should monitor closely.",
    currentMaterial: { name: "Virgin HDPE Plastic", costPerUnit: 0.08, eprFeePerUnit: 0.06, description: "Moderate projected fee if SB 1555 passes", icon: "🧴", color: "#eab308", imageUrl: "https://picsum.photos/seed/bottle-il/400/260" },
    alternativeMaterial: {
      name: "rPET (50% Recycled)", costPerUnit: 0.11, eprFeePerUnit: 0.02, description: "50% post-consumer recycled PET is widely accepted curbside in Illinois and likely to receive preferential fee treatment under SB 1555 if passed.", icon: "♻️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/eco-bottle/400/260",
      suppliers: [
        { name: "Printpack", location: "Atlanta, GA", website: "printpack.com", note: "Midwest-distributed rPET films and rigid packaging" },
        { name: "Sonoco Products", location: "Hartsville, SC", website: "sonoco.com", note: "Recycled-content rigid packaging, Chicago-area distribution" },
        { name: "ProAmpac", location: "Cincinnati, OH", website: "proampac.com", note: "Recyclable flexible packaging, strong Midwest presence" },
        { name: "Greenbottle", location: "Blandford Forum, UK", website: "greenbottle.com", note: "Paper-lined bottle alternative, growing US distribution" },
      ],
    },
  },
  Massachusetts: {
    name: "Massachusetts",
    abbr: "MA",
    level: "yellow",
    regulation: "Plastics Reduction Act (Advancing in Legislature)",
    issue: "Massachusetts is moving toward mandatory EPR fees on plastic packaging. Several single-use plastics are under proposed bans. Risk is moderate but timeline is uncertain.",
    currentMaterial: { name: "PVC Clamshell", costPerUnit: 0.09, eprFeePerUnit: 0.08, description: "PVC is targeted in MA proposed ban list", icon: "🫙", color: "#eab308", imageUrl: "https://picsum.photos/seed/pvc-clam/400/260" },
    alternativeMaterial: {
      name: "RPET Clamshell", costPerUnit: 0.12, eprFeePerUnit: 0.02, description: "Recycled PET clamshells are explicitly called out as preferred packaging in the current MA Plastics Reduction Act language, qualifying for the minimum fee tier.", icon: "♻️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/rpet-clam/400/260",
      suppliers: [
        { name: "Dart Container", location: "Mason, MI", website: "dartcontainer.com", note: "rPET clamshells and hinged containers, Northeast distribution" },
        { name: "Pactiv Evergreen", location: "Lake Forest, IL", website: "pactivevergreen.com", note: "EarthChoice® rPET clamshells, MA-compliant" },
        { name: "Genpak", location: "Glens Falls, NY", website: "genpak.com", note: "NY/NE-based manufacturer, rPET food containers" },
        { name: "Novolex", location: "Hartsville, SC", website: "novolex.com", note: "Eco-Products® line of rPET clamshells available nationally" },
      ],
    },
  },
  Connecticut: {
    name: "Connecticut",
    abbr: "CT",
    level: "yellow",
    regulation: "SB 1037 – Extended Producer Responsibility for Packaging",
    issue: "Connecticut's EPR bill passed committee in 2024. Implementation expected 2026-2027. Producers using non-recyclable plastics should begin transition planning now.",
    currentMaterial: { name: "Multi-layer Plastic Film", costPerUnit: 0.07, eprFeePerUnit: 0.07, description: "Estimated fee based on draft CT program design", icon: "🎁", color: "#eab308", imageUrl: "https://picsum.photos/seed/multi-film/400/260" },
    alternativeMaterial: {
      name: "Kraft Paper Bag", costPerUnit: 0.09, eprFeePerUnit: 0.01, description: "Kraft paper bags with or without recycled content qualify for Connecticut's lowest EPR fee tier and are recyclable curbside statewide.", icon: "🛍️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/kraft-bag/400/260",
      suppliers: [
        { name: "Duro Bag (Novolex)", location: "Hartsville, SC", website: "novolex.com", note: "America's largest paper bag manufacturer, CT distribution" },
        { name: "Stone Container (Smurfit)", location: "Chicago, IL", website: "smurfitwestrock.com", note: "Kraft paper bags and sacks, Northeast regional supply" },
        { name: "Longview Fibre (PCA)", location: "Longview, WA", website: "packagingcorp.com", note: "Kraft paper bags with recycled content, national distribution" },
        { name: "Hudson River Packaging", location: "Newburgh, NY", website: "hudsonriverpackaging.com", note: "NY/CT local packaging distributor, fast turnaround" },
      ],
    },
  },
  Maryland: {
    name: "Maryland",
    abbr: "MD",
    level: "yellow",
    regulation: "Plastic Pollution Reduction Act (Active)",
    issue: "Maryland has enacted several single-use plastic restrictions and is advancing EPR legislation. Polystyrene foam is banned statewide. Risk is moderate.",
    currentMaterial: { name: "Polystyrene Foam Cup", costPerUnit: 0.05, eprFeePerUnit: 0.15, description: "Foam is banned in MD — must switch immediately", icon: "☕", color: "#eab308", imageUrl: "https://picsum.photos/seed/foam-cup-md/400/260" },
    alternativeMaterial: {
      name: "Paper Cup (PE-lined)", costPerUnit: 0.08, eprFeePerUnit: 0.01, description: "Single-wall or double-wall paper cups with PE lining are the compliant standard replacement for foam cups under Maryland law. Widely available and curbside recyclable.", icon: "☕", color: "#22c55e", imageUrl: "https://picsum.photos/seed/paper-cup/400/260",
      suppliers: [
        { name: "Dart Container", location: "Mason, MI", website: "dartcontainer.com", note: "Paper hot cups in all sizes, strong MD/DC/VA distribution" },
        { name: "Solo Cup (Dart)", location: "Lake Forest, IL", website: "dartcontainer.com", note: "Solo® paper cups, foam-free alternatives available nationally" },
        { name: "Huhtamaki", location: "Espoo, Finland", website: "huhtamaki.com", note: "Paper cups with sustainable PE-lining, Mid-Atlantic supply" },
        { name: "Lollicup USA", location: "Chino, CA", website: "lollicupstore.com", note: "Paper cups and eco alternatives, competitive pricing" },
      ],
    },
  },
  Vermont: {
    name: "Vermont",
    abbr: "VT",
    level: "yellow",
    regulation: "Act 64 – Single-Use Products Law + EPR Study Bill",
    issue: "Vermont has sweeping single-use restrictions and is conducting an EPR study. Legislation expected by 2027. Producers should prepare now.",
    currentMaterial: { name: "Plastic Straw/Utensil", costPerUnit: 0.02, eprFeePerUnit: 0.10, description: "Many single-use plastic items are already banned in VT", icon: "🥄", color: "#eab308", imageUrl: "https://picsum.photos/seed/plastic-straw/400/260" },
    alternativeMaterial: {
      name: "Bamboo/Paper Utensil", costPerUnit: 0.06, eprFeePerUnit: 0.00, description: "ASTM-certified compostable bamboo or paper utensils are fully exempt from Vermont's Act 64 restrictions and projected to remain in the zero-fee tier under the EPR study's recommendations.", icon: "🌿", color: "#22c55e", imageUrl: "https://picsum.photos/seed/bamboo-eco/400/260",
      suppliers: [
        { name: "Bambu", location: "Portland, OR", website: "bambuhome.com", note: "Certified organic bamboo utensils, B Corp, national distribution" },
        { name: "World Centric", location: "Petaluma, CA", website: "worldcentric.com", note: "BPI-certified compostable paper utensils, strong Northeast sales" },
        { name: "Eco-Products (Novolex)", location: "Boulder, CO", website: "ecoproducts.com", note: "ASTM D6400 certified compostable utensils, VT-compliant" },
        { name: "Fabri-Kal", location: "Kalamazoo, MI", website: "fabri-kal.com", note: "Plant-based Greenware® cutlery, compliant with VT Act 64" },
      ],
    },
  },
  Hawaii: {
    name: "Hawaii",
    abbr: "HI",
    level: "yellow",
    regulation: "Statewide Single-Use Plastic Ban (Enforcement Active)",
    issue: "Hawaii has the broadest statewide plastic ban in the US. Plastic bags, foam containers, and many single-use items are prohibited. EPR fee program under development.",
    currentMaterial: { name: "Plastic Bag (LDPE)", costPerUnit: 0.03, eprFeePerUnit: 0.10, description: "Plastic bags are banned statewide in Hawaii", icon: "🛍️", color: "#eab308", imageUrl: "https://picsum.photos/seed/ldpe-bag/400/260" },
    alternativeMaterial: {
      name: "Paper Bag (Recycled Content)", costPerUnit: 0.07, eprFeePerUnit: 0.00, description: "Recycled-content paper bags are the default compliant replacement under Hawaii's statewide plastic bag ban. Must contain at least 40% post-consumer recycled content to qualify.", icon: "🛍️", color: "#22c55e", imageUrl: "https://picsum.photos/seed/paper-bag/400/260",
      suppliers: [
        { name: "Duro Bag (Novolex)", location: "Hartsville, SC", website: "novolex.com", note: "Recycled-content kraft paper bags, Hawaii distribution available" },
        { name: "BioBag Americas", location: "Dunedin, FL", website: "biobagusa.com", note: "Certified compostable and recycled-content bags for Hawaii" },
        { name: "Pacific Bag", location: "Woodinville, WA", website: "pacificbag.com", note: "West Coast-based, fast shipping to Hawaii, custom print options" },
        { name: "Frontier Bag", location: "Omaha, NE", website: "frontierbag.com", note: "Paper bags with recycled content, Hawaii-compliant specs" },
      ],
    },
  },
};

// Default for green states
export const defaultGreenState: Omit<StateData, "name" | "abbr"> = {
  level: "green",
  regulation: "No Active EPR or Packaging Ban",
  issue: "This state currently has no active EPR law or single-use plastic ban. Your packaging is compliant. Monitor for future legislation.",
  currentMaterial: { name: "Standard Plastic Packaging", costPerUnit: 0.08, eprFeePerUnit: 0.00, description: "No EPR fees in this state", icon: "🧴", color: "#22c55e" },
  alternativeMaterial: { name: "Standard Plastic Packaging", costPerUnit: 0.08, eprFeePerUnit: 0.00, description: "No change needed — state is compliant", icon: "🧴", color: "#22c55e" },
};

export const skus: SKU[] = [
  {
    id: "SKU-001",
    name: "CrunchBite Snack Pouch 2oz",
    category: "Snack Food",
    material: "Multi-layer Plastic Film",
    weightGrams: 12,
    annualUnitsPerState: { CA: 80000, NY: 70000, TX: 60000, FL: 55000, IL: 40000, WA: 35000, OR: 30000, CO: 25000 },
    states: ["CA", "NY", "TX", "FL", "IL", "WA", "OR", "CO"],
    riskLevel: "red",
    eprObligation: 48200,
  },
  {
    id: "SKU-002",
    name: "FreshSip Water Bottle 500ml",
    category: "Beverage",
    material: "Virgin HDPE Plastic",
    weightGrams: 22,
    annualUnitsPerState: { CA: 90000, OR: 40000, ME: 20000, MN: 35000, NJ: 45000, NY: 80000, MA: 30000 },
    states: ["CA", "OR", "ME", "MN", "NJ", "NY", "MA"],
    riskLevel: "red",
    eprObligation: 62400,
  },
  {
    id: "SKU-003",
    name: "GreenLeaf Salad Clamshell 12oz",
    category: "Fresh Produce",
    material: "PVC Clamshell",
    weightGrams: 35,
    annualUnitsPerState: { CA: 60000, CO: 20000, WA: 25000, MA: 18000, CT: 12000 },
    states: ["CA", "CO", "WA", "MA", "CT"],
    riskLevel: "red",
    eprObligation: 37800,
  },
  {
    id: "SKU-004",
    name: "QuickBrew Coffee Pod",
    category: "Beverage",
    material: "Polystyrene (#6 Plastic)",
    weightGrams: 8,
    annualUnitsPerState: { OR: 50000, ME: 30000, MN: 55000, MD: 40000, VT: 15000 },
    states: ["OR", "ME", "MN", "MD", "VT"],
    riskLevel: "red",
    eprObligation: 29100,
  },
  {
    id: "SKU-005",
    name: "FamilyPak Deli Bag",
    category: "Deli / Meat",
    material: "LDPE Plastic Bag",
    weightGrams: 5,
    annualUnitsPerState: { NJ: 70000, HI: 20000, CA: 90000, NY: 85000 },
    states: ["NJ", "HI", "CA", "NY"],
    riskLevel: "red",
    eprObligation: 18500,
  },
  {
    id: "SKU-006",
    name: "NutriBar Wrapper",
    category: "Snack Food",
    material: "Kraft Paper + PE Liner",
    weightGrams: 4,
    annualUnitsPerState: { CA: 200000, TX: 180000, FL: 150000, NY: 160000, OH: 120000 },
    states: ["CA", "TX", "FL", "NY", "OH"],
    riskLevel: "yellow",
    eprObligation: 8200,
  },
  {
    id: "SKU-007",
    name: "FreshPick Yogurt Cup 6oz",
    category: "Dairy",
    material: "rPET (30% Recycled)",
    weightGrams: 18,
    annualUnitsPerState: { TX: 90000, FL: 80000, GA: 50000, NC: 45000, VA: 40000 },
    states: ["TX", "FL", "GA", "NC", "VA"],
    riskLevel: "green",
    eprObligation: 0,
  },
  {
    id: "SKU-008",
    name: "CleanHome Detergent Bottle 32oz",
    category: "Household",
    material: "rHDPE (50% Recycled)",
    weightGrams: 65,
    annualUnitsPerState: { CA: 25000, OR: 15000, WA: 18000, CO: 12000, ME: 8000 },
    states: ["CA", "OR", "WA", "CO", "ME"],
    riskLevel: "yellow",
    eprObligation: 11400,
  },
  {
    id: "SKU-009",
    name: "PurePet Dog Treat Bag",
    category: "Pet Food",
    material: "Mono-material PE Film",
    weightGrams: 28,
    annualUnitsPerState: { TX: 40000, FL: 35000, OH: 30000, PA: 28000, NC: 25000 },
    states: ["TX", "FL", "OH", "PA", "NC"],
    riskLevel: "green",
    eprObligation: 0,
  },
  {
    id: "SKU-010",
    name: "TastyChips Party Bag 8oz",
    category: "Snack Food",
    material: "Multi-layer Plastic Film",
    weightGrams: 40,
    annualUnitsPerState: { CA: 100000, NY: 90000, TX: 80000, IL: 60000, WA: 45000, OR: 40000, MN: 35000 },
    states: ["CA", "NY", "TX", "IL", "WA", "OR", "MN"],
    riskLevel: "red",
    eprObligation: 54600,
  },
];
