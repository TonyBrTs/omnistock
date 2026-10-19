'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuditSummary {
  totalSkus: number;
  totalUnits: number;
  valuationCost: number;
  valuationSale: number;
  expectedProfit: number;
  activeBatchesCount: number;
  expiredBatchesCount: number;
  lowStockBatchesCount: number;
  totalLedgerTransactions: number;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose }) => {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/audit/report')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSummary(data.summary);
            setCsvContent(data.csvDownloadPayload);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_tienda_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              ¿Cuánto Dinero Hay en la Tienda? (Reporte de Ganancias)
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Resumen de cuánto nos costó la mercancía y cuánto ganaremos al venderla toda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <p className="text-center py-8 text-xs text-[#64748B] dark:text-slate-400">Calculando las cuentas...</p>
          ) : summary ? (
            <>
              {/* Cifras principales */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Nos costó</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    ${summary.valuationCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Dinero invertido</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Vamos a cobrar</span>
                  <span className="text-xl font-black text-[#008767] dark:text-emerald-400 mt-1 block">
                    ${summary.valuationSale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Ventas estimadas</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Ganancia limpia</span>
                  <span className="text-xl font-black text-[#0D5C75] dark:text-cyan-400 mt-1 block">
                    ${summary.expectedProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Utilidad esperada</span>
                </div>
              </div>

              {/* Resumen de cantidades */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0F172A]/50 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Tipos de productos diferentes:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{summary.totalSkus} artículos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Total de piezas o kilos en la tienda:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{summary.totalUnits} piezas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Lotes activos:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{summary.activeBatchesCount} lotes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Productos que ya se van a acabar:</span>
                  <span className="font-bold text-[#854D0E] dark:text-amber-400">{summary.lowStockBatchesCount} productos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Productos vencidos (bloqueados):</span>
                  <span className="font-bold text-[#991B1B] dark:text-red-400">{summary.expiredBatchesCount} lotes</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">Total de ventas y entradas registradas:</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">{summary.totalLedgerTransactions} movimientos</span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-slate-700 bg-[#F4F6F9]/40 dark:bg-slate-900/40 flex justify-between items-center text-xs">
          <button
            onClick={handleDownloadCsv}
            className="cursor-pointer px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#006e54] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar en Excel (CSV)</span>
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
