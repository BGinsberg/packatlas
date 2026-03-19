"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ALL_STATES,
  MATERIAL_OPTIONS,
  CATEGORIES,
  flagSKU,
  EPR_RED_STATES,
  EPR_YELLOW_STATES,
} from "@/lib/onboardingEpr";
import {
  ONBOARDING_KEY,
  type OnboardingSKU,
  type MaterialKey,
  type CategoryKey,
  type ProducerRole,
  type RevenueRange,
  type EPRExperience,
} from "@/lib/onboardingTypes";

const EPR_STATE_ABBRS = Object.keys(EPR_RED_STATES);
const VALID_ABBRS = new Set(ALL_STATES.map((s) => s.abbr));

// ── CSV Helpers ─────────────────────────────────────────────────────────────
function matchMaterial(input: string): MaterialKey {
  const c = input.toLowerCase().trim();
  if (c.includes("hdpe") || c.includes("high density")) return "Virgin HDPE Plastic";
  if (c.includes("rpet") || c.includes("recycled pet")) return "rPET (Recycled Plastic)";
  if (c.includes("rhdpe") || c.includes("recycled hdpe")) return "rHDPE (Recycled Plastic)";
  if (c.includes("pet") && !c.includes("food")) return "Virgin PET Plastic";
  if (c.includes("eps") || c.includes("polystyrene") || c.includes("foam")) return "Polystyrene Foam (EPS)";
  if (c.includes("multi") || c.includes("multilayer")) return "Multi-layer Plastic Film";
  if (c.includes("ldpe") || (c.includes("bag") && c.includes("plastic"))) return "LDPE Plastic Bag";
  if (c.includes("pp ") || c.includes("polyprop") || c.startsWith("pp")) return "PP Plastic";
  if (c.includes("paper") || c.includes("paperboard") || c.includes("kraft") || c.includes("cardboard")) return "Kraft Paper / Paperboard";
  if (c.includes("alum")) return "Aluminum";
  if (c.includes("glass")) return "Glass";
  if (c.includes("pla")) return "PLA Compostable";
  if (c.includes("pha")) return "PHA Compostable";
  const exact = MATERIAL_OPTIONS.find((m) => m.value.toLowerCase() === c);
  if (exact) return exact.value;
  return "Other Plastic";
}

function matchCategory(input: string): CategoryKey {
  const c = input.toLowerCase().trim();
  if (c.includes("snack") || c.includes("chip")) return "Snack Food";
  if (c.includes("bev") || c.includes("drink") || c.includes("water") || c.includes("juice")) return "Beverage";
  if (c.includes("food service") || c.includes("takeout") || c.includes("service")) return "Food Service";
  if (c.includes("produce") || c.includes("fresh")) return "Fresh Produce";
  if (c.includes("dairy") || c.includes("milk") || c.includes("cheese") || c.includes("yogurt")) return "Dairy";
  if (c.includes("deli") || c.includes("meat")) return "Deli / Meat";
  if (c.includes("house") || c.includes("clean")) return "Household";
  if (c.includes("pet food") || c.includes("dog") || c.includes("cat")) return "Pet Food";
  if (c.includes("personal") || c.includes("care") || c.includes("beauty") || c.includes("skin")) return "Personal Care";
  if (c.includes("retail")) return "Retail";
  const exact = CATEGORIES.find((cat) => cat.toLowerCase() === c);
  if (exact) return exact;
  return "Other";
}

function parseStates(input: string): string[] {
  const c = input.trim().toLowerCase();
  if (c === "all" || c === "all 50" || c === "all states" || c === "nationwide") {
    return ALL_STATES.map((s) => s.abbr);
  }
  return input.split(/[;,|\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => VALID_ABBRS.has(s));
}

function parseCSV(text: string): OnboardingSKU[] | string {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return "File appears empty — make sure it has a header row and at least one product.";

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const nameIdx = headers.findIndex((h) => h.includes("name") || h === "sku");
  const catIdx = headers.findIndex((h) => h.includes("categ"));
  const matIdx = headers.findIndex((h) => h.includes("material"));
  const unitsIdx = headers.findIndex((h) => h.includes("unit") || h.includes("annual"));
  const statesIdx = headers.findIndex((h) => h.includes("state"));

  if (nameIdx === -1 || matIdx === -1 || unitsIdx === -1 || statesIdx === -1) {
    return "Could not find required columns. Make sure your file has: sku_name, primary_material, annual_units, states_sold.";
  }

  const results: OnboardingSKU[] = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields
    const cols: string[] = [];
    let cur = "", inQuote = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const name = cols[nameIdx]?.trim();
    if (!name) continue;
    const units = parseInt((cols[unitsIdx] ?? "0").replace(/[^0-9]/g, ""), 10) || 0;
    const states = parseStates(cols[statesIdx] ?? "");
    if (states.length === 0) continue;

    results.push(flagSKU(
      crypto.randomUUID(),
      name,
      catIdx >= 0 ? matchCategory(cols[catIdx] ?? "") : "Other",
      matchMaterial(cols[matIdx] ?? ""),
      units,
      states
    ));
  }

  if (results.length === 0) return "No valid products found. Check that your rows have a name, material, units, and states.";
  return results;
}

async function downloadTemplate() {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "PackAtlas";
  wb.created = new Date();

  // Hidden reference sheet for dropdown validation
  const ref = wb.addWorksheet("Reference");
  (ref as { state: string }).state = "veryHidden";
  MATERIAL_OPTIONS.forEach((m, i) => { ref.getCell(i + 1, 1).value = m.value; });
  CATEGORIES.forEach((c, i) => { ref.getCell(i + 1, 2).value = c; });

  // Main data sheet
  const ws = wb.addWorksheet("SKU Data", {
    views: [{ state: "frozen", ySplit: 3 }],
  });
  ws.columns = [
    { key: "sku_name",         width: 38 },
    { key: "category",         width: 22 },
    { key: "primary_material", width: 32 },
    { key: "annual_units",     width: 20 },
    { key: "states_sold",      width: 46 },
  ];

  // Row 1 — title banner
  ws.mergeCells("A1:E1");
  const title = ws.getCell("A1");
  title.value = "PackAtlas SKU Template  ·  Fill in your products starting at row 7  ·  Delete example rows 4–6 before uploading";
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  title.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10.5 };
  title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 28;

  // Row 2 — column headers
  const colHeaders = ["SKU Name *", "Category *", "Primary Material *", "Annual Units *", "States Sold *"];
  colHeaders.forEach((h, i) => {
    const cell = ws.getCell(2, i + 1);
    cell.value = h;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    cell.border = { bottom: { style: "medium", color: { argb: "FF60A5FA" } } };
  });
  ws.getRow(2).height = 26;

  // Row 3 — guidance
  const guidance = [
    "Your product name or SKU code",
    "Select from dropdown list",
    "Select from dropdown list",
    "Total units sold per year (numbers only)",
    "State codes separated by ; (e.g. CA;NY;TX) or type All",
  ];
  guidance.forEach((d, i) => {
    const cell = ws.getCell(3, i + 1);
    cell.value = d;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
    cell.font = { italic: true, color: { argb: "FF1E40AF" }, size: 9 };
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  });
  ws.getRow(3).height = 18;

  // Rows 4–6 — example data
  const examples: (string | number)[][] = [
    ["Sparkling Water 12oz",  "Beverage",   "Virgin PET Plastic",          500000, "CA;NY;TX;FL;WA"],
    ["Snack Bar Wrapper",     "Snack Food", "Multi-layer Plastic Film",     250000, "CA;OR;ME;CO;MN"],
    ["Paper Grocery Bag",     "Retail",     "Kraft Paper / Paperboard",     100000, "All"],
  ];
  examples.forEach((ex, idx) => {
    const rowNum = 4 + idx;
    ex.forEach((val, colIdx) => {
      const cell = ws.getCell(rowNum, colIdx + 1);
      cell.value = val;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: idx % 2 === 0 ? "FFF0F4FF" : "FFFAFBFF" } };
      cell.font = { color: { argb: "FF6B7280" }, size: 10, italic: true };
      cell.alignment = { vertical: "middle", indent: 1 };
    });
    ws.getRow(rowNum).height = 22;
  });

  // Rows 7–206 — empty user rows with alternating shading + dropdowns
  for (let r = 7; r <= 206; r++) {
    const bg = r % 2 === 0 ? "FFF9FAFB" : "FFFFFFFF";
    for (let c = 1; c <= 5; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.font = { size: 10 };
      cell.alignment = { vertical: "middle", indent: 1 };
    }
    ws.getRow(r).height = 22;
    ws.getCell(r, 2).dataValidation = {
      type: "list", allowBlank: true,
      formulae: [`Reference!$B$1:$B$${CATEGORIES.length}`],
      showErrorMessage: true,
      errorTitle: "Invalid Category",
      error: "Please select a category from the dropdown.",
    };
    ws.getCell(r, 3).dataValidation = {
      type: "list", allowBlank: true,
      formulae: [`Reference!$A$1:$A$${MATERIAL_OPTIONS.length}`],
      showErrorMessage: true,
      errorTitle: "Invalid Material",
      error: "Please select a material from the dropdown.",
    };
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "packatlas_sku_template.xlsx"; a.click();
  URL.revokeObjectURL(url);
}

async function parseXLSX(buffer: ArrayBuffer): Promise<OnboardingSKU[] | string> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.getWorksheet("SKU Data") ?? wb.worksheets[0];
  if (!ws) return "Could not read the Excel file.";
  const results: OnboardingSKU[] = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum <= 6) return; // skip headers + examples
    const name = String(row.getCell(1).value ?? "").trim();
    if (!name) return;
    const unitsRaw = row.getCell(4).value;
    const units = typeof unitsRaw === "number" ? unitsRaw : parseInt(String(unitsRaw ?? "").replace(/[^0-9]/g, ""), 10) || 0;
    const states = parseStates(String(row.getCell(5).value ?? ""));
    if (states.length === 0) return;
    results.push(flagSKU(
      crypto.randomUUID(), name,
      matchCategory(String(row.getCell(2).value ?? "")),
      matchMaterial(String(row.getCell(3).value ?? "")),
      units, states
    ));
  });
  if (results.length === 0) return "No valid products found. Make sure your data starts at row 7.";
  return results;
}

// ── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  const steps = ["Add Your SKUs", "Review Flags", "About You"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done ? "bg-blue-600 border-blue-600 text-white" : active ? "bg-blue-600 border-blue-600 text-white" : "border-white/20 text-white/30"}`}>
                {done ? "✓" : num}
              </div>
              <div className={`text-xs mt-1.5 font-medium ${active ? "text-white" : done ? "text-blue-400" : "text-white/30"}`}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-24 h-px mb-4 mx-2 ${step > num ? "bg-blue-600" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Upload SKUs ─────────────────────────────────────────────────────
function Step1({
  skus,
  setSkus,
  onNext,
}: {
  skus: OnboardingSKU[];
  setSkus: (skus: OnboardingSKU[]) => void;
  onNext: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState("");
  const [mode, setMode] = useState<"upload" | "manual">("upload");

  // Manual entry state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryKey>("Snack Food");
  const [material, setMaterial] = useState<MaterialKey>("Virgin HDPE Plastic");
  const [annualUnits, setAnnualUnits] = useState("");
  const [manualStates, setManualStates] = useState<string[]>([]);
  const [manualError, setManualError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-xs text-white/50 uppercase tracking-wider mb-1";

  const handleFile = (file: File) => {
    setParseError("");
    const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    if (isXlsx) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = await parseXLSX(e.target?.result as ArrayBuffer);
        if (typeof result === "string") setParseError(result);
        else setSkus(result);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = parseCSV(e.target?.result as string);
        if (typeof result === "string") setParseError(result);
        else setSkus(result);
      };
      reader.readAsText(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const toggleState = (abbr: string) =>
    setManualStates((prev) => prev.includes(abbr) ? prev.filter((s) => s !== abbr) : [...prev, abbr]);

  const addManualSKU = () => {
    if (!name.trim()) return setManualError("Product name is required.");
    const units = parseInt(annualUnits.replace(/,/g, ""), 10);
    if (!units || units <= 0) return setManualError("Enter a valid annual unit count.");
    if (manualStates.length === 0) return setManualError("Select at least one state.");
    setManualError("");
    setSkus([...skus, flagSKU(crypto.randomUUID(), name.trim(), category, material, units, manualStates)]);
    setName(""); setAnnualUnits(""); setManualStates([]); setMaterial("Virgin HDPE Plastic"); setCategory("Snack Food");
  };

  const removeSKU = (id: string) => setSkus(skus.filter((s) => s.id !== id));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Tell us about your products</h2>
        <p className="text-white/50 text-sm">
          Upload a spreadsheet of your SKUs and we&apos;ll automatically flag the ones that may be subject to EPR obligations.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("upload")}
          className={`text-sm px-4 py-1.5 rounded-lg border transition-all ${mode === "upload" ? "bg-blue-600 border-blue-600 text-white" : "border-white/10 text-white/40 hover:text-white"}`}
        >
          Upload file
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`text-sm px-4 py-1.5 rounded-lg border transition-all ${mode === "manual" ? "bg-blue-600 border-blue-600 text-white" : "border-white/10 text-white/40 hover:text-white"}`}
        >
          Enter manually
        </button>
      </div>

      {mode === "upload" ? (
        <>
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-4
              ${dragOver ? "border-blue-500 bg-blue-500/10" : skus.length > 0 ? "border-green-500/40 bg-green-500/5" : "border-white/10 hover:border-white/30 hover:bg-white/3"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
            {skus.length > 0 ? (
              <>
                <div className="text-green-400 text-3xl mb-3">✓</div>
                <div className="text-white font-medium mb-1">{skus.length} product{skus.length !== 1 ? "s" : ""} detected</div>
                <div className="text-white/40 text-sm">Click to upload a different file</div>
              </>
            ) : (
              <>
                <div className="text-white/20 text-4xl mb-4">↑</div>
                <div className="text-white font-medium mb-1">Drop your CSV file here</div>
                <div className="text-white/40 text-sm mb-4">or click to browse</div>
                <button
                  onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                  className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Download template →
                </button>
              </>
            )}
          </div>

          {parseError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">{parseError}</div>
          )}

          <div className="text-xs text-white/25 mb-6">
            Accepts <span className="text-white/40">.xlsx</span> (recommended) or <span className="text-white/40">.csv</span> — use the template above for best results.
          </div>
        </>
      ) : (
        /* Manual Entry Form */
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Product Name</label>
              <input className={inputCls} placeholder="e.g. Sparkling Water 12oz" value={name}
                onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addManualSKU()} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Primary Packaging Material</label>
              <select className={inputCls} value={material} onChange={(e) => setMaterial(e.target.value as MaterialKey)}>
                <optgroup label="Higher EPR Risk">
                  {MATERIAL_OPTIONS.filter((m) => m.risk === "high").map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </optgroup>
                <optgroup label="Moderate EPR Risk">
                  {MATERIAL_OPTIONS.filter((m) => m.risk === "medium").map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </optgroup>
                <optgroup label="Low / No EPR Risk">
                  {MATERIAL_OPTIONS.filter((m) => m.risk === "low").map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className={labelCls}>Annual Units Sold</label>
              <input className={inputCls} placeholder="e.g. 500000" value={annualUnits}
                onChange={(e) => setAnnualUnits(e.target.value)} type="number" min="1" />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>States Sold</label>
              <div className="flex gap-3">
                <button onClick={() => setManualStates(ALL_STATES.map((s) => s.abbr))} className="text-xs text-blue-400 hover:text-blue-300">All</button>
                <button onClick={() => setManualStates([])} className="text-xs text-white/30 hover:text-white/50">Clear</button>
              </div>
            </div>
            <div className="mb-1.5">
              <div className="text-xs text-white/25 mb-1">Active EPR</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {EPR_STATE_ABBRS.map((abbr) => (
                  <button key={abbr} onClick={() => toggleState(abbr)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all ${manualStates.includes(abbr) ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-white/5 border-white/10 text-white/40 hover:border-red-400/30 hover:text-white/70"}`}>
                    {abbr}
                  </button>
                ))}
              </div>
              <div className="text-xs text-white/25 mb-1">Pending EPR</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {EPR_YELLOW_STATES.map((abbr) => (
                  <button key={abbr} onClick={() => toggleState(abbr)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all ${manualStates.includes(abbr) ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" : "bg-white/5 border-white/10 text-white/40 hover:border-yellow-400/30 hover:text-white/70"}`}>
                    {abbr}
                  </button>
                ))}
              </div>
              <div className="text-xs text-white/25 mb-1">Other states</div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STATES.filter((s) => !EPR_STATE_ABBRS.includes(s.abbr) && !EPR_YELLOW_STATES.includes(s.abbr)).map(({ abbr }) => (
                  <button key={abbr} onClick={() => toggleState(abbr)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all ${manualStates.includes(abbr) ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"}`}>
                    {abbr}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {manualError && <p className="text-red-400 text-xs mb-3">{manualError}</p>}
          <button onClick={addManualSKU} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            + Add SKU
          </button>
        </div>
      )}

      {/* SKU List */}
      {skus.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">{skus.length} SKU{skus.length !== 1 ? "s" : ""} loaded</div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-2.5 text-xs text-white/40 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-2.5 text-xs text-white/40 uppercase tracking-wider">Material</th>
                  <th className="text-left px-4 py-2.5 text-xs text-white/40 uppercase tracking-wider">States</th>
                  <th className="text-left px-4 py-2.5 text-xs text-white/40 uppercase tracking-wider">Units/yr</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {skus.map((sku, i) => (
                  <tr key={sku.id} className={i < skus.length - 1 ? "border-b border-white/5" : ""}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{sku.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${sku.riskLevel === "red" ? "bg-red-500/20 text-red-400" : sku.riskLevel === "yellow" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                          {sku.riskLevel === "red" ? "Risk" : sku.riskLevel === "yellow" ? "Watch" : "OK"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-white/50 text-xs">{sku.material}</td>
                    <td className="px-4 py-2.5 text-white/50 text-xs">{sku.states.length === 50 ? "All states" : `${sku.states.length} states`}</td>
                    <td className="px-4 py-2.5 text-white/50 text-xs">{sku.annualUnits.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => removeSKU(sku.id)} className="text-white/20 hover:text-red-400 transition-colors">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={skus.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Review Flags →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Review Flags ───────────────────────────────────────────────────
function Step2({
  skus,
  onNext,
  onBack,
}: {
  skus: OnboardingSKU[];
  onNext: () => void;
  onBack: () => void;
}) {
  const totalObligation = skus.reduce((s, sku) => s + sku.estimatedObligation, 0);
  const redCount = skus.filter((s) => s.riskLevel === "red").length;
  const yellowCount = skus.filter((s) => s.riskLevel === "yellow").length;
  const greenCount = skus.filter((s) => s.riskLevel === "green").length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Here&apos;s what we found</h2>
        <p className="text-white/50 text-sm">Based on your materials and distribution states, we&apos;ve flagged the following EPR exposure.</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            ${totalObligation >= 1000 ? `${(totalObligation / 1000).toFixed(0)}K` : totalObligation}
          </div>
          <div className="text-xs text-white/40 mt-1">Est. Annual Obligation</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{redCount}</div>
          <div className="text-xs text-white/40 mt-1">Critical SKUs</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{yellowCount}</div>
          <div className="text-xs text-white/40 mt-1">Watch SKUs</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{greenCount}</div>
          <div className="text-xs text-white/40 mt-1">Compliant SKUs</div>
        </div>
      </div>

      {/* SKU Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider">SKU</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider">Material</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider">Flagged States</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider">Risk</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 uppercase tracking-wider">Est. Obligation</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((sku, i) => (
              <tr key={sku.id} className={i < skus.length - 1 ? "border-b border-white/5" : ""}>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{sku.name}</div>
                  <div className="text-xs text-white/40">{sku.category} · {sku.annualUnits.toLocaleString()} units</div>
                </td>
                <td className="px-4 py-3 text-white/60">{sku.material}</td>
                <td className="px-4 py-3">
                  {sku.flaggedStates.length === 0 ? (
                    <span className="text-white/30 text-xs">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {sku.flaggedStates.slice(0, 6).map((s) => (
                        <span key={s.abbr} className={`text-xs px-1.5 py-0.5 rounded font-medium
                          ${s.level === "red" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {s.abbr}
                        </span>
                      ))}
                      {sku.flaggedStates.length > 6 && (
                        <span className="text-xs text-white/30">+{sku.flaggedStates.length - 6}</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${sku.riskLevel === "red" ? "bg-red-500/20 text-red-400" : sku.riskLevel === "yellow" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                    {sku.riskLevel === "red" ? "Critical" : sku.riskLevel === "yellow" ? "Watch" : "Compliant"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-white">
                  {sku.estimatedObligation > 0 ? `$${sku.estimatedObligation.toLocaleString()}` : <span className="text-green-400">$0</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flag Reasons */}
      {skus.some((s) => s.flagReasons.length > 0) && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6">
          <div className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">Why these SKUs were flagged</div>
          <ul className="space-y-1">
            {[...new Set(skus.flatMap((s) => s.flagReasons))].map((r) => (
              <li key={r} className="text-sm text-white/60 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">·</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-white/25 mb-6">Estimates based on current EPR fee schedules and equal state distribution. Consult legal counsel for formal filings.</p>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-white/40 hover:text-white text-sm px-4 py-2 transition-colors">← Back</button>
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-lg transition-colors">
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Producer Info ─────────────────────────────────────────────────
function Step3({
  skus,
  onBack,
}: {
  skus: OnboardingSKU[];
  onBack: () => void;
}) {
  const router = useRouter();
  const [role, setRole] = useState<ProducerRole | null>(null);
  const [revenue, setRevenue] = useState<RevenueRange | null>(null);
  const [experience, setExperience] = useState<EPRExperience | null>(null);

  const totalObligation = skus.reduce((s, sku) => s + sku.estimatedObligation, 0);

  const canSubmit = role && revenue && experience;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const data = {
      skus,
      producer: {
        role: role!,
        revenueRange: revenue!,
        eprExperience: experience!,
        completedAt: new Date().toISOString(),
      },
      totalEstimatedObligation: totalObligation,
    };

    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
    router.push("/dashboard");
  };

  const ChoiceBtn = ({
    selected, onClick, children,
  }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all
        ${selected ? "bg-blue-600/20 border-blue-500 text-white" : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Help us calculate your exposure</h2>
        <p className="text-white/50 text-sm">A few quick questions to refine your compliance picture.</p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Role */}
        <div>
          <div className="text-sm font-medium text-white mb-3">What is your role?</div>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["brand_owner", "Brand Owner — I own the brand on the label"],
              ["manufacturer", "Manufacturer — I make the product"],
              ["importer", "Importer — I bring products into the US"],
              ["distributor", "Distributor — I resell / distribute products"],
              ["retailer", "Retailer — I sell directly to consumers"],
            ] as [ProducerRole, string][]).map(([val, label]) => (
              <ChoiceBtn key={val} selected={role === val} onClick={() => setRole(val)}>
                {label}
              </ChoiceBtn>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div>
          <div className="text-sm font-medium text-white mb-3">What is your annual gross revenue?</div>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["under_1m", "Under $1M"],
              ["1m_5m", "$1M – $5M"],
              ["5m_50m", "$5M – $50M"],
              ["over_50m", "Over $50M"],
            ] as [RevenueRange, string][]).map(([val, label]) => (
              <ChoiceBtn key={val} selected={revenue === val} onClick={() => setRevenue(val)}>
                {label}
              </ChoiceBtn>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="text-sm font-medium text-white mb-3">How familiar are you with EPR compliance?</div>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["none", "Not familiar at all — just learning"],
              ["aware", "Aware of it, haven't acted yet"],
              ["registered", "Registered with a PRO or state program"],
              ["filing", "Already filing EPR reports"],
            ] as [EPRExperience, string][]).map(([val, label]) => (
              <ChoiceBtn key={val} selected={experience === val} onClick={() => setExperience(val)}>
                {label}
              </ChoiceBtn>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Your Setup Summary</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">{skus.length}</div>
            <div className="text-xs text-white/40">SKUs entered</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-400">{skus.filter((s) => s.riskLevel === "red").length}</div>
            <div className="text-xs text-white/40">EPR-flagged</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              ${totalObligation >= 1000 ? `${(totalObligation / 1000).toFixed(0)}K` : totalObligation}
            </div>
            <div className="text-xs text-white/40">Est. annual obligation</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-white/40 hover:text-white text-sm px-4 py-2 transition-colors">← Back</button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          View My Dashboard →
        </button>
      </div>
    </div>
  );
}

// ── Main Onboarding Page ───────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [skus, setSkus] = useState<OnboardingSKU[]>([]);

  useEffect(() => {
    // Clear any previous onboarding data so the wizard always starts fresh
    localStorage.removeItem(ONBOARDING_KEY);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">← PackAtlas</Link>
        <div className="text-xs text-white/30">Setup · Step {step} of 3</div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <StepIndicator step={step} />

        {step === 1 && (
          <Step1
            skus={skus}
            setSkus={setSkus}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            skus={skus}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3
            skus={skus}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
