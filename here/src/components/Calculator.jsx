import React, { useState, useRef, useEffect } from 'react';

export default function SalaryCalculator() {
  const [ral, setRal] = useState(35000);
  const [results, setResults] = useState(null);
  const resultsRef = useRef(null);

  // Format currency
  function fmt(v) {
    return v.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  }

  // Compute progressive IRPEF tax
  function computeIrpef(taxable) {
    const brackets = [
      { upTo: 28000, rate: 0.23 },
      { upTo: 50000, rate: 0.35 },
      { upTo: Infinity, rate: 0.43 },
    ];
    let remaining = taxable;
    let tax = 0;
    let lower = 0;
    for (const b of brackets) {
      const top = b.upTo;
      const slice = Math.max(0, Math.min(remaining, top - lower));
      tax += slice * b.rate;
      remaining -= slice;
      lower = top;
      if (remaining <= 0) break;
    }
    return Math.max(0, tax);
  }

  // Calculate salary breakdown
  function calculate(ralValue) {
    const inpsRate = 0.0949;
    const regionalRate = 0.0123;
    const municipalRate = 0.005;

    const inps = ralValue * inpsRate;
    const taxable = Math.max(0, ralValue - inps);
    const irpef = computeIrpef(taxable);
    const regional = taxable * regionalRate;
    const municipal = taxable * municipalRate;

    const netAnnual = ralValue - inps - irpef - regional - municipal;
    const netMonthly = netAnnual / 12;
    const effectiveTax = ((ralValue - netAnnual) / ralValue) || 0;

    return { ral: ralValue, inps, taxable, irpef, regional, municipal, netAnnual, netMonthly, effectiveTax };
  }

  // Handle calculate button click
  const handleCalculate = () => {
    const ralValue = parseFloat(ral || 0);
    if (isNaN(ralValue) || ralValue < 0) {
      alert('Inserisci una RAL valida');
      return;
    }
    const res = calculate(ralValue);
    setResults(res);
  };

  // Load PDF generation libraries dynamically
  async function loadPdfLibraries() {
    return new Promise((resolve, reject) => {
      const scripts = [];
      if (typeof window.html2canvas === 'undefined') {
        scripts.push({ src: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js' });
      }
      if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        scripts.push({ src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js' });
      }

      if (scripts.length === 0) {
        return resolve({ html2canvas: window.html2canvas, jspdf: window.jspdf });
      }

      let loaded = 0;
      scripts.forEach(sinfo => {
        const s = document.createElement('script');
        s.src = sinfo.src;
        s.async = true;
        s.onload = () => {
          loaded += 1;
          if (loaded === scripts.length) {
            resolve({ html2canvas: window.html2canvas, jspdf: window.jspdf });
          }
        };
        s.onerror = () => reject(new Error('Impossibile caricare librerie PDF'));
        document.head.appendChild(s);
      });
    });
  }

  // Handle PDF download
  const handleDownloadPdf = async () => {
    try {
      if (!resultsRef.current) {
        alert('Nessun risultato da scaricare');
        return;
      }

      await loadPdfLibraries();
      const ralValue = parseFloat(ral || 0);
      const filename = `salary-${isNaN(ralValue) ? 'calc' : ralValue}.pdf`;

      const canvas = await window.html2canvas(resultsRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const { jsPDF } = window.jspdf || window.jspdf || {};
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;

      const imgProps = { width: canvas.width, height: canvas.height };
      const imgRatio = imgProps.width / imgProps.height;
      const imgWidthMM = usableWidth;
      const imgHeightMM = imgWidthMM / imgRatio;

      pdf.addImage(imgData, 'PNG', margin, margin, imgWidthMM, imgHeightMM);
      pdf.save(filename);
    } catch (err) {
      console.error('Errore generazione PDF', err);
      alert('Errore durante la generazione del PDF. Riprova.');
    }
  };

  // Auto-calculate on mount
  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div
        className="rounded-lg p-6 shadow-sm"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      >
        {/* Input Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <label htmlFor="ral" className="w-full sm:w-40 font-medium" style={{ color: 'var(--text)' }}>
            Inserisci RAL (€/anno)
          </label>
          <div className="flex gap-2 items-center w-full">
            <input
              id="ral"
              type="number"
              min="0"
              step="100"
              value={ral}
              onChange={(e) => setRal(e.target.value)}
              className="w-40 sm:w-56 p-2 border rounded-md"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            />
            <button
              onClick={handleCalculate}
              className="px-4 py-2 text-white rounded-md transition"
              style={{ background: '#2563eb', border: 'none', cursor: 'pointer' }}
            >
              Calcola
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={!results}
              className="px-3 py-2 rounded-md"
              style={{
                background: 'var(--card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                cursor: results ? 'pointer' : 'not-allowed',
                opacity: results ? 1 : 0.6,
              }}
            >
              📥 PDF
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div
            ref={resultsRef}
            className="mt-4 p-4 rounded-md border"
            style={{
              background: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            aria-live="polite"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>RAL lorda</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(results.ral)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>Contributi INPS (9.49%)</span>
              <span style={{ color: 'var(--text)' }}>{fmt(results.inps)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>Reddito imponibile</span>
              <span style={{ color: 'var(--text)' }}>{fmt(results.taxable)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>IRPEF (progressivo)</span>
              <span style={{ color: 'var(--text)' }}>{fmt(results.irpef)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>Addiz. regionale</span>
              <span style={{ color: 'var(--text)' }}>{fmt(results.regional)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>Addiz. comunale</span>
              <span style={{ color: 'var(--text)' }}>{fmt(results.municipal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', marginTop: '8px', background: 'var(--card)', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Netto annuo stimato</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(results.netAnnual)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', marginTop: '8px', background: 'var(--card)', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Netto mensile stimato</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(results.netMonthly)}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '8px' }}>
              Imposta/Trattenute totali: {(results.effectiveTax * 100).toFixed(2)}% della RAL
            </div>
          </div>
        )}

        <p className="text-sm mt-3" style={{ color: 'var(--muted)' }}>
          Nota: prototipo semplificato. Le percentuali usate sono d'esempio e non sostituiscono consulenza fiscale.
        </p>
      </div>
    </div>
  );
}
