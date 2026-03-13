"use client";

import { useState } from "react";
import Link from "next/link";
import UploadModal from "./UploadModal";

interface Props {
  active: "home" | "dashboard" | "skus" | "reports" | "compare" | "regulations" | "other";
}

export default function NavBar({ active }: Props) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="text-xl font-bold tracking-tight text-white">PackAtlas</span>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className={active === "dashboard" ? "text-white font-medium" : "text-white/60 hover:text-white transition-colors"}>Dashboard</Link>
          <Link href="/skus" className={active === "skus" ? "text-white font-medium" : "text-white/60 hover:text-white transition-colors"}>SKUs</Link>
          <Link href="/regulations" className={active === "regulations" ? "text-white font-medium" : "text-white/60 hover:text-white transition-colors"}>Regulations</Link>
          <Link href="/reports" className={active === "reports" ? "text-white font-medium" : "text-white/60 hover:text-white transition-colors"}>Reports</Link>
          <Link href="/compare" className={active === "compare" ? "text-white font-medium" : "text-white/60 hover:text-white transition-colors"}>Compare</Link>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Upload SKUs
        </button>
      </nav>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
