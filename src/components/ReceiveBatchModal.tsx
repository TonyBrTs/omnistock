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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Meter Mercancía Nueva a la Tienda</h2>
            <p className="text-xs text-[#64748B]">Registra lo que llegó del proveedor con su fecha de vencimiento</p>
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
              ¿Qué producto llegó?
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Número de Lote
              </label>
              <input
                type="text"
                placeholder="Ej: LOTE-24A"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] shadow-xs focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                ¿Cuándo Vence? (Calendario)
              </label>
              <CustomDatePicker
                value={expirationDate}
                onChange={setExpirationDate}
                placeholder="Elegir fecha de vencimiento..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                ¿Cuántos llegaron?
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] shadow-xs focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Costo por pieza ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] shadow-xs focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                ¿Dónde se guarda?
              </label>
              <CustomSelect
                value={locationId}
                onChange={setLocationId}
                options={locationOptions}
                placeholder="Lugar de almacenaje..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nota o Factura del Proveedor
            </label>
            <input
              type="text"
              placeholder="Ej: Remisión #4081"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
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
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#006e54] text-white text-xs font-bold tracking-wide shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Guardando...' : 'Guardar en Inventario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
