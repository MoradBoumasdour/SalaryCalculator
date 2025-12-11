import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// PDF styles
const styles = StyleSheet.create({
  page: { padding: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, color: '#555' },
  value: { fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 18, marginBottom: 12 },
});

function SalaryPdf({
  results,
  fmt,
  months,
}: {
  results: any;
  fmt: (v: number) => string;
  months: number;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Calcolo da RAL a Netto ({months} mensilità)</Text>

        <View>
          {[
            ["RAL Lorda", results.ral],
            ["Contributi INPS", results.inps],
            ["Reddito imponibile", results.taxable],
            ["IRPEF", results.irpef],
            ["Netto annuo", results.netAnnual],
            [`Netto mensile (${months} mesi)`, results.netMonthly]
          ].map(([label, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{fmt(value as number)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export default function Calculator() {
  const [ral, setRal] = useState<number>(35000);
  const [results, setResults] = useState<any>(null);
  const [months, setMonths] = useState<number>(13);
  const [isClient, setIsClient] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => setIsClient(true), []);

  const fmt = (v: number) =>
    v.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

  // CALCOLO NETTO
  function calculate(ralValue: number, m: number) {
    const safeRal = Number.isFinite(ralValue) ? ralValue : 0;
    const inpsRate = 0.0949;
    const inps = safeRal * inpsRate;
    const taxable = safeRal - inps;
    const irpef = taxable * 0.25;
    const netAnnual = safeRal - inps - irpef;
    const netMonthly = netAnnual / m;

    return { ral: safeRal, inps, taxable, irpef, netAnnual, netMonthly };
  }

  useEffect(() => {
    setResults(calculate(ral, months));
  }, [ral, months]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Calcolatore RAL → Netto</h1>
          <p className="text-gray-500 mt-2">Inserisci la tua RAL per ottenere il netto mensile e annuale.</p>
        </div>

        {/* Input + buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">

          {/* RAL input */}
          <input
            type="number"
            value={Number.isFinite(ral) ? ral : ""}
            onChange={(e) => setRal(e.target.value === "" ? 0 : parseFloat(e.target.value))}
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label="Inserisci RAL"
          />

          {/* Toggle mensilità */}
          <div className="flex items-center gap-3">
            <label className="font-medium text-gray-700">Mensilità</label>
            <select
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-white shadow-sm"
            >
              <option value={13}>13 mesi</option>
              <option value={14}>14 mesi</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setResults(calculate(ral, months))}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            >
              Calcola
            </button>

            {isClient && results && (
              <PDFDownloadLink
                document={<SalaryPdf results={results} fmt={fmt} months={months} />}
                fileName={`calcolo-${results.ral}.pdf`}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 shadow flex items-center gap-2"
              >
                {!imgError ? (
                  <img
                    src="/pdf.svg"
                    alt="PDF"
                    className="w-2 h-2"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="font-semibold text-sm">PDF</span>
                )}
                <span className="hidden sm:inline">Scarica PDF</span>
              </PDFDownloadLink>
            )}
          </div>
        </div>

        {/* Results */}
        {results ? (
          <div className="mx-auto max-w-xl bg-gray-50 rounded-lg shadow divide-y">
            {[
              ["RAL Lorda", results.ral],
              ["Contributi INPS", results.inps],
              ["Reddito imponibile", results.taxable],
              ["IRPEF", results.irpef],
              ["Netto annuo", results.netAnnual],
              [`Netto mensile (${months} mesi)`, results.netMonthly],
            ].map(([label, value]) => (
              <div className="px-4 py-4 grid grid-cols-2 items-center" key={label}>
                <span className="text-gray-600">{label}</span>
                <span className="text-right font-semibold">{fmt(value as number)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Inserisci una RAL per vedere i risultati.</p>
        )}
      </div>
    </div>
  );
}
