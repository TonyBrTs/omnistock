'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  BatchHealthStatus,
  StorageTemperature,
  SupermarketProductRow,
} from '@/types/supermarket';
import {
  Search,
  MoreVertical,
  ClipboardList,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Store,
  PlusCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CustomSelect, SelectOption } from './ui/CustomSelect';

interface SupermarketInventoryTableProps {
  products: SupermarketProductRow[];
  onActionSelect?: (
    action: 'MARK_MERMA' | 'ADJUST_STOCK',
    product: SupermarketProductRow
  ) => void;
  onCreateProduct?: () => void;
  onEditProduct?: (product: SupermarketProductRow) => void;
  onDeleteProduct?: (product: SupermarketProductRow) => void;
}

const STATUS_STYLES: Record<BatchHealthStatus, { classes: string; label: string }> = {
  GOOD: {
    classes: 'bg-[#DCFCE7] dark:bg-emerald-950/70 text-[#166534] dark:text-emerald-300 border border-transparent dark:border-emerald-800/60',
    label: 'Todo Bien',
  },
  LOW_STOCK: {
    classes: 'bg-[#FEF9C3] dark:bg-amber-950/70 text-[#854D0E] dark:text-amber-300 border border-transparent dark:border-amber-800/60',
    label: 'Por Vencer / Queda Poco',
  },
  EXPIRED: {
    classes: 'bg-[#FEE2E2] dark:bg-red-950/70 text-[#991B1B] dark:text-red-300 border border-transparent dark:border-red-800/60',
    label: 'Vencido (No vender)',
  },
};

export const SupermarketInventoryTable: React.FC<SupermarketInventoryTableProps> = ({
  products,
  onActionSelect,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [tempFilter, setTempFilter] = useState<'ALL' | StorageTemperature>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BatchHealthStatus>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Cerrar menú de acciones contextual al hacer clic fuera o pulsar escape
  useEffect(() => {
    if (!activeMenuId) return;
    const handleClose = () => setActiveMenuId(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenuId(null);
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClose);
      window.addEventListener('keydown', handleKey);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKey);
    };
  }, [activeMenuId]);

  const departments = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map((p) => p.department)))];
  }, [products]);

  const departmentOptions: SelectOption[] = useMemo(() => {
    return departments.map((dept) => ({
      value: dept,
      label: dept === 'ALL' ? 'Todos los Departamentos' : dept,
    }));
  }, [departments]);

  const tempOptions: SelectOption[] = [
    { value: 'ALL', label: 'Todo Tipo de Conservación' },
    { value: 'Ambiente (Seco)', label: 'Ambiente (Seco)' },
    { value: 'Refrigerado (2°C a 6°C)', label: 'Refrigerado' },
    { value: 'Congelado (-18°C)', label: 'Congelador' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Todos los Estados' },
    { value: 'GOOD', label: 'Todo Bien', badge: 'En regla', badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/60' },
    { value: 'LOW_STOCK', label: 'Por Vencer / Queda Poco', badge: 'Atención', badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-800/60' },
    { value: 'EXPIRED', label: 'Vencidos', badge: 'No vender', badgeColor: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-transparent dark:border-red-800/60' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesDept =
        departmentFilter === 'ALL' || item.department === departmentFilter;
      const matchesTemp = tempFilter === 'ALL' || item.storageTemp === tempFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesDept && matchesTemp && matchesStatus;

      const matchesText =
        item.name.toLowerCase().includes(q) ||
        item.barcodeEan13.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.pluCode && item.pluCode.toLowerCase().includes(q)) ||
        item.batchNumber.toLowerCase().includes(q) ||
        item.aisleLocation.toLowerCase().includes(q);

      return matchesDept && matchesTemp && matchesStatus && matchesText;
    });
  }, [products, searchQuery, departmentFilter, tempFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  return (
    <section className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none w-full relative transition-colors duration-200">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-5 border-b border-[#E2E8F0] dark:border-slate-800 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 relative z-20">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-[#64748B] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, código de barras o lote..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F4F6F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white placeholder-[#64748B] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#008767]/25 focus:border-[#008767] transition-all"
          />
        </div>

        {/* Filtros y Botón Nuevo Producto */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <CustomSelect
            value={departmentFilter}
            onChange={(val) => {
              setDepartmentFilter(val);
              setCurrentPage(1);
            }}
            options={departmentOptions}
            buttonClassName="py-2 px-3 text-xs font-semibold rounded-xl"
            menuWidthClass="w-56"
            align="left"
            ariaLabel="Filtrar por Departamento"
          />

          <CustomSelect
            value={tempFilter}
            onChange={(val) => {
              setTempFilter(val as any);
              setCurrentPage(1);
            }}
            options={tempOptions}
            buttonClassName="py-2 px-3 text-xs font-semibold rounded-xl"
            menuWidthClass="w-52"
            align="left"
            ariaLabel="Filtrar por Tipo de Conservación"
          />

          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as any);
              setCurrentPage(1);
            }}
            options={statusOptions}
            buttonClassName="py-2 px-3 text-xs font-semibold rounded-xl"
            menuWidthClass="w-52"
            align="right"
            ariaLabel="Filtrar por Estado"
          />

          {onCreateProduct && (
            <button
              type="button"
              onClick={onCreateProduct}
              className="cursor-pointer px-3.5 py-2 rounded-xl bg-[#008767] hover:bg-[#006e54] text-white text-xs font-bold tracking-wide shadow-xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
              title="Registrar un producto nuevo en el catálogo"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla con Existencias Totales y Desglose Estante/Bodega */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F4F6F9]/60 dark:bg-slate-900/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Código
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Producto
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ubicación
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lote y Vencimiento
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Stock Total
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Precio
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Estado
              </th>
              <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 px-6 text-center text-sm font-medium text-[#64748B] dark:text-slate-400"
                >
                  No encontramos ningún producto con esa búsqueda.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const statusInfo = STATUS_STYLES[row.status];
                const isMenuOpen = activeMenuId === row.id;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F4F6F9]/70 dark:hover:bg-slate-800/50 transition-colors group cursor-default"
                  >
                    {/* Código */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-slate-100 block">
                        {row.barcodeEan13}
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                        {row.pluCode ? `Báscula: ${row.pluCode}` : `Clave: ${row.sku}`}
                      </span>
                    </td>

                    {/* Nombre */}
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">{row.name}</p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                        {row.brand} · <span className="font-medium text-slate-600 dark:text-slate-300">{row.department}</span>
                      </p>
                    </td>

                    {/* Pasillo */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                        {row.aisleLocation}
                      </span>
                      <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F6F9] dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700">
                        {row.storageTemp}
                      </span>
                    </td>

                    {/* Lote y Vencimiento */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-xl border border-[#E2E8F0] dark:border-slate-700 inline-block">
                        Lote: {row.batchNumber}
                      </span>
                      <span className="block text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                        Vence: {row.expirationDate}
                        {row.daysToExpire !== null && (
                          <span
                            className={`ml-1.5 font-bold ${
                              row.daysToExpire <= 0
                                ? 'text-[#991B1B] dark:text-red-400'
                                : row.daysToExpire <= 7
                                ? 'text-[#854D0E] dark:text-amber-400'
                                : 'text-[#166534] dark:text-emerald-400'
                            }`}
                          >
                            ({row.daysToExpire <= 0
                              ? 'Vencido'
                              : `${row.daysToExpire} días`})
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Stock Total */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-base font-black text-[#0F172A] dark:text-white block">
                        {row.stockQuantity} {row.baseUom}
                      </span>
                      <div className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Stock Mínimo: <strong className="text-slate-800 dark:text-slate-200">{row.minStockAlert} {row.baseUom}</strong></span>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-extrabold text-[#008767] dark:text-emerald-400 block">
                        ${row.salePrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                        Costo: ${row.unitCost.toFixed(2)}
                      </span>
                    </td>

                    {/* Estado con semáforo */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.classes}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Opciones */}
                    <td className="py-4 px-6 whitespace-nowrap text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : row.id);
                        }}
                        aria-label="Abrir opciones"
                        className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {isMenuOpen && (
                        <div className="origin-top-right absolute right-6 mt-1 w-56 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 shadow-xl z-30 py-2 text-left animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('ADJUST_STOCK', row);
                            }}
                            className="cursor-pointer w-full px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#F4F6F9] dark:hover:bg-slate-800/90 flex items-center gap-2 transition-colors"
                          >
                            <ClipboardList className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            Ajustar conteo físico
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditProduct?.(row);
                            }}
                            className="cursor-pointer w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#F4F6F9] dark:hover:bg-slate-800/90 flex items-center gap-2 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                            Editar producto
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('MARK_MERMA', row);
                            }}
                            className="cursor-pointer w-full px-4 py-2.5 text-xs font-semibold text-[#854D0E] dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 transition-colors"
                          >
                            <AlertOctagon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Registrar merma
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteProduct?.(row);
                            }}
                            className="cursor-pointer w-full px-4 py-2.5 text-xs font-bold text-[#991B1B] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                            Eliminar producto
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#64748B] dark:text-slate-400">
        <div>
          Mostrando{' '}
          <span className="font-bold text-[#0F172A] dark:text-white">{paginatedRows.length}</span> de{' '}
          <span className="font-bold text-[#0F172A] dark:text-white">{filteredProducts.length}</span>{' '}
          productos
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="cursor-pointer px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F6F9] dark:hover:bg-slate-700 flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>
          <span className="px-2 font-bold text-[#0F172A] dark:text-white">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="cursor-pointer px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#FFFFFF] dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F6F9] dark:hover:bg-slate-700 flex items-center gap-1 transition-all"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
