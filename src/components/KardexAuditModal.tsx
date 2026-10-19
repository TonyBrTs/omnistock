'use client';

import React, { useEffect, useState } from 'react';

import { X } from 'lucide-react';

interface KardexRecord {
  movementId: string;
  productId: string;
  batchId: string;
  locationId: string;
  movementType: string;
  quantityDelta: number;
  balanceAfter: number;
  unitCostSnapshot: number;
  referenceDocument?: string;
  operatorName: string;
  notes?: string;
  occurredAt: string;
}

interface KardexAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_TRANSLATIONS: Record<string, { label: string; badge: string }> = {
  PURCHASE_RECEIPT: { label: 'Entró de Proveedor', badge: 'bg-[#DCFCE7] dark:bg-emerald-950/70 text-[#166534] dark:text-emerald-300' },
  POS_SALE: { label: 'Se Vendió en Caja', badge: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300' },
  SHELF_REPLENISHMENT: { label: 'Se Puso en Estante', badge: 'bg-[#FEF9C3] dark:bg-amber-950/70 text-[#854D0E] dark:text-amber-300' },
  SHRINKAGE_EXPIRED: { label: 'Se Tiró (Merma)', badge: 'bg-[#FEE2E2] dark:bg-red-950/70 text-[#991B1B] dark:text-red-300' },
  INVENTORY_COUNT_ADJ: { label: 'Conteo Físico', badge: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300' },
};

export const KardexAuditModal: React.FC<KardexAuditModalProps> = ({ isOpen, onClose }) => {
  const [movements, setMovements] = useState<KardexRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/movements')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMovements(data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Historial de Entradas y Salidas de la Tienda
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Aquí queda anotado todo lo que se vende, lo que llega y lo que se tira.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center py-8 text-xs text-[#64748B] dark:text-slate-400">Cargando historial...</p>
          ) : movements.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#64748B] dark:text-slate-400">Aún no hay movimientos registrados hoy.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-slate-700 bg-[#F4F6F9]/60 dark:bg-slate-900/60">
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">¿Cuándo pasó?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">¿Qué se hizo?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Ticket o Factura</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">¿Quién lo hizo?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-right">¿Cuántos entraron/salieron?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-right">¿Cuántos quedaron?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                {movements.map((m) => {
                  const typeInfo = TYPE_TRANSLATIONS[m.movementType] || {
                    label: m.movementType,
                    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                  };
                  const isPositive = m.quantityDelta > 0;

                  return (
                    <tr key={m.movementId} className="hover:bg-[#F4F6F9]/60 dark:hover:bg-slate-800/60 text-xs">
                      <td className="py-3 px-4 text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                        {new Date(m.occurredAt).toLocaleString('es-MX', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{m.referenceDocument || '—'}</td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{m.operatorName}</td>
                      <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                        <span className={isPositive ? 'text-[#166534] dark:text-emerald-400' : 'text-[#991B1B] dark:text-red-400'}>
                          {isPositive ? `+${m.quantityDelta}` : m.quantityDelta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#0F172A] dark:text-white whitespace-nowrap">
                        {m.balanceAfter} piezas
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] dark:border-slate-700 bg-[#F4F6F9]/40 dark:bg-slate-900/40 flex justify-between items-center text-xs text-[#64748B] dark:text-slate-400">
          <span>Total de registros anotados: {movements.length}</span>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
