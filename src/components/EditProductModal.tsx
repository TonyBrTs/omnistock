'use client';

import React, { useState, useEffect } from 'react';
import { SupermarketProductRow } from '@/types/supermarket';
import { X, Pencil, Plus, Check } from 'lucide-react';
import { CustomSelect, SelectOption } from './ui/CustomSelect';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SupermarketProductRow | null;
  onProductUpdated: (message: string) => void;
}

const DEFAULT_DEPARTMENTS = [
  'Abarrotes y Despensa',
  'Lácteos y Refrigerados',
  'Carnicería y Salchichonería',
  'Frutas y Verduras',
  'Bebidas y Licores',
  'Panadería',
  'Cuidado Personal y Farmacia',
  'Limpieza y Hogar',
];

const UOM_OPTIONS: SelectOption[] = [
  { value: 'Pza', label: 'Pieza (Pza)' },
  { value: 'Kg', label: 'Kilogramo (Kg)' },
  { value: 'Litro', label: 'Litro (L)' },
  { value: 'Paq', label: 'Paquete (Paq)' },
];

const TEMP_OPTIONS: SelectOption[] = [
  { value: 'Ambiente (Seco)', label: 'Temperatura Ambiente (Seco)' },
  { value: 'Refrigerado (2°C a 6°C)', label: 'Refrigerado (2°C a 6°C)' },
  { value: 'Congelado (-18°C)', label: 'Congelador (-18°C)' },
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [department, setDepartment] = useState('Abarrotes y Despensa');
  const [departmentList, setDepartmentList] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [newDeptInput, setNewDeptInput] = useState('');

  const [baseUom, setBaseUom] = useState('Pza');
  const [storageTemp, setStorageTemp] = useState('Ambiente (Seco)');
  const [aisleLocation, setAisleLocation] = useState('');
  const [salePrice, setSalePrice] = useState<number | ''>(0);
  const [unitCost, setUnitCost] = useState<number | ''>(0);
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(10);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar lista dinámica de departamentos
  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const names = json.data.map((c: any) => c.name);
            setDepartmentList(() => {
              const currentProdDept = product?.department ? [product.department] : [];
              return Array.from(new Set([...names, ...currentProdDept]));
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '');
      const prodDept = product.department || 'Abarrotes y Despensa';
      setDepartment(prodDept);
      setDepartmentList((prev) => (prev.includes(prodDept) ? prev : [...prev, prodDept]));
      setBaseUom(product.baseUom || 'Pza');
      setStorageTemp(product.storageTemp || 'Ambiente (Seco)');
      setAisleLocation(product.aisleLocation || '');
      setSalePrice(product.salePrice ?? 0);
      setUnitCost(product.unitCost ?? 0);
      setMinStockAlert(product.minStockAlert ?? 5);
      setErrorMsg(null);
      setIsAddingNewDept(false);
      setNewDeptInput('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAddNewDepartment = () => {
    const trimmed = newDeptInput.trim();
    if (!trimmed) return;
    if (!departmentList.includes(trimmed)) {
      setDepartmentList((prev) => [...prev, trimmed]);
    }
    setDepartment(trimmed);
    setNewDeptInput('');
    setIsAddingNewDept(false);
  };

  const departmentOptions: SelectOption[] = departmentList.map((dept) => ({
    value: dept,
    label: dept,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const activeDepartment = isAddingNewDept && newDeptInput.trim() ? newDeptInput.trim() : department;

    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        department: activeDepartment,
        baseUom,
        storageTemp,
        aisleLocation: aisleLocation.trim() || 'Pasillo Principal',
        salePrice: Number(salePrice),
        unitCost: Number(unitCost),
        minStockAlert: Number(minStockAlert) || 5,
      };

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el producto');
      }

      onProductUpdated(`Producto "${name}" actualizado con éxito.`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between rounded-t-2xl bg-white dark:bg-[#1E293B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                Editar Producto
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Actualiza la información comercial y operativa del artículo en catálogo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 text-xs bg-[#FEE2E2] dark:bg-red-950/40 text-[#991B1B] dark:text-red-300 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Información fija del producto */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-bold uppercase text-[10px]">
                Código de Barras / Clave:
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {product.barcodeEan13} ({product.sku})
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block font-bold uppercase text-[10px]">
                Existencia Actual:
              </span>
              <span className="font-black text-[#008767] dark:text-emerald-400">
                {product.stockQuantity} {product.baseUom}
              </span>
            </div>
          </div>

          {/* Nombre y Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Marca
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Departamento y Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Departamento *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewDept(!isAddingNewDept)}
                  className="cursor-pointer text-[11px] text-[#008767] dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingNewDept ? 'Elegir existente' : 'Nuevo'}</span>
                </button>
              </div>

              {isAddingNewDept ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Nuevo departamento (ej: Gourmet)"
                    value={newDeptInput}
                    onChange={(e) => setNewDeptInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#0F172A] border border-[#008767] dark:border-emerald-500 rounded-xl text-[#0F172A] dark:text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewDepartment}
                    className="cursor-pointer p-2 rounded-xl bg-[#008767] text-white hover:bg-[#006e54] transition-colors"
                    title="Confirmar departamento"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <CustomSelect
                  value={department}
                  onChange={setDepartment}
                  options={departmentOptions}
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Unidad de Medida
              </label>
              <CustomSelect
                value={baseUom}
                onChange={setBaseUom}
                options={UOM_OPTIONS}
              />
            </div>
          </div>

          {/* Pasillo y Temperatura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Ubicación en Tienda
              </label>
              <input
                type="text"
                value={aisleLocation}
                onChange={(e) => setAisleLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Tipo de Conservación
              </label>
              <CustomSelect
                value={storageTemp}
                onChange={setStorageTemp}
                options={TEMP_OPTIONS}
              />
            </div>
          </div>

          {/* Precios y Stock Mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Precio de Venta ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 font-bold focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Costo de Compra ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Stock Mínimo (Alerta)
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pie de Acciones */}
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-700 flex items-center justify-end gap-3 shrink-0">
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
