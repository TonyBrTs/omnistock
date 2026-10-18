'use client';

import React, { useState } from 'react';

interface AppLayoutProps {
  storeBranchName: string;
  onQuickReceiveStock?: () => void;
  onOpenPOSSimulator?: () => void;
  onOpenKardex?: () => void;
  onOpenPriceTags?: () => void;
  onOpenAuditReport?: () => void;
  onOpenColdChain?: () => void;
  onOpenShrinkage?: () => void;
  children: React.ReactNode;
}

interface SidebarSection {
  groupTitle: string;
  links: {
    id: string;
    label: string;
    badge?: string;
    active?: boolean;
    onClick?: () => void;
  }[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  storeBranchName,
  onQuickReceiveStock,
  onOpenPOSSimulator,
  onOpenKardex,
  onOpenPriceTags,
  onOpenAuditReport,
  onOpenColdChain,
  onOpenShrinkage,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const STORE_NAVIGATION: SidebarSection[] = [
    {
      groupTitle: 'ERP & INVENTARIO DE TIENDA',
      links: [
        { id: 'stock-fefo', label: 'Catálogo & Lotes FEFO', active: true, badge: 'En Vivo' },
        { id: 'receptions', label: 'Recepción Proveedor', onClick: onQuickReceiveStock },
        { id: 'shrinkage', label: 'Bajas & Mermas', badge: 'Merma', onClick: onOpenShrinkage },
      ],
    },
    {
      groupTitle: 'POS & OPERACIÓN DE PISO',
      links: [
        { id: 'pos-sync', label: 'Simulador Caja POS', badge: 'FEFO', onClick: onOpenPOSSimulator },
        { id: 'price-tags', label: 'Cenefas y Etiquetas', badge: 'Góndola', onClick: onOpenPriceTags },
      ],
    },
    {
      groupTitle: 'BI & AUDITORÍA',
      links: [
        { id: 'kardex', label: 'Kardex de Movimientos', badge: 'Ledger', onClick: onOpenKardex },
        { id: 'cold-chain', label: 'Cadena de Frío IoT', badge: 'IoT', onClick: onOpenColdChain },
        { id: 'valuation', label: 'Auditoría & Valuación', badge: 'CSV', onClick: onOpenAuditReport },
      ],
    },
  ];

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

          {/* Menú de Navegación */}
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
                        onClick={item.onClick}
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

        {/* Estado de Conexión */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-[#1E293B] flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">12 Cajas POS En Línea</p>
                <p className="text-[11px] text-slate-400 truncate">4 Sensores IoT Conectados</p>
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

          <div className="flex flex-wrap items-center gap-2">
            {onOpenColdChain && (
              <button
                type="button"
                onClick={onOpenColdChain}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide border border-blue-200 transition-colors flex items-center gap-1.5"
              >
                <span>❄️ IoT Frío</span>
              </button>
            )}

            {onOpenShrinkage && (
              <button
                type="button"
                onClick={onOpenShrinkage}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold tracking-wide border border-red-200 transition-colors flex items-center gap-1.5"
              >
                <span>🗑️ Merma</span>
              </button>
            )}

            {onOpenPriceTags && (
              <button
                type="button"
                onClick={onOpenPriceTags}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold tracking-wide border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>🏷️ Cenefas</span>
              </button>
            )}

            {onOpenAuditReport && (
              <button
                type="button"
                onClick={onOpenAuditReport}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008767] text-xs font-semibold tracking-wide border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <span>📊 Valuación</span>
              </button>
            )}

            {onOpenPOSSimulator && (
              <button
                type="button"
                onClick={onOpenPOSSimulator}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide border border-indigo-200 transition-colors flex items-center gap-1.5"
              >
                <span>🛒 Cobro POS</span>
              </button>
            )}

            {onOpenKardex && (
              <button
                type="button"
                onClick={onOpenKardex}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold tracking-wide border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>📜 Kardex</span>
              </button>
            )}

            {onQuickReceiveStock && (
              <button
                type="button"
                onClick={onQuickReceiveStock}
                className="px-3.5 py-2 rounded-xl bg-[#008767] hover:bg-[#006e54] text-white text-xs font-semibold tracking-wide shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>+ Recibir Lote</span>
              </button>
            )}

            {/* Usuario Jefe de Almacén */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-xl bg-[#0D5C75] text-white flex items-center justify-center text-xs font-bold">
                JA
              </div>
              <div className="hidden 2xl:block leading-tight">
                <p className="text-xs font-semibold text-[#0F172A]">Jefe de Almacén</p>
                <p className="text-[10px] text-[#64748B]">Sucursal #04 Centro</p>
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
