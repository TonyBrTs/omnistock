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
  ArrowUpRight,
  ClipboardList,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react';
import { CustomSelect, SelectOption } from './ui/CustomSelect';

interface SupermarketInventoryTableProps {
  products: SupermarketProductRow[];
  onActionSelect?: (
    action: 'REPLENISH_AISLE' | 'MARK_MERMA' | 'ADJUST_STOCK',
    product: SupermarketProductRow
  ) => void;
}

const STATUS_STYLES: Record<BatchHealthStatus, { classes: string; label: string }> = {
  GOOD: {
    classes: 'bg-[#DCFCE7] text-[#166534]',
    label: 'Todo Bien',
  },
  LOW_STOCK: {
    classes: 'bg-[#FEF9C3] text-[#854D0E]',
    label: 'Por Vencer / Queda Poco',
  },
  EXPIRED: {
    classes: 'bg-[#FEE2E2] text-[#991B1B]',
    label: 'Vencido (No vender)',
  },
};

export const SupermarketInventoryTable: React.FC<SupermarketInventoryTableProps> = ({
  products,
  onActionSelect,
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
    { value: 'Ambiente (Seco)', label: 'Estante Seco' },
    { value: 'Refrigerado (2°C a 6°C)', label: 'Refrigerado' },
    { value: 'Congelado (-18°C)', label: 'Congelador' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Todos los Estados' },
    { value: 'GOOD', label: 'Todo Bien', badge: 'En regla', badgeColor: 'bg-emerald-50 text-emerald-700' },
    { value: 'LOW_STOCK', label: 'Por Vencer / Queda Poco', badge: 'Atención', badgeColor: 'bg-amber-50 text-amber-700' },
    { value: 'EXPIRED', label: 'Vencidos', badge: 'No vender', badgeColor: 'bg-red-50 text-red-700' },
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
    <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full overflow-hidden">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-5 border-b border-[#E2E8F0] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por código de barras, lote o nombre de producto..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#008767]/25 focus:border-[#008767] transition-all"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <CustomSelect
            value={departmentFilter}
            onChange={(val) => {
              setDepartmentFilter(val);
              setCurrentPage(1);
            }}
            options={departmentOptions}
            buttonClassName="py-2 px-3 text-xs font-semibold rounded-xl"
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
            ariaLabel="Filtrar por Estado"
          />
        </div>
      </div>

      {/* Tabla con Existencias Totales y Desglose Estante/Bodega */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F4F6F9]/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Código
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Producto
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Ubicación
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Lote y Vencimiento
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                TOTAL EN TIENDA
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Precio
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Estado
              </th>
              <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 px-6 text-center text-sm font-medium text-[#64748B]"
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
                    className="hover:bg-[#F4F6F9]/70 transition-colors group cursor-default"
                  >
                    {/* Código */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#0F172A] block">
                        {row.barcodeEan13}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {row.pluCode ? `Báscula: ${row.pluCode}` : `Clave: ${row.sku}`}
                      </span>
                    </td>

                    {/* Nombre */}
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-sm font-bold text-[#0F172A] truncate">{row.name}</p>
                      <p className="text-xs text-[#64748B] truncate">
                        Marca: {row.brand} · <span className="font-medium text-slate-600">{row.department}</span>
                      </p>
                    </td>

                    {/* Pasillo */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-800 block">
                        {row.aisleLocation}
                      </span>
                      <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F6F9] text-[#64748B] border border-[#E2E8F0]">
                        {row.storageTemp}
                      </span>
                    </td>

                    {/* Lote y Vencimiento */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl border border-[#E2E8F0] inline-block">
                        Lote: {row.batchNumber}
                      </span>
                      <span className="block text-xs text-slate-700 mt-1 font-medium">
                        Vence: {row.expirationDate}
                        {row.daysToExpire !== null && (
                          <span
                            className={`ml-1.5 font-bold ${
                              row.daysToExpire <= 0
                                ? 'text-[#991B1B]'
                                : row.daysToExpire <= 7
                                ? 'text-[#854D0E]'
                                : 'text-[#166534]'
                            }`}
                          >
                            ({row.daysToExpire <= 0
                              ? '¡Vencido!'
                              : `${row.daysToExpire} días`})
                          </span>
                        )}
                      </span>
                    </td>

                    {/* TOTAL EN TIENDA (Estante + Bodega) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-[#0F172A]">
                          {row.stockQuantity} {row.baseUom}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#008767] bg-emerald-50 px-1.5 py-0.2 rounded">
                          Total
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                        <span>Estante: <strong>{row.shelfStock}</strong></span>
                        <span>·</span>
                        <span>Bodega: <strong>{row.backroomStock}</strong></span>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-extrabold text-[#008767] block">
                        ${row.salePrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
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
                        className="cursor-pointer p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {isMenuOpen && (
                        <div className="origin-top-right absolute right-6 mt-1 w-56 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl z-30 py-2 text-left animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('REPLENISH_AISLE', row);
                            }}
                            className="cursor-pointer w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#F4F6F9] flex items-center justify-between transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#008767]" />
                              Mover al estante (+12)
                            </span>
                            <span className="text-[10px] font-bold text-[#008767] bg-emerald-50 px-1.5 py-0.5 rounded">
                              Bodega
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('ADJUST_STOCK', row);
                            }}
                            className="cursor-pointer w-full px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-[#F4F6F9] flex items-center gap-2 transition-colors"
                          >
                            <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                            Contar a mano cuántos hay
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('MARK_MERMA', row);
                            }}
                            className="cursor-pointer w-full px-4 py-2.5 text-xs font-bold text-[#991B1B] hover:bg-[#FEE2E2]/50 flex items-center gap-2 transition-colors"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Tirar / Dar de baja
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
      <div className="px-6 py-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#64748B]">
        <div>
          Mostrando{' '}
          <span className="font-bold text-[#0F172A]">{paginatedRows.length}</span> de{' '}
          <span className="font-bold text-[#0F172A]">{filteredProducts.length}</span>{' '}
          artículos en toda la tienda
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="cursor-pointer px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F6F9] flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>
          <span className="px-2 font-bold text-[#0F172A]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="cursor-pointer px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F6F9] flex items-center gap-1 transition-all"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
