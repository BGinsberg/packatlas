"use client";

import { useState, useRef } from "react";

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

  function downloadTemplate() {
    const csv = [
      "sku_id,name,category,material,weight_grams,states",
      "SKU-001,Example Product,Snack Food,Virgin HDPE Plastic,12,CA|NY|TX",
      "SKU-002,Another Product,Beverage,rPET (30% Recycled),22,CA|OR|ME",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packatlas_sku_template.csv";
    a.click();
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
                <div className="text-white/40 text-sm">Supports .CSV, .XLSX, .XLS</div>
              </div>

              {/* Template */}
              <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <div>
                  <div className="text-white text-sm font-medium">Download Template</div>
                  <div className="text-white/40 text-xs">Pre-formatted CSV with required columns</div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Download →
                </button>
              </div>

              {/* Required columns */}
              <div className="mt-4">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Required Columns</div>
                <div className="flex flex-wrap gap-2">
                  {["sku_id", "name", "category", "material", "weight_grams", "states"].map((col) => (
                    <span key={col} className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded font-mono">
                      {col}
                    </span>
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
