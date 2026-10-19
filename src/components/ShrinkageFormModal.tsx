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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Tirar Producto Dañado o Vencido</h2>
            <p className="text-xs text-[#64748B]">
              Saca de la tienda la mercancía que ya no sirve para que nadie la venda por error.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-[#FEE2E2] text-[#991B1B] rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              ¿Qué producto vas a tirar?
            </label>
            <CustomSelect
              value={selectedBatchNumber}
              onChange={setSelectedBatchNumber}
              options={productOptions}
              placeholder="Seleccionar producto a tirar..."
            />
          </div>

          {currentProduct && (
            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">¿Cuántos se van a la basura?</span>
                <span className="font-bold text-[#991B1B]">
                  {currentProduct.stockQuantity} {currentProduct.baseUom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dinero que se perdió:</span>
                <span className="font-extrabold text-[#991B1B]">
                  ${(currentProduct.stockQuantity * currentProduct.unitCost).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              ¿Por qué se tira?
            </label>
            <CustomSelect
              value={reason}
              onChange={(val) => setReason(val as any)}
              options={reasonOptions}
              placeholder="Seleccionar motivo..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              ¿Qué le pasó exactamente?
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Se cayó de la caja y se reventó el envase."
              className="w-full px-3.5 py-2 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              ¿Quién autoriza?
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
              className="cursor-pointer px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7f1d1d] text-white text-xs font-bold tracking-wide shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Sacando de la tienda...' : 'Confirmar y Tirar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
