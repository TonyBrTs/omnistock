'use client';

import React from 'react';
import { SupermarketProductRow } from '@/types/supermarket';
import { Printer, X } from 'lucide-react';

interface PriceTagGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: SupermarketProductRow[];
}

export const PriceTagGeneratorModal: React.FC<PriceTagGeneratorModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between no-print">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Etiquetas de Precios para los Estantes
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Imprime las tarjetas con el precio y código de barras para pegarlas frente al producto.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="cursor-pointer px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#006e54] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Mandar a Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rejilla de Etiquetas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-[#1E293B] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 shadow-xs flex flex-col justify-between h-48 print:bg-white print:border-black print:shadow-none"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                        {product.department} · {product.brand}
                      </span>
                      <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white print:text-black line-clamp-2 leading-tight mt-0.5">
                        {product.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 shrink-0">
                      {product.aisleLocation}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400">
                    <span>Presentación: <strong className="text-slate-800 dark:text-slate-200">{product.packEquivalence}</strong></span>
                    {product.pluCode && (
                      <span className="px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold rounded">
                        Código Báscula: {product.pluCode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-end justify-between">
                  <div>
                    {/* Código de barras simulado */}
                    <div className="h-6 w-36 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px)] dark:bg-[repeating-linear-gradient(90deg,#fff,#fff_2px,transparent_2px,transparent_4px)] print:bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px)] rounded-xs" />
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 block mt-0.5">
                      {product.barcodeEan13}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">
                      Lote: {product.batchNumber} (Vence: {product.expirationDate})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">PRECIO CON IVA</span>
                    <span className="text-2xl font-black text-[#008767] dark:text-emerald-400 print:text-black tracking-tight">
                      ${product.salePrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      por {product.baseUom}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] dark:border-slate-700 bg-[#FFFFFF] dark:bg-[#1E293B] flex justify-between items-center text-xs text-[#64748B] dark:text-slate-400 no-print">
          <span>{products.length} etiquetas listas para imprimir</span>
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
