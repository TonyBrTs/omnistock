'use client';

import React, { useState } from 'react';
import { X, Sparkles, PlusCircle } from 'lucide-react';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (message: string) => void;
}

const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: 'Abarrotes y Despensa', label: 'Abarrotes y Despensa', sublabel: 'Arroz, pastas, latas, aceites y harinas' },
  { value: 'Lácteos y Refrigerados', label: 'Lácteos y Refrigerados', sublabel: 'Leche, quesos, cremas y yogures' },
  { value: 'Carnicería y Salchichonería', label: 'Carnicería y Salchichonería', sublabel: 'Carnes, jamones, salchichas y embutidos' },
  { value: 'Frutas y Verduras', label: 'Frutas y Verduras', sublabel: 'Frescos, verduras, legumbres e islas' },
  { value: 'Bebidas y Licores', label: 'Bebidas y Licores', sublabel: 'Refrescos, jugos, aguas y licores' },
  { value: 'Panadería', label: 'Panadería', sublabel: 'Pan dulce, pan de caja, galletas y bolillos' },
];

const UOM_OPTIONS: SelectOption[] = [
  { value: 'Pza', label: 'Pieza (Pza)', sublabel: 'Unidad individual por paquete o envase' },
  { value: 'Kg', label: 'Kilos (Kg)', sublabel: 'Venta pesada en báscula' },
  { value: 'Litro', label: 'Litro (L)', sublabel: 'Líquidos a granel o botellas' },
  { value: 'Paq', label: 'Paquete (Paq)', sublabel: 'Charolas o paquetes multi-artículo' },
];

const TEMP_OPTIONS: SelectOption[] = [
  { value: 'Ambiente (Seco)', label: 'Temperatura Ambiente (Seco)', sublabel: 'No requiere refrigeración' },
  { value: 'Refrigerado (2°C a 6°C)', label: 'Refrigerador (2°C a 6°C)', sublabel: 'Vitrina fría o refrigerador' },
  { value: 'Congelado (-18°C)', label: 'Congelador (-18°C)', sublabel: 'Nevera o vitrina congelada' },
];

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [department, setDepartment] = useState('Abarrotes y Despensa');
  const [baseUom, setBaseUom] = useState('Pza');
  const [storageTemp, setStorageTemp] = useState('Ambiente (Seco)');
  const [aisleLocation, setAisleLocation] = useState('Pasillo 01');
  const [salePrice, setSalePrice] = useState<number | ''>(25);
  const [unitCost, setUnitCost] = useState<number | ''>(18);
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(10);

  // Registro de existencias iniciales opcional
  const [hasInitialStock, setHasInitialStock] = useState(true);
  const [initialQuantity, setInitialQuantity] = useState<number | ''>(24);
  const [initialBatch, setInitialBatch] = useState('LOT-2026-01');
  const [expirationDate, setExpirationDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generador de código de barras aleatorio si no se tiene lector
  const handleGenerateBarcode = () => {
    const randomEan = '750' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setBarcode(randomEan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        name: name.trim(),
        barcodeEan13: barcode.trim() || undefined,
        brand: brand.trim() || 'Genérico',
        department,
        baseUom,
        storageTemp,
        aisleLocation: aisleLocation.trim() || 'Pasillo Principal',
        salePrice: Number(salePrice),
        unitCost: Number(unitCost),
        minStockAlert: Number(minStockAlert) || 5,
        initialQuantity: hasInitialStock ? Number(initialQuantity) || 0 : 0,
        initialBatch: hasInitialStock ? initialBatch.trim() : undefined,
        expirationDate: hasInitialStock && expirationDate ? expirationDate : undefined,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo dar de alta el producto');
      }

      onProductCreated(`Producto "${name}" agregado con éxito.`);
      onClose();
      // Limpiar formulario
      setName('');
      setBarcode('');
      setBrand('');
      setExpirationDate('');
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
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#008767] dark:text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                Nuevo Producto
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Alta de artículo en el catálogo con precio, ubicación y stock inicial.
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

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 text-xs bg-[#FEE2E2] dark:bg-red-950/40 text-[#991B1B] dark:text-red-300 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Nombre y Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nombre del Producto *
              </label>
              <input
                type="text"
                placeholder="Ej: Aceite Vegetal 1 Litro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#008767]/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Marca
              </label>
              <input
                type="text"
                placeholder="Ej: Nutrioli"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Código de Barras con botón Generar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Código de Barras (EAN-13)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escanea o escribe el código (ej: 7501020304050)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1 px-3.5 py-2.5 font-mono text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
                title="Genera un código de barras automático"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Generar</span>
              </button>
            </div>
          </div>

          {/* Departamento y Unidad de Medida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Departamento *
              </label>
              <CustomSelect
                value={department}
                onChange={setDepartment}
                options={DEPARTMENT_OPTIONS}
              />
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

          {/* Ubicación y Temperatura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Ubicación en Tienda
              </label>
              <input
                type="text"
                placeholder="Ej: Pasillo 03, Sección A"
                value={aisleLocation}
                onChange={(e) => setAisleLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
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
                placeholder="25.00"
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
                placeholder="18.00"
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
                placeholder="10"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Sección Opcional: Existencias Iniciales */}
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={hasInitialStock}
                  onChange={(e) => setHasInitialStock(e.target.checked)}
                  className="rounded text-[#008767] focus:ring-[#008767] w-4 h-4 cursor-pointer"
                />
                Registrar lote de entrada inicial
              </label>
            </div>

            {hasInitialStock && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Cantidad Inicial
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={initialQuantity}
                      onChange={(e) => setInitialQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white"
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Número de Lote
                    </label>
                    <input
                      type="text"
                      value={initialBatch}
                      onChange={(e) => setInitialBatch(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white"
                      placeholder="LOT-2026-01"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Fecha de Vencimiento
                    </label>
                    <CustomDatePicker
                      value={expirationDate}
                      onChange={setExpirationDate}
                      placeholder="Elige fecha..."
                      align="right"
                    />
                  </div>
                </div>
              </div>
            )}
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
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#006e54] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold tracking-wide shadow-sm transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
