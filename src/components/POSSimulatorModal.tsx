'use client';

import React, { useState } from 'react';
import { SupermarketProductRow } from '@/types/supermarket';

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
  const [cashierName, setCashierName] = useState('Sofía Méndez');
  const [registerNo, setRegisterNo] = useState('02');
  const [loading, setLoading] = useState(false);
  const [alertError, setAlertError] = useState<{ message: string; errorCode?: string } | null>(
    null
  );

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
        setAlertError({ message: data.message || 'Error en la venta', errorCode: data.errorCode });
        return;
      }

      onSaleCompleted(
        `Venta Exitosa: ${data.saleDetails.productName} (${data.saleDetails.quantitySold} ${currentProduct?.baseUom}) - Total: $${data.saleDetails.totalAmount.toFixed(2)} [Ticket: ${ticketFolio}]`
      );
      onClose();
    } catch (err: any) {
      setAlertError({ message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Simulador de Caja Registradora POS</h2>
            <p className="text-xs text-[#64748B]">
              Prueba de escaneo de código de barras, despacho FEFO y bloqueo de caducidad.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSale} className="p-6 space-y-4">
          {alertError && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold ${
                alertError.errorCode === 'POS_EXPIRY_BLOCK'
                  ? 'bg-[#FEE2E2] border-[#991B1B]/30 text-[#991B1B]'
                  : 'bg-[#FEF9C3] border-[#854D0E]/30 text-[#854D0E]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <span>{alertError.message}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Seleccionar Producto o Código Escaneado
            </label>
            <select
              value={selectedBarcode}
              onChange={(e) => {
                setSelectedBarcode(e.target.value);
                setAlertError(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.barcodeEan13}>
                  {p.name} · [{p.status === 'EXPIRED' ? 'CADUCADO' : `Stock: ${p.stockQuantity}`}]
                </option>
              ))}
            </select>
          </div>

          {currentProduct && (
            <div className="p-3 bg-[#F4F6F9] rounded-xl border border-[#E2E8F0] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Lote FEFO Asignado:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {currentProduct.batchNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Caducidad:</span>
                <span
                  className={`font-semibold ${
                    currentProduct.status === 'EXPIRED' ? 'text-[#991B1B]' : 'text-slate-800'
                  }`}
                >
                  {currentProduct.expirationDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Precio Unitario:</span>
                <span className="font-bold text-[#008767]">
                  ${currentProduct.salePrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Caja POS
              </label>
              <input
                type="text"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Cajero(a)
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
                required
              />
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#006e54] text-white text-xs font-semibold tracking-wide shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Cobrando...' : 'Cobrar Ticket en POS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
