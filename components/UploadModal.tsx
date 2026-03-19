"use client";

import { useState, useRef } from "react";
import type ExcelJS from "exceljs";

interface Props {
  onClose: () => void;
}

type UploadStage = "idle" | "uploading" | "processing" | "done";

export default function UploadModal({ onClose }: Props) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [skuCount, setSkuCount] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file) return;
    setFileName(file.name);
    setStage("uploading");

    setTimeout(() => {
      setStage("processing");
      // Count rows in CSV (simulate)
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        setSkuCount(Math.max(lines.length - 1, 1)); // subtract header
      };
      reader.readAsText(file);
    }, 800);

    setTimeout(() => {
      setStage("done");
    }, 2200);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function downloadTemplate() {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "PackAtlas";
    wb.created = new Date();

    // ─── colour palette ────────────────────────────────────────────────────
    const NAVY       = "FF0F172A";
    const NAVY_MID   = "FF1E293B";
    const BLUE_LIGHT = "FFE8F0FE";
    const BLUE_HINT  = "FFF0F6FF";
    const GRAY_ROW   = "FFF8FAFC";
    const BORDER_CLR = "FFD1D5DB";
    const WHITE      = "FFFFFFFF";
    const GOLD       = "FFFBBF24";
    const GREEN_DARK = "FF166534";
    const GREEN_LIGHT = "FFF0FDF4";

    // ─── helpers ──────────────────────────────────────────────────────────
    function hdr(cell: ExcelJS.Cell, text: string) {
      cell.value = text;
      cell.font  = { bold: true, color: { argb: WHITE }, size: 10, name: "Calibri" };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = thinBorder(BORDER_CLR);
    }
    function sub(cell: ExcelJS.Cell, text: string) {
      cell.value = text;
      cell.font  = { italic: true, color: { argb: "FF64748B" }, size: 9, name: "Calibri" };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = thinBorder(BORDER_CLR);
    }
    function example(cell: ExcelJS.Cell, value: string | number, isFirst = false) {
      cell.value = value;
      cell.font  = { color: { argb: "FF334155" }, size: 10, name: "Calibri", italic: true };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE_LIGHT } };
      cell.alignment = { vertical: "middle", horizontal: isFirst ? "left" : "center", wrapText: false };
      cell.border = thinBorder("FFBFDBFE");
    }
    function dataCell(cell: ExcelJS.Cell, alt = false) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: alt ? GRAY_ROW : WHITE } };
      cell.font = { size: 10, name: "Calibri", color: { argb: "FF111827" } };
      cell.alignment = { vertical: "middle" };
      cell.border = thinBorder(BORDER_CLR);
    }
    function thinBorder(color: string): Partial<ExcelJS.Borders> {
      const s = { style: "thin" as const, color: { argb: color } };
      return { top: s, left: s, bottom: s, right: s };
    }
    function addDV(sheet: ExcelJS.Worksheet, col: string, startRow: number, endRow: number, list: string[]) {
      const formulae = [`"${list.join(",")}"`];
      for (let r = startRow; r <= endRow; r++) {
        sheet.getCell(`${col}${r}`).dataValidation = {
          type: "list", allowBlank: true, showErrorMessage: true,
          errorStyle: "warning", errorTitle: "Invalid value",
          error: "Please select a value from the dropdown list.",
          formulae,
        };
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SHEET 1 — SKU Template
    // ═══════════════════════════════════════════════════════════════════════
    const ws = wb.addWorksheet("SKU Template", {
      views: [{ state: "frozen", ySplit: 4, xSplit: 0, showGridLines: true }],
      pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "landscape" },
      properties: { tabColor: { argb: NAVY } },
    });

    ws.columns = [
      { key: "sku_id",     width: 16 },
      { key: "sku_name",   width: 32 },
      { key: "category",   width: 20 },
      { key: "material",   width: 28 },
      { key: "format",     width: 20 },
      { key: "weight",     width: 14 },
      { key: "units",      width: 18 },
      { key: "states",     width: 38 },
    ];

    // Row 1 — banner title
    ws.mergeCells("A1:H1");
    const title = ws.getCell("A1");
    title.value = "PackAtlas  —  SKU Import Template";
    title.font  = { bold: true, size: 14, color: { argb: GOLD }, name: "Calibri" };
    title.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ws.getRow(1).height = 36;

    // Row 2 — instruction bar
    ws.mergeCells("A2:H2");
    const instr = ws.getCell("A2");
    instr.value = "Fill in one row per SKU starting from row 5. Blue rows are examples — replace them with your own data. Use the dropdowns in columns C, D, and E.";
    instr.font  = { italic: true, size: 9.5, color: { argb: "FF334155" }, name: "Calibri" };
    instr.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE_HINT } };
    instr.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };
    ws.getRow(2).height = 28;

    // Row 3 — column headers
    const headers = ["SKU ID", "SKU Name", "Category", "Primary Material", "Packaging Format", "Weight (grams)", "Annual Units", "States Sold In"];
    headers.forEach((h, i) => hdr(ws.getRow(3).getCell(i + 1), h));
    ws.getRow(3).height = 32;

    // Row 4 — sub-descriptions
    const descs = [
      "Your internal ID",
      "Product / item name",
      "Select from dropdown",
      "Select from dropdown",
      "Select from dropdown",
      "Packaging only\n(excl. product)",
      "Total units/yr\nacross all states",
      "2-letter codes, pipe-\nseparated  e.g. CA|NY|TX",
    ];
    descs.forEach((d, i) => sub(ws.getRow(4).getCell(i + 1), d));
    ws.getRow(4).height = 36;

    // Rows 5-7 — example data
    const examples = [
      ["SKU-001", "Classic Drinking Straw",      "Food Service", "Polypropylene (PP)",         "Straw",    1,  2000000, "CA|NY|TX|FL|IL|WA"],
      ["SKU-002", "Kraft Paper Grocery Bag",      "Retail",       "Kraft Paper",                "Bag",     42,   350000, "CA|OR|ME|CO|NY|MA"],
      ["SKU-003", "8oz Cold Beverage Cup",        "Food Service", "rPET (Recycled PET)",        "Cup",      9,   800000, "CA|CO|ME|OR|MN|NJ|NY"],
      ["SKU-004", "Foam Takeout Clamshell",       "Food Service", "Polystyrene (PS / #6)",      "Tray",    18,   275000, "TX|FL|GA|OH|PA|TN"],
      ["SKU-005", "Snack Film Pouch",             "Snack Food",   "Multi-layer Plastic Film",   "Pouch",    6,  1200000, "CA|OR|MN|CO|ME|NY|WA"],
    ];
    examples.forEach((row, ri) => {
      const r = ws.getRow(5 + ri);
      row.forEach((val, ci) => example(r.getCell(ci + 1), val as string | number, ci === 0));
      r.height = 22;
    });

    // Rows 10-59 — blank data entry rows
    for (let r = 10; r <= 59; r++) {
      const row = ws.getRow(r);
      for (let c = 1; c <= 8; c++) dataCell(row.getCell(c), r % 2 === 0);
      row.height = 20;
    }

    // Data validation dropdowns (rows 5-59)
    const categories = ["Food Service","Retail","Snack Food","Beverage","Personal Care","Household","Electronics","Other"];
    const materials   = ["Virgin HDPE","Virgin PET","rPET (Recycled PET)","Polypropylene (PP)","Polystyrene (PS/#6)","Multi-layer Plastic Film","Paperboard","Kraft Paper","Aluminum","Glass","PLA Compostable","PHA Compostable","Other Plastic"];
    const formats     = ["Bag","Bottle","Box","Cup","Lid","Tray","Pouch","Wrap","Straw","Cutlery","Container","Sleeve","Other"];

    addDV(ws, "C", 5, 59, categories);
    addDV(ws, "D", 5, 59, materials);
    addDV(ws, "E", 5, 59, formats);

    // Number format on weight + units columns
    for (let r = 5; r <= 59; r++) {
      ws.getCell(`F${r}`).numFmt = "#,##0";
      ws.getCell(`G${r}`).numFmt = "#,##0";
    }

    // "EXAMPLES" label in the margin (col I)
    ws.getColumn(9).width = 12;
    for (let r = 5; r <= 9; r++) {
      const c = ws.getCell(`I${r}`);
      c.value = r === 5 ? "← EXAMPLES" : "";
      c.font  = { italic: true, size: 8.5, color: { argb: "FF93C5FD" } };
      c.alignment = { vertical: "middle" };
    }
    ws.getCell("I10").value = "← YOUR DATA";
    ws.getCell("I10").font  = { italic: true, size: 8.5, color: { argb: "FF6EE7B7" } };

    // ═══════════════════════════════════════════════════════════════════════
    // SHEET 2 — Valid Options reference
    // ═══════════════════════════════════════════════════════════════════════
    const ref = wb.addWorksheet("Valid Options", {
      properties: { tabColor: { argb: "FF166534" } },
    });
    ref.views = [{ showGridLines: false }];

    function refTitle(cell: ExcelJS.Cell, text: string, bgArgb: string, fgArgb = WHITE) {
      cell.value = text;
      cell.font  = { bold: true, size: 11, color: { argb: fgArgb }, name: "Calibri" };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
      cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
      cell.border = thinBorder(BORDER_CLR);
    }
    function refItem(cell: ExcelJS.Cell, text: string, bgArgb = WHITE) {
      cell.value = text;
      cell.font  = { size: 10, color: { argb: "FF1E293B" }, name: "Calibri" };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
      cell.alignment = { vertical: "middle", horizontal: "left", indent: 2 };
      cell.border = thinBorder(BORDER_CLR);
    }
    function refNote(cell: ExcelJS.Cell, text: string) {
      cell.value = text;
      cell.font  = { size: 9, italic: true, color: { argb: "FF64748B" }, name: "Calibri" };
      cell.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };
    }

    // Banner
    ref.mergeCells("A1:C1");
    const rb = ref.getCell("A1");
    rb.value = "PackAtlas — Valid Field Options";
    rb.font  = { bold: true, size: 13, color: { argb: GOLD }, name: "Calibri" };
    rb.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    rb.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ref.getRow(1).height = 32;

    ref.columns = [{ width: 28 }, { width: 28 }, { width: 44 }];

    // Helper to write a section
    let row = 3;
    function section(title: string, items: { label: string; note?: string }[], bg: string) {
      ref.mergeCells(`A${row}:C${row}`);
      refTitle(ref.getCell(`A${row}`), title, bg);
      ref.getRow(row).height = 26;
      row++;
      items.forEach(({ label, note }) => {
        refItem(ref.getCell(`A${row}`), label, row % 2 === 0 ? "FFF8FAFC" : WHITE);
        if (note) refNote(ref.getCell(`C${row}`), note);
        ref.getRow(row).height = 20;
        row++;
      });
      row++; // gap
    }

    section("Category  (Column C)", [
      { label: "Food Service",   note: "Straws, cups, cutlery, containers, takeout packaging" },
      { label: "Retail",         note: "Shopping bags, carry bags, retail outer packaging" },
      { label: "Snack Food",     note: "Chips, candy, snack bars, single-serve pouches" },
      { label: "Beverage",       note: "Bottles, cans, drink pouches, caps and closures" },
      { label: "Personal Care",  note: "Cosmetics, toiletries, health & beauty packaging" },
      { label: "Household",      note: "Cleaning products, home goods, general consumer" },
      { label: "Electronics",    note: "Device packaging, accessories, cables" },
      { label: "Other",          note: "Any category not listed above" },
    ], "FF1E3A5F");

    section("Primary Material  (Column D)", [
      { label: "Virgin HDPE",               note: "High-density polyethylene — bottles, jugs (#2). Widely recycled." },
      { label: "Virgin PET",                note: "Polyethylene terephthalate — clear bottles (#1). Widely recycled." },
      { label: "rPET (Recycled PET)",       note: "Recycled PET — lower EPR fee tier in most states." },
      { label: "Polypropylene (PP)",        note: "#5 plastic — straws, yogurt containers, bottle caps." },
      { label: "Polystyrene (PS / #6)",     note: "Foam and rigid PS — HIGHEST EPR fee tier; banned in several states." },
      { label: "Multi-layer Plastic Film",  note: "Laminated / composite films — not curbside recyclable; high EPR risk." },
      { label: "Paperboard",                note: "Folding cartons, paperboard boxes — generally lowest EPR tiers." },
      { label: "Kraft Paper",               note: "Paper bags, kraft wraps — generally lowest EPR tiers." },
      { label: "Aluminum",                  note: "Cans, foil, trays — highly recyclable; favored by EPR programs." },
      { label: "Glass",                     note: "Bottles, jars — recyclable; deposit laws may apply in some states." },
      { label: "PLA Compostable",           note: "Polylactic acid bioplastic — requires industrial composting facility." },
      { label: "PHA Compostable",           note: "Polyhydroxyalkanoate — marine & home compostable; lowest EPR risk." },
      { label: "Other Plastic",             note: "Any plastic not listed — use if none of the above apply." },
    ], "FF164E63");

    section("Packaging Format  (Column E)", [
      { label: "Bag",        note: "Shopping bags, poly bags, zip-lock bags" },
      { label: "Bottle",     note: "Beverage and consumer product bottles" },
      { label: "Box",        note: "Folding cartons, corrugated boxes, rigid boxes" },
      { label: "Container",  note: "Tubs, pots, wide-mouth rigid containers" },
      { label: "Cup",        note: "Hot and cold cups, tumblers" },
      { label: "Cutlery",    note: "Forks, knives, spoons, sporks" },
      { label: "Lid",        note: "Cup lids, container lids, closures" },
      { label: "Pouch",      note: "Stand-up pouches, flat pouches, retort pouches" },
      { label: "Sleeve",     note: "Cup sleeves, shrink sleeves, labels" },
      { label: "Straw",      note: "Drinking straws (all materials)" },
      { label: "Tray",       note: "Flat trays, clamshells, foam trays" },
      { label: "Wrap",       note: "Film wrap, overwrap, stretch film" },
      { label: "Other",      note: "Any format not listed above" },
    ], "FF14532D");

    section("States Sold In  (Column H — pipe-separated codes)", [
      { label: "AL | AK | AZ | AR | CA | CO | CT | DE | FL | GA" },
      { label: "HI | ID | IL | IN | IA | KS | KY | LA | ME | MD" },
      { label: "MA | MI | MN | MS | MO | MT | NE | NV | NH | NJ" },
      { label: "NM | NY | NC | ND | OH | OK | OR | PA | RI | SC" },
      { label: "SD | TN | TX | UT | VT | VA | WA | WV | WI | WY" },
      { label: "Example: CA|NY|TX|FL",  note: "List only the states you actively sell this SKU in." },
    ], NAVY_MID);

    // EPR risk callout
    row++;
    ref.mergeCells(`A${row}:C${row}`);
    const risk = ref.getCell(`A${row}`);
    risk.value = "EPR Risk Guide — Materials ranked from highest to lowest annual fee burden";
    risk.font  = { bold: true, size: 10, color: { argb: GREEN_DARK }, name: "Calibri" };
    risk.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_LIGHT } };
    risk.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ref.getRow(row).height = 24;
    row++;

    const riskRows: [string, string, string][] = [
      ["Polystyrene (PS / #6)",     "Highest",   "Banned in NJ, MN, WA, MD. EPR surcharges up to $0.20/unit in OR, ME, MN."],
      ["Multi-layer Plastic Film",  "Very High",  "Non-recyclable; highest fee tier in most EPR states."],
      ["Virgin HDPE / Virgin PET",  "High",       "Widely used — EPR fees $0.12–0.18/unit depending on state."],
      ["Polypropylene (PP)",         "Moderate",   "Generally lower EPR tier than #1/#2 plastics; depends on recyclability."],
      ["rPET (Recycled PET)",        "Low",        "Recycled content rewarded — significantly reduced fee tiers."],
      ["Paperboard / Kraft Paper",   "Very Low",   "Fiber-based packaging is the lowest EPR fee tier in all active states."],
      ["Aluminum",                   "Very Low",   "Highly recyclable; often exempt or minimal fees."],
      ["PLA / PHA Compostable",      "Minimal",    "Certified compostable materials receive lowest or zero EPR fees."],
    ];

    riskRows.forEach(([mat, risk, note]) => {
      const riskColor = risk === "Highest" ? "FFDC2626" : risk === "Very High" ? "FFD97706" : risk === "High" ? "FFCA8A04" : risk === "Moderate" ? "FF2563EB" : "FF16A34A";
      ref.getCell(`A${row}`).value = mat;
      ref.getCell(`A${row}`).font  = { size: 10, name: "Calibri", color: { argb: "FF111827" } };
      ref.getCell(`A${row}`).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: row % 2 === 0 ? "FFF8FAFC" : WHITE } };
      ref.getCell(`A${row}`).border = thinBorder(BORDER_CLR);
      ref.getCell(`A${row}`).alignment = { indent: 1 };

      ref.getCell(`B${row}`).value = risk;
      ref.getCell(`B${row}`).font  = { bold: true, size: 10, name: "Calibri", color: { argb: riskColor } };
      ref.getCell(`B${row}`).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: row % 2 === 0 ? "FFF8FAFC" : WHITE } };
      ref.getCell(`B${row}`).border = thinBorder(BORDER_CLR);
      ref.getCell(`B${row}`).alignment = { horizontal: "center" };

      ref.getCell(`C${row}`).value = note;
      ref.getCell(`C${row}`).font  = { size: 9, italic: true, name: "Calibri", color: { argb: "FF4B5563" } };
      ref.getCell(`C${row}`).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: row % 2 === 0 ? "FFF8FAFC" : WHITE } };
      ref.getCell(`C${row}`).border = thinBorder(BORDER_CLR);
      ref.getCell(`C${row}`).alignment = { wrapText: true, indent: 1 };

      ref.getRow(row).height = 20;
      row++;
    });

    // ── generate and download ──────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packatlas_sku_template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1526] border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Upload SKU Data</h2>
            <p className="text-white/50 text-sm mt-0.5">Upload a CSV or Excel file with your product packaging data</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {stage === "idle" && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-blue-500 bg-blue-500/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div className="text-4xl mb-3">📂</div>
                <div className="text-white font-medium mb-1">Drop your file here, or click to browse</div>
                <div className="text-white/40 text-sm">Supports .XLSX, .XLS, .CSV</div>
              </div>

              {/* Template */}
              <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <div>
                  <div className="text-white text-sm font-medium">Download Template</div>
                  <div className="text-white/40 text-xs">Excel file — dropdowns, examples, and EPR risk guide included</div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Download →
                </button>
              </div>

              {/* Column guide */}
              <div className="mt-4">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Column Guide</div>
                <div className="space-y-1.5">
                  {[
                    { col: "sku_id",           desc: "Your internal product identifier",                          example: "SKU-001" },
                    { col: "sku_name",          desc: "Product or packaging item name",                            example: "Classic Drinking Straw" },
                    { col: "category",          desc: "Product category",                                          example: "Food Service" },
                    { col: "primary_material",  desc: "Main packaging material — see template for valid options",  example: "Polypropylene (PP)" },
                    { col: "packaging_format",  desc: "Physical form of the packaging",                            example: "Straw, Cup, Bag, Tray…" },
                    { col: "weight_grams",      desc: "Packaging weight only, in grams",                           example: "12" },
                    { col: "annual_units",      desc: "Total units sold per year across all listed states",        example: "500000" },
                    { col: "states_sold",       desc: "2-letter state codes, pipe-separated",                      example: "CA|NY|TX|FL" },
                  ].map(({ col, desc, example }) => (
                    <div key={col} className="flex items-start gap-2 text-xs">
                      <span className="font-mono text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0 w-36 text-right">{col}</span>
                      <span className="text-white/50">{desc} <span className="text-white/25">e.g. {example}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {stage === "uploading" && (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">📤</div>
              <div className="text-white font-medium mb-2">Uploading {fileName}...</div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: "40%" }} />
              </div>
            </div>
          )}

          {stage === "processing" && (
            <div className="text-center py-10">
              <div className="text-4xl mb-4 animate-spin">⚙️</div>
              <div className="text-white font-medium mb-2">Analyzing packaging data...</div>
              <div className="text-white/50 text-sm">Matching SKUs against 50-state regulation database</div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: "75%" }} />
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-white font-bold text-xl mb-2">Import Complete</div>
              <div className="text-white/50 text-sm mb-6">
                {skuCount} SKUs analyzed across 50 states
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <div className="text-red-400 font-bold text-xl">4</div>
                  <div className="text-white/50 text-xs mt-0.5">Critical</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 font-bold text-xl">2</div>
                  <div className="text-white/50 text-xs mt-0.5">At Risk</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-green-400 font-bold text-xl">{Math.max(skuCount - 6, 0)}</div>
                  <div className="text-white/50 text-xs mt-0.5">Compliant</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
              >
                View Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
