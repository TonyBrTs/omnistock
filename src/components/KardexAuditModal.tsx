'use client';

import React, { useEffect, useState } from 'react';

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
  PURCHASE_RECEIPT: { label: 'Entró de Proveedor', badge: 'bg-[#DCFCE7] text-[#166534]' },
  POS_SALE: { label: 'Se Vendió en Caja', badge: 'bg-blue-50 text-blue-700' },
  SHELF_REPLENISHMENT: { label: 'Se Puso en Estante', badge: 'bg-[#FEF9C3] text-[#854D0E]' },
  SHRINKAGE_EXPIRED: { label: 'Se Tiró (Merma)', badge: 'bg-[#FEE2E2] text-[#991B1B]' },
  INVENTORY_COUNT_ADJ: { label: 'Conteo Físico', badge: 'bg-purple-50 text-purple-700' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Historial de Entradas y Salidas de la Tienda
            </h2>
            <p className="text-xs text-[#64748B]">
              Aquí queda anotado todo lo que se vende, lo que llega y lo que se tira.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center py-8 text-xs text-[#64748B]">Cargando historial...</p>
          ) : movements.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#64748B]">Aún no hay movimientos registrados hoy.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F4F6F9]/60">
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">¿Cuándo pasó?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">¿Qué se hizo?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">Ticket o Factura</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">¿Quién lo hizo?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 text-right">¿Cuántos entraron/salieron?</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 text-right">¿Cuántos quedaron?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {movements.map((m) => {
                  const typeInfo = TYPE_TRANSLATIONS[m.movementType] || {
                    label: m.movementType,
                    badge: 'bg-slate-100 text-slate-700',
                  };
                  const isPositive = m.quantityDelta > 0;

                  return (
                    <tr key={m.movementId} className="hover:bg-[#F4F6F9]/60 text-xs">
                      <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
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
                      <td className="py-3 px-4 font-mono text-slate-700">{m.referenceDocument || '—'}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{m.operatorName}</td>
                      <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                        <span className={isPositive ? 'text-[#166534]' : 'text-[#991B1B]'}>
                          {isPositive ? `+${m.quantityDelta}` : m.quantityDelta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#0F172A] whitespace-nowrap">
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
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F4F6F9]/40 flex justify-between items-center text-xs text-[#64748B]">
          <span>Total de registros anotados: {movements.length}</span>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#0F172A] font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
