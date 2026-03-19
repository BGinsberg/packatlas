import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

const MATERIAL_OPTIONS = [
  "Virgin HDPE Plastic",
  "Virgin PET Plastic",
  "PP Plastic",
  "Polystyrene Foam (EPS)",
  "Multi-layer Plastic Film",
  "LDPE Plastic Bag",
  "rPET (Recycled Plastic)",
  "rHDPE (Recycled Plastic)",
  "Other Plastic",
  "Kraft Paper / Paperboard",
  "Aluminum",
  "Glass",
  "PLA Compostable",
  "PHA Compostable",
];

const CATEGORIES = [
  "Snack Food", "Beverage", "Food Service", "Fresh Produce",
  "Dairy", "Deli / Meat", "Household", "Pet Food", "Personal Care", "Retail", "Other",
];

export async function GET() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PackAtlas";
  wb.created = new Date();

  // Hidden reference sheet for dropdown validation
  const ref = wb.addWorksheet("Reference");
  (ref as unknown as { state: string }).state = "veryHidden";
  MATERIAL_OPTIONS.forEach((m, i) => { ref.getCell(i + 1, 1).value = m; });
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
    ["Sparkling Water 12oz",  "Beverage",   "Virgin PET Plastic",         500000, "CA;NY;TX;FL;WA"],
    ["Snack Bar Wrapper",     "Snack Food", "Multi-layer Plastic Film",    250000, "CA;OR;ME;CO;MN"],
    ["Paper Grocery Bag",     "Retail",     "Kraft Paper / Paperboard",    100000, "All"],
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

  // Rows 7–1000 — empty user rows with dropdowns
  for (let r = 7; r <= 1000; r++) {
    const bg = r % 2 === 0 ? "FFF9FAFB" : "FFFFFFFF";
    for (let c = 1; c <= 5; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.font = { size: 10 };
      cell.alignment = { vertical: "middle", indent: 1 };
    }
    ws.getRow(r).height = 22;
  }

  // Dropdowns for all data rows (examples + user rows): cols B and C, rows 4–1000
  for (let r = 4; r <= 1000; r++) {
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

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="packatlas_sku_template.xlsx"',
    },
  });
}
