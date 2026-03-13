"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { skus } from "@/lib/data";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a8a",
  },
  headerLeft: {},
  logo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    marginBottom: 2,
  },
  logoSub: {
    fontSize: 8,
    color: "#6b7280",
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  filingTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    marginBottom: 3,
  },
  filingMeta: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  infoCell: {
    width: "31%",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 3,
    padding: 6,
  },
  infoCellLabel: {
    fontSize: 7,
    color: "#9ca3af",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  infoCellValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e3a8a",
    padding: 6,
    borderRadius: 2,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 8,
    color: "#374151",
  },
  tableCellBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  tableCellRed: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#1e3a8a",
    padding: 8,
    borderRadius: 2,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    flex: 1,
  },
  totalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#fbbf24",
  },
  certBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    padding: 10,
  },
  certTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  certText: {
    fontSize: 7.5,
    color: "#374151",
    lineHeight: 1.5,
  },
  signatureRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 24,
  },
  signatureBlock: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 7,
    color: "#9ca3af",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
  },
});

interface ReportData {
  id: string;
  state: string;
  abbr: string;
  regulation: string;
  dueDate: string;
  filingPeriod: string;
  skusAffected: number;
  totalObligation: number;
}

function EPRDocument({ report }: { report: ReportData }) {
  const coveredSKUs = skus.filter((s) => s.riskLevel === "red").slice(0, report.skusAffected);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>PACKATLAS</Text>
            <Text style={styles.logoSub}>AUTOMATED COMPLIANCE PLATFORM</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.filingTitle}>EPR COMPLIANCE FILING</Text>
            <Text style={styles.filingMeta}>{report.state} — {report.filingPeriod}</Text>
            <Text style={styles.filingMeta}>Filing ID: NF-{report.id}-{Date.now().toString().slice(-6)}</Text>
            <Text style={styles.filingMeta}>Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
          </View>
        </View>

        {/* Regulatory Reference */}
        <View style={{ backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 3, padding: 8, marginBottom: 4 }}>
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e3a8a", marginBottom: 2 }}>Applicable Regulation</Text>
          <Text style={{ fontSize: 8, color: "#374151" }}>{report.regulation}</Text>
          <Text style={{ fontSize: 7.5, color: "#6b7280", marginTop: 2 }}>Filing Due: {report.dueDate} · Program Administrator: {report.abbr} Department of Environmental Quality</Text>
        </View>

        {/* Producer Info */}
        <Text style={styles.sectionTitle}>Section 1 — Producer Information</Text>
        <View style={styles.infoGrid}>
          {[
            ["Legal Entity Name", "PackAtlas Demo Co., LLC"],
            ["EIN / Tax ID", "XX-XXXXXXX"],
            ["Mailing Address", "123 Commerce Ave, Suite 400"],
            ["City, State, ZIP", "New York, NY 10001"],
            ["Contact Name", "Compliance Officer"],
            ["Contact Email", "compliance@packatlasdemo.com"],
            ["Phone", "(212) 555-0100"],
            ["Program Registration #", `${report.abbr}-EPR-2025-00847`],
            ["PRO Membership", "National Packaging Coalition"],
          ].map(([label, value]) => (
            <View key={label} style={styles.infoCell}>
              <Text style={styles.infoCellLabel}>{label}</Text>
              <Text style={styles.infoCellValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Covered Packaging */}
        <Text style={styles.sectionTitle}>Section 2 — Covered Packaging Units</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>SKU ID</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Product Name</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Material Type</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.7, textAlign: "right" }]}>Wt (g)</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: "right" }]}>Units Sold</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: "right" }]}>Total Wt (kg)</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>EPR Fee</Text>
        </View>
        {coveredSKUs.map((sku, i) => {
          const units = 50000;
          const totalWeightKg = ((sku.weightGrams * units) / 1000).toFixed(1);
          const fee = Math.round(sku.eprObligation / report.skusAffected);
          return (
            <View key={sku.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{sku.id}</Text>
              <Text style={[styles.tableCellBold, { flex: 2.5 }]}>{sku.name}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{sku.material}</Text>
              <Text style={[styles.tableCell, { flex: 0.7, textAlign: "right" }]}>{sku.weightGrams}</Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: "right" }]}>{units.toLocaleString()}</Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: "right" }]}>{totalWeightKg}</Text>
              <Text style={[styles.tableCellRed, { flex: 1, textAlign: "right" }]}>${fee.toLocaleString()}</Text>
            </View>
          );
        })}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL EPR OBLIGATION — {report.state.toUpperCase()} {report.filingPeriod}</Text>
          <Text style={styles.totalValue}>${report.totalObligation.toLocaleString()}</Text>
        </View>

        {/* Certification */}
        <View style={styles.certBox}>
          <Text style={styles.certTitle}>Certification Statement</Text>
          <Text style={styles.certText}>
            I, the undersigned authorized representative of PackAtlas Demo Co., LLC, certify under penalty of law that the information provided in this Extended Producer Responsibility filing is true, accurate, and complete to the best of my knowledge. I understand that knowingly submitting false or misleading information is a violation of applicable state law and may result in civil and/or criminal penalties. This filing was prepared using Nightfly Intelligence automated compliance software and has been reviewed by qualified compliance personnel prior to submission.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={[styles.signatureLabel, { marginBottom: 16 }]}> </Text>
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={[styles.signatureLabel, { marginBottom: 16 }]}> </Text>
            <Text style={styles.signatureLabel}>Printed Name & Title</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={[styles.signatureLabel, { marginBottom: 16 }]}> </Text>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CONFIDENTIAL — PackAtlas · Automated EPR Compliance Filing</Text>
          <Text style={styles.footerText}>Filing ID: NF-{report.id} · {report.filingPeriod}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function PDFDownloadButton({ report }: { report: ReportData }) {
  return (
    <PDFDownloadLink
      document={<EPRDocument report={report} />}
      fileName={`PackAtlas_EPR_Filing_${report.abbr}_${report.filingPeriod.replace(" ", "")}.pdf`}
    >
      {({ loading }) => (
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          disabled={loading}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {loading ? "Building PDF..." : "Download PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
