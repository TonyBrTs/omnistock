'use client';

import React, { useState, useEffect } from 'react';
import { SupermarketProductRow } from '@/types/supermarket';
import { AlertCircle, X } from 'lucide-react';
import { CustomSelect, SelectOption } from './ui/CustomSelect';

interface POSSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: SupermarketProductRow[];
  onSaleCompleted: (message: string) => void;
}

export const POSSimulatorModal: React.FC<POSSimulatorModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaleCompleted,
}) => {
  const [selectedBarcode, setSelectedBarcode] = useState(products[0]?.barcodeEan13 || '');
  const [quantity, setQuantity] = useState(1);
  const [cashierName, setCashierName] = useState('Sofía');
  const [registerNo, setRegisterNo] = useState('1');
  const [loading, setLoading] = useState(false);
  const [alertError, setAlertError] = useState<{ message: string; errorCode?: string } | null>(
    null
  );

  useEffect(() => {
    if (isOpen && products.length > 0) {
      if (!selectedBarcode || !products.some((p) => p.barcodeEan13 === selectedBarcode)) {
        setSelectedBarcode(products[0].barcodeEan13);
      }
      setAlertError(null);
    }
  }, [isOpen, products, selectedBarcode]);

  const productOptions: SelectOption[] = products.map((p) => ({
    value: p.barcodeEan13,
    label: p.name,
    sublabel: `Precio: $${p.salePrice.toFixed(2)} · Departamento: ${p.department}`,
    badge: p.status === 'EXPIRED' ? 'VENCIDO' : `${p.stockQuantity} disponibles`,
    badgeColor: p.status === 'EXPIRED' ? 'bg-red-50 text-red-700 border border-red-200' : undefined,
  }));

  if (!isOpen) return null;

  const currentProduct = products.find(
    (p) => p.barcodeEan13 === selectedBarcode || p.sku === selectedBarcode
  );

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertError(null);

    const ticketFolio = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch('/api/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: selectedBarcode,
          quantity: Number(quantity),
          cashierName,
          registerNo,
          ticketFolio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertError({
          message:
            data.errorCode === 'POS_EXPIRY_BLOCK'
              ? `Bloqueo FEFO: El producto "${currentProduct?.name}" está caducado (${currentProduct?.expirationDate}). Venta no autorizada. Retirar lote a merma.`
              : data.message || 'No se pudo procesar la venta',
          errorCode: data.errorCode,
        });
        return;
      }

      onSaleCompleted(
        `Venta registrada: ${data.saleDetails.productName} (${data.saleDetails.quantitySold} ${currentProduct?.baseUom}) - Total: $${data.saleDetails.totalAmount.toFixed(2)}`
      );
      onClose();
    } catch (err: any) {
      setAlertError({ message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-xl overflow-visible animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between rounded-t-2xl bg-white dark:bg-[#1E293B]">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Cobro en Caja</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Simulador de punto de venta. Valida inventario y bloquea artículos vencidos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSale} className="p-6 space-y-4">
          {alertError && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold ${
                alertError.errorCode === 'POS_EXPIRY_BLOCK'
                  ? 'bg-[#FEE2E2] dark:bg-red-950/40 border-[#991B1B]/30 dark:border-red-900/50 text-[#991B1B] dark:text-red-300'
                  : 'bg-[#FEF9C3] dark:bg-amber-950/40 border-[#854D0E]/30 dark:border-amber-900/50 text-[#854D0E] dark:text-amber-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{alertError.message}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Producto o Código
            </label>
            <CustomSelect
              value={selectedBarcode}
              onChange={(val) => {
                setSelectedBarcode(val);
                setAlertError(null);
              }}
              options={productOptions}
              placeholder="Seleccionar producto a cobrar..."
            />
          </div>

          {currentProduct && (
            <div className="p-3 bg-[#F4F6F9] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Lote a entregar:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {currentProduct.batchNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fecha de Vencimiento:</span>
                <span
                  className={`font-bold ${
                    currentProduct.status === 'EXPIRED' ? 'text-[#991B1B] dark:text-red-400' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {currentProduct.expirationDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Precio Unitario:</span>
                <span className="font-extrabold text-[#008767] dark:text-emerald-400">
                  ${currentProduct.salePrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Número de Caja
              </label>
              <input
                type="text"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Cajero(a)
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
                required
              />
            </div>
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
              {loading ? 'Procesando...' : 'Registrar Cobro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
