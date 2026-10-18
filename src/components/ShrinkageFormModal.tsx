'use client';

import React, { useState } from 'react';
import { SupermarketProductRow } from '@/types/supermarket';

interface ShrinkageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: SupermarketProductRow[];
  onShrinkageRecorded: (message: string) => void;
}

export const ShrinkageFormModal: React.FC<ShrinkageFormModalProps> = ({
  isOpen,
  onClose,
  products,
  onShrinkageRecorded,
}) => {
  const [selectedBatchNumber, setSelectedBatchNumber] = useState(products[0]?.batchNumber || '');
  const [reason, setReason] = useState<
    'FECHA_CADUCADA' | 'RUPTURA_EMPAQUE' | 'PERDIDA_CADENA_FRIO' | 'DANIO_MANIPULACION' | 'RETIRO_SANITARIO'
  >('FECHA_CADUCADA');
  const [notes, setNotes] = useState('');
  const [operatorName, setOperatorName] = useState('Auditor de Mermas');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.batchNumber === selectedBatchNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/shrinkage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchNumber: selectedBatchNumber,
          reason,
          notes: notes.trim() || 'Merma declarada por revisión visual en piso.',
          operatorName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar merma');
      }

      onShrinkageRecorded(data.message);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Acta de Baja por Merma / Caducidad</h2>
            <p className="text-xs text-[#64748B]">
              Retiro oficial de producto de góndola con asiento contable de pérdida.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-[#FEE2E2] text-[#991B1B] rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Seleccionar Lote a Dar de Baja
            </label>
            <select
              value={selectedBatchNumber}
              onChange={(e) => setSelectedBatchNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.batchNumber}>
                  {p.name} · [{p.batchNumber} - Vence: {p.expirationDate}] · Stock: {p.stockQuantity} {p.baseUom}
                </option>
              ))}
            </select>
          </div>

          {currentProduct && (
            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Stock a Destruir / Retirar:</span>
                <span className="font-bold text-[#991B1B]">
                  {currentProduct.stockQuantity} {currentProduct.baseUom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Impacto a Costo Total:</span>
                <span className="font-bold text-[#991B1B]">
                  ${(currentProduct.stockQuantity * currentProduct.unitCost).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Causa de la Merma
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
            >
              <option value="FECHA_CADUCADA">Fecha de Caducidad Cumplida</option>
              <option value="PERDIDA_CADENA_FRIO">Pérdida de Temperatura / Cadena de Frío</option>
              <option value="RUPTURA_EMPAQUE">Empaque Dañado / Roto</option>
              <option value="DANIO_MANIPULACION">Daño por Manipulación o Caída</option>
              <option value="RETIRO_SANITARIO">Retiro Sanitario / Alerta Epidemiológica</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Observaciones del Dictamen
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Lote vencido detectado en recorrido matutino de pasillo 2."
              className="w-full px-3.5 py-2 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Responsable de Auditoría
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7f1d1d] text-white text-xs font-semibold tracking-wide shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando Baja...' : 'Dar de Baja a Merma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
