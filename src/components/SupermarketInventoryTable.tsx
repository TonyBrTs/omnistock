'use client';

import React, { useMemo, useState } from 'react';
import {
  BatchHealthStatus,
  StorageTemperature,
  SupermarketProductRow,
} from '@/types/supermarket';

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
    label: 'Óptimo en Góndola',
  },
  LOW_STOCK: {
    classes: 'bg-[#FEF9C3] text-[#854D0E]',
    label: 'Resurtir / Por Vencer',
  },
  EXPIRED: {
    classes: 'bg-[#FEE2E2] text-[#991B1B]',
    label: 'Caducado (Bloqueo POS)',
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
    <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      {/* Barra de Búsqueda por Código de Barras y Filtros de Supermercado */}
      <div className="p-5 border-b border-[#E2E8F0] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <svg
            className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Escanear código de barras EAN-13, código PLU, lote FEFO o nombre de producto..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#008767]/25 focus:border-[#008767]"
          />
        </div>

        {/* Filtros por Departamento, Cadena de Frío y Estado */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filtrar por Departamento"
            className="px-3.5 py-2.5 text-xs font-semibold bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
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
            aria-label="Filtrar por Cadena de Frío"
            className="px-3.5 py-2.5 text-xs font-semibold bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
          >
            <option value="ALL">Toda Cadena de Frío</option>
            <option value="Ambiente (Seco)">Ambiente (Seco)</option>
            <option value="Refrigerado (2°C a 6°C)">Refrigerado (2°C a 6°C)</option>
            <option value="Congelado (-18°C)">Congelado (-18°C)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | BatchHealthStatus);
              setCurrentPage(1);
            }}
            aria-label="Filtrar por Estado de Stock/Caducidad"
            className="px-3.5 py-2.5 text-xs font-semibold bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#008767]"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="GOOD">Óptimo en Góndola</option>
            <option value="LOW_STOCK">Resurtir / Por Vencer</option>
            <option value="EXPIRED">Caducado (Bloqueo POS)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Alta Densidad para Supermercado */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F4F6F9]/60">
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                EAN-13 / PLU
              </th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Producto / Marca
              </th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pasillo / Ubicación
              </th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lote FEFO / Caducidad
              </th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Stock (UOM / Empaque)
              </th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Precio POS
              </th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Estado FEFO
              </th>
              <th className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                  No se encontraron productos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const statusInfo = STATUS_STYLES[row.status];
                const isMenuOpen = activeMenuId === row.id;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F4F6F9]/70 transition-colors"
                  >
                    {/* EAN-13 y PLU */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-[#0F172A] block">
                        {row.barcodeEan13}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono">
                        {row.pluCode ? `PLU: ${row.pluCode}` : `SKU: ${row.sku}`}
                      </span>
                    </td>

                    {/* Producto y Departamento */}
                    <td className="py-4 px-6">
                      <p className="text-sm font-semibold text-[#0F172A]">{row.name}</p>
                      <p className="text-xs text-[#64748B]">
                        {row.brand} · <span className="font-medium">{row.department}</span>
                      </p>
                    </td>

                    {/* Pasillo y Temperatura */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700 block">
                        {row.aisleLocation}
                      </span>
                      <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F6F9] text-[#64748B] border border-[#E2E8F0]">
                        {row.storageTemp}
                      </span>
                    </td>

                    {/* Lote y Fecha de Caducidad */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl border border-[#E2E8F0] inline-block">
                        {row.batchNumber}
                      </span>
                      <span className="block text-xs text-slate-700 mt-1 font-medium">
                        Vence: {row.expirationDate}
                        {row.daysToExpire !== null && (
                          <span
                            className={`ml-1.5 font-semibold ${
                              row.daysToExpire <= 0
                                ? 'text-[#991B1B]'
                                : row.daysToExpire <= 7
                                ? 'text-[#854D0E]'
                                : 'text-[#166534]'
                            }`}
                          >
                            ({row.daysToExpire <= 0
                              ? 'Vencido'
                              : `${row.daysToExpire}d`})
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Stock y Conversión de Empaque */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#0F172A] block">
                        {row.stockQuantity} {row.baseUom}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {row.packEquivalence} (Mín: {row.minStockAlert})
                      </span>
                    </td>

                    {/* Precio de Venta y Costo */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#0F172A] block">
                        ${row.salePrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Costo: ${row.unitCost.toFixed(2)}
                      </span>
                    </td>

                    {/* Badge de Estado FEFO */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.classes}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Menú Contextual Flotante */}
                    <td className="py-4 px-6 whitespace-nowrap text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(isMenuOpen ? null : row.id)
                        }
                        aria-label="Opciones de lote"
                        className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {isMenuOpen && (
                        <div className="origin-top-right absolute right-6 mt-1 w-52 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-lg z-30 py-1.5 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('REPLENISH_AISLE', row);
                            }}
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#F4F6F9] flex items-center justify-between"
                          >
                            <span>Resurtir a Góndola</span>
                            <span className="text-[10px] font-semibold text-[#008767]">
                              FEFO
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('ADJUST_STOCK', row);
                            }}
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#F4F6F9]"
                          >
                            Ajuste por Conteo Cíclico
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onActionSelect?.('MARK_MERMA', row);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2]/40"
                          >
                            Enviar Lote a Merma / Baja
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
          <span className="font-semibold text-[#0F172A]">{paginatedRows.length}</span> de{' '}
          <span className="font-semibold text-[#0F172A]">{filteredProducts.length}</span>{' '}
          lotes activos en tienda
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] font-medium disabled:opacity-40 hover:bg-[#F4F6F9]"
          >
            Anterior
          </button>
          <span className="px-2 font-semibold text-[#0F172A]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] font-medium disabled:opacity-40 hover:bg-[#F4F6F9]"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
};
