'use client';

import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';

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
    label: 'Vencido (No se puede vender)',
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

  const departments = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map((p) => p.department)))];
  }, [products]);

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
    <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-visible">
      {/* Barra de Búsqueda y Filtros con Nombres Comunes */}
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
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filtrar por Departamento"
            className="cursor-pointer px-3.5 py-2.5 text-xs font-semibold bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] hover:border-[#008767] transition-colors focus:outline-none"
          >
            <option value="ALL">Todos los Departamentos</option>
            {departments
              .filter((d) => d !== 'ALL')
              .map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
          </select>

          <select
            value={tempFilter}
            onChange={(e) => {
              setTempFilter(e.target.value as 'ALL' | StorageTemperature);
              setCurrentPage(1);
            }}
            aria-label="Filtrar por Refrigeración"
            className="cursor-pointer px-3.5 py-2.5 text-xs font-semibold bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] hover:border-[#008767] transition-colors focus:outline-none"
          >
            <option value="ALL">Todo Tipo de Frío</option>
            <option value="Ambiente (Seco)">En Estante (Seco)</option>
            <option value="Refrigerado (2°C a 6°C)">En Refri (Fresco)</option>
            <option value="Congelado (-18°C)">En Congelador</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | BatchHealthStatus);
              setCurrentPage(1);
            }}
            aria-label="Filtrar por Estado"
            className="cursor-pointer px-3.5 py-2.5 text-xs font-semibold bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] hover:border-[#008767] transition-colors focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="GOOD">Todo Bien</option>
            <option value="LOW_STOCK">Por Vencer / Queda Poco</option>
            <option value="EXPIRED">Vencidos (Tirar)</option>
          </select>
        </div>
      </div>

      {/* Tabla con Columnas Claras */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F4F6F9]/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Código de Barras
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Producto
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Dónde está guardado
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Lote y Cuándo Vence
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                ¿Cuánto Queda?
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Precio al Cliente
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                Estado
              </th>
              <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Opciones
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
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-[#0F172A]">{row.name}</p>
                      <p className="text-xs text-[#64748B]">
                        Marca: {row.brand} · <span className="font-medium text-slate-600">{row.department}</span>
                      </p>
                    </td>

                    {/* Pasillo / Refri */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-800 block">
                        {row.aisleLocation}
                      </span>
                      <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F6F9] text-[#64748B] border border-[#E2E8F0]">
                        {row.storageTemp}
                      </span>
                    </td>

                    {/* Vencimiento */}
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
                              ? '¡Ya venció!'
                              : `Faltan ${row.daysToExpire} días`})
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Cantidad disponible */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-extrabold text-[#0F172A] block">
                        {row.stockQuantity} {row.baseUom}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Viene en: {row.packEquivalence}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-extrabold text-[#008767] block">
                        ${row.salePrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Nos costó: ${row.unitCost.toFixed(2)}
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
                        onClick={() =>
                          setActiveMenuId(isMenuOpen ? null : row.id)
                        }
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
                              Poner más en el estante
                            </span>
                            <span className="text-[10px] font-bold text-[#008767] bg-emerald-50 px-1.5 py-0.5 rounded">
                              +12
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
          productos en la tienda
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
