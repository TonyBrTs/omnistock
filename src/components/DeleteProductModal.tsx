'use client';

import React, { useState } from 'react';
import { SupermarketProductRow } from '@/types/supermarket';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SupermarketProductRow | null;
  onProductDeleted: (message: string) => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo eliminar el producto');
      }

      onProductDeleted(`Se eliminó el producto "${product.name}" del catálogo.`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between rounded-t-2xl bg-white dark:bg-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#991B1B] dark:text-red-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              ¿Eliminar este producto?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 text-xs bg-[#FEE2E2] dark:bg-red-950/40 text-[#991B1B] dark:text-red-300 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-[#991B1B] dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#991B1B] dark:text-red-300">
                Esta acción no se puede deshacer
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Al borrar este producto se eliminarán también sus lotes asociados del inventario.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Producto:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Código de barras:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{product.barcodeEan13}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Existencias actuales:</span>
              <span className="font-bold text-[#991B1B] dark:text-red-400">{product.stockQuantity} {product.baseUom}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7f1d1d] text-white text-xs font-bold tracking-wide shadow-sm transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Eliminando...' : 'Sí, Eliminar Producto'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
