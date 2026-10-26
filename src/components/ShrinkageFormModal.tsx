'use client';

import React, { useState } from 'react';
import { SupermarketProductRow } from '@/types/supermarket';
import { X } from 'lucide-react';
import { CustomSelect, SelectOption } from './ui/CustomSelect';

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
  const [operatorName, setOperatorName] = useState('Encargado');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const productOptions: SelectOption[] = products.map((p) => ({
    value: p.batchNumber,
    label: `${p.name} · Lote ${p.batchNumber}`,
    sublabel: `Vence: ${p.expirationDate} · Departamento: ${p.department}`,
    badge: `${p.stockQuantity} ${p.baseUom}`,
    badgeColor: p.status === 'EXPIRED' ? 'bg-red-50 text-red-700 border border-red-200' : undefined,
  }));

  const reasonOptions: SelectOption[] = [
    { value: 'FECHA_CADUCADA', label: 'Ya se venció la fecha', sublabel: 'Alcanzó su fecha límite de venta' },
    { value: 'PERDIDA_CADENA_FRIO', label: 'Se calentó el refrigerador', sublabel: 'Falla eléctrica o pérdida de temperatura' },
    { value: 'RUPTURA_EMPAQUE', label: 'Bolsa o envase roto', sublabel: 'Fuga, perforación o sello abierto' },
    { value: 'DANIO_MANIPULACION', label: 'Se cayó o golpeó', sublabel: 'Accidente en pasillo o acomodo' },
    { value: 'RETIRO_SANITARIO', label: 'Vino mal de fábrica', sublabel: 'Defecto de empaque o alerta de proveedor' },
  ];

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
          notes: notes.trim() || 'Producto retirado por revisión.',
          operatorName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Hubo un error al dar de baja');
      }

      onShrinkageRecorded(`Listo: Se dio de baja el lote "${selectedBatchNumber}" de la tienda.`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-xl overflow-visible animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between rounded-t-2xl bg-white dark:bg-[#1E293B]">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Registro de Merma</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Retiro de mercancía no apta para venta por daño o caducidad.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-[#FEE2E2] dark:bg-red-950/40 text-[#991B1B] dark:text-red-300 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Producto y Lote
            </label>
            <CustomSelect
              value={selectedBatchNumber}
              onChange={setSelectedBatchNumber}
              options={productOptions}
              placeholder="Seleccionar producto a dar de baja..."
            />
          </div>

          {currentProduct && (
            <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Cantidad a retirar:</span>
                <span className="font-bold text-[#991B1B] dark:text-red-400">
                  {currentProduct.stockQuantity} {currentProduct.baseUom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Pérdida calculada:</span>
                <span className="font-extrabold text-[#991B1B] dark:text-red-400">
                  ${(currentProduct.stockQuantity * currentProduct.unitCost).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Motivo del Retiro
            </label>
            <CustomSelect
              value={reason}
              onChange={(val) => setReason(val as any)}
              options={reasonOptions}
              placeholder="Seleccionar motivo..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Empaque roto durante maniobra de acomodo."
              className="w-full px-3.5 py-2 text-sm bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Autorizado por
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7f1d1d] dark:bg-red-600 dark:hover:bg-red-700 text-white text-xs font-bold tracking-wide shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Procesando...' : 'Registrar Merma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
