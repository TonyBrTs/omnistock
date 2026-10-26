'use client';

import React, { useState } from 'react';
import { SupermarketProductRow } from '@/types/supermarket';
import { X } from 'lucide-react';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';

interface ReceiveBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: SupermarketProductRow[];
  onBatchReceived: (message: string) => void;
}

export const ReceiveBatchModal: React.FC<ReceiveBatchModalProps> = ({
  isOpen,
  onClose,
  products,
  onBatchReceived,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState<number>(24);
  const [unitCost, setUnitCost] = useState<number>(20);
  const [invoice, setInvoice] = useState('');
  const [locationId, setLocationId] = useState('loc-cold');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const productOptions: SelectOption[] = products.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: `Código: ${p.barcodeEan13} · Departamento: ${p.department}`,
    badge: `${p.stockQuantity} en stock`,
  }));

  const locationOptions: SelectOption[] = [
    { value: 'loc-cold', label: 'En el Refrigerador', sublabel: 'Lácteos, carnes, embutidos y frescos' },
    { value: 'loc-main', label: 'En el Estante / Bodega', sublabel: 'Secos, abarrotes, harinas y enlatados' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          locationId,
          batchNumber: batchNumber.trim(),
          expirationDate,
          quantity: Number(quantity),
          unitCost: Number(unitCost),
          supplierInvoice: invoice.trim(),
          operatorName: 'Encargado de Tienda',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ? JSON.stringify(data.error) : 'Hubo un error al guardar');
      }

      onBatchReceived('¡Listo! Se guardó la mercancía nueva.');
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
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Recepción de Mercancía</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Ingreso de producto con número de lote y caducidad.</p>
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
              Producto
            </label>
            <CustomSelect
              value={selectedProductId}
              onChange={setSelectedProductId}
              options={productOptions}
              placeholder="Seleccionar producto..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Número de Lote
              </label>
              <input
                type="text"
                placeholder="Ej: LOTE-24A"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 shadow-xs focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#008767]/20 dark:focus:ring-emerald-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Fecha de Vencimiento
              </label>
              <CustomDatePicker
                value={expirationDate}
                onChange={setExpirationDate}
                placeholder="Elegir fecha..."
                align="right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 shadow-xs focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#008767]/20 dark:focus:ring-emerald-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Costo Unitario ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 shadow-xs focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#008767]/20 dark:focus:ring-emerald-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Ubicación
              </label>
              <CustomSelect
                value={locationId}
                onChange={setLocationId}
                options={locationOptions}
                placeholder="Lugar de almacenaje..."
                align="right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Folio de Factura o Remisión
            </label>
            <input
              type="text"
              placeholder="Ej: Remisión #4081"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
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
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#006e54] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold tracking-wide shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Guardando...' : 'Guardar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
