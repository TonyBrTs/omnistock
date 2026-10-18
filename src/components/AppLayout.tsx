'use client';

import React, { useState } from 'react';

interface AppLayoutProps {
  storeBranchName: string;
  onQuickReceiveStock?: () => void;
  children: React.ReactNode;
}

interface SidebarSection {
  groupTitle: string;
  links: {
    id: string;
    label: string;
    badge?: string;
    active?: boolean;
  }[];
}

const STORE_NAVIGATION: SidebarSection[] = [
  {
    groupTitle: 'ERP & INVENTARIO DE TIENDA',
    links: [
      { id: 'stock-fefo', label: 'Catálogo & Lotes FEFO', active: true, badge: 'En Vivo' },
      { id: 'replenish', label: 'Resurtido a Góndolas', badge: '14' },
      { id: 'receptions', label: 'Recepción de Proveedores' },
      { id: 'shrinkage', label: 'Control de Mermas y Caducos' },
    ],
  },
  {
    groupTitle: 'POS & OPERACIÓN DE PISO',
    links: [
      { id: 'pos-sync', label: 'Sincronización Cajas POS' },
      { id: 'scale-plu', label: 'Básculas y Códigos PLU' },
      { id: 'price-labels', label: 'Etiquetas de Precios / Cenefas' },
    ],
  },
  {
    groupTitle: 'BI & AUDITORÍA',
    links: [
      { id: 'kardex', label: 'Kardex de Movimientos' },
      { id: 'cold-chain', label: 'Monitor Cadena de Frío' },
    ],
  },
];

export const AppLayout: React.FC<AppLayoutProps> = ({
  storeBranchName,
  onQuickReceiveStock,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] text-[#0F172A] font-sans antialiased">
      {/* Sidebar Izquierdo Oscuro (#0F172A) */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 bg-[#0F172A] text-white flex flex-col justify-between transition-all duration-300 border-r border-slate-800 select-none`}
      >
        <div>
          {/* Identidad de Marca */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#008767] flex items-center justify-center font-extrabold text-white shadow-sm shrink-0">
                FM
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <span className="font-bold text-base tracking-tight block text-white">
                    FreshMarket
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
                    WMS & POS Inventory
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Alternar barra lateral"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'}
                />
              </svg>
            </button>
          </div>

          {/* Menú de Navegación por Departamentos Operativos */}
          <nav className="p-4 space-y-6">
            {STORE_NAVIGATION.map((section) => (
              <div key={section.groupTitle}>
                {!collapsed && (
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {section.groupTitle}
                  </p>
                )}
                <ul className="space-y-1">
                  {section.links.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          item.active
                            ? 'bg-[#008767] text-white shadow-sm'
                            : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!collapsed && item.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-white/15 text-white">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Estado de Conexión con Cajas POS y Cámaras Frías */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-[#1E293B] flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  12 Cajas POS En Línea
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Motor FEFO Activo · Sincronizado
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabecera Superior */}
        <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 md:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Control de Inventario y Perecederos (FEFO)
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#DCFCE7] text-[#166534]">
                {storeBranchName}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Monitoreo en tiempo real de stock en góndola, lotes por caducar, cadena de frío y rotación POS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onQuickReceiveStock && (
              <button
                type="button"
                onClick={onQuickReceiveStock}
                className="px-4 py-2.5 rounded-xl bg-[#008767] hover:bg-[#006e54] text-white text-xs font-semibold tracking-wide shadow-sm transition-colors flex items-center gap-2"
              >
                <span>+ Recepción de Mercancía / Lote</span>
              </button>
            )}

            {/* Fecha de Operación */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F6F9] border border-[#E2E8F0] text-xs font-medium text-[#64748B]">
              <span>Turno Matutino · 18 Oct 2026</span>
            </div>

            {/* Usuario Jefe de Almacén */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-xl bg-[#0D5C75] text-white flex items-center justify-center text-xs font-bold">
                JA
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-xs font-semibold text-[#0F172A]">Jefe de Almacén</p>
                <p className="text-[11px] text-[#64748B]">Sucursal #04 Centro</p>
              </div>
            </div>
          </div>
        </header>

        {/* Cuerpo de la Aplicación */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
