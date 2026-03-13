import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <NavBar active="home" />

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-32 pb-20 text-center">
        <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
          EPR & Packaging Compliance
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Your operating system for<br />
          <span className="text-blue-400">packaging compliance</span>
        </h1>
        <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10">
          Upload your SKU data. PackAtlas automatically calculates EPR obligations, flags compliance risks, and generates regulatory filings across all 50 states.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            View Demo Dashboard
          </Link>
          <Link
            href="/skus"
            className="border border-white/20 hover:border-white/40 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            View SKUs
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-8 pb-20 grid grid-cols-3 gap-6">
        {[
          { value: "7", label: "Active EPR States" },
          { value: "50", label: "States Monitored" },
          { value: "100%", label: "Automated Filings" },
        ].map((stat) => (
          <div key={stat.label} className="border border-white/10 rounded-xl p-6 text-center bg-white/5">
            <div className="text-4xl font-bold text-blue-400 mb-2">{stat.value}</div>
            <div className="text-white/60 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
