import React, { useState, useEffect } from 'react';
import { aliquoteRegioni2025 } from "../lib/aliquoteRegioni2025";
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
            ["Add. Regionale", results.addReg],
            ["Add. Comunale", results.addCom],
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
  const [regione, setRegione] = useState<string>("Lombardia");
  const [addRegionale, setAddRegionale] = useState<number>(aliquoteRegioni2025["Lombardia"]);
  const [addComunale, setAddComunale] = useState<number>(0.8); // media Italia
  const [isClient, setIsClient] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => setIsClient(true), []);

  const fmt = (v: number) =>
    v.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

  // Calcolo IRPEF con scaglioni 2025
  function calcolaIrpef(imponibile: number): number {
    
    let irpef = 0;
    
    if (imponibile <= 28000) {
      irpef = imponibile * 0.23;
    } else if (imponibile <= 50000) {
      irpef = 28000 * 0.23 + (imponibile - 28000) * 0.35;
    } else {
      irpef = 28000 * 0.23 + 22000 * 0.35 + (imponibile - 50000) * 0.43;
    }
    
    return irpef;
  }

  // CALCOLO NETTO
  function calculate(ralValue: number, m: number, regionale: number, comunale: number) {
    const safeRal = Number.isFinite(ralValue) ? ralValue : 0;
    const inpsRate = 0.0949;
    const inps = safeRal * inpsRate;
    const taxable = safeRal - inps;
    const irpef = calcolaIrpef(taxable);
    
    // Addizionali regionali e comunali (calcolate sull'imponibile)
    const addReg = taxable * (regionale / 100);
    const addCom = taxable * (comunale / 100);
    
    const netAnnual = safeRal - inps - irpef - addReg - addCom;
    const netMonthly = netAnnual / m;

    return { ral: safeRal, inps, taxable, irpef, addReg, addCom, netAnnual, netMonthly };
  }

  // Aggiorna aliquota regionale quando cambia la regione
  useEffect(() => {
    setAddRegionale(aliquoteRegioni2025[regione] ?? 1.73);
  }, [regione]);

  useEffect(() => {
    setResults(calculate(ral, months, addRegionale, addComunale));
  }, [ral, months, addRegionale, addComunale]);

  return (
    <div className="min-h-screen py-16 px-6 md:px-8">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Card principale */}
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden p-8 md:p-10">
          
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-700 text-white py-8 px-8">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-white">Calcolatore RAL → Netto</h1>
            <p className="text-indigo-200 dark:text-indigo-100 text-center mt-2">Inserisci la tua RAL per ottenere il netto mensile e annuale</p>
          </div>

            
            {/* Input section */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl pb-12 ">
              <div className="flex justify-evenly items-end gap-3 flex-wrap">
                
                {/* RAL input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">RAL Annua (€)</label>
                  <input
                    type="number"
                    value={Number.isFinite(ral) ? ral : ""}
                    onChange={(e) => setRal(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                    className="w-28 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    aria-label="Inserisci RAL"
                  />
                </div>


                {/* Regione selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-12">Regione</label>
                  <select
                    value={regione}
                    onChange={e => setRegione(e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {Object.keys(aliquoteRegioni2025).map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                {/* Toggle mensilità */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Mensilità</label>
                  <select
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    className="w-28 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={13}>13 mesi</option>
                    <option value={14}>14 mesi</option>
                  </select>
                </div>


                {/* PDF Button */}
                {isClient && results && (
                  <PDFDownloadLink
                    document={<SalaryPdf results={results} fmt={fmt} months={months} />}
                    fileName={`calcolo-${results.ral}.pdf`}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow flex items-center gap-2 transition-colors self-end"
                  >
                    <img src="/pdf.svg" alt="PDF" className="w-5 h-5" />
                    <span>Scarica PDF</span>
                  </PDFDownloadLink>
                )}
              </div>
            </div>

            {/* Results section*/}
            <div className="pt-32">
              {results ? (
                <div className="flex justify-center mx-auto">
                  <table className="w-1/2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-slate-700">
                        <th colSpan={2} className="px-6 py-3 text-center font-semibold text-gray-700 dark:text-white border-b border-gray-300 dark:border-slate-600">
                          📊 Risultati
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["RAL Lorda", results.ral, false],
                        ["Contributi INPS (9,49%)", results.inps, true],
                        ["Reddito imponibile", results.taxable, false],
                        ["IRPEF", results.irpef, true],
                        [`Add. Regionale (${addRegionale}%)`, results.addReg, true],
                        [`Add. Comunale (${addComunale}%)`, results.addCom, true],
                        ["Netto annuo", results.netAnnual, false],
                        [`Netto mensile (${months} mesi)`, results.netMonthly, false],
                      ].map(([label, value, isDeduction]) => (
                        <tr key={label as string} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <td className="px-6 py-3 text-gray-600 dark:text-white border-b border-gray-200 dark:border-slate-700">
                            {label}
                          </td>
                          <td className={`px-6 py-3 text-right font-semibold border-b border-gray-200 dark:border-slate-700 ${isDeduction ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {isDeduction ? '- ' : ''}{fmt(value as number)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <td className="px-6 py-4 font-semibold text-indigo-700 dark:text-white">
                          💰 Netto in busta
                        </td>
                        <td className="px-6 py-4 text-right text-xl font-bold text-indigo-600 dark:text-white">
                          {fmt(results.netMonthly)}/mese
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <p>Inserisci una RAL per vedere i risultati</p>
                </div>
              )}
            </div>
          
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6">
          Calcolo indicativo · Non costituisce consulenza fiscale
        </p>
      </div>
    </div>
  );
}
